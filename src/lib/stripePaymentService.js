import { supabase } from '@/lib/customSupabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '@/config/paymentConfig';

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    if (!STRIPE_PUBLIC_KEY) {
      console.error("Stripe Publishable Key is missing. Please check src/config/paymentConfig.js");
    }
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Creates a Stripe PaymentIntent via Supabase Edge Function
 * @param {number} amount - Amount in cents (e.g., 2900 for $29.00)
 * @param {string} leadId - ID of the lead record
 * @param {string} email - Customer email
 * @returns {Promise<string>} clientSecret
 */
export const createPaymentIntent = async (amount, leadId, email) => {
  try {
    console.log(`Initializing payment for Lead: ${leadId}, Email: ${email}, Amount: ${amount}`);
    
    // Convert generic amount to cents if passed as dollars, but ideally pass cents directly
    // Assuming the caller passes 29, we need to convert to 2900
    const amountInCents = amount * 100;

    const { data, error } = await supabase.functions.invoke('stripe-payment', {
      body: { 
        action: 'create-payment-intent',
        amount: amountInCents, 
        leadId, 
        email 
      }
    });

    if (error) {
      console.error('Supabase Edge Function Error:', error);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
    
    if (!data?.clientSecret) {
      console.error('Invalid response from payment function. Data received:', data);
      throw new Error('Received invalid payment data from server. Please try again.');
    }

    console.log('Payment Intent created successfully');
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirms payment status with Stripe via Supabase Edge Function
 * @param {string} paymentIntentId 
 * @returns {Promise<{status: string, amount: number, id: string}>}
 */
export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-payment', {
      body: { 
        action: 'retrieve-payment-intent',
        paymentIntentId 
      }
    });

    if (error) {
      console.error('Error verifying payment status:', error);
      throw new Error(`Verification failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};