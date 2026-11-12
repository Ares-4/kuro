// Builds four long-form Poland blog posts from live data and writes a migration
// that inserts them as DRAFTS (status 'draft') for the owner to review in
// Admin > Blog before publishing.
//
// Facts come only from: the programs table (tuition, duration, application fee,
// as shown on the course pages), destination_visa_info for Poland (verified
// against the official consular page), and figures the site already uses.
//
// Usage: node tools/blog-drafts/build.cjs <poland-programs.json> <poland-visa.json>
const fs = require('fs');
const path = require('path');

const programs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const visa = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const root = path.join(__dirname, '..', '..');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = (n) => `€${Number(n).toLocaleString('en-GB')}`;
const uniName = (u) => u.replace(/\s*\(.*\)$/, '');
const city = (u) => (u.match(/\(([^,]+),/) || [])[1] || '';
const years = (d) => { const n = parseFloat(String(d)); return Number.isFinite(n) ? `${n} years` : String(d); };
const link = (p) => `<a href="/courses/${p.id}">${esc(p.program_name.replace(/\s+(BSc|BA|BSN|BSW)$/, ''))}</a>`;
const fee = (p) => (Number(p.tuition_fee) ? Number(p.tuition_fee) : null);

const byUni = {};
for (const p of programs) (byUni[p.university] ||= []).push(p);
const unis = Object.entries(byUni).map(([u, list]) => {
  const fees = list.map(fee).filter(Boolean);
  return { u, name: uniName(u), city: city(u), list, min: Math.min(...fees), max: Math.max(...fees) };
}).sort((a, b) => a.min - b.min);
const allFees = programs.map(fee).filter(Boolean);
const minFee = Math.min(...allFees);
const maxFee = Math.max(...allFees);
const cheapest = [...programs].filter(fee).sort((a, b) => fee(a) - fee(b)).slice(0, 8);

const LIVING_MIN = 500; // monthly estimate already used on the site
const LIVING_MAX = 800;
const verified = visa.last_verified;
const docs = visa.documents || [];

const confirmNote = `<p><em>Fees are the annual figures currently listed on our course pages for students from outside the EU. Universities update prices each year and sometimes run discounts, so we confirm the exact fee for your intake before you pay anything.</em></p>`;

const posts = [];

// 1 ─ Tuition fees compared
posts.push({
  slug: 'poland-tuition-fees-english-bachelors-2027',
  title: 'Tuition Fees in Poland for English-Taught Bachelor\'s Degrees (2027 Intake)',
  excerpt: `What English-taught Bachelor's degrees in Poland really cost: ${programs.length} programmes at ${unis.length} universities compared, from ${eur(minFee)} to ${eur(maxFee)} a year, with the cheapest options and what else to budget for.`,
  categories: ['Study Guides', 'Costs'],
  tags: ['poland', 'tuition fees', 'bachelor', '2027', 'cheap universities', 'zimbabwe'],
  content: `
<p>Poland is one of the most affordable places in the EU to earn an English-taught degree. Across the ${programs.length} Bachelor's programmes we currently list in Poland, annual tuition for students from outside the EU runs from <strong>${eur(minFee)}</strong> to <strong>${eur(maxFee)}</strong>. This guide compares the universities side by side, lists the lowest-cost programmes, and explains what else to budget for.</p>

<h2>Tuition by university</h2>
<table>
  <thead><tr><th>University</th><th>City</th><th>Programmes</th><th>Tuition per year</th></tr></thead>
  <tbody>
${unis.map((x) => `    <tr><td>${esc(x.name)}</td><td>${esc(x.city)}</td><td>${x.list.length}</td><td>${eur(x.min)}${x.max !== x.min ? ` – ${eur(x.max)}` : ''}</td></tr>`).join('\n')}
  </tbody>
</table>
${confirmNote}

<h2>The lowest-cost English-taught programmes</h2>
<p>If budget is your main concern, these are the most affordable programmes on our list right now:</p>
<table>
  <thead><tr><th>Programme</th><th>University</th><th>Length</th><th>Tuition per year</th></tr></thead>
  <tbody>
${cheapest.map((p) => `    <tr><td>${link(p)}</td><td>${esc(uniName(p.university))}</td><td>${years(p.duration)}</td><td>${eur(fee(p))}</td></tr>`).join('\n')}
  </tbody>
</table>
<p>Cheaper does not mean worse: all of these are full Bachelor's degrees from Polish universities. The bigger differences are the city (Warsaw is the most expensive place to live, smaller cities such as Lublin, Rzeszów and Nowy Targ are cheaper), the subject, and whether the programme length is three or three and a half years, which changes the total cost of the degree.</p>

<h2>Total cost of the degree, not just the yearly fee</h2>
<p>Always multiply by the length of the programme. A ${eur(2700)} programme over three years costs ${eur(8100)} in tuition, while a ${eur(4000)} programme over three and a half years costs ${eur(14000)}. Engineering, IT and architecture degrees are often 3.5 or 4 years long.</p>

<h2>Other costs to plan for</h2>
<ul>
  <li><strong>Application fee:</strong> the programmes on our list show an application fee of ${esc(programs[0].application_fee || '€50')}.</li>
  <li><strong>Student visa:</strong> the Polish national (Type D) visa fee is ${esc(visa.cost)} and is not refunded if the visa is refused. See our <a href="/blog/poland-student-visa-type-d-guide-2027">Poland student visa guide</a>.</li>
  <li><strong>Health insurance:</strong> required for the visa, with at least €30,000 of cover.</li>
  <li><strong>Living costs:</strong> most students budget about ${eur(LIVING_MIN)}–${eur(LIVING_MAX)} a month for accommodation, food and transport, depending on the city and lifestyle.</li>
</ul>
<p>For a full first-year budget, read <a href="/blog/cost-of-studying-in-poland-first-year-budget-2027">how much it costs to study in Poland for your first year</a>.</p>

<h2>How to choose</h2>
<ol>
  <li>Start with the subject you want, then compare the universities that offer it.</li>
  <li>Compare the <strong>total</strong> tuition over the full programme, plus living costs in that city.</li>
  <li>Check the entry requirements: most programmes ask for a high school certificate (for example A-levels or an equivalent), a passport and proof of English.</li>
  <li>Apply early. Popular programmes and accommodation fill up, and the visa takes time.</li>
</ol>
<p>Not sure where you fit? Take our <a href="/readiness-check">readiness check</a> or <a href="/contact">talk to an advisor</a>, and we will shortlist programmes that match your results and budget. You can also browse every programme on our <a href="/courses">courses page</a>.</p>
`,
});

// 2 ─ Visa guide
posts.push({
  slug: 'poland-student-visa-type-d-guide-2027',
  title: 'Poland Student Visa (Type D) for 2027: Documents, Fees and Timeline',
  excerpt: `How to get a Polish national (Type D) student visa for the 2027 intake: the documents you need, the ${visa.cost} fee, processing times, and a week-by-week timeline so you arrive in time for classes.`,
  categories: ['Visas', 'Study Guides'],
  tags: ['poland', 'student visa', 'type d visa', '2027', 'zimbabwe', 'south africa'],
  content: `
<p>If you are from outside the EU and have been accepted to a full-time degree in Poland, you will normally travel on a <strong>${esc(visa.visa_type)}</strong>. This guide covers what you need, what it costs and how long it takes, based on the official Polish consular guidance (last checked ${esc(verified)}).</p>

<h2>Key facts</h2>
<table>
  <tbody>
    <tr><th>Visa</th><td>${esc(visa.visa_type)}</td></tr>
    <tr><th>Fee</th><td>${esc(visa.cost)}, non-refundable</td></tr>
    <tr><th>Processing time</th><td>${esc(visa.processing_time)}</td></tr>
    <tr><th>Where to apply</th><td>Book through the Polish e-konsulat system with the consulate responsible for your country</td></tr>
    <tr><th>Official information</th><td><a href="${esc(visa.official_link)}" target="_blank" rel="noopener noreferrer">Polish government: national visa (Type D)</a></td></tr>
  </tbody>
</table>

<h2>Documents you need</h2>
<ul>
${docs.map((d) => `  <li>${esc(d)}</li>`).join('\n')}
</ul>
<p>Health insurance must cover at least €30,000 for the whole stay. Your acceptance letter comes from the university once you have been admitted and, for most private universities, once you have paid the first tuition instalment. Bring originals and copies, and check the consulate's own list before your appointment, because individual consulates can ask for extra documents.</p>

<h2>Timeline for an October 2027 start</h2>
<table>
  <thead><tr><th>When</th><th>Step</th></tr></thead>
  <tbody>
    <tr><td>January – April 2027</td><td>Choose programmes and apply. Prepare your passport (it must be valid for at least six months beyond your stay) and certified copies of your certificates.</td></tr>
    <tr><td>April – June 2027</td><td>Receive your admission decision, pay the first instalment and get your official acceptance letter.</td></tr>
    <tr><td>As soon as you have the letter</td><td>Book your e-konsulat appointment. Slots can be limited at busy times.</td></tr>
    <tr><td>8 weeks before departure</td><td>Have every document ready: insurance, proof of funds, accommodation. We recommend this buffer even though the official minimum is shorter.</td></tr>
    <tr><td>July – August 2027</td><td>Attend the appointment and wait for the decision (${esc(visa.processing_time.split('(')[0].trim())}).</td></tr>
    <tr><td>September 2027</td><td>Travel, register with your university and start classes in October.</td></tr>
  </tbody>
</table>

<h2>After you arrive</h2>
<p>The national visa lets you enter and start your studies. If your degree is longer than the visa, apply for a <strong>temporary residence permit</strong> at the regional office (voivodeship office) while your visa is still valid. Full-time students with a residence permit can generally work in Poland without a separate work permit, which helps with living costs.</p>

<h2>Common reasons for delays or refusals</h2>
<ul>
  <li>Proof of funds that does not clearly cover the required amount, or bank statements without a clear history.</li>
  <li>Health insurance with too little cover or the wrong dates.</li>
  <li>Booking the appointment too late for the start of classes.</li>
  <li>Missing translations or certified copies.</li>
</ul>

<h2>How Kuro helps</h2>
<p>We prepare and check your visa file with you before the appointment, help you book insurance and accommodation, and keep an eye on appointment availability. Start with our <a href="/readiness-check">readiness check</a>, compare <a href="/blog/poland-tuition-fees-english-bachelors-2027">tuition fees in Poland</a>, or <a href="/contact">contact an advisor</a>.</p>
<p><em>Visa rules can change. Always confirm the current requirements on the <a href="${esc(visa.official_link)}" target="_blank" rel="noopener noreferrer">official Polish government page</a> before you apply.</em></p>
`,
});

// 3 ─ IT degrees
const itRe = /cyber|comput|artificial|cloud|program|software/i;
const it = programs.filter((p) => itRe.test(p.program_name) && fee(p)).sort((a, b) => fee(a) - fee(b));
const itMin = Math.min(...it.map(fee));
const itMax = Math.max(...it.map(fee));
// Each programme goes in the first group it matches (Computer Science first, so a
// "Computer Science (AI, Cyber Security)" degree is not listed three times).
const placed = new Set();
const group = (re) => it.filter((p) => !placed.has(p.id) && re.test(p.program_name)).map((p) => (placed.add(p.id), p));
const groups = [
  ['Computer Science and Software', /computer science|software|programming/i, 'Programming, algorithms, databases and software engineering: the broadest foundation for a career in tech.'],
  ['Cybersecurity', /cyber/i, 'Protecting networks, systems and data: networking, cryptography, ethical hacking and incident response. Security specialists are in short supply worldwide.'],
  ['Artificial Intelligence', /artificial|\bAI\b/i, 'Machine learning, data and the maths behind AI, with programming throughout. Strong maths at school helps.'],
  ['Computer Engineering and Cloud', /computer engineering|cloud|design and control/i, 'Where hardware meets software, from embedded systems to cloud platforms and DevOps.'],
];
posts.push({
  slug: 'study-it-in-poland-ai-cybersecurity-computer-science-2027',
  title: 'Study IT in Poland in English: AI, Cybersecurity and Computer Science Degrees for 2027',
  excerpt: `${it.length} English-taught IT Bachelor's degrees in Poland compared: Cybersecurity, Artificial Intelligence, Computer Science, Computer Engineering and Cloud, from ${eur(itMin)} a year.`,
  categories: ['Study Guides', 'Programmes'],
  tags: ['poland', 'computer science', 'cybersecurity', 'artificial intelligence', 'it degrees', '2027'],
  content: `
<p>IT is the most popular subject area for our students heading to Poland, and it is easy to see why: the degrees are taught in English, tuition is low by European standards, and tech skills travel well. We currently list <strong>${it.length} English-taught IT Bachelor's programmes</strong> in Poland, with tuition from <strong>${eur(itMin)}</strong> to <strong>${eur(itMax)}</strong> a year.</p>

${groups.map(([name, re, blurb]) => {
    const list = group(re);
    if (!list.length) return '';
    return `<h2>${name}</h2>
<p>${blurb}</p>
<table>
  <thead><tr><th>Programme</th><th>University</th><th>Length</th><th>Tuition per year</th></tr></thead>
  <tbody>
${list.map((p) => `    <tr><td>${link(p)}</td><td>${esc(uniName(p.university))}, ${esc(city(p.university))}</td><td>${years(p.duration)}</td><td>${eur(fee(p))}</td></tr>`).join('\n')}
  </tbody>
</table>`;
  }).filter(Boolean).join('\n\n')}
${confirmNote}

<h2>Which IT degree should you choose?</h2>
<ul>
  <li><strong>Not sure yet?</strong> Computer Science gives the widest choice later, including a Master's in AI or security.</li>
  <li><strong>Like puzzles and how systems break?</strong> Cybersecurity.</li>
  <li><strong>Strong in maths?</strong> Artificial Intelligence.</li>
  <li><strong>Interested in hardware or infrastructure?</strong> Computer Engineering or Cloud &amp; DevOps.</li>
</ul>
<p>Most programmes ask for a high school certificate, a passport and proof of English. Maths at A-level (or equivalent) is a real advantage for AI and Computer Science, even where it is not formally required.</p>

<h2>Three or three and a half years?</h2>
<p>Several engineering-style IT degrees last 3.5 years (seven semesters) instead of three. Compare the total tuition, and remember the extra semester adds living costs too.</p>

<h2>Next steps</h2>
<p>See <a href="/blog/poland-tuition-fees-english-bachelors-2027">tuition fees for all subjects in Poland</a>, read our <a href="/blog/poland-student-visa-type-d-guide-2027">student visa guide</a>, or take the <a href="/readiness-check">readiness check</a> and an advisor will help you shortlist the right IT programme.</p>
`,
});

// 4 ─ First-year budget
const lowYear = minFee + LIVING_MIN * 12;
const highYear = maxFee + LIVING_MAX * 12;
posts.push({
  slug: 'cost-of-studying-in-poland-first-year-budget-2027',
  title: 'How Much Does It Cost to Study in Poland? A First-Year Budget for 2027',
  excerpt: `A realistic first-year budget for studying in Poland in 2027: tuition, application and visa fees, insurance and living costs, adding up to roughly ${eur(lowYear)}–${eur(highYear)} before flights.`,
  categories: ['Costs', 'Study Guides'],
  tags: ['poland', 'cost of studying', 'budget', 'living costs', '2027', 'zimbabwe'],
  content: `
<p>Families often ask us one question first: how much will the first year really cost? Here is a straightforward budget for an English-taught Bachelor's degree in Poland, using the fees on our course pages and the official visa requirements.</p>

<h2>First-year budget at a glance</h2>
<table>
  <thead><tr><th>Cost</th><th>Amount</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Tuition (one year)</td><td>${eur(minFee)} – ${eur(maxFee)}</td><td>Depends on university and programme</td></tr>
    <tr><td>Application fee</td><td>${esc(programs[0].application_fee || '€50')}</td><td>Paid once, when you apply</td></tr>
    <tr><td>Student visa (Type D)</td><td>${esc(visa.cost)}</td><td>Non-refundable</td></tr>
    <tr><td>Health insurance</td><td>Varies</td><td>Must cover at least €30,000; get quotes</td></tr>
    <tr><td>Living costs (12 months)</td><td>${eur(LIVING_MIN * 12)} – ${eur(LIVING_MAX * 12)}</td><td>About ${eur(LIVING_MIN)}–${eur(LIVING_MAX)} a month</td></tr>
    <tr><td>Flights</td><td>Varies</td><td>Book early for the best fares</td></tr>
    <tr><td><strong>Estimated total</strong></td><td><strong>${eur(lowYear)} – ${eur(highYear)}</strong></td><td>Before insurance and flights</td></tr>
  </tbody>
</table>
${confirmNote}

<h2>Tuition</h2>
<p>Tuition is usually the biggest single cost. Smaller cities tend to be cheaper on both tuition and rent. Compare all universities in our <a href="/blog/poland-tuition-fees-english-bachelors-2027">Poland tuition guide</a>. Many universities let you pay per semester rather than the full year up front, which spreads the cost.</p>

<h2>Living costs</h2>
<p>Most students spend about ${eur(LIVING_MIN)}–${eur(LIVING_MAX)} a month. The biggest variable is accommodation: a shared flat or student residence is much cheaper than living alone, and Warsaw costs more than Lublin, Rzeszów or Nowy Targ. Food, a monthly transport pass and a phone plan make up most of the rest.</p>

<h2>Proof of funds for the visa</h2>
<p>For the visa, you must show that you can support yourself. The consular guidance in our records lists proof of financial means of €500 a month. Plan your savings or sponsor letters around this early, because unclear bank statements are one of the most common causes of visa delays. Our <a href="/blog/poland-student-visa-type-d-guide-2027">visa guide</a> explains the documents.</p>

<h2>Ways to reduce the cost</h2>
<ul>
  <li><strong>Choose the city carefully.</strong> Rent in a smaller city can save hundreds of euros a year.</li>
  <li><strong>Work part-time.</strong> Full-time students with a residence permit can generally work without a separate work permit.</li>
  <li><strong>Look for scholarships and discounts.</strong> Some universities offer early-application or merit discounts. Browse our <a href="/scholarships">scholarships page</a>.</li>
  <li><strong>Pay attention to programme length.</strong> A 3-year degree costs less in total than a 3.5-year one.</li>
</ul>

<h2>Get a personal budget</h2>
<p>Every student's situation is different. Take our <a href="/readiness-check">readiness check</a> and an advisor will build a budget around the programmes you are considering, or <a href="/contact">contact us</a> directly.</p>
`,
});

const words = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const arr = (a) => `array[${a.map((t) => `'${t.replace(/'/g, "''")}'`).join(', ')}]`;
const lit = (s) => { if (s.includes('$post$')) throw new Error('delimiter'); return `$post$${s}$post$`; };

