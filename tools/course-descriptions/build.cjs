// Turns drafts.cjs into (1) a SQL migration and (2) a Markdown review file.
// Usage: node tools/course-descriptions/build.cjs <programs.json>
// programs.json = active rows of `programs` (id, university, program_name, ...).
// The migration only fills descriptions that are still empty, so anything
// edited in Admin in the meantime is never overwritten.
const fs = require('fs');
const path = require('path');
const drafts = require('./drafts.cjs');

const programs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const byPrefix = new Map(programs.map((p) => [p.id.slice(0, 8), p]));

const rows = Object.entries(drafts).map(([prefix, text]) => {
  const p = byPrefix.get(prefix);
  if (!p) throw new Error(`No programme with id prefix ${prefix}`);
  if (text.includes('$desc$')) throw new Error(`Bad delimiter in ${prefix}`);
  return { p, text: text.trim() };
});

const root = path.join(__dirname, '..', '..');
const sql = [
  '-- Course descriptions for programmes that had none (drafted 2026-11-11,',
  '-- reviewed by the owner before running). Only fills empty descriptions.',
  'begin;',
  ...rows.map(({ p, text }) =>
    `update programs set description = $desc$${text}$desc$, updated_at = now()\n  where id = '${p.id}' and coalesce(trim(description), '') = '';`),
  'commit;',
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'supabase/migrations/20261111160000_course_descriptions.sql'), sql);

const words = (t) => t.split(/\s+/).length;
const md = [
  '# Course descriptions: review before publishing',
  '',
  `${rows.length} programmes had an empty description. Drafts below are subject-focused: they explain what the course covers, who it suits and where it leads. Tuition, duration, language and entry requirements are already shown on each course page from the database, so the text repeats none of them and makes no claims about the universities that we have not verified.`,
  '',
  'To publish: edit anything here in `tools/course-descriptions/drafts.cjs`, run `node tools/course-descriptions/build.cjs <programs.json>` if you changed it, then',
  '`supabase db query --linked -f supabase/migrations/20261111160000_course_descriptions.sql`.',
  '',
  ...rows.flatMap(({ p, text }) => [
    `## ${p.program_name} · ${p.university}`,
    `\`${p.id}\` · ${words(text)} words`,
    '',
    text,
    '',
  ]),
].join('\n');
fs.writeFileSync(path.join(root, 'tools/course-descriptions/REVIEW.md'), md);

console.log(`${rows.length} descriptions, ${Math.min(...rows.map((r) => words(r.text)))}-${Math.max(...rows.map((r) => words(r.text)))} words`);
