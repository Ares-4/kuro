// stripe-webhook/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function formatDateCET(d: Date) {
  return d.toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const SEND_EMAIL_URL = `${supabaseUrl}/functions/v1/send-email`;

async function sendEmailSafe(payload: any) {
  try {
    const res = await fetch(SEND_EMAIL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("send-email failed:", res.status, txt);
    }
  } catch (e) {
    console.error("send-email exception:", String(e));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 0) Validate required env
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_WEBHOOK_SECRET" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Signature header
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Raw body
    const rawBody = await req.text();

    // 3) Verify event
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid signature", details: String(err) }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Only handle checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true, ignored: event.type }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ received: true, ignored: "not_paid" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Readiness check purchases (process-payment, product metadata) have no
    // application record — notify the admin and stop here.
    const product = session.metadata?.product ?? "";
    if (product.startsWith("readiness_")) {
      await supabaseAdmin.from("admin_notifications").insert({
        type: "readiness_paid",
        title: "Readiness check paid",
        body: `${session.customer_details?.email ?? session.customer_email ?? "A visitor"} paid ${(session.amount_total ?? 0) / 100} ${(session.currency ?? "").toUpperCase()} for ${product.replace("readiness_", "")} readiness check.`,
        metadata: { stripeSessionId: session.id, product, amountTotal: session.amount_total },
      });
      return new Response(JSON.stringify({ received: true, product }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Core values from session
    const stripeSessionId = session.id;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;

    const amount =
      typeof session.amount_total === "number" ? session.amount_total / 100 : null;

    const currency = session.currency ? session.currency.toUpperCase() : null;

    const customerEmail =
      session.customer_details?.email ??
      session.customer_email ??
      session.metadata?.email ??
      null;

    const name =
      session.customer_details?.name ??
      session.metadata?.name ??
      "Customer";

    // 5) Try to locate the application reliably
    // Primary: metadata.applicationId (uuid)
    const metadataApplicationId = session.metadata?.applicationId ?? null;

    let applicationRow: any = null;

    // A) If metadata.applicationId is a UUID, try lookup by id
    if (metadataApplicationId && isUuid(metadataApplicationId)) {
      const { data, error } = await supabaseAdmin
        .from("applications")
        .select("*")
        .eq("id", metadataApplicationId)
        .maybeSingle();

      if (error) console.error("lookup by application id error:", error.message);
      if (data) applicationRow = data;
    }

    // B) Fallback: lookup by stripe_session_id (this fixes your historical bad metadata problem)
    if (!applicationRow) {
      const { data, error } = await supabaseAdmin
        .from("applications")
        .select("*")
        .eq("stripe_session_id", stripeSessionId)
        .maybeSingle();

      if (error) console.error("lookup by stripe_session_id error:", error.message);
      if (data) applicationRow = data;
    }

    // C) Fallback: lookup by payment_intent_id (useful if you store it)
    if (!applicationRow && paymentIntentId) {
      const { data, error } = await supabaseAdmin
        .from("applications")
        .select("*")
        .eq("payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (error) console.error("lookup by payment_intent_id error:", error.message);
      if (data) applicationRow = data;
    }

    // If still not found:
    // DO NOT return 404. Stripe will retry forever and spam your system.
    // Log + return 200.
    if (!applicationRow) {
      console.error("Application not found for paid session", {
        metadataApplicationId,
        stripeSessionId,
        paymentIntentId,
      });

      // Optional: store a “dead-letter” notification for you
      await supabaseAdmin.from("admin_notifications").insert({
        type: "payment_orphaned",
        title: "Payment received but application not found",
        body: "Stripe payment succeeded but we could not match it to an application record.",
        metadata: {
          metadataApplicationId,
          stripeSessionId,
          paymentIntentId,
          customerEmail,
          amount,
          currency,
        },
      });

      return new Response(JSON.stringify({
        received: true,
        matched: false,
        reason: "application_not_found",
        metadataApplicationId,
        stripeSessionId,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const applicationId = applicationRow.id as string;

    // Security: never mark an application paid for less than the fee we charged.
    const expectedCents = parseInt(session.metadata?.expectedAmountCents ?? "", 10);
    if (Number.isFinite(expectedCents) && (session.amount_total ?? 0) < expectedCents) {
      await supabaseAdmin.from("admin_notifications").insert({
        type: "payment_amount_mismatch",
        title: "Payment below expected fee",
        body: `Application ${applicationId} paid ${(session.amount_total ?? 0) / 100} but ${expectedCents / 100} was expected. Not marked as paid.`,
        metadata: { applicationId, stripeSessionId, expectedCents, amountTotal: session.amount_total },
      });
      return new Response(JSON.stringify({ received: true, matched: true, flagged: "amount_mismatch" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6) Idempotency: if already paid, do not resend emails repeatedly
    const alreadyPaid =
      applicationRow.payment_status === "paid" ||
      applicationRow.paid_at !== null;

    // 7) Update application using columns you DO have (you showed these exist)
    if (!alreadyPaid) {
      const { error: updErr } = await supabaseAdmin
        .from("applications")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          stripe_session_id: stripeSessionId,
          payment_intent_id: paymentIntentId,
        })
        .eq("id", applicationId);

      if (updErr) {
        // This is a real server failure -> 500 is correct
        return new Response(JSON.stringify({ error: "Failed to update application", details: updErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 8) Insert admin notification (always ok even if already paid; you may choose to skip duplicates)
    const { error: notifErr } = await supabaseAdmin
      .from("admin_notifications")
      .insert({
        type: "payment_success",
        title: amount && currency ? `Payment received — ${amount.toFixed(2)} ${currency}` : "Payment received",
        body: `Application ${applicationId} was paid via Stripe.`,
        metadata: {
          applicationId,
          stripeSessionId,
          paymentIntentId,
          amount,
          currency,
          customerEmail,
        },
      });

    if (notifErr) {
      return new Response(JSON.stringify({ error: "Failed to insert notification", details: notifErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 9) Send emails ONLY if not already paid (prevents repeats on Stripe retries)
    if (!alreadyPaid) {
      const receiptNumber = `KURO-${stripeSessionId.slice(-10).toUpperCase()}`;
      const date = formatDateCET(new Date());

      // CLIENT email (requires customerEmail)
      if (customerEmail) {
        await sendEmailSafe({
          to: customerEmail,
          templateName: "payment_confirmation",
          subject: "Kuro — Payment Confirmation",
          data: {
            name,
            applicationId,
            stripeSessionId,
            receiptNumber,
            date,
            amount: amount !== null ? amount.toFixed(2) : "",
            currency: currency ?? "",
          },
        });
      } else {
        console.error("No customer email available; client email skipped", { applicationId, stripeSessionId });
      }

      // ADMIN email
      const adminEmail =
        Deno.env.get("ADMIN_EMAIL") ||
        "admin@kuroeduconsultancy.com";

      await sendEmailSafe({
        to: adminEmail,
        templateName: "admin_notification",
        subject: "Kuro — Payment Received",
        data: {
          name,
          applicationId,
          stripeSessionId,
          receiptNumber,
          date,
          amount: amount !== null ? amount.toFixed(2) : "",
          currency: currency ?? "",
          customerEmail: customerEmail ?? "N/A",
        },
      });
    }

    return new Response(JSON.stringify({
      received: true,
      matched: true,
      applicationId,
      stripeSessionId,
      alreadyPaid,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
