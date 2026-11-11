// send-email: renders an email_templates row and sends it over SMTP.
//
// Security (2026-11-09): previously an open relay — anyone with the public anon key
// could send any template, a custom subject, or raw content to any address.
//   * Admins and trusted server functions (service-role key): any template/recipient.
//   * Public callers: only PUBLIC_TEMPLATES, no subject override, throttled per
//     recipient; admin_notification always goes to ADMIN_EMAIL, never to `to`.
//   * Template variables are HTML-escaped.
import nodemailer from "npm:nodemailer@6.9.7";
import {
  corsHeaders, json, serviceClient, isPrivileged, escapeHtml, isEmail, recentEmailCount,
} from "../_shared/security.ts";

const SMTP_USER = Deno.env.get("SMTP_USER")!;
const transporter = nodemailer.createTransport({
  host: Deno.env.get("SMTP_HOST")!,
  port: parseInt(Deno.env.get("SMTP_PORT") ?? "465"),
  secure: true,
  auth: { user: SMTP_USER, pass: Deno.env.get("SMTP_PASS")! },
});

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "kuro.agents@kuroeduconsultancy.com";
const PUBLIC_TEMPLATES = new Set(["guide_download", "readiness_results", "admin_notification"]);
const PUBLIC_PER_RECIPIENT_PER_HOUR = 3;
// The guide link is fixed server-side: callers must not be able to put their
// own URL into an email sent from our address (phishing).
const GUIDE_URL = "https://kuroeduconsultancy.com/guides/kuro-study-in-europe-guide-2027.pdf";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const templateName = String(body.templateName ?? "");
    const data: Record<string, unknown> = body.data && typeof body.data === "object" ? body.data : {};
    const privileged = await isPrivileged(req);

    let to = String(body.to ?? "").trim();
    let subjectOverride: string | undefined = privileged && typeof body.subject === "string" ? body.subject.slice(0, 200) : undefined;

    if (!privileged) {
      if (!PUBLIC_TEMPLATES.has(templateName)) return json({ error: "Not allowed" }, 403);
      if (templateName === "admin_notification") to = ADMIN_EMAIL;
      subjectOverride = undefined;
    }
    if (templateName === "guide_download") {
      for (const k of Object.keys(data)) delete data[k];
      data.link = GUIDE_URL;
    }
    if (!isEmail(to)) return json({ error: "Invalid recipient" }, 400);

    if (!privileged && (await recentEmailCount(to)) >= PUBLIC_PER_RECIPIENT_PER_HOUR) {
      return json({ error: "Too many emails to this address, try again later" }, 429);
    }

    const supabase = serviceClient();
    const { data: template } = await supabase
      .from("email_templates").select("subject, body").eq("name", templateName).maybeSingle();
    if (!template) return json({ error: "Unknown template" }, 400);

    let html = String(template.body ?? "");
    let subject = subjectOverride || String(template.subject ?? "Notification from Kuro Edu");
    for (const [key, raw] of Object.entries(data)) {
      if (!/^[A-Za-z0-9_]{1,40}$/.test(key)) continue;
      const value = escapeHtml(raw).slice(0, 2000);
      const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      html = html.replace(re, value);
      subject = subject.replace(re, String(raw ?? "").replace(/[\r\n]/g, " ").slice(0, 200));
    }

    const info = await transporter.sendMail({ from: `"Kuro Support" <${SMTP_USER}>`, to, subject, html });

    await supabase.from("email_logs").insert({
      recipient: to,
      subject,
      template_name: templateName,
      status: "sent",
      metadata: { messageId: info.messageId, privileged },
    });

    return json({ success: true });
  } catch (error) {
    console.error("send-email error:", error);
    // Non-secret diagnostics (e.g. EAUTH = login rejected, ECONNECTION/ETIMEDOUT =
    // cannot reach the mail server) so failures can be fixed without log access.
    // deno-lint-ignore no-explicit-any
    const e = error as any;
    // Tell admins (at most once an hour): a wrong mailbox password once stopped
    // every site email for four months without anyone noticing.
    try {
      const db = serviceClient();
      const since = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await db.from("admin_notifications").select("id", { count: "exact", head: true })
        .eq("type", "email_failure").gte("created_at", since);
      if (!count) {
        await db.from("admin_notifications").insert({
          type: "email_failure",
          title: "Site emails are failing",
          body: e?.code === "EAUTH"
            ? "The mail server rejected the login (wrong mailbox password?). Update SMTP_PASS in Supabase secrets."
            : `Sending failed (${e?.code ?? "unknown error"}). Check the mail server settings.`,
          metadata: { code: e?.code ?? null, smtp: e?.responseCode ?? null },
        });
      }
    } catch { /* never let alerting hide the original error */ }
    return json({ error: "Could not send email", code: e?.code ?? null, smtp: e?.responseCode ?? null, command: e?.command ?? null }, 500);
  }
});
