-- One reminder for visitors who completed the readiness check questions but did
-- not finish paying (lead saved, no readiness order). Sent by the daily-followups
-- function about a day later, once per email address ever.
insert into email_templates (name, subject, body)
select 'readiness_checkout_reminder',
  'Your readiness check is waiting',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<p>Hi,</p><p>You started the Kuro readiness check ({{plan}}, {{price}}) but did not finish the payment, so we could not send your result.</p>'
  || '<p>It only takes a few minutes to complete. You get your readiness score across academics, finances, documents and timeline, and with Premium an expert reviews your profile and rates your visa risk within 24 hours.</p>'
  || '<p style="margin:24px 0"><a href="https://kuroeduconsultancy.com/readiness-check" style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Finish my readiness check</a></p>'
  || '<p>If something went wrong with the payment, or you have a question first, just reply to this email or message us on WhatsApp and an advisor will help.</p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p>'
  || '<p style="font-size:12px;color:#64748b">This is the only reminder we send about your readiness check.</p></div>'
where not exists (select 1 from email_templates where name = 'readiness_checkout_reminder');
