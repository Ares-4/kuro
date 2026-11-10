// Kuro assistant: answers from site data only (no LLM, no API cost).
//
// 1. Live intents: deadlines, scholarships, visa and cost questions are answered
//    straight from the same tables the public pages use, so answers never drift
//    from what the site shows.
// 2. Everything else: ranked match against the admin-managed knowledge_base.
import { supabase } from '@/lib/customSupabaseClient';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'what', 'how', 'do', 'does', 'can',
  'will', 'would', 'could', 'should', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'not',
  'be', 'have', 'has', 'it', 'this', 'that', 'with', 'about', 'from', 'you', 'your', 'there', 'any',
  'need', 'want', 'get', 'much', 'many', 'which', 'when', 'where', 'who', 'please', 'tell', 'know',
]);

// Aliases -> canonical destination. `slug` is destinations.slug; `match` is how the
// country is written in scholarships.countries / university_deadlines.country.
const COUNTRIES = [
  { slug: 'poland', name: 'Poland', match: ['poland'], aliases: ['poland', 'polish', 'warsaw', 'krakow'] },
  { slug: 'germany', name: 'Germany', match: ['germany'], aliases: ['germany', 'german', 'berlin', 'munich'] },
  { slug: 'uk', name: 'UK', match: ['uk', 'united kingdom'], aliases: ['uk', 'britain', 'england', 'london', 'scotland', 'united kingdom', 'british'] },
  { slug: 'canada', name: 'Canada', match: ['canada'], aliases: ['canada', 'canadian', 'toronto', 'vancouver'] },
  { slug: 'australia', name: 'Australia', match: ['australia'], aliases: ['australia', 'australian', 'sydney', 'melbourne'] },
  { slug: 'usa', name: 'USA', match: ['usa', 'united states'], aliases: ['usa', 'america', 'american', 'united states'] },
  { slug: 'hungary', name: 'Hungary', match: ['hungary'], aliases: ['hungary', 'hungarian', 'budapest'] },
  { slug: 'austria', name: 'Austria', match: ['austria'], aliases: ['austria', 'austrian', 'vienna'] },
  { slug: 'lithuania', name: 'Lithuania', match: ['lithuania'], aliases: ['lithuania', 'lithuanian', 'vilnius'] },
  { slug: 'latvia', name: 'Latvia', match: ['latvia'], aliases: ['latvia', 'latvian', 'riga'] },
  { slug: 'malta', name: 'Malta', match: ['malta'], aliases: ['malta', 'maltese'] },
  { slug: 'cyprus', name: 'Cyprus', match: ['cyprus'], aliases: ['cyprus', 'cypriot', 'nicosia'] },
];

const INTENTS = {
  deadline: /\b(deadline|deadlines|closing|closes|due date|last date|apply by|when (can|should|do) i apply)\b/,
  scholarship: /\b(scholarship|scholarships|bursary|bursaries|funding|grant|grants|fully funded)\b/,
  visa: /\b(visa|permit|immigration|embassy|consulate)\b/,
  cost: /\b(cost|costs|tuition|fees?|expensive|cheap|afford|living|budget|price|how much)\b/,
};

const normalize = (text) => ` ${text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ')} `;

const stem = (word) => word.replace(/(ies)$/, 'y').replace(/(es|s)$/, '');

export const extractKeywords = (text) =>
  normalize(text).trim().split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w)).map(stem);

export const detectCountry = (text) => {
  const haystack = normalize(text);
  return COUNTRIES.find((c) => c.aliases.some((alias) => haystack.includes(` ${alias} `))) || null;
};

const countryMatches = (value, country) =>
  !!value && country.match.some((m) => String(value).toLowerCase().includes(m));

const formatDate = (iso) =>
  iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Rolling';

async function answerDeadlines(country) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('university_deadlines')
    .select('university_name, program_name, country, deadline_date, intake_season, intake_year')
    .eq('is_active', true)
    .gte('deadline_date', today)
    .order('deadline_date', { ascending: true })
    .limit(40);
  const rows = (data || []).filter((d) => !country || countryMatches(d.country, country)).slice(0, 4);
  if (!rows.length) {
    return {
      content: country
        ? `I don't have upcoming ${country.name} deadlines listed right now. Our advisors track rolling intakes too, so book a free consultation and we'll check for you.`
        : "There are no upcoming deadlines listed right now. Check back soon, or book a free consultation.",
      pageLink: '/deadlines',
    };
  }
  const lines = rows.map((d) => `• ${d.university_name}${d.program_name ? ` (${d.program_name})` : ''}: ${formatDate(d.deadline_date)}${d.intake_season ? `, ${d.intake_season} ${d.intake_year || ''}`.trimEnd() : ''}`);
  return {
    content: `Next ${country ? `${country.name} ` : ''}application deadlines:\n${lines.join('\n')}`,
    pageLink: '/deadlines',
  };
}

