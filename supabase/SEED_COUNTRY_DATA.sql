-- ============================================================
-- SEED COUNTRY DATA — Run in Supabase SQL Editor
-- Populates destination details, visa info, and roadmaps
-- for all countries so detail pages show full information.
-- ============================================================

-- ── 1. UPDATE DESTINATIONS WITH DESCRIPTIONS & COSTS ────────

insert into destinations (slug, name, is_active, description, tuition_cost, living_cost) values
  ('poland',    'Poland',    true,
   'Poland offers world-class universities at a fraction of Western European costs. With vibrant student cities like Warsaw, Kraków, and Wrocław, it''s one of the fastest-growing study destinations in Europe.',
   '€2,000 – €6,000 / year', '€500 – €800 / month'),
  ('uk',        'UK',        true,
   'The UK is home to some of the world''s most prestigious universities including Oxford, Cambridge, and UCL. A UK degree is globally recognised and opens doors across every industry.',
   '£10,000 – £30,000 / year', '£800 – £1,500 / month'),
  ('canada',    'Canada',    true,
   'Canada consistently ranks among the top countries for quality of life and education. With welcoming immigration pathways and diverse campuses, it''s an ideal destination for international students.',
   'CAD $15,000 – $35,000 / year', 'CAD $1,000 – $1,800 / month'),
  ('australia', 'Australia', true,
   'Australia offers a high standard of living, world-ranked universities, and a post-study work visa of up to 4 years. Its multicultural environment makes international students feel at home.',
   'AUD $20,000 – $45,000 / year', 'AUD $1,400 – $2,500 / month'),
  ('usa',       'USA',       true,
   'The United States has the largest higher education system in the world with over 4,000 institutions. From Ivy League schools to state universities, there''s a perfect fit for every student.',
   'USD $20,000 – $55,000 / year', 'USD $1,000 – $2,500 / month'),
  ('germany',   'Germany',   true,
   'Germany is famous for tuition-free or low-cost public universities, a strong engineering and science tradition, and a booming job market. Many programs are taught entirely in English.',
   '€0 – €3,000 / year (semester fees)', '€700 – €1,100 / month'),
  ('lithuania', 'Lithuania', true,
   'Lithuania is an emerging European study destination with modern universities, affordable living, and full EU residency benefits for graduates. Vilnius and Kaunas are vibrant student cities.',
   '€2,000 – €5,000 / year', '€600 – €900 / month'),
  ('latvia',    'Latvia',    true,
   'Latvia offers accredited EU degrees at some of the most affordable tuition rates in Europe. Riga, the capital, is a UNESCO World Heritage city with a thriving student community.',
   '€2,500 – €6,000 / year', '€600 – €900 / month'),
  ('hungary',   'Hungary',   true,
   'Hungary is home to several globally ranked universities including the Stipendium Hungaricum scholarship program. Budapest is one of Europe''s most beautiful and affordable capitals.',
   '€3,000 – €10,000 / year', '€500 – €900 / month'),
  ('malta',     'Malta',     true,
   'Malta is the only English-speaking country in the EU, making it ideal for students who want a European degree in a familiar language. The island offers a safe, sunny, and affordable lifestyle.',
   '€5,000 – €14,000 / year', '€800 – £1,300 / month'),
  ('cyprus',    'Cyprus',    true,
   'Cyprus combines EU-quality education with a Mediterranean lifestyle. Its universities are fully accredited, tuition fees are competitive, and English is widely spoken across the island.',
   '€5,000 – £12,000 / year', '€700 – €1,100 / month'),
  ('austria',   'Austria',   true,
   'Austria offers a world-class education system with public universities charging minimal tuition. Vienna consistently ranks as one of the world''s most liveable cities for students.',
   '€1,500 – €5,000 / year', '€900 – €1,400 / month')
on conflict (slug) do update set
  description  = excluded.description,
  tuition_cost = excluded.tuition_cost,
  living_cost  = excluded.living_cost,
  is_active    = true;


-- ── 2. VISA INFORMATION ──────────────────────────────────────

insert into destination_visa_info
  (destination_slug, visa_type, processing_time, cost, documents, notes, official_link, last_verified)
values

('poland', 'National Visa (Type D)', '2–4 weeks', '€80',
 '["Valid passport (min. 6 months validity)","University acceptance letter","Proof of financial means (€500/month)","Health insurance (min. €30,000 coverage)","Accommodation proof","Passport-size photos","Visa application form"]'::jsonb,
 'Polish student visas are processed at the Polish consulate in your home country. Apply at least 8 weeks before your course starts. Students from most African countries should expect additional document checks.',
 'https://www.gov.pl/web/visa', '2026-04-28'),

('uk', 'Student Visa', '3 weeks', '£490',
 '["Valid passport","CAS number from your university","Proof of English proficiency (IELTS 6.0+)","Financial evidence (£1,334/month for London, £1,023 outside London)","Tuberculosis test results (if required)","Parental consent (if under 18)","Biometric enrolment"]'::jsonb,
 'You must have a Confirmation of Acceptance for Studies (CAS) from your university before applying. The visa allows you to work up to 20 hours per week during term time.',
 'https://www.gov.uk/student-visa', '2026-04-28'),

