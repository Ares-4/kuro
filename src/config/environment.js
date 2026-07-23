/**
 * Centralized environment configuration and validation
 */

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const validateEnvironment = () => {
  const missing = [];
  const config = {};

  // Check required variables
  requiredVars.forEach(key => {
    const value = import.meta.env[key];
    if (!value) {
      missing.push(key);
    }
    config[key] = value;
  });

  // Optional variables
  config.VITE_STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  config.VITE_TAWK_PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID || '';
  config.VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // Validation logic
  const isValid = missing.length === 0;

  if (!isValid) {
    console.error('🚨 Missing required environment variables:', missing.join(', '));
  } else {
    // Basic format checks
    try {
      new URL(config.VITE_SUPABASE_URL);
    } catch (e) {
      console.error('🚨 VITE_SUPABASE_URL is not a valid URL');
      return { 
        isValid: false, 
        missing: [], 
        errors: ['VITE_SUPABASE_URL is malformed'], 
        config 
      };
    }
  }

  return {
    isValid,
    missing,
    errors: isValid ? [] : [`Missing: ${missing.join(', ')}`],
    config
  };
};

export const envConfig = validateEnvironment();