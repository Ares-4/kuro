-- Event-triggered follow-up emails: welcome after profile completion (sent by
-- the student's own session, self-only in send-email) and readiness purchase
-- confirmations (sent by stripe-webhook).

insert into email_templates (name, subject, body)
select v.name, v.subject, v.body from (values
(
  'welcome_student',
  'Welcome to Kuro, {{name}}',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<h1 style="font-size:22px;color:#0b1224;margin:0 0 12px">Welcome, {{name}}</h1>'
  || '<p>Your Kuro student profile is set up. Here is how to make the most of it for your {{destination}} plans:</p>'
  || '<ol style="padding-left:18px"><li><strong>Check the deadlines</strong> for your intake: <a href="https://kuroeduconsultancy.com/deadlines">kuroeduconsultancy.com/deadlines</a></li>'
  || '<li><strong>Shortlist courses</strong> with fees and requirements: <a href="https://kuroeduconsultancy.com/courses">kuroeduconsultancy.com/courses</a></li>'
  || '<li><strong>Know where you stand</strong> with the readiness check (from EUR 2.99): <a href="https://kuroeduconsultancy.com/readiness-check">kuroeduconsultancy.com/readiness-check</a></li></ol>'
  || '<p>Your dashboard tracks each step of your application. Reply to this email if you have questions; an advisor will get back to you.</p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p></div>'
),
(
  'readiness_basic_confirm',
  'Your Kuro readiness check: payment received',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<h1 style="font-size:22px;color:#0b1224;margin:0 0 12px">Thanks, your payment is confirmed</h1>'
  || '<p>Your Basic readiness check (EUR 2.99) is paid. Your score and top blockers were shown on screen straight after payment.</p>'
  || '<p>Want an expert to review your profile? The Premium report (EUR 19) adds a visa risk rating, a financial check and 3 destination comparisons: <a href="https://kuroeduconsultancy.com/readiness-check">kuroeduconsultancy.com/readiness-check</a></p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p></div>'
),
(
  'readiness_premium_confirm',
  'Your Kuro Premium report: payment received',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<h1 style="font-size:22px;color:#0b1224;margin:0 0 12px">Thanks, your payment is confirmed</h1>'
  || '<p>Your Premium readiness report (EUR 19) is paid. An advisor is now reviewing your answers, and we will email your PDF report <strong>within 24 hours</strong>.</p>'
  || '<p>If anything in your situation changes before then (budget, destination, documents), just reply to this email so we can include it.</p>'
  || '<p>If you continue with our full application service, your EUR 19 is deducted from the fee.</p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p></div>'
)
) as v(name, subject, body)
where not exists (select 1 from email_templates t where t.name = v.name);
