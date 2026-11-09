-- 2027 cycle content seed (researched 2026-11-09).
-- Dates marked "expected" follow the previous official cycle; confirm on the official link before relying on them.

-- ── Data hygiene ──────────────────────────────────────────────
update destinations set name = 'Germany' where slug = 'germany' and name = 'GERMANY';
update destinations set name = 'Malta'   where slug = 'malta'   and name = 'MALTA';
update universities set name = btrim(name) where name <> btrim(name);

-- ── Scholarships ──────────────────────────────────────────────
insert into scholarships (title, provider, description, amount, countries, levels, deadline, link, is_active)
select * from (values
  ('Stipendium Hungaricum 2027/28', 'Tempus Public Foundation (Hungarian Government)',
   'Fully funded Hungarian government scholarship for bachelor, master and PhD study. You apply on DreamApply and must also be nominated by your country''s Sending Partner — check your country is on the partner list, as local nomination deadlines can be earlier. Deadline expected 15 January 2027 (14:00 CET), following the 2026/27 cycle.',
   'Tuition waiver, monthly stipend, accommodation contribution, medical insurance',
   array['Hungary'], array['Undergraduate','Masters','PhD'], date '2027-01-15', 'https://stipendiumhungaricum.hu/', true),

  ('Erasmus Mundus Joint Masters (2027 intake)', 'European Commission (EACEA)',
   'Fully funded joint master''s degrees taught across two or more European universities. Each programme sets its own deadline — most fall between December 2026 and March 2027. Browse the official catalogue and apply directly to the consortium.',
   'Tuition, travel, installation costs and a monthly allowance (about €1,400)',
   array['Germany','Poland','Hungary','Austria','Lithuania','Latvia','Malta','Cyprus'], array['Masters'], null, 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en', true),

  ('DAAD EPOS Development-Related Postgraduate Courses 2027/28', 'DAAD (German Academic Exchange Service)',
   'Full scholarships for professionals from developing countries with at least two years of work experience, for selected master''s and PhD courses in Germany. Applications go to the university, not DAAD, and each course has its own deadline (many close between August 2026 and March 2027 — e.g. INEMA: 15 March 2027).',
   '€992/month for master''s students, plus insurance, travel allowance and tuition where applicable',
   array['Germany'], array['Masters','PhD'], null, 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/', true),

  ('DAAD EPOS — INEMA Education Management (Ludwigsburg / Helwan)', 'DAAD / Ludwigsburg University of Education',
   'Joint international MA in Education Management with an EPOS scholarship track. Window opens 2 January 2027; closes 15 March 2027, 23:59 CET. Highly competitive (around 25 places).',
   'DAAD EPOS full scholarship', array['Germany'], array['Masters'], date '2027-03-15', 'https://www.ph-ludwigsburg.de/en/inema', true),

  ('Australia Awards Scholarships — 2028 intake', 'Australian Government (DFAT) / Australia Awards Africa',
   'Fully funded master''s scholarships for eligible African countries in priority development fields. The 2027 intake closed on 30 April 2026. Applications for the 2028 intake are expected to open in February 2027 and close around 30 April 2027 via OASIS.',
   'Full tuition, return airfare, living allowance, health cover', array['Australia'], array['Masters'], date '2027-04-30', 'https://australiaawardsafrica.org/awards/apply/', true),

  ('NAWA Ignacy Łukasiewicz Scholarship Programme', 'NAWA (Polish National Agency for Academic Exchange)',
   'Polish government scholarships for students from selected developing countries for full master''s study in Poland. The eligible-country list changes each call, so confirm your country before applying. Deadline is set in each annual call.',
   'Tuition waiver plus monthly stipend', array['Poland'], array['Masters'], null, 'https://nawa.gov.pl/en/students/foreign-students/the-ignacy-lukasiewicz-scholarship-programme', true),

  ('Chevening Scholarships — 2028/29 round', 'UK Foreign, Commonwealth & Development Office',
   'One-year fully funded master''s in the UK for future leaders with at least two years of work experience. The 2027/28 round closed on 6 October 2026. The 2028/29 round is expected to open in early August 2027 and close in early October 2027.',
   'Tuition, monthly stipend, flights and arrival allowances', array['UK'], array['Masters'], null, 'https://www.chevening.org/scholarships/application-timeline/', true),

  ('Commonwealth Master''s Scholarships — 2028/29 round', 'Commonwealth Scholarship Commission in the UK',
   'Fully funded taught master''s in the UK for citizens of eligible low- and middle-income Commonwealth countries. The 2027/28 round closed on 20 October 2026. The next round is expected to open around September 2027 — your national nominating agency usually closes earlier than the CSC deadline.',
   'Tuition, airfare, monthly stipend, thesis and warm-clothing allowances', array['UK'], array['Masters'], null, 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/', true),

  ('Fulbright Foreign Student Program — 2028/29 cycle', 'U.S. Department of State / U.S. Embassy',
   'Graduate study and research in the USA. The 2027/28 competition has closed. The next cycle is run by the U.S. Embassy Public Affairs Section in your country — check the embassy page for the opening date.',
   'Tuition, living stipend, airfare, health benefits', array['USA'], array['Masters','PhD'], null, 'https://foreign.fulbrightonline.org/', true)
) as v(title, provider, description, amount, countries, levels, deadline, link, is_active)
where not exists (select 1 from scholarships s where s.title = v.title);

-- ── Deadlines (2027 intakes) ─────────────────────────────────
insert into university_deadlines (university_name, program_name, country, deadline_date, type, intake_season, intake_year, link, notes, is_active)
select * from (values
  ('Hamburg University of Technology', 'International English-taught Master''s', 'Germany', date '2027-02-01', 'application_deadline', 'October', 2027,
   'https://www.tuhh.de/tuhh/en/education/application.html',
   'Expected window 1 Dec 2026 – 1 Feb 2027, following the 2025/26 cycle. Computer Science and Electrical Engineering use a separate window (1 Jun – 15 Jul).', true),
  ('Hamburg University of Technology', 'MSc Computer Science / Electrical Engineering', 'Germany', date '2027-07-15', 'application_deadline', 'October', 2027,
   'https://www.tuhh.de/tuhh/en/education/application.html',
   'Expected window 1 Jun – 15 Jul 2027. Confirm on the programme page.', true),
  ('Hochschule Merseburg University of Applied Sciences', 'Restricted-admission programmes', 'Germany', date '2027-06-15', 'application_deadline', 'October', 2027,
   'https://www.hs-merseburg.de',
   'Apply via uni-assist (allow 4–6 weeks for document checks). Admission-free programmes usually close 31 August.', true),
  ('Hochschule Merseburg University of Applied Sciences', 'Admission-free programmes', 'Germany', date '2027-08-31', 'application_deadline', 'October', 2027,
   'https://www.hs-merseburg.de',
   'Late deadline leaves little time for a German visa appointment — Kuro recommends applying by May.', true),
  ('Schmalkalden University of Applied Sciences', 'German-taught programmes', 'Germany', date '2027-07-15', 'application_deadline', 'October', 2027,
   'https://www.hs-schmalkalden.de/en/application/international-applicants',
   'Window 1 April – 15 July. English-taught programmes open from 1 February; check the programme page for their closing date.', true),
  ('Kuro Poland partner universities', 'Vistula, WSB, WSEI, UITM, VIZJA, Akademia Tatrzańska', 'Poland', date '2027-06-30', 'other', 'October', 2027,
   '/destinations/poland',
   'Polish private universities admit on a rolling basis into the summer, but non-EU students need time for the Type D visa. Kuro''s recommended latest submission date for October 2027 is 30 June 2027.', true),
  ('Kuro Poland partner universities', 'February intake', 'Poland', date '2026-12-15', 'other', 'February', 2027,
   '/destinations/poland',
   'Kuro''s recommended latest submission date for the February 2027 intake, to leave time for the visa appointment.', true),
  ('Stipendium Hungaricum', 'All levels', 'Hungary', date '2027-01-15', 'scholarship_deadline', 'September', 2027,
   'https://stipendiumhungaricum.hu/',
   'Expected deadline 15 January 2027, 14:00 CET (as in the 2026/27 cycle). Sending Partner deadlines may be earlier.', true),
  ('DAAD EPOS — INEMA', 'MA Education Management', 'Germany', date '2027-03-15', 'scholarship_deadline', 'October', 2027,
   'https://www.ph-ludwigsburg.de/en/inema',
   'Opens 2 January 2027, closes 15 March 2027 23:59 CET.', true),
  ('Australia Awards Africa', '2028 intake', 'Australia', date '2027-04-30', 'scholarship_deadline', 'January', 2028,
   'https://australiaawardsafrica.org/awards/apply/',
   'Expected to open February 2027 and close around 30 April 2027, following the 2027 intake cycle.', true)
) as v(university_name, program_name, country, deadline_date, type, intake_season, intake_year, link, notes, is_active)
where not exists (
  select 1 from university_deadlines d
  where d.university_name = v.university_name and coalesce(d.program_name,'') = coalesce(v.program_name,'') and d.intake_year = v.intake_year
);

-- ── Germany application roadmap ───────────────────────────────
insert into destination_roadmaps (destination_slug, steps, notices)
values ('germany', $json$[
  {"order":1,"title":"Shortlist programmes and check admission rules","description":"Use the DAAD International Programmes database and each university's page. Check whether your school certificate gives direct access or requires a Studienkolleg / foundation year, and whether the programme is taught in English or German.","docs_required":["Academic transcripts","School leaving certificate","Passport"],"typical_timeline":"10–12 months before start"},
  {"order":2,"title":"Prove your language level","description":"English-taught programmes usually need IELTS 6.0–6.5 or equivalent; German-taught programmes need TestDaF 4x4 or DSH-2 (C1). Book tests early — results can take several weeks.","docs_required":["IELTS / TOEFL or TestDaF / DSH certificate"],"typical_timeline":"8–10 months before start"},
  {"order":3,"title":"Apply via uni-assist or the university portal","description":"Many universities of applied sciences (e.g. Merseburg) require uni-assist, which takes 4–6 weeks to check documents. Others such as TUHH and Schmalkalden take applications on their own portal. Winter semester deadlines range from 1 February to 15 July.","docs_required":["Certified copies of certificates","Translations (German or English)","CV","Motivation letter","uni-assist fee receipt"],"typical_timeline":"6–9 months before start"},
  {"order":4,"title":"Open a blocked account and arrange health insurance","description":"After you get your Zulassungsbescheid (admission letter), open a blocked account (Sperrkonto) with EUR 11,904 for the year (EUR 992/month). You also need travel health insurance for the visa and statutory or private student health insurance on enrolment.","docs_required":["Admission letter","Blocked account confirmation","Health insurance certificate"],"typical_timeline":"4–5 months before start"},
  {"order":5,"title":"Apply for the national student visa","description":"Apply online through the Federal Foreign Office portal (digital.diplo.de) where available, then attend the embassy for biometrics and the €75 fee. Processing usually takes 6–12 weeks, so book as soon as you have the admission letter and blocked account.","docs_required":["Passport","Admission letter","Blocked account confirmation","Health insurance","Language certificate","Biometric photos","Motivation letter"],"typical_timeline":"3–4 months before start"},
  {"order":6,"title":"Arrive, register and enrol","description":"Register your address (Anmeldung) at the Bürgeramt within 14 days, enrol at the university and pay the semester contribution, then apply to the Ausländerbehörde for your residence permit before the visa expires.","docs_required":["Rental contract / Wohnungsgeberbestätigung","Enrolment certificate","Health insurance","Passport and visa"],"typical_timeline":"First 2–4 weeks after arrival"}
]$json$::jsonb, 'Blocked-account amount is set yearly by the German government — confirm the current figure before transferring funds.')
on conflict (destination_slug) do nothing;
