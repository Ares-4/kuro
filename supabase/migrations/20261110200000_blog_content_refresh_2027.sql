-- Blog refresh for the 2027 cycle.
-- 7 published posts were one-sentence stubs (74–112 characters): rewritten as
-- full articles. 3 new 2027-intake posts added. Figures come from the site's own
-- destination, visa (verified 2026-11-10), scholarship, deadline and programme
-- data, so the blog and the destination pages agree.

-- ── 1. Cost of living ───────────────────────────────────────────────────────
update blog_posts set
  title = 'Cost of Living as a Student in Europe: 2027 Breakdown by Country',
  excerpt = 'Monthly living costs and yearly tuition for 9 European study destinations, from Poland and Hungary (from about €500 a month) to Malta and Austria, plus how to build a realistic budget.',
  tags = array['cost of living','budget','europe','tuition','2027'],
  updated_at = now(),
  content = $html$
<p>Tuition is only half of your study-abroad budget. Rent, food, transport and insurance decide whether your money lasts the whole year, and embassies check that you can cover them before they issue a visa. This guide compares typical student costs across the European destinations we work with, using the same figures as our destination pages.</p>

<h2>Monthly living costs and yearly tuition</h2>
<table>
  <thead><tr><th>Country</th><th>Living cost / month</th><th>Tuition / year</th></tr></thead>
  <tbody>
    <tr><td><a href="/destinations/poland">Poland</a></td><td>€500 – €800</td><td>€2,000 – €6,000</td></tr>
    <tr><td><a href="/destinations/hungary">Hungary</a></td><td>€500 – €900</td><td>€3,000 – €10,000</td></tr>
    <tr><td><a href="/destinations/latvia">Latvia</a></td><td>€600 – €900</td><td>€2,500 – €6,000</td></tr>
    <tr><td><a href="/destinations/lithuania">Lithuania</a></td><td>€600 – €900</td><td>€2,000 – €5,000</td></tr>
    <tr><td><a href="/destinations/germany">Germany</a></td><td>€700 – €1,100</td><td>€0 – €3,000 (mostly semester fees)</td></tr>
    <tr><td><a href="/destinations/cyprus">Cyprus</a></td><td>€700 – €1,100</td><td>€5,000 – €12,000</td></tr>
    <tr><td><a href="/destinations/malta">Malta</a></td><td>€800 – €1,300</td><td>€5,000 – €14,000</td></tr>
    <tr><td><a href="/destinations/austria">Austria</a></td><td>€900 – €1,400</td><td>€1,500 – €5,000</td></tr>
  </tbody>
</table>
<p>Ranges are wide because capital cities cost more than smaller university towns. Warsaw or Vienna sit at the top of each range; cities such as Lublin, Rzeszów or Debrecen sit near the bottom.</p>

<h2>Where the money goes</h2>
<ul>
  <li><strong>Accommodation (40–50%)</strong>: a shared flat or student residence is the biggest cost. Dormitories are cheapest but fill early, so apply as soon as you accept your offer.</li>
  <li><strong>Food (20–25%)</strong>: cooking at home and using student canteens keeps this low. Supermarkets such as Lidl and Biedronka are popular with students in Poland.</li>
  <li><strong>Transport (5%)</strong>: most cities offer student discounts of 50% or more on monthly passes.</li>
  <li><strong>Health insurance</strong>: required for your visa or residence permit. Budget for it before you arrive.</li>
  <li><strong>Phone, books and personal costs</strong>: smaller items that add up to €50–€100 a month.</li>
</ul>

<h2>Proof of funds is not the same as your budget</h2>
<p>Most countries ask you to show a minimum amount before granting a visa. Germany, for example, requires a blocked account with €992 per month for 2026 (€11,904 for a year). Austria expects about €722.58 per month if you are under 24 and €1,308.39 if you are 24 or older. Latvia asks for roughly €780 per month. These are legal minimums, not comfortable budgets, so plan to have a little more.</p>

<h2>Five ways to stretch your budget</h2>
<ol>
  <li>Choose a smaller city: the same degree often costs far less to live on outside the capital.</li>
  <li>Look for scholarships early. Our <a href="/scholarships">scholarships page</a> lists open awards, including Stipendium Hungaricum and Erasmus Mundus.</li>
  <li>Check part-time work rules. Full-time students in Poland on a residence permit can generally work without a separate permit, and Germany allows 140 full or 280 half days a year.</li>
  <li>Pay tuition yearly if your university offers a discount for it.</li>
  <li>Arrive with an emergency fund of at least one month's costs.</li>
</ol>

<h2>Plan your numbers</h2>
<p>Our <a href="/intake-planner">2027 intake planner</a> builds a month-by-month plan with budget estimates for your chosen country. If you are not sure what you can afford, the <a href="/eligibility">eligibility check</a> looks at your budget alongside your grades and suggests realistic destinations.</p>
$html$
where slug = 'cost-of-living-student-europe-breakdown';

