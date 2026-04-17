import { logError, getCategoryFromError } from './errorHandler';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic API wrapper with retry logic and error handling
 */
export const apiCall = async (url, options = {}, retries = MAX_RETRIES) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
  
  try {
    const config = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, config);
    clearTimeout(id);

    if (!response.ok) {
      // Create detailed error object
      const errorBody = await response.text().catch(() => '{}');
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.url = url;
      error.body = errorBody;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    
    const category = getCategoryFromError(error);
    
    // Only retry on network errors or 5xx server errors
    const shouldRetry = (category === 'network' || category === 'server') && retries > 0;
    
    if (shouldRetry) {
      const delay = (MAX_RETRIES - retries + 1) * 1000; // Exponential backoffish
      if (import.meta.env.DEV) {
        console.warn(`⚠️ Retrying ${url} in ${delay}ms... (${retries} retries left)`);
      }
      await sleep(delay);
      return apiCall(url, options, retries - 1);
    }

    logError(error, { url, options, retries });
    throw error;
  }
};

export const get = (url, options) => apiCall(url, { ...options, method: 'GET' });
export const post = (url, data, options) => apiCall(url, { ...options, method: 'POST', body: JSON.stringify(data) });
export const put = (url, data, options) => apiCall(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
export const del = (url, options) => apiCall(url, { ...options, method: 'DELETE' });