async function answerScholarships(country) {
  const { data } = await supabase
    .from('scholarships')
    .select('id, title, provider, amount, countries, deadline')
    .eq('is_active', true)
    .order('deadline', { ascending: true, nullsFirst: false })
    .limit(60);
  const today = new Date().toISOString().slice(0, 10);
  const rows = (data || [])
    .filter((s) => !s.deadline || s.deadline >= today)
    .filter((s) => !country || (s.countries || []).some((c) => countryMatches(c, country)))
    .slice(0, 4);
  if (!rows.length) {
    return {
      content: country
        ? `I don't have open ${country.name} scholarships listed right now. Browse all scholarships, or subscribe on a scholarship page to get alerts.`
        : "No open scholarships are listed right now. Check the scholarships page for updates.",
      pageLink: '/scholarships',
    };
  }
  const lines = rows.map((s) => `• ${s.title}${s.amount ? `: ${s.amount}` : ''} (deadline ${formatDate(s.deadline)})`);
  return {
    content: `Open ${country ? `${country.name} ` : ''}scholarships:\n${lines.join('\n')}`,
    pageLink: rows.length === 1 ? `/scholarships/${rows[0].id}` : '/scholarships',
  };
}

async function answerVisa(country) {
  const { data } = await supabase
    .from('destination_visa_info')
    .select('visa_type, processing_time, cost, official_link, last_verified')
    .eq('destination_slug', country.slug)
    .maybeSingle();
  if (!data) return null;
  const parts = [
    `${country.name}: ${data.visa_type}.`,
    data.processing_time && `Processing: ${data.processing_time}.`,
    data.cost && `Fee: ${data.cost}.`,
    data.official_link && `Official source: ${data.official_link}`,
    data.last_verified && `(Last verified ${formatDate(data.last_verified)}. Always confirm on the official site before paying.)`,
  ].filter(Boolean);
  return { content: parts.join('\n'), pageLink: `/destinations/${country.slug}` };
}

async function answerCost(country) {
  const { data } = await supabase
    .from('destinations')
    .select('name, tuition_cost, living_cost')
    .eq('slug', country.slug)
    .maybeSingle();
  if (!data || (!data.tuition_cost && !data.living_cost)) return null;
  return {
    content: `Typical costs in ${data.name}:\n• Tuition: ${data.tuition_cost || 'varies by programme'}\n• Living: ${data.living_cost || 'varies by city'}\nUse the intake planner to build a full 2027 budget.`,
    pageLink: `/destinations/${country.slug}`,
  };
}

// knowledge_base is small (tens to low hundreds of rows): load once per session
// and rank locally instead of firing several ilike queries per message.
let kbCache = null;
const loadKnowledgeBase = async () => {
  if (!kbCache) {
    kbCache = supabase
      .from('knowledge_base')
      .select('question, answer, tags, page_link')
      .eq('is_active', true)
      .then(({ data }) =>
        (data || []).map((row) => ({
          ...row,
          q: normalize(row.question),
          a: normalize(row.answer),
          t: (row.tags || []).map((tag) => stem(String(tag).toLowerCase())),
        })),
      )
      .catch(() => {
        kbCache = null;
        return [];
      });
  }
  return kbCache;
};

const scoreRow = (row, keywords, country) => {
  let score = 0;
  for (const kw of keywords) {
    if (row.t.includes(kw)) score += 3;
    if (row.q.includes(` ${kw}`)) score += 3;
    else if (row.a.includes(` ${kw}`)) score += 1;
  }
  if (country) {
    const mentions = country.aliases.some((alias) => row.q.includes(` ${alias} `) || row.t.includes(alias));
    // A question about Hungary must never get the Poland answer.
    const otherCountry = COUNTRIES.some((c) => c !== country && c.aliases.some((alias) => row.q.includes(` ${alias} `)));
    if (mentions) score += 4;
    else if (otherCountry) score -= 6;
  }
  return score;
};

async function answerFromKnowledgeBase(text, country) {
  const keywords = extractKeywords(text);
  if (!keywords.length) return null;
  const rows = await loadKnowledgeBase();
  let best = null;
  let bestScore = 0;
  for (const row of rows) {
    const score = scoreRow(row, keywords, country);
    if (score > bestScore) {
      best = row;
      bestScore = score;
    }
  }
  // Require more than a single weak answer-body hit.
  return best && bestScore >= 3 ? { content: best.answer, pageLink: best.page_link || null } : null;
}

/** Returns { content, pageLink } or null when nothing relevant was found. */
export async function answerQuestion(text) {
  const haystack = normalize(text);
  const country = detectCountry(text);

  try {
    if (INTENTS.deadline.test(haystack)) return await answerDeadlines(country);
    if (INTENTS.scholarship.test(haystack)) return await answerScholarships(country);
    if (country && INTENTS.visa.test(haystack)) {
      const visa = await answerVisa(country);
      if (visa) return visa;
    }
    if (country && INTENTS.cost.test(haystack) && !/\bkuro\b/.test(haystack)) {
      const cost = await answerCost(country);
      if (cost) return cost;
    }
  } catch {
    // Fall through to the knowledge base if a live lookup fails.
  }

  return answerFromKnowledgeBase(text, country);
}