-- ── 2. Engineering universities ─────────────────────────────────────────────
update blog_posts set
  title = 'Best Engineering Universities in Europe for International Students (2027)',
  excerpt = 'Europe''s best-known engineering schools, the affordable alternatives that admit far more international students, and engineering programmes open for the 2027 intake.',
  tags = array['engineering','universities','europe','germany','poland','2027'],
  updated_at = now(),
  content = $html$
<p>Europe trains engineers to a very high standard, and many of its technical universities charge low or no tuition. The challenge for international students is matching ambition with admission chances, language and budget. This guide covers the famous names, the more accessible options, and what you need to apply.</p>

<h2>The well-known leaders</h2>
<p>These universities appear near the top of most international engineering rankings. Entry is competitive and many programmes expect excellent grades in maths and physics.</p>
<ul>
  <li><strong>Technical University of Munich (Germany)</strong>: strong in mechanical, electrical and aerospace engineering. Public, so you pay mainly a semester fee (about €300). Its Mechanical Engineering programme is listed on our <a href="/courses">courses page</a>.</li>
  <li><strong>RWTH Aachen and Karlsruhe Institute of Technology (Germany)</strong>: large, research-heavy and closely linked to German industry.</li>
  <li><strong>Delft University of Technology (Netherlands)</strong>: known for civil engineering, aerospace and water management.</li>
  <li><strong>ETH Zurich and EPFL (Switzerland)</strong>: consistently among the world's top technical universities.</li>
  <li><strong>KTH Royal Institute of Technology (Sweden)</strong> and <strong>Politecnico di Milano (Italy)</strong>: both teach many master's programmes in English.</li>
</ul>

<h2>Accessible, affordable alternatives</h2>
<p>German universities of applied sciences (Hochschulen) focus on practical, industry-led engineering with small classes and very low fees. Options in our catalogue include:</p>
<ul>
  <li><strong>Hamburg University of Technology</strong>: English-taught master's degrees, including Engineering Science. Deadlines for October 2027 run from 1 February to 15 July 2027.</li>
  <li><strong>Hochschule Merseburg</strong>: Engineering and Management, with admission-free programmes open until 31 August 2027.</li>
  <li><strong>Schmalkalden University of Applied Sciences</strong>: Mechanics &amp; Robotics.</li>
  <li><strong>Hochschule Bielefeld</strong>: Industrial Engineering.</li>
</ul>
<p>Poland is the other strong choice for African students: English-taught degrees, tuition of about €2,000–€6,000 a year and simpler admission. Akademia Tatrzańska offers Civil, Mechanical and Computer Engineering, Building Structures and Architecture, and Vistula University offers Computer Engineering and Architecture.</p>

<h2>What you need to apply</h2>
<ul>
  <li>A school-leaving certificate (A-level, Matric, NSSC or equivalent) with strong maths, and physics for most programmes. Master's applicants need a related bachelor's degree.</li>
  <li>English proof, usually IELTS 5.5–6.5 or equivalent. Some universities accept an English Medium of Instruction letter.</li>
  <li>For German-taught programmes, German language certificates (often B2–C1).</li>
  <li>A motivation letter and, for some universities, uni-assist or an entrance test.</li>
</ul>

<h2>Next steps</h2>
<p>See every engineering programme we can help with on the <a href="/courses">courses page</a>, check closing dates on the <a href="/deadlines">deadlines page</a>, and run the <a href="/eligibility">eligibility check</a> to see where your grades fit best.</p>
$html$
where slug = 'best-engineering-universities-europe';

-- ── 3. Medicine ─────────────────────────────────────────────────────────────
update blog_posts set
  title = 'Studying Medicine in Europe: English-Taught Options for 2027',
  excerpt = 'Where to study medicine in English in Europe, what entry tests and science grades you need, typical costs, and how to make sure your degree is recognised at home.',
  tags = array['medicine','medical','europe','poland','hungary','2027'],
  updated_at = now(),
  content = $html$
<p>Medicine is one of the most competitive degrees in the world, and many African students look to Europe for English-taught programmes at a lower cost than the UK or USA. Central and Eastern Europe has a long tradition of teaching international medical students. Here is what to know before you apply.</p>

<h2>Popular countries for English-taught medicine</h2>
<ul>
  <li><strong>Hungary</strong>: Semmelweis University (Budapest) and the universities of Debrecen, Szeged and Pécs have taught medicine in English for decades and run large international programmes.</li>
  <li><strong>Poland</strong>: medical universities in Warsaw, Kraków, Gdańsk, Łódź, Lublin and other cities offer six-year English-taught MD programmes.</li>
  <li><strong>Lithuania and Latvia</strong>: the Lithuanian University of Health Sciences (Kaunas) and Rīga Stradiņš University are well-established choices.</li>
  <li><strong>Cyprus and Malta</strong>: smaller, English-speaking options with Mediterranean living costs.</li>
