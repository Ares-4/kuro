-- 2027 cycle refinement: refresh visa fees that changed in 2026, fix mixed-currency
-- cost strings, and grow the assistant knowledge base with answers grounded in
-- the site's own destination/visa data and features.

-- ── Visa fees (verified 2026-11-10 against official-source summaries) ─────────
update destination_visa_info set
  cost = '£558 (from 8 April 2026) + Immigration Health Surcharge £776 per year',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'uk';

update destination_visa_info set
  cost = 'AUD $2,500 (from 1 July 2026)',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'australia';

update destination_visa_info set
  cost = 'USD $185 visa fee + $350 SEVIS fee (+ $250 visa integrity fee where your consulate collects it)',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'usa';

update destination_visa_info set
  cost = 'CAD $150 + CAD $85 biometrics',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'canada';

-- ── Currency typos (£ inside € ranges) ───────────────────────────────────────
update destinations set tuition_cost = '€5,000 – €12,000 / year' where slug = 'cyprus' and tuition_cost like '%£%';
update destinations set living_cost  = '€800 – €1,300 / month'   where slug = 'malta'  and living_cost  like '%£%';

-- ── Knowledge base expansion ────────────────────────────────────────────────
insert into knowledge_base (question, answer, tags, page_link, is_active)
select v.question, v.answer, v.tags, v.page_link, true
from (values
  ('What is the cheapest country to study in Europe?',
   'Germany is usually cheapest for tuition: public universities charge only semester fees (about €0–€3,000/year), but you must show a blocked account for living costs. Poland and Hungary combine low tuition (from about €2,000–€3,000/year) with low living costs (€500–€900/month).',
   array['cheap','cheapest','affordable','budget','europe','germany','poland','hungary'], '/destinations'),
  ('Can I study in Germany for free?',
   'Most public universities in Germany charge no tuition, only a semester contribution (roughly €150–€400 per semester). You still need to prove living funds through a blocked account, €992 per month for 2026 (confirm the current figure before transferring). Some states and private universities do charge tuition.',
   array['germany','free','tuition','blocked','account'], '/destinations/germany'),
  ('What is a German blocked account?',
   'A blocked account (Sperrkonto) proves you can cover living costs in Germany. You deposit a year of funds upfront (€992 per month) and can withdraw only the monthly amount once you arrive. It is required for the German student visa.',
   array['germany','blocked','account','sperrkonto','funds','proof'], '/destinations/germany'),
  ('How much does it cost to study in Germany?',
   'Tuition at public universities is roughly €0–€3,000 per year (mostly semester fees). Living costs are about €700–€1,100 per month depending on the city.',
   array['germany','cost','tuition','living'], '/destinations/germany'),
  ('How much does it cost to study in the UK?',
   'Tuition is typically £10,000–£30,000 per year and living costs £800–£1,500 per month. The Student visa costs £558 plus the Immigration Health Surcharge of £776 per year.',
   array['uk','cost','tuition','living','britain'], '/destinations/uk'),
  ('How much does it cost to study in Canada?',
   'Tuition is typically CAD $15,000–$35,000 per year and living costs CAD $1,000–$1,800 per month. You must also show proof of funds for living costs when applying for your study permit.',
   array['canada','cost','tuition','living'], '/destinations/canada'),
  ('How much does it cost to study in Australia?',
   'Tuition is typically AUD $20,000–$45,000 per year and living costs AUD $1,400–$2,500 per month. The Student visa (subclass 500) costs AUD $2,500 from 1 July 2026.',
   array['australia','cost','tuition','living'], '/destinations/australia'),
  ('How much does it cost to study in the USA?',
   'Tuition is typically USD $20,000–$55,000 per year and living costs USD $1,000–$2,500 per month. The F-1 visa adds a $185 visa fee and a $350 SEVIS fee.',
   array['usa','america','cost','tuition','living'], '/destinations/usa'),
  ('How much does it cost to study in Hungary?',
   'Tuition is typically €3,000–€10,000 per year and living costs €500–€900 per month, which makes Hungary one of the most affordable options in the EU.',
   array['hungary','cost','tuition','living','budapest'], '/destinations/hungary'),
  ('Can I work while studying in Poland?',
   'Students studying full-time in Poland on a residence permit can generally work without a separate work permit. On a national visa, work rules depend on your status, so confirm your exact conditions with us before taking a job.',
   array['poland','work','job','part-time'], '/destinations/poland'),
  ('Can I work while studying in Germany?',
   'International students in Germany can work part-time, up to 140 full days or 280 half days per year, without extra approval. Many students work in university or student jobs.',
   array['germany','work','job','part-time'], '/destinations/germany'),
  ('Can I work while studying in Canada?',
   'Most study permit holders can work off campus part-time during academic sessions and full-time during scheduled breaks. Check the conditions printed on your study permit.',
   array['canada','work','job','part-time'], '/destinations/canada'),
  ('Can I work while studying in Australia?',
   'Student visa holders in Australia can work up to 48 hours per fortnight during study periods and unlimited hours during scheduled course breaks.',
   array['australia','work','job','part-time'], '/destinations/australia'),
  ('How long does a Poland student visa take?',
   'A Polish national (Type D) visa is usually decided within about 15 working days, up to 30 in complex cases. Book your consulate appointment early, because appointment slots are often the real bottleneck.',
   array['poland','visa','processing','time'], '/destinations/poland'),
  ('When should I start applying for the 2027 intake?',
   'Start 9–12 months before your intake. For September/October 2027, shortlist universities by late 2026, sit English tests early in 2027, and apply between January and May. Visa applications follow your offer letter. Use the intake planner for a month-by-month plan.',
   array['2027','intake','timeline','when','start','september'], '/intake-planner'),
  ('What is the intake planner?',
   'The intake planner builds a personalised month-by-month timeline for your target country and intake, including budget estimates and live application deadlines. Your plan is saved on your device.',
   array['planner','intake','timeline','plan','tool'], '/intake-planner'),
  ('Is there a January or February intake?',
   'Yes. Several destinations offer a second intake: Canada, Australia and the UK commonly start courses in January or February, and some Polish and German programmes have a spring (February/March) semester. Fewer courses are available than in September.',
   array['january','february','spring','intake','second'], '/intake-planner'),
  ('What is the eligibility check?',
   'The eligibility check assesses your academic profile, budget and target destination, and gives you a tiered result with a PDF report emailed to you. It costs $29 and takes a few minutes.',
   array['eligibility','check','assessment','report','pdf'], '/eligibility'),
  ('What is the readiness check?',
   'The readiness check is a quick self-assessment of how prepared you are to apply abroad (documents, finances, English, timeline). It helps you see what to work on before applying.',
   array['readiness','check','prepared','quiz','assessment'], '/readiness-check'),
  ('Where can I find scholarships?',
   'Browse open scholarships on our scholarships page, filtered by country and study level. You can subscribe to a scholarship to get notified about updates.',
   array['scholarship','scholarships','funding','grant'], '/scholarships'),
  ('Are there scholarships for African students?',
   'Yes. Many international scholarships are open to African applicants, including government programmes and university merit awards. Our scholarships page lists open ones with eligibility and deadlines.',
   array['scholarship','africa','african','south','zimbabwe','botswana','namibia','zambia'], '/scholarships'),
  ('Do I need IELTS to study in Poland or Germany?',
   'English-taught programmes usually ask for IELTS (typically 5.5–6.5) or an equivalent. Some universities accept a Medium of Instruction letter if your previous studies were in English. Requirements vary by university and programme.',
   array['ielts','english','poland','germany','toefl','language'], '/services'),
  ('Can I study abroad without IELTS?',
   'Sometimes. Some universities accept an English Medium of Instruction letter, Duolingo English Test or their own entrance test instead of IELTS. Visa authorities in some countries (for example the UK) have their own English rules, so check before you apply.',
   array['ielts','without','english','duolingo','moi'], '/services'),
  ('What documents do I need for a student visa?',
   'Typically: a valid passport, the university acceptance letter, proof of funds, proof of accommodation, health insurance, passport photos and the visa application form and fee. Each country adds its own requirements, listed on its destination page.',
   array['visa','documents','requirements','passport','funds'], '/process'),
  ('How do I track my application progress?',
   'Log in to your student dashboard. The roadmap tracker shows the steps for your destination country, and you can tick them off as you go. Your advisor can see your progress too.',
   array['dashboard','track','progress','roadmap','steps'], '/dashboard'),
  ('Can I sign in with Google?',
   'Yes. Choose Continue with Google on the login or sign-up page to create or access your student account without a separate password.',
   array['google','login','sign','account'], '/login'),
  ('How do I reset my password?',
   'Use Forgot password on the login page. We will email you a link to set a new password.',
   array['password','reset','forgot','login'], '/forgot-password'),
  ('How do I contact Kuro?',
   'Use the contact page, or tap Talk to an advisor in this chat and leave your WhatsApp number. Our team replies within 24 hours.',
   array['contact','advisor','human','whatsapp','talk'], '/contact'),
  ('Where can I see university application deadlines?',
   'The deadlines page lists upcoming application deadlines by university and country. You can also ask me, for example: "Poland deadlines".',
   array['deadline','deadlines','dates','closing'], '/deadlines'),
  ('Is it safe to study in Poland?',
   'Poland is generally considered safe for international students, with low violent crime rates and large student communities in cities like Warsaw, Krakow and Wroclaw. Normal city precautions apply.',
   array['poland','safe','safety','security'], '/destinations/poland'),
  ('Can I bring my family on a student visa?',
   'It depends on the country and level of study. The UK now allows dependants mainly for research postgraduate students, while Canada, Australia and several EU countries allow dependants with extra proof of funds. Ask us about your specific case.',
   array['family','dependants','dependents','spouse','children'], '/contact'),
  ('Can I stay and work after graduating?',
   'Many destinations offer post-study work options: the UK Graduate Route, Canada''s Post-Graduation Work Permit, Australia''s Temporary Graduate visa and job-seeker permits in Germany and Poland. Rules and lengths vary by country.',
   array['graduate','post-study','work','stay','after','pgwp'], '/destinations')
) as v(question, answer, tags, page_link)
where not exists (select 1 from knowledge_base k where lower(k.question) = lower(v.question));
