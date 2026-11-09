// supabase/functions/create-checkout-session/index.ts

import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  student_id: string;     // uuid
  program_id: string;     // uuid
  amount_cents?: number;  // optional override
  currency?: string;      // default eur
  success_url: string;
  cancel_url: string;
  name?: string;
  email?: string;
};

function assertEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = assertEnv("SUPABASE_URL");
    const serviceRoleKey = assertEnv("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = assertEnv("STRIPE_SECRET_KEY");

    const stripe = new Stripe(stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = (await req.json()) as ReqBody;

    const {
      student_id,
      program_id,
      amount_cents = 299, // default 2.99 EUR
      currency = "eur",
      success_url,
      cancel_url,
      name,
      email,
    } = body;

    if (!student_id || !program_id || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Reuse an existing pending application if one exists; otherwise create a new one
    // This prevents duplicates if the user clicks pay multiple times.
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("applications")
      .select("id, stripe_session_id, payment_status")
      .eq("student_id", student_id)
      .eq("program_id", program_id)
      .in("payment_status", ["pending", "unpaid", "initiated"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingErr) {
      return new Response(JSON.stringify({ error: "Failed to check existing application", details: existingErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let applicationId: string;

    if (existing && existing.length > 0) {
      applicationId = existing[0].id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin
        .from("applications")
        .insert({
          student_id,
          program_id,
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (createErr || !created) {
        return new Response(JSON.stringify({ error: "Failed to create application", details: createErr?.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      applicationId = created.id;
    }

    // 2) Create Stripe Checkout Session (metadata uses REAL application UUID)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email ?? undefined,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Kuro — Readiness Fee",
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        applicationId,
        name: name ?? "",
        email: email ?? "",
      },
      success_url,
      cancel_url,
    });

    // 3) Save stripe_session_id onto applications row (this is a critical safety net)
    const { error: updErr } = await supabaseAdmin
      .from("applications")
      .update({
        stripe_session_id: session.id,
        payment_status: "pending",
      })
      .eq("id", applicationId);

    if (updErr) {
      return new Response(JSON.stringify({ error: "Failed to save stripe_session_id", details: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ applicationId, checkoutUrl: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
