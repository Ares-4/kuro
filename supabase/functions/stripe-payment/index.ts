// stripe-payment: PaymentIntent for the paid eligibility check (StripePaymentModal).
//
// Security (2026-11-09): the amount came from the browser, so the report could be
// unlocked for a few cents. The price is now fixed server-side
// (ELIGIBILITY_PRICE_CENTS, default 2900 = USD 29, matching src/config/paymentConfig.js).
import Stripe from "https://esm.sh/stripe@14.21.0";
import { corsHeaders, json, isEmail } from "../_shared/security.ts";

const PRICE_CENTS = parseInt(Deno.env.get("ELIGIBILITY_PRICE_CENTS") ?? "2900");
const CURRENCY = (Deno.env.get("ELIGIBILITY_CURRENCY") ?? "usd").toLowerCase();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { action, leadId, email, paymentIntentId } = await req.json().catch(() => ({}));
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments not configured" }, 503);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

    if (action === "create-payment-intent") {
      if (typeof leadId !== "string" || !UUID.test(leadId)) return json({ error: "Invalid lead" }, 400);
      const receipt = isEmail(email) ? email : undefined;
      const intent = await stripe.paymentIntents.create({
        amount: PRICE_CENTS,
        currency: CURRENCY,
        automatic_payment_methods: { enabled: true },
        metadata: { leadId, email: receipt ?? "" },
        receipt_email: receipt,
      });
      return json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
    }

    if (action === "retrieve-payment-intent") {
      if (typeof paymentIntentId !== "string" || !paymentIntentId.startsWith("pi_")) return json({ error: "Invalid id" }, 400);
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      // Only report success for a full-price payment
      const ok = intent.status === "succeeded" && intent.amount_received >= PRICE_CENTS;
      return json({ status: ok ? intent.status : (intent.status === "succeeded" ? "amount_mismatch" : intent.status), amount: intent.amount, id: intent.id });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("stripe-payment error:", error);
    return json({ error: "Payment error" }, 400);
  }
});
