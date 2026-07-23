import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle, Sparkles, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { createCheckoutSession } from '@/lib/paymentService';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateLeadScore } from '@/lib/leadScoringService';

// ── Poland-specific question set (Syrena / Zimbabwe) ─────────────────────

const PolandStep = ({ formData, updateField }) => (
  <div className="space-y-5">
    <div className="flex gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-700/30">
      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-200 leading-relaxed">
        Based on the official Syrena (Polish consulate, Pretoria) requirements for Zimbabwean students.
      </p>
    </div>

    {/* A-levels */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">A-level passes</Label>
      <p className="text-xs text-slate-500 mb-2">Syrena requires a minimum of 3 A-level passes for undergraduate admission.</p>
      <Select onValueChange={v => updateField('alevels', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="How many A-level passes do you have?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3plus">3 or more A-level passes</SelectItem>
          <SelectItem value="2only">2 A-level passes</SelectItem>
          <SelectItem value="1only">1 A-level pass</SelectItem>
          <SelectItem value="none_degree">No A-levels — I have a university degree</SelectItem>
          <SelectItem value="none">No A-levels and no degree</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Passport */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Passport validity</Label>
      <p className="text-xs text-slate-500 mb-2">Must be valid for at least 1 year and 3 months (15 months) after your planned departure date, with 2 blank consecutive visa pages.</p>
      <Select onValueChange={v => updateField('passportMonthsRemaining', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Validity from your planned departure date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15plus">15+ months — meets requirement</SelectItem>
          <SelectItem value="12_15">12–15 months — borderline, renewal advised</SelectItem>
          <SelectItem value="under12">Under 12 months — must renew first</SelectItem>
          <SelectItem value="no_passport">No passport yet</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* NAWA recognition */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">NAWA recognition statement</Label>
      <p className="text-xs text-slate-500 mb-2">This is a written confirmation from NAWA (Poland's academic exchange agency) that your high school diploma qualifies you to study in Poland. Apply directly: dyplom@nawa.gov.pl</p>
      <Select onValueChange={v => updateField('nawaStatement', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="done">Received — have the statement</SelectItem>
          <SelectItem value="applied">Applied to NAWA and waiting</SelectItem>
          <SelectItem value="not_yet">Not applied yet</SelectItem>
          <SelectItem value="unsure">Don't know what this is</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Final acceptance letter */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Final acceptance letter + tuition fees paid</Label>
      <p className="text-xs text-slate-500 mb-2">Must be a signed final (not conditional) letter from the university stating you're accepted and all fees are paid — with bank proof of payment. Also requires a Certificate of Student Status (Zaświadczenie).</p>
      <Select onValueChange={v => updateField('admissionLetter', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full">Final letter + fees paid + Zaświadczenie — all in hand</SelectItem>
          <SelectItem value="accepted_unpaid">Accepted but fees not yet paid</SelectItem>
          <SelectItem value="conditional">Conditional offer only</SelectItem>
          <SelectItem value="applied">Applied and waiting</SelectItem>
          <SelectItem value="not_yet">Not applied yet</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* School certificates legalization */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">School certificates — legalized by Zimbabwe MFA</Label>
      <p className="text-xs text-slate-500 mb-2">Originals AND copies required. For Zimbabwe, certificates must be legalized by the Ministry of Foreign Affairs (not apostilled — apostille is for SA/Botswana). Also need a letter of no objection from Zimbabwe's Ministry of Education.</p>
      <Select onValueChange={v => updateField('certLegalization', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="done">Legalized by Zimbabwe MFA — originals and copies ready</SelectItem>
          <SelectItem value="in_progress">In progress</SelectItem>
          <SelectItem value="not_yet">Not done yet</SelectItem>
          <SelectItem value="apostille_only">Have apostille only — didn't know about MFA legalization</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Accommodation */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Proof of accommodation for first year</Label>
      <p className="text-xs text-slate-500 mb-2">A signed letter from the university confirming accommodation, or a lease agreement.</p>
      <Select onValueChange={v => updateField('accommodation', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="done">Confirmed — have letter or lease</SelectItem>
          <SelectItem value="not_yet">Not arranged yet</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Sponsor financial documents */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Financial sponsor documents</Label>
      <p className="text-xs text-slate-500 mb-2">Sponsor needs: a declaration of costs (notarized + legalized by Zimbabwe MFA), employment letter, last 3 months payslips and bank statements (originals). Account must show at least R100,000. Scholarship confirmation is also accepted.</p>
      <Select onValueChange={v => updateField('sponsorType', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Financial proof situation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full_sponsor">Sponsor has all documents — notarized declaration, employment letter, payslips, bank statements (R100k+)</SelectItem>
          <SelectItem value="partial_sponsor">Sponsor has some documents but not complete</SelectItem>
          <SelectItem value="scholarship">Confirmed scholarship covering costs</SelectItem>
          <SelectItem value="not_ready">Financial documents not ready</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Medical insurance */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Travel medical insurance</Label>
      <p className="text-xs text-slate-500 mb-2">Must cover 30,000 EUR, be valid for 365 days from departure, and be from an approved insurer (e.g. AIG, AXA, Hollard, Old Mutual, Santam).</p>
      <Select onValueChange={v => updateField('insurance', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="done">Have it — 30,000 EUR, 365 days, approved insurer</SelectItem>
          <SelectItem value="not_yet">Not arranged yet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

// ── Germany-specific question set (auswaertiges-amt.de) ───────────────────

const GermanyStep = ({ formData, updateField }) => (
  <div className="space-y-5">
    <div className="flex gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-700/30">
      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-200 leading-relaxed">
        Based on the German Federal Foreign Office requirements. Zimbabwe students apply for a <strong>National visa (Type D)</strong> — not a Schengen visa.
      </p>
    </div>

    {/* Visa type awareness */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Visa type</Label>
      <p className="text-xs text-slate-500 mb-2">Studying in Germany requires a <strong className="text-slate-300">National visa</strong> (for stays longer than 90 days). The visa fee is EUR 75. Fee is waived if you receive a public scholarship.</p>
      <Select onValueChange={v => updateField('germanyVisaType', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Which visa are you applying for?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="national_correct">National visa — correct, I know this is what I need</SelectItem>
          <SelectItem value="unsure">Not sure which visa type I need</SelectItem>
          <SelectItem value="schengen_wrong">I thought I needed a Schengen visa</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Passport */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Valid passport</Label>
      <p className="text-xs text-slate-500 mb-2">A valid travel document is required. Applications must be submitted in person at the German mission — your original passport will be checked.</p>
      <Select onValueChange={v => updateField('passportMonthsRemaining', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Passport status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="valid_good">Valid and covers my full study period</SelectItem>
          <SelectItem value="valid_short">Valid but may expire during studies — needs renewal</SelectItem>
          <SelectItem value="no_passport">No passport yet</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Consular Services Portal */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Online application — Consular Services Portal</Label>
      <p className="text-xs text-slate-500 mb-2">Since January 2025, study visa applications can be submitted online via <strong className="text-slate-300">digital.diplo.de</strong>. You upload documents online, then attend in person for fingerprints, biometric photo, and fee payment.</p>
      <Select onValueChange={v => updateField('germanyPortal', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Portal status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="registered">Registered on digital.diplo.de and started application</SelectItem>
          <SelectItem value="aware">Aware of it — not started yet</SelectItem>
          <SelectItem value="unaware">Did not know about the online portal</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* German mission / appointment */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">German Embassy appointment</Label>
      <p className="text-xs text-slate-500 mb-2">Applications must be submitted in person at the German mission responsible for your place of residence. The in-person appointment is required for biometric data (fingerprints and photo) and to pay the EUR 75 fee in person.</p>
      <Select onValueChange={v => updateField('germanyAppointment', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Appointment status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="booked">Appointment booked at German Embassy</SelectItem>
          <SelectItem value="waiting">On the waiting list / trying to book</SelectItem>
          <SelectItem value="not_yet">Not booked yet</SelectItem>
          <SelectItem value="unsure">Not sure which German mission to contact</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Processing time / lead time */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Processing lead time</Label>
      <p className="text-xs text-slate-500 mb-2">National visa applications "may take several months to process." You must start well before your intended study date.</p>
      <Select onValueChange={v => updateField('germanyLeadTime', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="How far in advance are you applying?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6plus">6+ months before my intended start — good lead time</SelectItem>
          <SelectItem value="3_6">3–6 months before — borderline</SelectItem>
          <SelectItem value="under3">Less than 3 months before — very tight</SelectItem>
          <SelectItem value="unsure">Not sure when I want to start</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* University admission */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">University admission</Label>
      <p className="text-xs text-slate-500 mb-2">A study visa requires proof of your purpose of stay. The Consular Services Portal specifically supports visa applications "to pursue your studies."</p>
      <Select onValueChange={v => updateField('admissionLetter', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Admission status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unconditional">Accepted — have a formal admission letter</SelectItem>
          <SelectItem value="conditional">Conditional offer — conditions not yet met</SelectItem>
          <SelectItem value="applied">Applied to a German university, waiting</SelectItem>
          <SelectItem value="not_yet">Not yet applied to a university</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Scholarship */}
    <div className="space-y-1">
      <Label className="text-slate-200 text-sm font-semibold">Scholarship or financial proof</Label>
      <p className="text-xs text-slate-500 mb-2">If you receive funding from public funds (e.g. DAAD, government scholarship), the EUR 75 visa fee is waived. Otherwise, proof of financial resources is required.</p>
      <Select onValueChange={v => updateField('sponsorType', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
          <SelectValue placeholder="Financial situation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="scholarship_public">Public scholarship confirmed (DAAD, government, etc.) — fee waived</SelectItem>
          <SelectItem value="scholarship_private">Private scholarship</SelectItem>
          <SelectItem value="self_or_sponsor">Self-funded or family sponsor</SelectItem>
          <SelectItem value="not_sorted">Financial proof not sorted yet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

// ── Generic step 3 (non-Poland destinations) ──────────────────────────────

const GenericStep = ({ formData, updateField }) => (
  <div className="space-y-4">
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
        <p className="text-sm text-slate-300">Your answers affect the result. Be accurate.</p>
      </div>
    </div>

    <div className="space-y-2">
      <Label>Estimated annual budget (tuition + living)</Label>
      <Select onValueChange={v => updateField('budget', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700">
          <SelectValue placeholder="Select budget range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Under €3,000</SelectItem>
          <SelectItem value="medium">€3,000 – €7,000</SelectItem>
          <SelectItem value="high">€7,000 – €12,000+</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Passport validity (months remaining)</Label>
      <Select onValueChange={v => updateField('passportMonthsRemaining', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700">
          <SelectValue placeholder="Select months remaining" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">0–3 months</SelectItem>
          <SelectItem value="6">4–6 months</SelectItem>
          <SelectItem value="12">7–12 months</SelectItem>
          <SelectItem value="24">12+ months</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Documents readiness</Label>
      <Select onValueChange={v => updateField('documentsReady', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="YES_ALL">All key documents ready</SelectItem>
          <SelectItem value="SOME">Some documents missing</SelectItem>
          <SelectItem value="NO">Not ready</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>When do you want to start?</Label>
      <Select onValueChange={v => updateField('intakeTimeline', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700">
          <SelectValue placeholder="Select timeline" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0_3">0–3 months</SelectItem>
          <SelectItem value="3_6">3–6 months</SelectItem>
          <SelectItem value="6_12">6–12 months</SelectItem>
          <SelectItem value="12_PLUS">12+ months</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>English level (self-declared)</Label>
      <Select onValueChange={v => updateField('englishLevel', v)}>
        <SelectTrigger className="bg-slate-900 border-slate-700">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="B2_PLUS">B2+ (strong)</SelectItem>
          <SelectItem value="B1">B1 (intermediate)</SelectItem>
          <SelectItem value="A2_OR_LOWER">A2 or lower</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Country of residence</Label>
      <Input placeholder="e.g., Zimbabwe"
        className="bg-slate-900 border-slate-700"
        value={formData.residence}
        onChange={e => updateField('residence', e.target.value)} />
    </div>

    <div className="space-y-2">
      <Label>Bachelor programs only (current offering)</Label>
      <RadioGroup
        value={formData.bachelorOnlyConfirm ? "yes" : "no"}
        onValueChange={v => updateField('bachelorOnlyConfirm', v === "yes")}
        className="grid gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="bachelor_yes" />
          <Label htmlFor="bachelor_yes">Yes, Bachelor only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="bachelor_no" />
          <Label htmlFor="bachelor_no">No</Label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

// ── Main modal ─────────────────────────────────────────────────────────────

const ReadinessCheckModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    plan: 'basic',
    educationLevel: '',
    destination: '',
    residence: '',
    email: '',
    phone: '',
    intakeTimeline: '',
    budget: '',
    passportMonthsRemaining: '',
    documentsReady: '',
    englishLevel: '',
    bachelorOnlyConfirm: false,
    // Poland-specific (Syrena requirements)
    alevels: '',
    passportMonthsRemaining: '',
    nawaStatement: '',
    admissionLetter: '',
    certLegalization: '',
    accommodation: '',
    sponsorType: '',
    insurance: '',
    // Germany-specific
    germanyVisaType: '',
    germanyPortal: '',
    germanyAppointment: '',
    germanyLeadTime: '',
  });

  const isPoland   = formData.destination === 'poland';
  const isGermany  = formData.destination === 'germany';

  const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 2) {
      if (!formData.educationLevel) return "Please select your education level.";
      if (!formData.destination) return "Please select your preferred destination.";
      if (!formData.intakeTimeline) return "Please select when you want to start.";
      return true;
    }
    if (step === 3) {
      if (isPoland) {
        if (!formData.alevels) return "Please answer the A-level question.";
        if (!formData.passportMonthsRemaining) return "Please select your passport validity.";
        if (!formData.nawaStatement) return "Please select your NAWA statement status.";
        if (!formData.admissionLetter) return "Please select your admission letter status.";
        if (!formData.certLegalization) return "Please select your certificate legalization status.";
        if (!formData.accommodation) return "Please select your accommodation status.";
        if (!formData.sponsorType) return "Please select your financial proof situation.";
        if (!formData.insurance) return "Please select your insurance status.";
      } else if (isGermany) {
        if (!formData.germanyVisaType) return "Please select the visa type.";
        if (!formData.passportMonthsRemaining) return "Please select your passport status.";
        if (!formData.germanyPortal) return "Please answer the Consular Services Portal question.";
        if (!formData.germanyAppointment) return "Please select your appointment status.";
        if (!formData.germanyLeadTime) return "Please select your application lead time.";
        if (!formData.admissionLetter) return "Please select your admission status.";
        if (!formData.sponsorType) return "Please select your financial situation.";
      } else {
        if (!formData.budget) return "Please select your budget range.";
        if (!formData.passportMonthsRemaining) return "Please select passport validity.";
        if (!formData.documentsReady) return "Please select documents readiness.";
        if (!formData.englishLevel) return "Please select your English level.";
        if (!formData.residence || formData.residence.trim().length < 2) return "Please enter your country of residence.";
        if (formData.bachelorOnlyConfirm !== true) return "You must confirm Bachelor programs only.";
      }
      return true;
    }
    if (step === 4) {
      if (!formData.email || !formData.email.includes('@')) return "Please enter a valid email address.";
      if (!formData.phone || formData.phone.trim().length < 6) return "Please enter a valid WhatsApp number.";
      return true;
    }
    return true;
  };

  const handleNext = () => {
    const valid = validateStep();
    if (valid !== true) {
      toast({ title: "Missing information", description: valid, variant: "destructive" });
      return;
    }
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const scoringResult = await calculateLeadScore({
        destination: formData.destination,
        budget: formData.budget,
        intakeTimeline: formData.intakeTimeline,
        educationLevel: formData.educationLevel,
        residence: formData.residence || 'zimbabwe',
        email: formData.email,
        phone: formData.phone,
      });

      localStorage.setItem("kuro_readiness_payload", JSON.stringify({
        plan: formData.plan === "premium" ? "PREMIUM" : "BASIC",
        answers: { ...formData },
        score: scoringResult.score,
        tier: scoringResult.tier,
        createdAt: new Date().toISOString(),
      }));

      await supabase.from('leads').insert({
        email: formData.email,
        name: 'Student',
        whatsapp: formData.phone,
        goal: `readiness_check_${formData.plan}`,
        target_destination: formData.destination,
        budget_range: formData.budget || formData.sponsorType,
        study_level: formData.educationLevel,
        intake_month: formData.intakeTimeline,
        origin_country: formData.residence || 'Zimbabwe',
        score: scoringResult.score,
        tier: scoringResult.tier,
        scored_at: scoringResult.scored_at,
        intake_form: JSON.stringify(formData),
      });

      const session = await createCheckoutSession({
        applicationId: crypto.randomUUID(),
        amount: formData.plan === "premium" ? 19 : 2.99,
        programName: formData.plan === "premium" ? "Premium Visa Risk Report" : "Basic Readiness Check",
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?payment=cancelled`,
        currency: "eur",
      });

      if (session?.url) { window.location.href = session.url; return; }
      toast({ title: "Payment error", description: "Could not start checkout.", variant: "destructive" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to process request.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center shrink-0">
          <h2 className="text-xl font-bold text-white">Readiness check</h2>
          <p className="text-blue-100 text-sm mt-1">
            {isPoland && step === 3 ? 'Poland — Syrena requirements' : isGermany && step === 3 ? 'Germany — national visa checklist' : 'Assess your admission & visa eligibility'}
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="w-full bg-slate-900 h-1.5 rounded-full mb-6">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1 — Plan */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Label className="text-base font-semibold text-white">Choose your analysis level</Label>
                <RadioGroup defaultValue="basic" onValueChange={v => updateField('plan', v)} className="grid gap-4">
                  <div>
                    <RadioGroupItem value="basic" id="basic" className="peer sr-only" />
                    <Label htmlFor="basic" className="flex flex-col rounded-md border-2 border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-slate-500 cursor-pointer">
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-white">Basic check</span>
                        <span className="font-bold text-slate-400">€2.99</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">Instant automated score</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="premium" id="premium" className="peer sr-only" />
                    <Label htmlFor="premium" className="flex flex-col rounded-md border-2 border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/10 cursor-pointer">
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Premium report</span>
                          <Badge className="bg-blue-600 text-[10px] h-5 px-1">Recommended</Badge>
                        </div>
                        <span className="font-bold text-blue-400">€19</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">Expert review + visa risk analysis + action plan</span>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 2 — Education + Destination + Timeline */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current qualification</Label>
                  <Select onValueChange={v => updateField('educationLevel', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select your highest qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">O-levels only (no A-levels)</SelectItem>
                      <SelectItem value="alevel">A-levels / ZIMSEC Advanced</SelectItem>
                      <SelectItem value="bachelor">Bachelor's degree</SelectItem>
                      <SelectItem value="master">Master's degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred destination</Label>
                  <Select onValueChange={v => updateField('destination', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Where do you want to study?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poland">Poland</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="cyprus">Cyprus</SelectItem>
                      <SelectItem value="uk">UK</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="undecided">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>When do you want to start?</Label>
                  <Select onValueChange={v => updateField('intakeTimeline', v)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0_3">Within 3 months</SelectItem>
                      <SelectItem value="3_6">3–6 months</SelectItem>
                      <SelectItem value="6_12">6–12 months</SelectItem>
                      <SelectItem value="12_PLUS">More than 12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Poland-specific or generic */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {isPoland   ? <PolandStep   formData={formData} updateField={updateField} />
                 : isGermany ? <GermanyStep  formData={formData} updateField={updateField} />
                 :             <GenericStep  formData={formData} updateField={updateField} />
                }
              </motion.div>
            )}

            {/* Step 4 — Contact */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center mb-6">
                  {formData.plan === 'premium'
                    ? <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    : <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  }
                  <h3 className="font-bold">Almost there</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Where should we send your {formData.plan === 'premium' ? 'premium report' : 'result'}?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email address</Label>
                  <Input placeholder="you@example.com" className="bg-slate-900 border-slate-700"
                    value={formData.email} onChange={e => updateField('email', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp number</Label>
                  <Input placeholder="+263..." className="bg-slate-900 border-slate-700"
                    value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-slate-400" disabled={loading}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}
              className={`bg-blue-600 hover:bg-blue-700 ml-auto ${step === 1 ? 'w-full' : ''}`}
              disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? 'Processing...'
                : step === 4 ? `Pay €${formData.plan === 'premium' ? '19' : '2.99'} & get result`
                : 'Continue'}
              {!loading && step !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadinessCheckModal;
