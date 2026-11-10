import { supabase } from "@/lib/customSupabaseClient";

/**
 * Readiness check checkout (anonymous visitors). The price is fixed server-side
 * per product in the process-payment edge function.
 * @param {{ product: 'readiness_basic'|'readiness_premium', email?: string, successUrl: string, cancelUrl: string }} args
 * @returns {Promise<{ url: string }>}
 */
export async function createReadinessCheckout({ product, email, successUrl, cancelUrl }) {
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: { product, email, successUrl, cancelUrl },
  });

  if (error) {
    console.error("Supabase function invoke error:", error);
    throw error;
  }

  return data; // { url }
}

/**
 * Confirms a returned Stripe Checkout session was a full readiness-check payment.
 * @param {string} sessionId - the cs_... id from the success URL
 * @returns {Promise<{ paid: boolean, product: string|null }>}
 */
export async function verifyReadinessPayment(sessionId) {
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: { action: "verify-readiness", sessionId },
  });
  if (error) throw error;
  return data;
}
