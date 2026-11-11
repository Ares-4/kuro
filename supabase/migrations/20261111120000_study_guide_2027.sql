-- Study in Europe Guide 2027: the pop-up promised a 2025 "50-page PDF" and
-- the email linked to a file that never existed. The real guide is now at
-- /guides/kuro-study-in-europe-guide-2027.pdf (15 pages); send-email sets the
-- link server-side.

update email_templates set
  subject = 'Your Study in Europe Guide 2027',
  body = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
    || '<h1 style="font-size:22px;color:#0b1224;margin:0 0 12px">Your guide is ready</h1>'
    || '<p>Thanks for requesting <strong>The Ultimate Study in Europe Guide 2027</strong>. Inside: 12 countries compared, real costs and proof-of-funds amounts, 2027 deadlines, document checklists, student visa fees and steps, scholarships, and how to avoid common scams.</p>'
    || '<p style="margin:24px 0"><a href="{{link}}" style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Download the guide (PDF)</a></p>'
    || '<p>Want to know where you stand? Our readiness check gives you an instant score for EUR 2.99, or an expert-reviewed report for EUR 19: <a href="https://kuroeduconsultancy.com/readiness-check">kuroeduconsultancy.com/readiness-check</a></p>'
    || '<p>Questions? Reply to this email and our team will help.</p>'
    || '<p>Best wishes,<br>Kuro Educational Consultancy</p></div>',
  updated_at = now()
where name = 'guide_download';

update site_settings
set value = jsonb_set(
  jsonb_set(
    jsonb_set(value, '{guide,title}', '"The Ultimate Study in Europe Guide 2027"'),
    '{guide,text}', '"Free 15-page PDF: 12 countries compared, real costs, 2027 deadlines, visa fees and steps, scholarships and document checklists."'),
  '{guide,buttonText}', '"Email me the guide"')
where key = 'promo_banners' and value ? 'guide';

-- A test pop-up (title "Ronald", text "Kahoka", button "hoka") was enabled for
-- all visitors. Switched off; it stays in Admin and can be re-enabled.
update site_settings
set value = jsonb_set(value, '{summer,enabled}', 'false')
where key = 'promos' and value #>> '{summer,title}' = 'Ronald';
