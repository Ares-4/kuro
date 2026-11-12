// daily-followups: run once a day by pg_cron (see migration 20261111150000).
//  1. Guide follow-up: leads who downloaded the study guide 3+ days ago.
//  2. Scholarship deadline reminders: subscribers, 30 and 7 days before.
//  3. Readiness check reminder: questions done but payment not finished.
// Idempotent: every send is recorded in followup_sends (unique per kind+ref+email),
// so calling it again, or by someone else, never repeats an email; it only
// sends what is due. Emails go through send-email with the service role.
import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url, serviceKey);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const MAX_PER_RUN = 200;

async function sendOnce(kind: string, ref: string, email: string, templateName: string, data: Record<string, string>) {
  const to = email.trim().toLowerCase();
  // Claim first: the unique constraint stops duplicates even if two runs overlap.
  const { error: claimErr } = await db.from("followup_sends").insert({ kind, ref, email: to });
  if (claimErr) return false; // already sent (or claimed)
  const res = await fetch(`${url}/functions/v1/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ to, templateName, data }),
  });
  if (!res.ok) {
    await db.from("followup_sends").delete().match({ kind, ref, email: to }); // retry tomorrow
    return false;
  }
  return true;
}

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

Deno.serve(async () => {
  let sent = 0;

  // 1. Guide follow-up, 3 to 10 days after the download (never older leads).
  const { data: leads } = await db.from("leads").select("email, created_at")
    .eq("goal", "guide_download").not("email", "is", null)
    .lte("created_at", new Date(Date.now() - 3 * 86400000).toISOString())
    .gte("created_at", new Date(Date.now() - 10 * 86400000).toISOString())
    .limit(MAX_PER_RUN);
  for (const l of leads ?? []) {
    if (sent >= MAX_PER_RUN) break;
    if (await sendOnce("guide_followup", "guide-2027", l.email, "guide_followup", {})) sent++;
  }

  // 2. Scholarship deadline reminders at 30 and 7 days.
  for (const daysLeft of [30, 7]) {
    const { data: schols } = await db.from("scholarships").select("id, title, deadline, link")
      .eq("is_active", true).eq("deadline", day(daysLeft));
    for (const s of schols ?? []) {
      const { data: subs } = await db.from("scholarship_subscriptions").select("email").eq("scholarship_id", s.id);
      for (const sub of subs ?? []) {
        if (sent >= MAX_PER_RUN) break;
        if (await sendOnce(`deadline_${daysLeft}`, s.id, sub.email, "scholarship_deadline_reminder", {
          title: s.title, days: String(daysLeft), deadline: s.deadline, link: `https://kuroeduconsultancy.com/scholarships/${s.id}`,
        })) sent++;
      }
    }
  }

  // 3. Readiness check started but not paid: one reminder per email address ever,
  //    for leads 20 hours to 7 days old with no readiness order (by lead or email).
  const { data: started } = await db.from("leads").select("id, email, goal, created_at")
    .in("goal", ["readiness_check_basic", "readiness_check_premium"]).not("email", "is", null)
    .lte("created_at", new Date(Date.now() - 20 * 3600000).toISOString())
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .order("created_at", { ascending: false })
    .limit(MAX_PER_RUN);
  const seen = new Set<string>();
  for (const l of started ?? []) {
    if (sent >= MAX_PER_RUN) break;
    const email = String(l.email).trim().toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);
    const [byLead, byEmail] = await Promise.all([
      db.from("readiness_orders").select("id", { count: "exact", head: true }).eq("lead_id", l.id),
      db.from("readiness_orders").select("id", { count: "exact", head: true }).ilike("email", email),
    ]);
    if (byLead.error || byEmail.error) continue; // unsure: never remind someone who may have paid
    if ((byLead.count ?? 0) + (byEmail.count ?? 0) > 0) continue; // paid (this lead or another one)
    const premium = l.goal === "readiness_check_premium";
    if (await sendOnce("readiness_reminder", "readiness-2027", email, "readiness_checkout_reminder", {
      plan: premium ? "Premium report" : "Basic check",
      price: premium ? "EUR 19" : "EUR 2.99",
    })) sent++;
  }

  return json({ ok: true, sent });
});
