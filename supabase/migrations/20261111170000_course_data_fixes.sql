-- Course data corrections from official sources (checked 2026-11-11).
--
-- VIZJA University: 2026/2027 English-taught first-degree prices, regular
-- annual tuition (https://vizja.pl/en/cennik/). The lower "IRS" rate is only
-- for a list of Eastern European / Central Asian countries, so it does not
-- apply to Kuro's students. "American Studies" is no longer on the price list
-- and is left unchanged for the owner to review.
--
-- TUM Mechanical Engineering (B.Sc.): taught in German, German proficiency
-- required; non-EU tuition 3,000 EUR/semester, rising to 3,400 EUR/semester
-- from winter 2027/28, plus the semester fee (97 EUR)
-- (https://www.tum.de/en/studies/degree-programs/detail/mechanical-engineering-bachelor-of-science-bsc,
--  https://www.tum.de/en/studies/fees/tuition). Stored per year at the
-- 2027/28 rate, the first intake Kuro students can still apply for.
--
-- Vistula "LSBU Management": the Polish-British double diploma with London
-- South Bank University (two years in Warsaw, option of a final year at LSBU).

begin;

update programs set tuition_fee = v.fee, updated_at = now()
from (values
  ('2d1066ec', '3800'),  -- Social Media and Digital Marketing
  ('0d862c20', '4100'),  -- Advertising (Marketing, specialisation Advertising)
  ('b4104440', '4200'),  -- Business Finance
  ('49ac4217', '4100'),  -- Enterprise Management
  ('51184299', '3800'),  -- International Relations
  ('3cdd8c20', '4100'),  -- International Trade and Logistics
  ('4925a506', '4300'),  -- Psychology
  ('4533653c', '4200'),  -- Cybersecurity
  ('2fa8061a', '4200'),  -- Accounting, Audit and Controlling
  ('49bdad9d', '4200')   -- Banking and Insurance
) as v(prefix, fee)
where programs.university ilike 'VIZJA%' and left(programs.id::text, 8) = v.prefix;

update programs set
  tuition_fee = '6800',
  currency = 'EUR',
  language = 'German',
  description = $desc$Mechanical Engineering at the Technical University of Munich is taught at the Garching campus near Munich. Students build strong foundations in maths, mechanics, thermodynamics and materials, then move on to machine design, production and control engineering.

Important: this programme is taught entirely in German, and you must prove German proficiency by the application deadline (applications 15 May to 15 July for the October start). Students from outside the EU pay tuition of 3,000 EUR per semester, rising to 3,400 EUR per semester from winter 2027/28, plus a semester fee of about 97 EUR. TUM offers some fee waivers and scholarships.$desc$,
  updated_at = now()
where left(id::text, 8) = '215cb576';

update programs set
  description = $desc$LSBU Management is Vistula's Polish-British double diploma programme with London South Bank University (LSBU) in the UK. The curriculum covers management and leadership, marketing, finance, human resources and business strategy, with an international, case-based approach.

Students spend their first two years in Warsaw and can choose to complete their final year at LSBU in London, where Vistula students receive a discount on LSBU tuition. It suits students who want a business degree with a UK award. Your advisor can walk you through the costs of the London year before you apply.$desc$,
  updated_at = now()
where left(id::text, 8) = '8438d6f7';

commit;
