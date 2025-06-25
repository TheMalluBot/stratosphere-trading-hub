import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorOptions {
  showToast?: boolean;
  toastMessage?: string;
  logError?: boolean;
  retryable?: boolean;
  onRetry?: () => void;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, options: ErrorOptions = {}) => {
    const {
      showToast = true,
      toastMessage,
      logError = true,
      retryable = false,
      onRetry
    } = options;

    // Log error
    if (logError) {
      console.error('Error handled:', error);
    }

    // Show toast notification
    if (showToast) {
      const message = toastMessage || error.message || 'An unexpected error occurred';
      
      if (retryable && onRetry) {
        toast.error(message, {
          action: {
            label: 'Retry',
            onClick: onRetry
          }
        });
      } else {
        toast.error(message);
      }
    }

    // Store error for debugging
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.unshift(errorData);
      
      // Keep only last 10 errors
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(0, 10)));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }, []);

  const clearErrors = useCallback(() => {
    localStorage.removeItem('app_errors');
  }, []);

  const getStoredErrors = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }, []);

  return { handleError, clearErrors, getStoredErrors };
};
