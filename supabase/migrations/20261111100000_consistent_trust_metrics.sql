-- Homepage showed two conflicting sets of figures (hero: 50+ partner
-- universities / 91% visa success; credibility block: 35+ / +90%).
-- One consistent set, confirmed by the owner on 2026-11-11: 200+ students
-- placed, 90%+ visa success. Partner universities uses the lower of the two
-- existing claims (35+) until the owner confirms the exact figure.
-- Also re-enables the testimonials section (3 real, featured testimonials).

update site_settings
set value = '{"students_placed": "200+", "visa_success": "90%+", "partner_unis": "35+"}'::jsonb
where key = 'site_metrics';

update site_settings
set value = (
  select jsonb_agg(
    case when m->>'label' = 'Visa Success Rate' then jsonb_set(m, '{value}', '"90%+"') else m end
  )
  from jsonb_array_elements(value) m
)
where key = 'credibility_metrics';

update site_settings set value = 'true'::jsonb where key = 'show_testimonials_section';
