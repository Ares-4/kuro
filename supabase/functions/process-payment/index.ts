// process-payment: creates a Stripe Checkout session for an application fee.
//
// Security (2026-11-09): the amount, currency and redirect URLs used to come straight
// from the browser, and stripe-webhook marks the application paid for ANY amount —
// so a student could pay a few cents. Now the caller must be signed in and own the
// application, and the fee is computed server-side (program fee -> site default -> €50).
import Stripe from "https://esm.sh/stripe@14.21.0";
import { corsHeaders, json, serviceClient, getCaller, isAllowedRedirect, isEmail } from "../_shared/security.ts";

// Readiness check (ReadinessCheckModal) is sold to anonymous visitors, so it has
// its own path: fixed server-side prices, no application record involved.
const READINESS_PRODUCTS: Record<string, { cents: number; name: string }> = {
  readiness_basic: { cents: 299, name: "Basic Readiness Check" },
  readiness_premium: { cents: 1900, name: "Premium Visa Risk Report" },
};

const stripeClient = () =>
  new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { httpClient: Stripe.createFetchHttpClient() });

const parseFee = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    // Readiness check: start checkout
    if (typeof body.product === "string") {
      const product = READINESS_PRODUCTS[body.product];
      if (!product) return json({ error: "Unknown product" }, 400);
      if (!isAllowedRedirect(body.successUrl) || !isAllowedRedirect(body.cancelUrl)) {
        return json({ error: "Invalid redirect URL" }, 400);
      }
      const session = await stripeClient().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: { currency: "eur", product_data: { name: product.name }, unit_amount: product.cents },
          quantity: 1,
        }],
        mode: "payment",
        customer_email: isEmail(body.email) ? body.email : undefined,
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        metadata: {
          product: body.product,
          expectedAmountCents: String(product.cents),
          ...(typeof body.leadId === "string" && /^[0-9a-f-]{36}$/i.test(body.leadId) ? { leadId: body.leadId } : {}),
        },
      });
      return json({ url: session.url });
    }

    // Readiness check: confirm a returned checkout session really was paid in full
    if (body.action === "verify-readiness") {
      if (typeof body.sessionId !== "string" || !body.sessionId.startsWith("cs_")) return json({ error: "Invalid session" }, 400);
      const session = await stripeClient().checkout.sessions.retrieve(body.sessionId);
      const product = READINESS_PRODUCTS[session.metadata?.product ?? ""];
      const paid = !!product && session.payment_status === "paid" && (session.amount_total ?? 0) >= product.cents;
      return json({ paid, product: paid ? session.metadata?.product : null });
    }

    const user = await getCaller(req);
    if (!user) return json({ error: "Sign in required" }, 401);

    const { applicationId, successUrl, cancelUrl } = body;
    if (!applicationId) return json({ error: "Missing applicationId" }, 400);
    if (!isAllowedRedirect(successUrl) || !isAllowedRedirect(cancelUrl)) {
      return json({ error: "Invalid redirect URL" }, 400);
    }

    const db = serviceClient();
    const { data: app } = await db
      .from("applications")
      .select("id, payment_status, student:students!inner(user_id), program:programs(program_name, application_fee)")
      .eq("id", applicationId)
      .maybeSingle();

    // deno-lint-ignore no-explicit-any
    const a = app as any;
    if (!a || a.student?.user_id !== user.id) return json({ error: "Application not found" }, 404);
    if (a.payment_status === "paid") return json({ error: "Application already paid" }, 409);

    let fee = parseFee(a.program?.application_fee);
    if (!fee) {
      const { data: setting } = await db.from("site_settings").select("value").eq("key", "default_application_fee").maybeSingle();
      fee = parseFee(setting?.value) ?? 50;
    }

    const session = await stripeClient().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Application Fee: ${a.program?.program_name ?? "Kuro application"}`.slice(0, 120) },
          unit_amount: Math.round(fee * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { applicationId: a.id, expectedAmountCents: String(Math.round(fee * 100)) },
    });

    await db.from("applications").update({ stripe_session_id: session.id }).eq("id", a.id);
    return json({ url: session.url });
  } catch (error) {
    console.error("process-payment error:", error);
    return json({ error: "Could not start payment" }, 400);
  }
});
