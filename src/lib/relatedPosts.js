// Picks blog posts relevant to a programme: same country first, then same
// subject area, then general planning topics (visa, costs, scholarships...).

const SUBJECTS = [
  { course: /comput|cyber|software|programm|artificial|\bai\b|cloud|devops|data|informat/i, post: /\bIT\b|[Cc]omputer|[Tt]ech|[Cc]yber|[Aa]rtificial|[Ss]oftware/ }, // "IT" case-sensitive so the word "it" doesn't match
  { course: /engineer|mechanic|civil|architect|construct|structur|design and control/i, post: /engineer/i },
  { course: /manag|business|financ|account|econom|bank|market|logist|trade|advertis|tourism|aviation|project|insurance/i, post: /\bbusiness\b|\bmba\b|management|finance/i }, // \bmba\b: "Zimbabwe" contains "mba"
  { course: /nurs|medic|diet|health|psycholog|social work/i, post: /medic|nursing|health/i },
];
const COUNTRIES = ['poland', 'germany', 'latvia', 'lithuania', 'hungary', 'austria', 'malta', 'cyprus', 'canada', 'australia'];
const GENERAL =/visa|cost|tuition|budget|scholarship|intake|timeline|student life/i;

const text = (p) => `${p.title} ${(p.tags || []).join(' ')} ${(p.categories || []).join(' ')}`;

export const pickRelatedPosts = (posts, program, limit = 3) => {
  const country = String(program.country || '').toLowerCase();
  const subject = SUBJECTS.find((s) => s.course.test(program.program_name || ''));
  return (posts || [])
    .map((p) => {
      const t = text(p);
      const lower = t.toLowerCase();
      const sameCountry = !!country && lower.includes(country);
      // A guide to a different destination (Germany guide on a Polish course) is not shown.
      if (!sameCountry && COUNTRIES.some((c) => c !== country && lower.includes(c))) return { p, score: 0 };
      // A post about another subject (e.g. medicine on an IT course) is never shown,
      // even if it mentions the same country.
      const postSubject = SUBJECTS.find((s) => s.post.test(t));
      if (postSubject && postSubject !== subject) return { p, score: 0 };
      let score = 0;
      if (sameCountry) score += 3;
      if (subject && subject.post.test(t)) score += 2;
      if (GENERAL.test(t)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || String(b.p.published_at).localeCompare(String(a.p.published_at)))
    .slice(0, limit)
    .map((x) => x.p);
};
