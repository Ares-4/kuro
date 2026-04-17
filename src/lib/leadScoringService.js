import { supabase } from '@/lib/customSupabaseClient';

/**
 * Calculates lead score based on weighted factors.
 * Weights:
 * - Destination: Dynamic (Max 25%)
 * - Budget: 25%
 * - Intake Proximity: 20%
 * - Study Level: 15%
 * - Origin Fit: 10%
 * - Contact Quality: 5%
 * 
 * Tiers:
 * - A: 75-100 (High Priority)
 * - B: 55-74 (Medium Priority)
 * - C: 0-54  (Low Priority)
 */

const AFRICAN_COUNTRIES = [
  'zimbabwe', 'nigeria', 'kenya', 'ghana', 'south africa', 'uganda', 'tanzania', 
  'ethiopia', 'cameroon', 'senegal', 'rwanda', 'botswana', 'namibia', 'zambia', 
  'malawi', 'mozambique', 'angola', 'ivory coast', 'mali', 'burkina faso', 
  'benin', 'togo', 'sierra leone', 'liberia', 'guinea', 'guinea-bissau', 
  'cape verde', 'mauritius', 'seychelles', 'djibouti', 'eritrea', 'sudan', 
  'south sudan', 'somalia', 'egypt', 'libya', 'tunisia', 'algeria', 'morocco', 
  'lesotho', 'eswatini'
];

const normalizeInput = (str) => str?.toString().toLowerCase().trim() || '';

const getDestinationWeight = async (destination) => {
  const normalized = normalizeInput(destination);
  if (!normalized) return 10; // Default if no destination provided

  try {
    // 1. Try exact match first
    const { data, error } = await supabase
      .from('destination_weights')
      .select('weight')
      .eq('destination', normalized)
      .maybeSingle();
      
    if (!error && data) return data.weight;

    // 2. Try partial match if no exact match (simple check for common ones)
    // This handles cases like "United States" matching "usa" if mapped, or broad matches.
    // For now, we'll rely on client-side mapping fallback if DB lookup fails for partials,
    // or simply return default. A robust system might use a mapping table.
    // Let's check for "united states" manually if "usa" exists, etc.
    
    // Fallback to searching known aliases if needed, but for now we return default
    // or try to match 'default' row from DB
    const { data: defaultData } = await supabase
      .from('destination_weights')
      .select('weight')
      .eq('destination', 'default')
      .maybeSingle();

    return defaultData?.weight || 10;
  } catch (err) {
    console.warn('Error fetching destination weight:', err);
    return 10;
  }
};

const getBudgetPoints = (budget) => {
  const b = normalizeInput(budget);
  if (!b) return 5;

  // High (25 pts)
  if (['high', '$30,000+', '30000', '> 30000', '15000-30000', '$15,000 - $30,000'].some(k => b.includes(k))) return 25;
  
  // Medium (20 pts)
  if (['medium', '5000-15000', '$5,000 - $15,000'].some(k => b.includes(k))) return 20;
  
  // Low (10 pts)
  if (['low', '< 5000', 'under', 'less'].some(k => b.includes(k))) return 10;
  
  return 5;
};

const getIntakePoints = (intake) => {
  const i = normalizeInput(intake);
  if (!i) return 5;

  // Immediate < 6 months (20 pts)
  if (['jan', 'feb', 'sep', 'oct', '0_3', '3_6', 'immediate', 'asap'].some(k => i.includes(k))) return 20;
  
  // Mid-term 6-12 months (15 pts)
  if (['6_12', 'next year'].some(k => i.includes(k))) return 15;
  
  // Long-term 12+ months (5 pts)
  if (['12_plus', '2026', '2027'].some(k => i.includes(k))) return 5;
  
  return 10;
};

const getStudyLevelPoints = (level) => {
  const l = normalizeInput(level);
  if (!l) return 8;

  // Advanced (15 pts)
  if (['master', 'phd', 'postgrad', 'mba', 'doctorate'].some(k => l.includes(k))) return 15;
  
  // Standard (12 pts)
  if (['bachelor', 'undergrad', 'degree'].some(k => l.includes(k))) return 12;
  
  // Foundation/Other (8 pts)
  return 8;
};

const getOriginPoints = (origin) => {
  const o = normalizeInput(origin);
  if (!o) return 5;
  
  // In Allowlist (10 pts)
  if (AFRICAN_COUNTRIES.some(c => o.includes(c))) return 10;
  
  // Other (5 pts)
  return 5;
};

const getContactQualityPoints = (email, phone) => {
  const hasEmail = email && email.includes('@');
  const hasPhone = phone && phone.length > 5;
  
  if (hasEmail && hasPhone) return 5;
  if (hasEmail || hasPhone) return 3;
  return 0;
};

export const calculateLeadScore = async (leadData) => {
  const {
    target_destination, destination,
    budget_range, budget,
    intake_month, intakeTimeline,
    study_level, educationLevel,
    origin_country, residence,
    email, whatsapp, phone
  } = leadData;

  // 1. Normalize inputs
  const destVal = target_destination || destination || '';
  const budgetVal = budget_range || budget || '';
  const intakeVal = intake_month || intakeTimeline || '';
  const levelVal = study_level || educationLevel || '';
  const originVal = origin_country || residence || '';
  const emailVal = email || '';
  const phoneVal = whatsapp || phone || '';

  // 2. Calculate component scores
  // ASYNC Call for Destination Weight
  const destPts = await getDestinationWeight(destVal);
  
  const budgetPts = getBudgetPoints(budgetVal);
  const intakePts = getIntakePoints(intakeVal);
  const levelPts = getStudyLevelPoints(levelVal);
  const originPts = getOriginPoints(originVal);
  const contactPts = getContactQualityPoints(emailVal, phoneVal);

  let totalScore = destPts + budgetPts + intakePts + levelPts + originPts + contactPts;

  // 3. Apply Edge Caps
  // Cap at 70 if destination is unknown (or minimal weight returned)
  if (!destVal) {
    totalScore = Math.min(totalScore, 70);
  }
  
  // Cap at 50 if no valid contact info
  if (contactPts === 0) {
    totalScore = Math.min(totalScore, 50);
  }

  // Clamp 0-100
  totalScore = Math.max(0, Math.min(100, totalScore));

  // 4. Determine Tier
  let tier = 'C';
  if (totalScore >= 75) tier = 'A';
  else if (totalScore >= 55) tier = 'B';

  return {
    score: totalScore,
    tier,
    scored_at: new Date().toISOString()
  };
};