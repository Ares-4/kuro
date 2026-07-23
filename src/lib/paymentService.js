import { supabase } from "@/lib/customSupabaseClient";

/**
 * Calls Supabase Edge Function: process-payment
 * Your Edge Function expects:
 * { applicationId, amount, programName, successUrl, cancelUrl, currency }
 *
 * IMPORTANT:
 * - amount must be in major units (e.g., 2.99), because the function does amount * 100.
 */
export async function createCheckoutSession({
  applicationId,
  amount,
  programName,
  successUrl,
  cancelUrl,
  currency = "eur",
}) {
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: {
      applicationId,
      amount,
      programName,
      successUrl,
      cancelUrl,
      currency,
    },
  });

  if (error) {
    console.error("Supabase function invoke error:", error);
    throw error;
  }

  return data; // expects { url }
}