('canada', 'Study Permit', '8–12 weeks', 'CAD $150',
 '["Valid passport","Letter of acceptance from a DLI (Designated Learning Institution)","Proof of funds (CAD $10,000 for first year + tuition)","Medical examination (if required)","Police clearance certificate","Statement of purpose","Biometrics (CAD $85)"]'::jsonb,
 'Apply online via IRCC. Processing times vary significantly by country of origin — Zimbabwean applicants should apply at least 12 weeks before the course start date. The Student Direct Stream (SDS) can speed up processing.',
 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html', '2026-04-28'),

('australia', 'Student Visa (Subclass 500)', '4–6 weeks', 'AUD $710',
 '["Valid passport","Confirmation of Enrolment (CoE) from your university","Genuine Temporary Entrant (GTE) statement","English proficiency (IELTS 6.0+)","Overseas Student Health Cover (OSHC)","Proof of financial capacity","Academic transcripts"]'::jsonb,
 'Apply online via ImmiAccount. You must maintain a Confirmation of Enrolment throughout your stay. The GTE requirement means you must demonstrate your intention to return home after your studies.',
 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', '2026-04-28'),

('usa', 'F-1 Student Visa', '2–4 weeks (after interview)', 'USD $185',
 '["Valid passport","Form I-20 from your university (SEVIS)","SEVIS fee payment (USD $350)","DS-160 application form","Visa interview appointment","Proof of financial support","Academic transcripts and test scores","Ties to home country evidence"]'::jsonb,
 'The F-1 visa interview is mandatory at a US Embassy or Consulate. Allow 3–4 months from application to arrival. You can work on-campus up to 20 hours/week during term.',
 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', '2026-04-28'),

('germany', 'Student Visa (Nationales Visum)', '6–12 weeks', '€75',
 '["Valid passport","University admission letter","Proof of financial resources (€11,208/year in blocked account)","Health insurance confirmation","Language proficiency (German B2 or English)","Biometric photos","Motivation letter"]'::jsonb,
 'The blocked account (Sperrkonto) is mandatory — you must deposit ~€11,208 into a German blocked account before applying. Apply at the German Embassy in your home country at least 3 months before the semester starts.',
 'https://www.make-it-in-germany.com/en/visa-residence/types/students', '2026-04-28'),

('lithuania', 'National Visa (Type D)', '2–3 weeks', '€80',
 '["Valid passport","Acceptance letter from Lithuanian university","Proof of financial means (€350/month)","Health insurance","Proof of accommodation in Lithuania","Completed visa application form","Passport photos"]'::jsonb,
 'After arrival, you must register your residence with the Migration Department within 3 months and apply for a temporary residence permit. Lithuania is part of the Schengen Zone.',
 'https://www.migracija.lt/en/', '2026-04-28'),

('latvia', 'Student Residence Permit', '30 days', '€100',
 '["Valid passport","University acceptance letter","Proof of sufficient funds (€430/month)","Health insurance","Accommodation confirmation","Completed application form","Recent passport photos"]'::jsonb,
 'Apply at the Office of Citizenship and Migration Affairs (OCMA) after arriving in Latvia on a short-stay Schengen visa. Latvia offers a temporary residence permit valid for the duration of your studies.',
 'https://www.pmlp.gov.lv/en/residence-permit-studies', '2026-04-28'),

('hungary', 'Student Visa + Residence Permit', '3–4 weeks', '€60',
 '["Valid passport","Acceptance letter from a Hungarian university","Proof of accommodation","Financial evidence (€500/month equivalent)","Health insurance","Completed Hungarian visa application","Medical certificate"]'::jsonb,
 'Apply at the Hungarian Embassy in your home country. Upon arrival, you must register within 15 days at your local government office and apply for a residence permit. Stipendium Hungaricum scholarship holders have a streamlined process.',
 'https://konzuliszolgalat.kormany.hu/en', '2026-04-28'),

('malta', 'Single Permit (Student)', '4–6 weeks', '€250',
 '["Valid passport (min. 12 months validity)","University or English language school acceptance letter","Proof of sufficient funds (€5,000 minimum)","Return flight booking or proof of onward travel","Accommodation proof","Health insurance","Clean police record"]'::jsonb,
 'Non-EU students must apply for a Single Permit which combines the residence and work permit into one document. Apply after arrival at Identity Malta. Malta''s English-medium programs are popular with African students.',
 'https://identitymalta.com/unit/residence-programme/', '2026-04-28'),

('cyprus', 'Temporary Residence Permit', '2–3 weeks', '€70',
 '["Valid passport","University registration certificate","Proof of financial means (€500/month)","Health insurance","Clean criminal record certificate (apostilled)","Accommodation proof in Cyprus","Completed application form (M61)"]'::jsonb,
 'Apply at the Civil Registry and Migration Department (CRMD) after arriving in Cyprus. You must first enter on a tourist visa, then convert within 3 months. Cyprus processes applications relatively quickly compared to other EU countries.',
 'https://www.moi.gov.cy/moi/crmd/crmd.nsf/home_en', '2026-04-28'),

('austria', 'Student Visa (Type D)', '4–6 weeks', '€120',
 '["Valid passport","University admission letter","Proof of financial means (€1,000/month)","Accommodation proof in Austria","Health insurance for Austria","Language proficiency (German or English)","Completed visa application","Biometric photos"]'::jsonb,
 'Apply at the Austrian Embassy or Consulate in your home country. Public universities in Austria charge only a semester fee (~€363). You must open a bank account in Austria after arrival and register your address within 3 days.',
 'https://www.oead.at/en/to-austria/coming-to-austria/entry-and-residence/', '2026-04-28')

on conflict (destination_slug) do update set
  visa_type       = excluded.visa_type,
  processing_time = excluded.processing_time,
  cost            = excluded.cost,
  documents       = excluded.documents,
  notes           = excluded.notes,
  official_link   = excluded.official_link,
  last_verified   = excluded.last_verified;


-- ── 3. APPLICATION ROADMAPS ──────────────────────────────────

-- POLAND
insert into destination_roadmaps (destination_slug, steps) values ('poland', '[
  {"order":1,"title":"Choose your university and program","description":"Research Polish universities on the NAWA and Perspektywy rankings. Most programs for international students are taught in English. Submit your online application directly to the university — application fees range from €30–€80.","typical_timeline":"3–6 months before start","docs_required":["Academic transcripts","English proficiency certificate","Motivation letter","CV"]},
  {"order":2,"title":"Receive your acceptance letter","description":"Once accepted, the university will send you an official admission letter. This document is required for your visa application. Some universities issue a conditional offer first — fulfill any conditions promptly.","typical_timeline":"2–8 weeks after applying","docs_required":["Official acceptance letter"]},
  {"order":3,"title":"Apply for your Polish student visa (Type D)","description":"Book an appointment at the Polish Embassy or Consulate in Zimbabwe. Submit your complete application with all required documents. Pay the €80 visa fee at the time of application.","typical_timeline":"8–10 weeks before departure","docs_required":["Passport","Acceptance letter","Financial proof","Health insurance","Accommodation proof","Visa form","Photos"]},
  {"order":4,"title":"Arrange accommodation","description":"Contact your university''s international office for dormitory options. Popular student cities like Warsaw and Kraków have affordable student housing from €150–€300/month. Book early as spaces fill up quickly.","typical_timeline":"2–3 months before start","docs_required":["Dormitory contract or rental agreement"]},
  {"order":5,"title":"Arrive and register your stay","description":"Within 4 days of arrival, register your address at the local municipal office (Urząd Gminy). Within 3 months, apply for a Temporary Residence Card at the Voivodeship Office. Your university international office will guide you.","typical_timeline":"First week of arrival","docs_required":["Passport","Visa","Accommodation contract","University enrollment confirmation"]},
  {"order":6,"title":"Enrol and begin your studies","description":"Complete university enrollment, obtain your student ID, and set up your student email. Register for classes online through the university portal. Attend any mandatory orientation sessions for international students.","typical_timeline":"1–2 weeks after arrival","docs_required":["Acceptance letter","Health certificate","Passport photos"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- UK
insert into destination_roadmaps (destination_slug, steps) values ('uk', '[
  {"order":1,"title":"Select your university and course","description":"Research UCAS-listed universities. Use the UCAS system to apply for up to 5 undergraduate courses. For postgraduate programs, apply directly to each university. Check entry requirements carefully — most require IELTS 6.0 or equivalent.","typical_timeline":"6–12 months before start","docs_required":["Academic transcripts","Personal statement","References","English test scores"]},
  {"order":2,"title":"Receive your CAS number","description":"Once unconditionally accepted, your university will issue a Confirmation of Acceptance for Studies (CAS) reference number. This is mandatory for your visa application. Do not book flights until you have your CAS.","typical_timeline":"4–8 weeks after offer","docs_required":["CAS reference number"]},
  {"order":3,"title":"Apply for your UK Student Visa","description":"Apply online through the UK Visas and Immigration (UKVI) portal. Pay the £490 visa fee plus the Immigration Health Surcharge (£470/year of study). Book a biometric appointment at a Visa Application Centre.","typical_timeline":"3 months before course start","docs_required":["Passport","CAS number","Bank statements (28 consecutive days)","IELTS certificate","TB test results if required"]},
  {"order":4,"title":"Arrange accommodation","description":"Apply for university halls of residence — most guarantee accommodation for first-year international students. Apply as soon as you receive your offer. Private student accommodation (Unite Students, iQ) is the alternative.","typical_timeline":"As soon as offer received","docs_required":["Accommodation application form","Deposit payment"]},
  {"order":5,"title":"Arrive and complete arrival formalities","description":"On arrival, collect your Biometric Residence Permit (BRP) from a local Post Office within 10 days. Register with a local GP (doctor). Attend your university''s international student orientation.","typical_timeline":"Before course start","docs_required":["Passport","Visa vignette","BRP collection letter"]},
  {"order":6,"title":"Enrol and begin your studies","description":"Complete in-person enrollment at your university. Get your student ID and library card. Set up your student bank account (Monzo, Starling, or HSBC international student accounts are popular). Register for modules.","typical_timeline":"Enrollment week","docs_required":["Passport","Acceptance letter","Proof of address"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- CANADA
insert into destination_roadmaps (destination_slug, steps) values ('canada', '[
  {"order":1,"title":"Apply to a Designated Learning Institution (DLI)","description":"Only DLI-approved institutions can issue study permits. Research universities and colleges on the IRCC DLI list. Apply directly through the institution''s website. Canadian universities have January, May, and September intakes.","typical_timeline":"8–12 months before start","docs_required":["Academic transcripts","English/French proficiency scores","Statement of purpose","References","Application fee"]},
  {"order":2,"title":"Receive your Letter of Acceptance","description":"Your institution will issue a Letter of Acceptance (LOA) once admitted. This is the primary document for your study permit application. Some institutions also send a Confirmation of Enrollment.","typical_timeline":"4–12 weeks after applying","docs_required":["Official Letter of Acceptance"]},
  {"order":3,"title":"Apply for your Study Permit","description":"Apply online via the IRCC portal. Pay CAD $150 application fee and CAD $85 biometrics fee. Prepare your Statement of Purpose explaining your study plans and intent to return home. Processing takes 8–12 weeks for Zimbabwe applicants.","typical_timeline":"4–5 months before departure","docs_required":["Passport","Letter of Acceptance","Financial proof (CAD $10,000+)","Statement of purpose","Biometrics","Medical exam if required"]},
  {"order":4,"title":"Arrange housing","description":"Most Canadian universities offer on-campus residence — apply immediately after receiving your acceptance as spots fill quickly. Off-campus options include private rentals, homestays, and student housing platforms like PadMapper.","typical_timeline":"2–3 months before start","docs_required":["Housing application","Deposit"]},
  {"order":5,"title":"Arrive and complete port of entry formalities","description":"At the Canadian border, present your study permit approval and receive your official Study Permit document. Obtain your Social Insurance Number (SIN) from Service Canada if you plan to work. Register for a provincial health card.","typical_timeline":"Before course start","docs_required":["Passport","Study permit approval letter","LOA","Proof of funds"]},
  {"order":6,"title":"Enrol and settle in","description":"Complete enrollment, get your student card, and set up a Canadian bank account (RBC, TD, and Scotiabank all have student accounts with no monthly fees). Attend international student orientation for guidance on healthcare, work permits, and co-op opportunities.","typical_timeline":"First 2 weeks","docs_required":["Student ID","SIN (if working)"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- AUSTRALIA
insert into destination_roadmaps (destination_slug, steps) values ('australia', '[
  {"order":1,"title":"Choose your institution and course","description":"Research universities on the QS World University Rankings and the CRICOS register (all institutions must be CRICOS-registered to accept international students). Apply directly online — most universities have rolling admissions.","typical_timeline":"6–12 months before start","docs_required":["Academic transcripts","English test scores (IELTS 6.0+)","Personal statement","References"]},
  {"order":2,"title":"Receive your Confirmation of Enrolment (CoE)","description":"After accepting your offer and paying your deposit, the university issues a Confirmation of Enrolment (CoE). This is your primary visa document. You may need to pay the first semester''s tuition upfront to receive the CoE.","typical_timeline":"2–4 weeks after accepting offer","docs_required":["CoE document","Payment receipt"]},
  {"order":3,"title":"Purchase Overseas Student Health Cover (OSHC)","description":"OSHC is mandatory for the full duration of your visa. Purchase it before applying for the visa — your university can arrange it on your behalf. Popular providers include Medibank, Bupa, and AHM. Costs around AUD $500–$600/year.","typical_timeline":"Before visa application","docs_required":["OSHC policy certificate"]},
  {"order":4,"title":"Apply for Student Visa (Subclass 500)","description":"Apply online through the ImmiAccount portal. You must submit the GTE (Genuine Temporary Entrant) statement explaining why you want to study in Australia and your plans to return home. Pay AUD $710 application fee.","typical_timeline":"3–4 months before start","docs_required":["Passport","CoE","OSHC certificate","GTE statement","Financial evidence","Transcripts","English scores"]},
  {"order":5,"title":"Arrive and complete orientation","description":"Attend your university''s compulsory international student orientation. Set up an Australian bank account (CommBank, NAB, or ANZ student accounts). Register with a local GP. Get a TFN (Tax File Number) from the ATO if you plan to work.","typical_timeline":"1–2 weeks before course start","docs_required":["Passport","Visa grant notice","CoE"]},
  {"order":6,"title":"Enrol and begin studies","description":"Complete formal enrollment, get your student ID, and register for subjects. Explore on-campus support services including academic support, mental health services, and career centres. International students can work up to 48 hours per fortnight.","typical_timeline":"Orientation week","docs_required":["Student ID","TFN (for working)"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- USA
insert into destination_roadmaps (destination_slug, steps) values ('usa', '[
  {"order":1,"title":"Research and apply to universities","description":"The US has over 4,000 accredited institutions. Use Common App for undergraduate admissions (up to 20 schools). For graduate programs, apply directly. Most deadlines are November–February for September intake. Prepare SAT/ACT scores for undergrad, GRE/GMAT for grad.","typical_timeline":"12–18 months before start","docs_required":["Transcripts","SAT/ACT or GRE/GMAT scores","TOEFL/IELTS scores","Essays","References","Application fee ($50–$100)"]},
  {"order":2,"title":"Receive your I-20 form","description":"After admission, your university''s Designated School Official (DSO) will issue Form I-20. Pay the SEVIS I-901 fee of USD $350 online at www.fmjfee.com before your visa interview. Keep the receipt.","typical_timeline":"4–8 weeks after admission","docs_required":["I-20 form","SEVIS fee receipt"]},
  {"order":3,"title":"Complete DS-160 and schedule your visa interview","description":"Complete Form DS-160 online at ceac.state.gov. Pay the USD $185 MRV fee. Schedule your F-1 visa interview at the US Embassy in Harare as early as possible — appointment slots can be scarce.","typical_timeline":"4–5 months before departure","docs_required":["DS-160 confirmation","Passport","I-20","SEVIS receipt","Financial documents","University offer letter"]},
  {"order":4,"title":"Attend your visa interview","description":"Arrive early with all your documents. The consular officer will ask about your study plans, financial situation, and ties to Zimbabwe. Be confident and honest. Visa decisions are usually given on the day or within a few days.","typical_timeline":"After scheduling","docs_required":["Passport","DS-160","I-20","SEVIS receipt","Bank statements","Offer letter","Academic records"]},
  {"order":5,"title":"Arrange housing and arrive","description":"Apply for on-campus housing immediately after admission. You may enter the US up to 30 days before your program start date as listed on your I-20. At the port of entry, you will receive an I-94 arrival record — download it from cbp.dhs.gov.","typical_timeline":"Before start date","docs_required":["Passport","I-20","I-94 record"]},
  {"order":6,"title":"Enrol, get your SSN and student ID","description":"Report to your DSO within 15 days of arriving to validate your SEVIS record. Apply for a Social Security Number (SSN) if you have on-campus employment. Set up a US bank account and attend mandatory orientation.","typical_timeline":"First week on campus","docs_required":["I-20","I-94","Passport","Employment authorisation (for SSN)"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- LITHUANIA
insert into destination_roadmaps (destination_slug, steps) values ('lithuania', '[
  {"order":1,"title":"Apply to a Lithuanian university","description":"Top institutions include Vilnius University, Kaunas University of Technology, and ISM University. Most international programs are in English. Apply through the university website or the Lithuanian national admissions system (LAMA BPO for undergrad).","typical_timeline":"4–6 months before start","docs_required":["Transcripts","English proficiency certificate","Motivation letter","CV","Application fee"]},
  {"order":2,"title":"Receive your acceptance letter","description":"The university will send an official admission letter. Some universities also issue a formal invitation letter specifically for visa purposes — request this from the international office.","typical_timeline":"2–6 weeks after applying","docs_required":["Acceptance/invitation letter"]},
  {"order":3,"title":"Apply for National Visa (Type D)","description":"Apply at the Lithuanian Embassy or Consulate nearest to you. Lithuania does not have an embassy in Zimbabwe — the nearest is in Pretoria, South Africa. Book your appointment well in advance. Visa fee is €80.","typical_timeline":"8–10 weeks before departure","docs_required":["Passport","Acceptance letter","Financial proof (€350/month)","Health insurance","Accommodation proof","Visa form","Photos"]},
  {"order":4,"title":"Arrange accommodation","description":"Universities offer student dormitories at €100–€200/month. Apply through the university''s housing portal. Private student apartments in Vilnius cost €250–€450/month. Book early as international students compete for limited spots.","typical_timeline":"2–3 months before start","docs_required":["Accommodation booking confirmation"]},
  {"order":5,"title":"Arrive and register residence","description":"Within 3 months of arrival, register with the Migration Department of Lithuania and apply for a Temporary Residence Permit. Your university''s international office will assist. Register your address at the municipality within 5 days.","typical_timeline":"First 2 weeks in Lithuania","docs_required":["Passport","Visa","Accommodation contract","University enrollment proof"]},
  {"order":6,"title":"Enrol and begin studies","description":"Complete university enrollment and get your student card. Open a Lithuanian bank account (Swedbank or SEB are most common). Get a personal identification code (Asmens kodas) which is needed for most official services.","typical_timeline":"Enrollment week","docs_required":["Acceptance letter","Passport","Residence permit application receipt"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- LATVIA
insert into destination_roadmaps (destination_slug, steps) values ('latvia', '[
  {"order":1,"title":"Apply to a Latvian university","description":"Top institutions include the University of Latvia, Riga Technical University, and RSU. Many bachelor and master programs are available in English. Apply directly through the university website. Riga is the main student city.","typical_timeline":"4–6 months before start","docs_required":["Academic transcripts","English proficiency proof","Motivation letter","Application fee (€30–€50)"]},
  {"order":2,"title":"Receive your acceptance letter","description":"After admission, request an official invitation letter from the university''s international office — this is needed for your visa and residence permit application. Keep both the acceptance letter and the invitation letter.","typical_timeline":"2–6 weeks after applying","docs_required":["Official invitation letter","Acceptance letter"]},
  {"order":3,"title":"Enter Latvia on a Schengen visa","description":"Non-EU students enter Latvia on a short-stay Schengen visa (Type C). Apply at the Latvian Embassy or the Embassy of a Schengen country that issues on behalf of Latvia. Provide your university invitation letter as the purpose of visit.","typical_timeline":"6–8 weeks before departure","docs_required":["Passport","University invitation letter","Financial proof","Return ticket","Health insurance"]},
  {"order":4,"title":"Apply for Temporary Residence Permit on arrival","description":"Within 30 days of arrival, apply for a Temporary Residence Permit at the Office of Citizenship and Migration Affairs (OCMA). This will be valid for your full study duration. Fee is €100.","typical_timeline":"Within 30 days of arrival","docs_required":["Passport","University enrollment certificate","Proof of accommodation","Financial means proof (€430/month)","Health insurance","Application form","Photos"]},
  {"order":5,"title":"Register accommodation and open bank account","description":"Register your residential address with the municipality. Open a Latvian bank account (SEB, Swedbank, or Citadele) — required for receiving any stipends or part-time wages. Apply for a student public transport card in Riga.","typical_timeline":"First 2 weeks","docs_required":["Residence permit","Passport","Proof of address"]},
  {"order":6,"title":"Enrol and begin studies","description":"Complete enrollment at the university, get your student ID, and register for courses. Attend the mandatory international student orientation. The university international office will guide you on health insurance, library access, and student support services.","typical_timeline":"Start of semester","docs_required":["Student ID","Enrollment confirmation"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- HUNGARY
insert into destination_roadmaps (destination_slug, steps) values ('hungary', '[
  {"order":1,"title":"Apply to a Hungarian university","description":"Top universities include the University of Debrecen, Semmelweis University (medicine), Budapest Metropolitan University, and Óbuda University. Many programs are in English. Apply via the Stipendium Hungaricum portal for scholarships or directly to the university.","typical_timeline":"6–9 months before start","docs_required":["Academic transcripts","English proficiency proof","Motivation letter","References","Passport copy","Application fee"]},
  {"order":2,"title":"Receive acceptance and secure financing","description":"After admission, the university issues an acceptance letter. If applying through Stipendium Hungaricum, decisions are made by March/April. Self-funded students should confirm their financial plan as proof of €500/month equivalent is required for the visa.","typical_timeline":"4–8 weeks after applying","docs_required":["Acceptance letter","Financial plan/scholarship confirmation"]},
  {"order":3,"title":"Apply for student visa at Hungarian Embassy","description":"Apply at the Hungarian Embassy or Consulate. Hungary does not have an embassy in Zimbabwe — apply at the Hungarian Embassy in Pretoria, South Africa or through a third-country Hungarian consulate. Processing takes 3–4 weeks.","typical_timeline":"8–10 weeks before departure","docs_required":["Passport","Acceptance letter","Financial proof","Accommodation proof","Medical certificate","Health insurance","Visa form"]},
  {"order":4,"title":"Arrange accommodation","description":"Hungarian universities offer dormitory accommodation from €150–€250/month. Apply through the university accommodation portal as soon as you are admitted. Private apartments in Budapest are €300–€600/month. University cities like Debrecen are more affordable.","typical_timeline":"2–3 months before start","docs_required":["Accommodation confirmation letter"]},
  {"order":5,"title":"Arrive and register with authorities","description":"Within 15 days of arrival, register your address at the local government office (Kormányablak). Apply for a residence permit at the Regional Directorate of the National Directorate-General for Aliens Policing (OIF). Your university international office will assist.","typical_timeline":"First 2 weeks in Hungary","docs_required":["Passport","Visa","Accommodation contract","University enrollment certificate","Health insurance"]},
  {"order":6,"title":"Enrol and settle in","description":"Complete enrollment, get your student ID card (Neptun code), and register for courses in the Neptun educational system. Open a Hungarian bank account (OTP Bank or K&H are popular). Get a social security number (TAJ card) for healthcare.","typical_timeline":"Enrollment week","docs_required":["Acceptance letter","Passport","Residence permit","TAJ card application"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- MALTA
insert into destination_roadmaps (destination_slug, steps) values ('malta', '[
  {"order":1,"title":"Apply to a Maltese university or school","description":"The University of Malta is the main public university. There are also several private institutions specialising in English language programs, business, and hospitality. Apply directly through the institution website. Malta is popular for English language courses combined with degree programs.","typical_timeline":"4–6 months before start","docs_required":["Academic transcripts","English proficiency","Motivation letter","Application fee"]},
  {"order":2,"title":"Receive acceptance and arrange finances","description":"After admission, the institution sends an acceptance letter. You will need to show at least €5,000 in your bank account before applying for entry. Secure your finances early as banks may take weeks to issue the necessary statements.","typical_timeline":"2–6 weeks after applying","docs_required":["Acceptance letter","Bank statements showing €5,000+"]},
  {"order":3,"title":"Enter Malta on a short-stay Schengen visa","description":"Non-EU nationals must first enter Malta on a Schengen visa. Apply at the Maltese Embassy or the Embassy of a Schengen state representing Malta. Provide your university acceptance letter as proof of purpose.","typical_timeline":"6–8 weeks before departure","docs_required":["Passport","Acceptance letter","Financial proof","Return ticket","Travel health insurance"]},
  {"order":4,"title":"Apply for Single Permit at Identity Malta","description":"Within 3 months of arrival, apply for the Single Permit at Identity Malta Agency. This combines your residence and work authorisation into one document. Pay €250 fee. Bring all original documents plus copies.","typical_timeline":"Within 3 months of arrival","docs_required":["Passport","Acceptance letter","Bank statements","Health insurance","Accommodation proof","Police clearance certificate","Biometric photos"]},
  {"order":5,"title":"Register with the police and set up banking","description":"Register your address with the Maltese Police within 1 month of arrival. Open a bank account at BOV (Bank of Valletta) or HSBC Malta — you will need your Single Permit application receipt. Get a Maltese SIM card for local communication.","typical_timeline":"First month in Malta","docs_required":["Passport","Single permit receipt","Proof of address"]},
  {"order":6,"title":"Enrol and begin studies","description":"Complete enrollment at your institution, receive your student ID, and attend orientation. Malta''s compact size makes getting around easy — public buses cover the whole island. Take advantage of the English-speaking environment to build your academic and social network.","typical_timeline":"Course start","docs_required":["Student ID","Single permit"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- CYPRUS
insert into destination_roadmaps (destination_slug, steps) values ('cyprus', '[
  {"order":1,"title":"Apply to a Cypriot university","description":"Top institutions include the University of Cyprus, Cyprus University of Technology, Frederick University, and UCLan Cyprus. Many programs are fully in English. Apply online through the university portal. Nicosia and Limassol are the main student cities.","typical_timeline":"4–6 months before start","docs_required":["Transcripts","English language certificate","Motivation letter","References","Application fee (€50–€100)"]},
  {"order":2,"title":"Receive your offer and pay deposit","description":"After admission, accept your offer and pay the enrollment deposit (€500–€1,000). The university will issue an official acceptance letter and may issue a formal invitation letter for your visa application. Request both.","typical_timeline":"2–4 weeks after applying","docs_required":["Acceptance letter","Invitation letter","Deposit receipt"]},
  {"order":3,"title":"Enter Cyprus on a short-stay visa","description":"Zimbabwean nationals require a short-stay visa to enter Cyprus. Apply at the Cypriot Embassy or the Embassy of a Schengen/EU country representing Cyprus. Present your university invitation letter as the purpose of visit. Entry is typically granted for 90 days.","typical_timeline":"6–8 weeks before start","docs_required":["Passport","Invitation letter","Financial proof","Return ticket","Health insurance"]},
  {"order":4,"title":"Apply for Temporary Residence Permit (M61)","description":"Within 3 months of arrival, submit Form M61 at the Civil Registry and Migration Department (CRMD). Pay €70 fee. You will need a Cyprus bank account reference for the application. The permit is usually issued within 2–3 weeks.","typical_timeline":"Within 90 days of arrival","docs_required":["Passport","University registration certificate","Financial proof (€500/month)","Health insurance","Cyprus bank statement","Criminal record certificate (apostilled)","Application form M61","Biometric photos"]},
  {"order":5,"title":"Open a bank account and register address","description":"Open a Cyprus bank account (Bank of Cyprus or Hellenic Bank) early as it''s required for the residence permit. Register your rental address with your local municipality. Get a Cyprus mobile number for local communications.","typical_timeline":"First 2 weeks","docs_required":["Passport","University enrollment","Rental contract"]},
  {"order":6,"title":"Enrol and begin studies","description":"Complete formal enrollment and get your student ID. Cyprus universities offer strong student support services, career fairs, and international student societies. EU-accredited degrees from Cyprus are recognised worldwide and can facilitate further studies or work in the EU.","typical_timeline":"Course start","docs_required":["Residence permit","Student ID"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;

-- AUSTRIA
insert into destination_roadmaps (destination_slug, steps) values ('austria', '[
  {"order":1,"title":"Apply to an Austrian university","description":"Austria''s top institutions include the University of Vienna, TU Wien (Technical University), and WU Vienna (Economics). Most public universities require German proficiency for undergraduate programs, but many international master''s programs are in English. Apply via the uni:data portal or directly.","typical_timeline":"6–9 months before start","docs_required":["Transcripts","Language certificate (German B2 or English proficiency)","Motivation letter","Passport copy","Application fee (public unis have no fee; private charge €50–€100)"]},
  {"order":2,"title":"Receive admission and prepare finances","description":"Public universities charge only a semester fee (~€363). Private universities range from €1,500–€5,000/year. After admission, you need proof of €1,000/month financial support for the visa application. Open a blocked account or prepare 6 months of bank statements.","typical_timeline":"4–8 weeks after applying","docs_required":["Admission letter","Financial proof (€1,000/month equivalent)"]},
  {"order":3,"title":"Apply for Austrian student visa (Type D)","description":"Apply at the Austrian Embassy or an accredited Austrian Consulate. Austria does not have an embassy in Zimbabwe — apply at the Austrian Embassy in Pretoria, South Africa or in Nairobi, Kenya. Processing takes 4–6 weeks. Fee is €120.","typical_timeline":"8–10 weeks before departure","docs_required":["Passport","Admission letter","Financial proof","Health insurance","Accommodation proof","Language certificate","Visa application form","Biometric photos"]},
  {"order":4,"title":"Arrange accommodation","description":"Student dormitories (Studentenheime) in Vienna cost €280–€450/month — apply through the ÖH (Austrian Student Union) housing portal at wohnen.oeh.ac.at. Private rooms cost €500–€800/month. Apply early — Vienna has a competitive housing market.","typical_timeline":"3–4 months before start","docs_required":["Accommodation contract or booking confirmation"]},
  {"order":5,"title":"Arrive and register at Meldeamt","description":"Within 3 days of moving into your accommodation, you must register your address at the local Meldeamt (registration office) — this is legally required. Bring your passport and rental contract. After registration, apply for a residence permit (Aufenthaltsbewilligung) at the MA 35 office.","typical_timeline":"First 3 days of arrival","docs_required":["Passport","Rental contract","Meldebescheinigung (registration confirmation)","University enrollment","Financial proof","Health insurance"]},
  {"order":6,"title":"Enrol and activate your student life","description":"Pay the semester fee (€363) to officially enrol. Get your u:card (student ID) which also serves as a public transport card. Open an Austrian bank account (Erste Bank or Raiffeisen are popular with students). Join your faculty''s ÖH student union for support and discounts.","typical_timeline":"Semester start","docs_required":["Admission letter","Residence permit","Passport","Semester fee payment receipt"]}
]'::jsonb)
on conflict (destination_slug) do update set steps = excluded.steps;


-- ── 4. COUNTRY-SPECIFIC FAQs ─────────────────────────────────

insert into faqs (question, answer, category, is_active) values
('What language are courses taught in?', 'Most international programs in Poland are fully taught in English. Public universities like Warsaw University of Technology and Jagiellonian University offer hundreds of English-medium programs at both undergraduate and postgraduate level.', 'poland', true),
('How much money do I need per month in Poland?', 'Budget €500–€800/month for a comfortable student life. This covers rent (€150–€300 in a dorm, €300–€500 private), food, transport, and leisure. Warsaw is more expensive than Kraków or Wrocław.', 'poland', true),
('Can I work while studying in Poland?', 'Yes. Students from non-EU countries holding a valid residence permit can work without a separate work permit. Many students find part-time work in hospitality, tutoring, or IT.', 'poland', true),
('Is Poland safe for international students?', 'Poland is one of the safest countries in Europe. Crime rates are low and the student communities in Warsaw, Kraków, and Wrocław are welcoming and multicultural.', 'poland', true),
('Can I stay in Poland after graduation?', 'Yes. After completing your degree, you can apply for a temporary residence permit for job-seeking purposes (up to 1 year). Many graduates find employment in Poland''s growing tech and business sectors.', 'poland', true),
('Do I need IELTS to study in the UK?', 'Most UK universities require IELTS 6.0–6.5 overall for undergraduate programs and 6.5–7.0 for postgraduate. Some universities accept alternatives like TOEFL, PTE, or their own in-house English test.', 'uk', true),
('How much does it cost to live in the UK?', 'Outside London expect £800–£1,200/month. In London, budget £1,200–£1,800/month. This includes rent, food, transport, and personal expenses. Student accommodation is typically cheaper than private rentals.', 'uk', true),
('Can I work in the UK on a student visa?', 'Yes, up to 20 hours per week during term time and full time during official vacation periods. You can also do work placements if they are part of your course.', 'uk', true),
('What is the Graduate Route visa?', 'After completing your degree, the Graduate Route allows you to stay and work in the UK for 2 years (3 years for PhD graduates) without needing a job offer. This is a major advantage of studying in the UK.', 'uk', true),
('Are UK degrees recognised worldwide?', 'Yes. UK degrees from accredited universities are among the most respected globally and are recognised by employers and academic institutions across Africa, Europe, North America, and beyond.', 'uk', true),
('Which provinces are best for international students?', 'Ontario (Toronto, Ottawa), British Columbia (Vancouver), and Quebec (Montreal) are the most popular. Ontario has the most universities; BC offers great post-study work opportunities; Quebec has lower tuition programs.', 'canada', true),
('How long does the Canadian study permit take?', 'For Zimbabwean applicants, allow 10–14 weeks. Apply well in advance. The Student Direct Stream (SDS) can reduce processing to 20 days if you meet all criteria including upfront tuition payment.', 'canada', true),
('Can I bring my family to Canada as a student?', 'Yes. Your spouse or common-law partner may be eligible for an open work permit. Dependent children can attend Canadian schools. This makes Canada one of the most family-friendly study destinations.', 'canada', true),
('What is a co-op program in Canada?', 'Co-op programs alternate study terms with paid work terms in your field. They are common in engineering, business, and computer science. Co-op gives you Canadian work experience which significantly improves post-graduation job prospects.', 'canada', true),
('Can I stay in Canada after graduation?', 'Yes. The Post-Graduation Work Permit (PGWP) allows you to work in Canada for up to 3 years after completing a program of 2 years or more. Many graduates use this to qualify for permanent residency through Express Entry.', 'canada', true),
('What is the Genuine Temporary Entrant requirement?', 'The GTE is a statement explaining why you want to study in Australia and your genuine intention to return home after studies. It should be honest and specific about your academic and career goals.', 'australia', true),
('How much can I work in Australia as a student?', 'International students can work up to 48 hours per fortnight during term time, and unlimited hours during official university breaks. The minimum wage in Australia is AUD $23.23/hour.', 'australia', true),
('What is OSHC and why do I need it?', 'Overseas Student Health Cover (OSHC) is mandatory health insurance for international students in Australia. It covers doctor visits, hospital care, and some medicines. You must hold it for the entire duration of your student visa.', 'australia', true),
('Can I extend my stay after graduation in Australia?', 'Yes. The Temporary Graduate Visa (subclass 485) allows you to live and work in Australia for 2–4 years after graduation depending on your qualification level and study location. Regional graduates get extra time.', 'australia', true),
('Which cities are best for students in Australia?', 'Melbourne and Sydney are the most popular. Brisbane and Adelaide are more affordable with growing international student populations. Perth is ideal for students interested in mining or agriculture sectors.', 'australia', true),
('What is the difference between the SAT, ACT, and GRE?', 'SAT and ACT are for undergraduate admissions. GRE is for graduate admissions in most fields. GMAT is specifically for business schools. Many universities are now test-optional — check each school''s requirements.', 'usa', true),
('How competitive is admission to US universities?', 'It varies widely. Ivy League schools have admission rates below 10%. State universities and community colleges are much more accessible. There are thousands of accredited institutions — you can find a great fit at any budget.', 'usa', true),
('Can I work in the USA on an F-1 visa?', 'On-campus work is allowed up to 20 hours/week during term. After one academic year you can apply for CPT internships, and after graduation, Optional Practical Training (OPT) for up to 3 years in STEM fields.', 'usa', true),
('What scholarships are available for African students in the USA?', 'The Fulbright Foreign Student Program, Mastercard Foundation Scholars Program, and individual university merit scholarships are the main options. Many US universities offer substantial financial aid to international students.', 'usa', true),
('How does health insurance work for students in the USA?', 'Most universities require you to enroll in their student health plan. Costs range from $1,500–$3,000/year. Healthcare in the US is expensive without insurance, so maintaining coverage is essential.', 'usa', true),
('Do I need to speak German to study in Germany?', 'Not necessarily. Many universities offer full master''s programs in English. However, for undergraduate programs, German B2 or C1 is usually required. Learning German also helps enormously with daily life and job prospects.', 'germany', true),
('What is a blocked account and how do I open one?', 'A German blocked account (Sperrkonto) is a special bank account where you deposit €11,208 before applying for your visa. The funds are released monthly after you arrive. Fintiba and Coracle are the most commonly used providers.', 'germany', true),
('Are German public universities really free?', 'Public universities charge only a semester contribution of €100–€350, which usually includes a public transport pass. This makes Germany one of the most affordable high-quality study destinations in the world.', 'germany', true),
('Can I stay in Germany after graduation?', 'Yes. Germany''s Job Seeker Visa allows graduates to stay for 18 months to find employment related to their degree. Once employed, you can apply for an EU Blue Card. Germany actively welcomes skilled graduates.', 'germany', true),
('How strong is Germany''s job market for graduates?', 'Germany has one of Europe''s strongest economies with very low unemployment. Engineering, IT, healthcare, and finance graduates are in high demand. Many international graduates build long-term careers in Germany.', 'germany', true),
('Is Lithuanian hard to learn?', 'You do not need Lithuanian for English-medium programs. However, learning basic Lithuanian for daily life is helpful and locals appreciate the effort. Most young Lithuanians speak English well.', 'lithuania', true),
('What are the best universities in Lithuania?', 'Vilnius University (founded 1579), Kaunas University of Technology, and ISM University of Management and Economics are the top choices. Vilnius University is ranked in the QS Top 500.', 'lithuania', true),
('How affordable is student life in Lithuania?', 'Lithuania is one of the most affordable EU countries. Expect €600–€900/month total including rent, food, and transport. A meal at a student canteen costs €2–€4 and a monthly transport pass is around €16.', 'lithuania', true),
('Can I travel freely across Europe from Lithuania?', 'Yes. Lithuania is part of the Schengen Area. With a valid Lithuanian residence permit, you can travel freely to 26 other European countries without a separate visa.', 'lithuania', true),
('Is a Lithuanian degree recognised internationally?', 'Yes. Lithuanian university degrees are recognised across the EU and internationally through the Lisbon Recognition Convention. They carry full European accreditation.', 'lithuania', true),
('What is Riga like as a student city?', 'Riga is a vibrant, walkable city with a stunning UNESCO-listed Old Town, an active arts and music scene, and a large international student community. It is compact and easy to navigate by bike or public transport.', 'latvia', true),
('How much does it cost to study in Latvia?', 'Tuition ranges from €2,500–€6,000/year for international students. Living costs are €600–€900/month including accommodation (€200–€400 for a dorm), food, and transport.', 'latvia', true),
('Do Latvian universities teach in English?', 'Yes, many bachelor and master programs are fully taught in English, particularly at Riga Technical University, University of Latvia, and Riga Stradinš University which is popular for medicine and healthcare programs.', 'latvia', true),
('Can I work in Latvia as a student?', 'Yes. Non-EU students with a valid residence permit can work up to 20 hours per week during the academic year and full time during vacations. The minimum wage in Latvia is €700/month gross.', 'latvia', true),
('What post-study options are available in Latvia?', 'After graduation, you can extend your residence permit for job-seeking for up to 9 months. A job offer from a Latvian employer can lead to a longer-term residence permit and eventually permanent EU residency.', 'latvia', true),
('What is the Stipendium Hungaricum scholarship?', 'Stipendium Hungaricum is a Hungarian government scholarship covering full tuition, accommodation, and a monthly stipend. Zimbabwe is an eligible country. Applications open annually in November–January through the Tempus Public Foundation.', 'hungary', true),
('Is Budapest affordable for students?', 'Yes, Budapest is one of the most affordable European capitals. Expect €500–€900/month for a comfortable lifestyle. A monthly transport pass is €15, a restaurant meal costs €5–€10, and student dormitories start from €150/month.', 'hungary', true),
('Are Hungarian degrees recognised in the EU?', 'Yes. Hungarian universities are fully accredited and degrees are recognised across the EU and internationally. Semmelweis University medical degrees are recognised globally, making Hungary popular for medicine students.', 'hungary', true),
('Do I need to learn Hungarian?', 'For English-medium programs, no. Most university staff and younger Hungarians speak English well, especially in Budapest.', 'hungary', true),
('Can I stay in Hungary after my degree?', 'Yes. You can apply for a job-seeking permit after graduation. Hungary also has a Guest Worker scheme and EU Blue Card pathway for qualified graduates who find employment.', 'hungary', true),
('Why is Malta a good choice for English speakers?', 'Malta is the only EU member state with English as an official language. Your entire experience — lectures, administration, and daily life — is in English. Your degree is EU-accredited and internationally recognised.', 'malta', true),
('Is Malta expensive compared to other EU countries?', 'Malta is mid-range. Tuition is €5,000–€14,000/year and living costs are €800–€1,300/month. It is more expensive than Eastern Europe but cheaper than the UK or Ireland. The Mediterranean climate and quality of life add significant value.', 'malta', true),
('What programs is Malta best known for?', 'Malta is particularly strong in English language programs, maritime studies, gaming and iGaming, hospitality and tourism management, and healthcare. The University of Malta also offers competitive law, arts, and science programs.', 'malta', true),
('Can I work in Malta as a student?', 'Yes. With a Single Permit, non-EU students can work up to 20 hours per week during term and full time during holidays. Malta''s economy has good opportunities in hospitality, tech, and financial services.', 'malta', true),
('Can I move to other EU countries from Malta?', 'After legally residing in Malta for 5 years, you can apply for long-term EU residency which gives you rights to live and work across all 27 EU member states.', 'malta', true),
('Is Cyprus safe for African students?', 'Yes, Cyprus is generally safe with low crime rates. The international student community is large and well-integrated. The country has a warm Mediterranean culture and English is widely understood.', 'cyprus', true),
('What are the top universities in Cyprus?', 'The University of Cyprus is the leading public institution. Frederick University, UCLan Cyprus, Cyprus University of Technology, and European University Cyprus are the main options with strong international programs.', 'cyprus', true),
('What is the lifestyle like in Cyprus?', 'Cyprus enjoys 300+ days of sunshine per year with a classic Mediterranean climate. The island is compact with beaches, mountains, and historical sites all within easy reach. It is a relaxed and welcoming environment.', 'cyprus', true),
('Can I work while studying in Cyprus?', 'Yes. Students with a valid residence permit can work up to 20 hours per week during term time. The Cypriot economy has opportunities in hospitality, tourism, and financial services.', 'cyprus', true),
('Is a Cypriot degree valid in Europe?', 'Yes. All accredited Cypriot universities are recognised by EU member states. Degrees from UCLan Cyprus carry the same UK accreditation as UCLan''s main UK campus.', 'cyprus', true),
('Is Vienna really the world''s most liveable city?', 'Vienna has topped the Economist Intelligence Unit''s Global Liveability Index multiple times. It offers excellent public transport, world-class healthcare, low crime, rich culture, and high quality of life at a fraction of London or Paris costs.', 'austria', true),
('What language do I need for Austrian universities?', 'Public universities primarily teach in German — B2 or C1 is usually required for undergraduate programs. However, many master''s programs at TU Wien, WU Vienna, and the University of Vienna are fully in English.', 'austria', true),
('How does the semester fee system work in Austria?', 'Austrian public universities charge approximately €363 per semester, which usually includes a free public transport pass saving you €600+ per year. Private universities charge full tuition of €5,000–€20,000/year.', 'austria', true),
('What career opportunities exist in Austria after graduation?', 'Austria has a strong economy with opportunities in engineering, finance, tourism, and international organisations. Vienna hosts the UN, OPEC, and OSCE. The Red-White-Red Card allows qualified graduates to apply for a work visa.', 'austria', true),
('Can I travel Europe easily from Austria?', 'Absolutely. Austria borders 8 countries and is in the heart of the Schengen Area. Vienna has excellent rail connections to Prague, Budapest, Munich, and Zurich. With an Austrian residence permit you can travel freely across 26 Schengen countries.', 'austria', true)

on conflict do nothing;