const sql = [
  '-- Four Poland blog posts built from live data (tools/blog-drafts/build.cjs).',
  "-- Inserted as DRAFTS: review in Admin > Blog, then publish. Skips slugs that exist.",
  'begin;',
  '-- Course name tidy-ups (typo and stray spaces, shown on course pages too).',
  "update programs set program_name = 'Computer Science (Artificial Intelligence, Cyber Security)', updated_at = now() where left(id::text, 8) = '6744a9e2';",
  "update programs set program_name = 'Computer Science (Software Engineering)', updated_at = now() where left(id::text, 8) = '2ce69f27';",
  ...posts.map((p) => `insert into blog_posts (title, slug, excerpt, content, categories, tags, featured_image, status)
select ${lit(p.title)}, '${p.slug}', ${lit(p.excerpt)}, ${lit(p.content.trim())},
  ${arr(p.categories)}, ${arr(p.tags)},
  (select featured_image from blog_posts where slug = '${p.slug.startsWith('study-it') ? 'it-tech-programs-europe-best-universities' : 'study-in-poland-from-southern-africa-2027'}'),
  'draft'
where not exists (select 1 from blog_posts where slug = '${p.slug}');`),
  'commit;',
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'supabase/migrations/20261112100000_poland_blog_drafts.sql'), sql);

const md = ['# Poland blog drafts: review', '', ...posts.flatMap((p) => [`## ${p.title}`, `/blog/${p.slug} · ${words(p.content)} words`, '', `> ${p.excerpt}`, '', p.content.trim(), ''])].join('\n');
fs.writeFileSync(path.join(__dirname, 'REVIEW.md'), md);
posts.forEach((p) => console.log(p.slug, words(p.content), 'words'));
