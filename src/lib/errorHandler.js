/**
 * Categories for error classification
 */
export const ErrorCategory = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * Determines the category of an error based on its properties
 */
export const getCategoryFromError = (error) => {
  if (!error) return ErrorCategory.UNKNOWN;
  
  const msg = error.message?.toLowerCase() || '';
  const code = error.code || error.status;

  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('cors')) {
    return ErrorCategory.NETWORK;
  }
  
  if (code === 401 || code === 403 || msg.includes('unauthorized') || msg.includes('forbidden')) {
    return ErrorCategory.AUTH;
  }
  
  if (code === 400 || code === 422 || msg.includes('validation') || msg.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }
  
  if (code >= 500) {
    return ErrorCategory.SERVER;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Returns a user-friendly message based on the error
 */
export const getUserMessage = (error) => {
  const category = getCategoryFromError(error);
  
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorCategory.AUTH:
      return 'You do not have permission to perform this action. Please log in again.';
    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorCategory.SERVER:
      return 'Something went wrong on our end. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Logs the error with context
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.DEV) {
    console.group('🚨 Error Logged');
    console.error('Error:', error);
    console.log('Category:', getCategoryFromError(error));
    console.log('Context:', context);
    console.groupEnd();
  }
  
  // In a real app, you would send this to Sentry/LogRocket here
  sendToMonitoring(error, context);
};

/**
 * Placeholder for sending errors to a monitoring service
 */
export const sendToMonitoring = (error, context) => {
  // e.g. Sentry.captureException(error, { extra: context });
  // Currently just a no-op or internal log
  // console.log('Sending to monitoring service...', error.message);
};