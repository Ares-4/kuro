import { logError } from './errorHandler';

/**
 * Validates a URL format
 */
export const validateUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if an image URL is accessible (basic check)
 */
export const validateImageUrl = (url) => {
  if (!validateUrl(url)) {
    logError(new Error(`Invalid image URL format: ${url}`));
    return false;
  }
  // In a real generic validator, we might try to fetch HEAD, 
  // but for frontend synchronous checks, mostly we check structure.
  // Asynchronous validation can happen in components via onError.
  return true;
};

/**
 * Validates API endpoints from env vars
 */
export const validateApiEndpoint = (url) => {
  const isValid = validateUrl(url);
  if (!isValid) {
    console.warn(`Potential configuration issue: Invalid API Endpoint ${url}`);
  }
  return isValid;
};

/**
 * Returns fallback images for broken resources
 */
export const getFallbackImage = (type = 'default') => {
  const fallbacks = {
    user: 'https://ui-avatars.com/api/?name=User&background=random',
    course: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    university: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    default: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80'
  };
  return fallbacks[type] || fallbacks.default;
};