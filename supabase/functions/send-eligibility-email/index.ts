// send-eligibility-email: sends the eligibility report link via SendGrid.
//
// Security (2026-11-09): name/tier/pdfUrl were interpolated raw into HTML sent from
// no-reply@kuroeduconsultancy.com to any address, so anyone could send phishing mail
// from our domain. Now: values are escaped, the link must point at our own
// eligibility-results bucket, and sends are throttled per recipient.
import {
  corsHeaders, json, serviceClient, escapeHtml, isEmail, recentEmailCount,
} from "../_shared/security.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const PDF_PREFIX = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/eligibility-results/`;
const TIERS = new Set(["1", "2", "3", "4", "5", "A", "B", "C", "D", "Gold", "Silver", "Bronze"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { to, name, tier, pdfUrl } = await req.json().catch(() => ({}));
    if (!isEmail(to)) return json({ error: "Invalid recipient" }, 400);
    if (typeof pdfUrl !== "string" || !pdfUrl.startsWith(PDF_PREFIX) || pdfUrl.length > 500) {
      return json({ error: "Invalid report link" }, 400);
    }
    if ((await recentEmailCount(to)) >= 3) return json({ error: "Too many emails, try again later" }, 429);

    const safeName = escapeHtml(String(name ?? "there").slice(0, 80));
    const safeTier = TIERS.has(String(tier)) ? escapeHtml(tier) : "—";
    const safeUrl = escapeHtml(pdfUrl);

    if (!SENDGRID_API_KEY) {
      console.log("SendGrid key missing; email not sent");
      return json({ success: false, message: "Email service not configured" }, 503);
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "no-reply@kuroeduconsultancy.com", name: "Kuro Education" },
        subject: "Your Eligibility Assessment Result",
        content: [{
          type: "text/html",
          value: `
            <h1>Hello ${safeName},</h1>
            <p>Thank you for using our eligibility check service.</p>
            <p>Your result is: <strong>Tier ${safeTier}</strong></p>
            <p>You can download your official assessment report here:</p>
            <p><a href="${safeUrl}" style="background-color:#2980b9;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Download PDF Report</a></p>
            <p>Best regards,<br>Kuro Education Consultancy</p>`,
        }],
      }),
    });

    await serviceClient().from("email_logs").insert({
      recipient: to,
      subject: "Your Eligibility Assessment Result",
      template_name: "eligibility_result",
      status: res.ok ? "sent" : "failed",
    });

    return json({ success: res.ok }, res.ok ? 200 : 502);
  } catch (error) {
    console.error("send-eligibility-email error:", error);
    return json({ error: "Could not send email" }, 500);
  }
});