</ul>

<h2>How long it takes and what it costs</h2>
<p>A European medical degree usually takes six years and leads straight to a doctor of medicine qualification. Tuition for English-taught medicine is much higher than for other subjects in the same countries, commonly in the range of about €10,000–€20,000 per year depending on the university. Add living costs, for example €500–€900 a month in Hungary and Poland. Always confirm the current fee with the university, as medical fees change every year.</p>

<h2>Entry requirements</h2>
<ul>
  <li><strong>Strong science grades</strong>: biology and chemistry at A-level (or equivalent) are almost always required; physics or maths helps.</li>
  <li><strong>Entrance exam</strong>: most universities set their own test in biology and chemistry, sometimes with an interview. Some accept results from other medical entrance tests.</li>
  <li><strong>English proof</strong>: IELTS or an equivalent, often 6.0 or higher.</li>
  <li><strong>Preparatory year</strong>: if your science background is weaker, many universities offer a one-year pre-medical course.</li>
</ul>

<h2>Check recognition before you apply</h2>
<p>To practise at home, your degree must be recognised by your country's medical council, and you will usually sit a licensing exam on your return. Check the World Directory of Medical Schools listing for the university and confirm your country's rules before paying any fees.</p>

<h2>Health-related degrees in our catalogue</h2>
<p>If medicine is out of reach for now, nursing and allied health degrees are a strong route into healthcare careers. Our <a href="/courses">courses page</a> lists Nursing at WSEI University and Nursing BSN at UITM University in Poland, plus Dietetics at Vistula University, with much lower tuition than medicine.</p>

<h2>Get advice on your chances</h2>
<p>Medical admissions differ from university to university. Take the <a href="/eligibility">eligibility check</a> or <a href="/contact">talk to an advisor</a> and we will help you compare options that fit your grades and budget.</p>
$html$
where slug = 'top-medical-universities-europe';

-- ── 4. Scholarships ─────────────────────────────────────────────────────────
update blog_posts set
  title = 'Scholarships for International Students in Europe: 2027 Guide',
  excerpt = 'The main fully funded scholarships for African students for 2027 and 2028 entry: Stipendium Hungaricum, DAAD EPOS, Erasmus Mundus, NAWA, Chevening, Commonwealth and more, with deadlines.',
  tags = array['scholarships','funding','africa','europe','2027'],
  updated_at = now(),
  content = $html$
<p>A scholarship can cover your tuition, living costs and even flights. Competition is strong, but many major programmes are open to students from Southern Africa, and deadlines for 2027 entry come early. Here are the awards worth knowing, with dates from our <a href="/scholarships">scholarships page</a>.</p>

<h2>Fully funded government scholarships</h2>
<h3>Stipendium Hungaricum (Hungary) — closes 15 January 2027</h3>
<p>Run by the Hungarian government through the Tempus Public Foundation. Covers a tuition waiver, a monthly stipend, an accommodation contribution and medical insurance, at bachelor's, master's and PhD level. You apply through your country's partner ministry, so check that your country takes part.</p>

<h3>DAAD EPOS (Germany)</h3>
<p>The German Academic Exchange Service funds development-related postgraduate courses for professionals from developing countries, paying €992 per month for master's students plus insurance, travel and tuition where applicable. You usually need a bachelor's degree and at least two years of relevant work experience. One example, the INEMA Education Management programme, closes on 15 March 2027.</p>

<h3>Erasmus Mundus Joint Masters (EU)</h3>
<p>Funded by the European Commission. You study in two or more European countries and receive tuition, travel and installation costs, plus a monthly allowance of about €1,400. Each programme sets its own deadline, usually between October and February.</p>

<h3>NAWA Ignacy Łukasiewicz Scholarship (Poland)</h3>
<p>Offered by the Polish National Agency for Academic Exchange for master's studies, with a tuition waiver and a monthly stipend.</p>

<h2>Scholarships beyond the EU</h2>
<ul>
  <li><strong>Chevening</strong> (UK, master's, 2028/29 round): tuition, monthly stipend, flights and arrival allowances.</li>
  <li><strong>Commonwealth Master's Scholarships</strong> (UK, 2028/29 round): tuition, airfare, stipend and thesis allowance.</li>
  <li><strong>Australia Awards</strong> (Australia, master's, 2028 intake): closes 30 April 2027. Full tuition, airfare, living allowance and health cover.</li>
  <li><strong>Fulbright Foreign Student Program</strong> (USA, master's and PhD, 2028/29 cycle).</li>
</ul>

<h2>How to make your application stand out</h2>
<ol>
  <li><strong>Start 12 months early.</strong> Most deadlines fall 8–12 months before the course begins.</li>
  <li><strong>Match the scholarship's purpose.</strong> Development-focused awards want to know how you will use your degree at home.</li>
  <li><strong>Get strong references.</strong> Ask lecturers or employers who know your work well, and give them plenty of time.</li>
  <li><strong>Prepare documents in advance.</strong> Certified transcripts, a valid passport and English test results often take weeks to obtain.</li>
  <li><strong>Apply to several.</strong> Treat scholarships like university applications and spread your chances.</li>
</ol>

<h2>Stay updated</h2>
<p>Subscribe to any scholarship on our <a href="/scholarships">scholarships page</a> to be emailed when it changes, and check the <a href="/deadlines">deadlines page</a> for university closing dates.</p>
$html$
where slug = 'scholarships-international-students-europe';

-- ── 5. Student life ─────────────────────────────────────────────────────────
update blog_posts set
  title = 'Student Life in Europe: What to Expect as an African Student',
  excerpt = 'Teaching style, weather, housing, part-time work, residence registration and finding community: a practical guide to your first year studying in Europe.',
  tags = array['student life','europe','africa','first year','tips'],
  updated_at = now(),
  content = $html$
<p>Moving to Europe to study is exciting, and it is also a big change. Knowing what to expect makes the first months much easier. Here is what students from Southern Africa tell us surprised them most.</p>

<h2>A different way of learning</h2>
<p>European universities expect independent study. You may have fewer contact hours than at school, but more reading, group projects and presentations. Lecturers are approachable, and asking questions is encouraged. Many courses grade you on a final exam, so steady work through the semester pays off.</p>

<h2>Weather and clothing</h2>
<p>Winters in Central and Northern Europe are cold and dark, with temperatures below freezing from December to February in Poland, Germany, Latvia and Lithuania. Budget for a warm coat, boots and layers, ideally bought locally where they are cheaper and better suited. Cyprus and Malta are the exceptions, with mild winters.</p>

<h2>Housing</h2>
<p>Most students live in university dormitories or shared flats. Apply for a dormitory as soon as you accept your offer, because places go quickly. If you rent privately, never pay a deposit before seeing a contract, and be cautious of offers that seem too good to be true.</p>

<h2>Paperwork after you arrive</h2>
<ul>
  <li><strong>Register your address</strong>: Austria requires registration (Meldezettel) within 3 days, and most countries have a similar step.</li>
  <li><strong>Residence permit</strong>: in many countries you apply for or collect it after arrival. In Cyprus, for example, you register with the Aliens Register within 7–10 days.</li>
  <li><strong>Health insurance and a bank account</strong>: needed for your permit and for daily life.</li>
</ul>
<p>Each <a href="/destinations">destination page</a> lists the visa and permit steps for that country.</p>

<h2>Working while you study</h2>
<p>Part-time work helps with costs and builds experience. Full-time students in Poland with a residence permit can generally work without a separate work permit; Germany allows 140 full days or 280 half days a year. Keep your studies first: failing courses can affect your residence permit.</p>

<h2>Finding community</h2>
<p>Most cities have African student associations, churches and international student groups, and universities run orientation weeks for newcomers. Join our student <a href="/dashboard/hub">community hub</a> to connect with other Kuro students heading to the same country.</p>

<h2>Staying safe and well</h2>
<p>European university cities are generally safe; normal city precautions apply. Homesickness is common in the first winter, so stay in touch with home, keep a routine and use your university's counselling service if you need it.</p>

<h2>Prepare before you fly</h2>
<p>Use the <a href="/intake-planner">intake planner</a> to schedule your visa, accommodation and travel, and the roadmap tracker in your <a href="/dashboard">dashboard</a> to tick off each step.</p>
$html$
where slug = 'student-life-in-europe-what-to-expect';

-- ── 6. IT / Computer science ────────────────────────────────────────────────
update blog_posts set
  title = 'IT and Computer Science Degrees in Europe for 2027',
  excerpt = 'Computer science, cybersecurity, AI and cloud degrees taught in English in Poland and Germany, what they cost, entry requirements and career prospects.',
  tags = array['computer science','IT','cybersecurity','artificial intelligence','poland','2027'],
  updated_at = now(),
  content = $html$
<p>Technology skills are in demand across Europe, and IT degrees are among the most popular choices for international students. Poland in particular has become a hub for software development, with many global companies running engineering centres there. Here is how to choose an IT degree for 2027.</p>

<h2>Which specialisation?</h2>
<ul>
  <li><strong>Computer Science / Software Engineering</strong>: programming, algorithms and systems. The most flexible option for a tech career.</li>
  <li><strong>Cybersecurity</strong>: protecting systems and data. Strong demand and a clear career path.</li>
  <li><strong>Artificial Intelligence</strong>: machine learning and data. Usually needs strong maths.</li>
  <li><strong>Cloud Computing &amp; DevOps</strong>: infrastructure and deployment, closely matched to industry jobs.</li>
  <li><strong>Computer Engineering</strong>: hardware and software together.</li>
</ul>

<h2>English-taught IT degrees in our catalogue</h2>
<table>
  <thead><tr><th>University (Poland)</th><th>IT programmes</th></tr></thead>
  <tbody>
    <tr><td>UITM University, Rzeszów</td><td>Computer Science BSc, Cybersecurity BSc, Cloud Computing &amp; DevOps BSc</td></tr>
    <tr><td>Vistula University, Warsaw</td><td>Artificial Intelligence, Cyber Security, Computer Engineering, Business Analytics</td></tr>
    <tr><td>WSEI University, Lublin</td><td>Computer Science (Software Engineering), Computer Science (AI, Cyber Security)</td></tr>
    <tr><td>Akademia Tatrzańska, Nowy Targ</td><td>Artificial Intelligence, Cybersecurity, Computer Engineering, Applications Programming</td></tr>
    <tr><td>VIZJA University, Warsaw</td><td>Cybersecurity</td></tr>
  </tbody>
</table>
<p>Tuition at these universities is roughly €2,000–€6,000 per year, and living costs in Poland are about €500–€800 a month. See exact fees on each programme's page under <a href="/courses">courses</a>.</p>

<h2>The well-known names</h2>
<p>If you have top grades, leading technical universities include the Technical University of Munich, ETH Zurich, KTH in Stockholm, Delft University of Technology and the Warsaw University of Technology. Admission is competitive, and German public universities often teach bachelor's degrees in German.</p>

<h2>Entry requirements</h2>
<ul>
  <li>A school-leaving certificate (A-level, Matric, NSSC or equivalent), with maths strongly preferred.</li>
  <li>English proof, usually IELTS 5.5–6.0 or equivalent, or an English Medium of Instruction letter at some universities.</li>
  <li>No prior programming experience is required for most bachelor's degrees, but basic practice helps.</li>
</ul>

<h2>Careers after graduation</h2>
<p>IT graduates can work in software, security, data and IT support roles. Poland and Germany both offer routes to stay and look for work after graduation, and IT internships during your studies make a big difference to job offers.</p>

<h2>Apply for 2027</h2>
<p>Our Polish partner universities accept applications for October 2027 until 30 June 2027, and for the February 2027 intake until 15 December 2026. Check the <a href="/deadlines">deadlines page</a>, then start with the <a href="/eligibility">eligibility check</a>.</p>
$html$
where slug = 'it-tech-programs-europe-best-universities';

-- ── 7. Business ─────────────────────────────────────────────────────────────
update blog_posts set
  title = 'Business Degrees in Europe: Management, Finance and MBA Options',
  excerpt = 'From Europe''s elite business schools to affordable English-taught management, finance, logistics and aviation degrees in Poland, with costs and entry requirements.',
  tags = array['business','management','MBA','finance','poland','europe'],
  updated_at = now(),
  content = $html$
<p>A business degree opens doors in almost every industry, and Europe offers everything from world-famous MBAs to affordable bachelor's degrees taught entirely in English. Here is how the options compare.</p>

<h2>Europe's elite business schools</h2>
<p>Schools such as INSEAD (France), London Business School (UK), HEC Paris, IE Business School and ESADE (Spain) and Bocconi (Italy) lead the international rankings. Their MBAs usually require several years of management experience, a GMAT or GRE score and tuition well above €50,000. In Poland, Kozminski University holds the "triple crown" of business school accreditations (AACSB, EQUIS and AMBA).</p>

<h2>Affordable English-taught business degrees</h2>
<p>For most students, a bachelor's degree at a well-run private university is the practical route. Our Polish partner universities offer a wide range, typically for €2,000–€6,000 a year:</p>
<ul>
  <li><strong>Management and enterprise</strong>: Management at Vistula, WSEI and Akademia Tatrzańska; Enterprise Management at VIZJA; Business Management BA at UITM; and LSBU Management at Vistula, delivered with London South Bank University.</li>
  <li><strong>Finance and accounting</strong>: Finance &amp; Accounting at Vistula; Accounting, Audit and Controlling, Business Finance and Banking and Insurance at VIZJA; Digital Finance &amp; Strategy at UITM.</li>
  <li><strong>Logistics and trade</strong>: Logistics at Vistula; Logistics and Supply Chain Management at Akademia Tatrzańska; International Trade and Logistics at VIZJA.</li>
  <li><strong>Aviation</strong>: Aviation Management at UITM and Civil Aviation Management at Akademia Tatrzańska.</li>
  <li><strong>Marketing and analytics</strong>: Social Media and Digital Marketing at VIZJA; Business Analytics at Vistula.</li>
</ul>
<p>Browse them all on the <a href="/courses">courses page</a>.</p>

<h2>Entry requirements</h2>
<ul>
  <li>A school-leaving certificate (A-level, Matric, NSSC or equivalent). Maths is helpful for finance and analytics.</li>
  <li>English proof, usually IELTS 5.5–6.0 or equivalent.</li>
  <li>For master's degrees and MBAs, a bachelor's degree and often work experience.</li>
</ul>

<h2>Why study business in Poland?</h2>
<p>Poland is one of the fastest-growing economies in the EU and a major centre for finance, logistics and shared-services companies, many of which hire English-speaking graduates. Full-time students with a residence permit can generally work part-time without a separate work permit, which helps build experience while you study.</p>

<h2>Start your application</h2>
<p>October 2027 applications at our Polish partners close on 30 June 2027. Use the <a href="/intake-planner">intake planner</a> to plan the months ahead, or take the <a href="/eligibility">eligibility check</a> for a personalised shortlist.</p>
$html$
where slug = 'business-schools-europe-mba-programs';

-- ── New posts ───────────────────────────────────────────────────────────────
insert into blog_posts (title, slug, excerpt, content, featured_image, categories, tags, status, published_at)
select v.title, v.slug, v.excerpt, v.content, v.featured_image, v.categories, v.tags, 'published', now()
from (values
(
  '2027 Intake Timeline: When to Apply to Study Abroad from Southern Africa',
  'study-abroad-2027-intake-timeline',
  'A month-by-month plan for the February and September/October 2027 intakes, with real university and scholarship deadlines, visa lead times and the documents to prepare first.',
  $html$
<p>The most common reason students miss an intake is starting too late. Visas, certified documents and English tests all take time. This timeline works back from the two main 2027 start dates, using real deadlines from our <a href="/deadlines">deadlines page</a>.</p>

<h2>The two main intakes</h2>
<ul>
  <li><strong>February/March 2027 (spring)</strong>: offered by our Polish partner universities and some German programmes. Fewer courses, faster turnaround.</li>
  <li><strong>September/October 2027 (autumn)</strong>: the main intake almost everywhere in Europe, with the widest choice of programmes and scholarships.</li>
</ul>

<h2>Key 2027 deadlines</h2>
<table>
  <thead><tr><th>Deadline</th><th>What</th><th>Intake</th></tr></thead>
  <tbody>
    <tr><td>15 Dec 2026</td><td>Kuro Poland partner universities</td><td>February 2027</td></tr>
    <tr><td>15 Jan 2027</td><td>Stipendium Hungaricum (Hungary)</td><td>September 2027</td></tr>
    <tr><td>1 Feb 2027</td><td>Hamburg University of Technology, international master's</td><td>October 2027</td></tr>
    <tr><td>15 Mar 2027</td><td>DAAD EPOS — INEMA (Germany)</td><td>October 2027</td></tr>
    <tr><td>30 Apr 2027</td><td>Australia Awards Africa</td><td>January 2028</td></tr>
    <tr><td>30 Jun 2027</td><td>Kuro Poland partners (Vistula, WSB, WSEI, UITM, VIZJA, Akademia Tatrzańska)</td><td>October 2027</td></tr>
    <tr><td>15 Jul 2027</td><td>Hamburg University of Technology MSc; Schmalkalden UAS</td><td>October 2027</td></tr>
    <tr><td>31 Aug 2027</td><td>Hochschule Merseburg, admission-free programmes</td><td>October 2027</td></tr>
  </tbody>
</table>

<h2>Month-by-month for an October 2027 start</h2>
<h3>November – December 2026: research</h3>
<ul>
  <li>Choose 2–3 destinations based on budget. Compare costs on our <a href="/destinations">destination pages</a>.</li>
  <li>Check that your passport is valid for at least 12 months beyond your planned arrival; renew it now if not.</li>
  <li>Shortlist programmes on the <a href="/courses">courses page</a>.</li>
</ul>
<h3>January – February 2027: documents and scholarships</h3>
<ul>
  <li>Order certified copies of certificates and transcripts. Some countries also need an apostille or legalisation.</li>
  <li>Book an English test if your programme needs one.</li>
  <li>Submit scholarship applications: Stipendium Hungaricum closes 15 January.</li>
</ul>
<h3>March – May 2027: apply</h3>
<ul>
  <li>Send university applications, starting with the earliest deadlines.</li>
  <li>Write a clear motivation letter for each programme.</li>
</ul>
<h3>May – July 2027: offer, fees and visa</h3>
<ul>
  <li>Accept your offer and pay the deposit or first-year tuition your university requires.</li>
  <li>Book your visa appointment immediately. Appointment slots, not processing time, are often the real bottleneck.</li>
  <li>Arrange proof of funds, for example a German blocked account (€992 per month for 2026).</li>
</ul>
<h3>August – September 2027: prepare to travel</h3>
<ul>
  <li>Book accommodation and flights once your visa is approved.</li>
  <li>Buy health insurance and prepare documents for registration after arrival.</li>
</ul>

<h2>Visa lead times to plan around</h2>
<p>Allow extra time beyond official processing times: Poland about 15 working days, Germany 6–12 weeks, Austria up to 3 months, Canada 8–12 weeks. See each country's page for current fees and steps.</p>

<h2>Get your personal plan</h2>
<p>The <a href="/intake-planner">2027 intake planner</a> turns this into a personalised month-by-month checklist for your country and intake, with budget estimates and live deadlines.</p>
$html$,
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
  array['Study Guides'],
  array['2027','intake','timeline','deadlines','planning']
),
(
  'Student Visa Fees in 2026–27: 12 Countries Compared',
  'student-visa-fees-2026-2027-compared',
  'Up-to-date student visa and residence permit fees and processing times for the UK, USA, Canada, Australia, Germany, Poland, Hungary, Austria and other study destinations, verified November 2026.',
  $html$
<p>Visa costs have changed a lot over the past year: the UK, Australia and the USA all raised their fees in 2026. This table compares the main student visa or residence permit cost and typical processing time for each destination we cover. Figures were last checked on 10 November 2026.</p>

<h2>Fees and processing times</h2>
<table>
  <thead><tr><th>Country</th><th>Visa / permit</th><th>Main fees</th><th>Processing</th></tr></thead>
  <tbody>
    <tr><td><a href="/destinations/uk">UK</a></td><td>Student visa</td><td>£558 + Immigration Health Surcharge £776 per year</td><td>About 3 weeks</td></tr>
    <tr><td><a href="/destinations/usa">USA</a></td><td>F-1 visa</td><td>$185 visa fee + $350 SEVIS fee (+ $250 visa integrity fee where collected)</td><td>2–4 weeks after interview</td></tr>
    <tr><td><a href="/destinations/canada">Canada</a></td><td>Study permit</td><td>CAD $150 + CAD $85 biometrics</td><td>8–12 weeks</td></tr>
    <tr><td><a href="/destinations/australia">Australia</a></td><td>Student visa (subclass 500)</td><td>AUD $2,500 (from 1 July 2026)</td><td>4–6 weeks</td></tr>
    <tr><td><a href="/destinations/germany">Germany</a></td><td>National student visa</td><td>€75</td><td>6–12 weeks</td></tr>
    <tr><td><a href="/destinations/austria">Austria</a></td><td>Student residence permit</td><td>€218</td><td>Up to 3 months</td></tr>
    <tr><td><a href="/destinations/hungary">Hungary</a></td><td>Student visa + residence permit</td><td>€110 via a consulate</td><td>3–4 weeks</td></tr>
    <tr><td><a href="/destinations/latvia">Latvia</a></td><td>Temporary residence permit</td><td>About €160–€180 + €45 residence card</td><td>30 days (express available)</td></tr>
    <tr><td><a href="/destinations/lithuania">Lithuania</a></td><td>Temporary residence permit (MIGRIS)</td><td>About €80–€160 + VFS service fee</td><td>Up to 2 months</td></tr>
    <tr><td><a href="/destinations/malta">Malta</a></td><td>Type D visa + Identità residence permit</td><td>About €50 permit; visa fee varies by embassy</td><td>4–8 weeks</td></tr>
    <tr><td><a href="/destinations/cyprus">Cyprus</a></td><td>Entry permit + temporary residence permit</td><td>€70</td><td>Several weeks</td></tr>
    <tr><td><a href="/destinations/poland">Poland</a></td><td>National visa (Type D)</td><td>See the Poland page</td><td>About 15 working days</td></tr>
  </tbody>
</table>

<h2>The fee is not the whole cost</h2>
<ul>
  <li><strong>Proof of funds</strong>: often the biggest hurdle. Germany requires a blocked account of €992 per month for 2026, and Austria about €722.58 per month if you are under 24.</li>
  <li><strong>Health cover</strong>: the UK charges its surcharge upfront for the whole course; most EU countries ask for private insurance.</li>
  <li><strong>Service and courier fees</strong>: visa centres such as VFS Global add their own charges.</li>
  <li><strong>Translations and legalisation</strong>: documents may need certified translations or an apostille.</li>
</ul>

<h2>Tips to avoid delays</h2>
<ol>
  <li>Book your appointment as soon as you have your admission letter; slots fill weeks ahead in peak season.</li>
  <li>Check the document list on the official embassy or immigration website for your country of residence.</li>
  <li>Never travel on a tourist visa planning to switch to student status. Cyprus, for example, does not allow it.</li>
  <li>Keep copies of everything you submit.</li>
</ol>

<h2>Always confirm before paying</h2>
<p>Governments change fees with little notice. Each <a href="/destinations">destination page</a> shows the date its visa information was last verified and links to the official source. If anything looks out of date, <a href="/contact">contact us</a> and we will check it for you.</p>
$html$,
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
  array['Visa Guides'],
  array['visa','fees','2026','2027','student visa','comparison']
),
(
  'Study in Poland from Zimbabwe and Southern Africa: 2027 Guide',
  'study-in-poland-from-southern-africa-2027',
  'Why Poland is a top choice for students from Zimbabwe, South Africa, Botswana, Namibia and Zambia: costs, universities, entry requirements, the national visa and 2027 intake deadlines.',
  $html$
<p>Poland has become one of the most popular study destinations for students from Southern Africa. It combines EU-recognised degrees taught in English, low tuition and living costs, and a straightforward admission process. This guide covers everything you need to plan for 2027.</p>

<h2>Why Poland?</h2>
<ul>
  <li><strong>Affordable</strong>: tuition of about €2,000–€6,000 a year and living costs of €500–€800 a month.</li>
  <li><strong>English-taught degrees</strong> in business, IT, engineering, nursing, psychology, international relations and more.</li>
  <li><strong>EU degree</strong>: recognised across Europe and internationally.</li>
  <li><strong>Work while you study</strong>: full-time students with a residence permit can generally work without a separate work permit.</li>
  <li><strong>Safe and welcoming</strong>: large international student communities in Warsaw, Kraków, Wrocław, Lublin and Rzeszów.</li>
</ul>

<h2>Our partner universities</h2>
<table>
  <thead><tr><th>University</th><th>City</th><th>Popular programmes</th></tr></thead>
  <tbody>
    <tr><td>Vistula University</td><td>Warsaw</td><td>Management, Finance &amp; Accounting, AI, Cyber Security, Architecture, Logistics</td></tr>
    <tr><td>VIZJA University</td><td>Warsaw</td><td>Psychology, International Relations, Cybersecurity, Business Finance</td></tr>
    <tr><td>WSEI University</td><td>Lublin</td><td>Computer Science, Nursing, Psychology, Management</td></tr>
    <tr><td>UITM University</td><td>Rzeszów</td><td>Computer Science, Cybersecurity, Nursing BSN, Aviation Management</td></tr>
    <tr><td>Akademia Tatrzańska</td><td>Nowy Targ</td><td>Civil and Mechanical Engineering, AI, International Business</td></tr>
  </tbody>
</table>
<p>See all 60 Polish programmes, with fees, on the <a href="/courses">courses page</a>.</p>

<h2>Entry requirements</h2>
<ul>
  <li><strong>Bachelor's</strong>: a school-leaving certificate such as A-level, Matric/NSC, NSSC or BGCSE. For Zimbabwean students, the Polish consulate generally expects at least 3 A-level passes for undergraduate study.</li>
  <li><strong>Master's</strong>: a recognised bachelor's degree in a related field.</li>
  <li><strong>English</strong>: IELTS or equivalent, or an English Medium of Instruction letter at many universities.</li>
  <li><strong>Documents</strong>: passport, certified certificates and transcripts, passport photos, and sometimes legalised or apostilled documents.</li>
</ul>

<h2>The Polish student visa</h2>
<p>You apply for a national (Type D) visa at the Polish embassy or consulate responsible for your country, after receiving your acceptance letter and paying your tuition deposit. Decisions usually take about 15 working days, up to 30 in complex cases, but appointment availability is often the real bottleneck, so book early. You will need your acceptance letter, proof of funds, health insurance and proof of accommodation. After arrival, you can apply for a temporary residence permit to stay for the full length of your degree. See the <a href="/destinations/poland">Poland page</a> for current fees and the official link.</p>

<h2>2027 intakes and deadlines</h2>
<ul>
  <li><strong>February 2027 intake</strong>: apply by 15 December 2026.</li>
  <li><strong>October 2027 intake</strong>: apply by 30 June 2027 (earlier is better for visa timing).</li>
</ul>

<h2>Start today</h2>
<p>Take the <a href="/readiness-check">readiness check</a> to see how prepared you are, including the Poland-specific requirements for Zimbabwean applicants, or use the <a href="/intake-planner">intake planner</a> for a step-by-step plan. When you are ready, <a href="/contact">talk to an advisor</a> and we will guide your application from start to finish.</p>
$html$,
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b',
  array['Study Guides'],
  array['poland','zimbabwe','south africa','2027','study abroad','visa']
)
) as v(title, slug, excerpt, content, featured_image, categories, tags)
where not exists (select 1 from blog_posts b where b.slug = v.slug);

-- ── Germany guide: strip class/dir attributes left over from a copy-paste ────
update blog_posts set
  content = regexp_replace(content, '\s(class|dir)="[^"]*"', '', 'g'),
  updated_at = now()
where slug = 'study-in-germany-complete-guide-for-international-students-2027'
  and content ~ '\s(class|dir)="';
