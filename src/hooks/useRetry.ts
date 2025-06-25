
import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
}

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { handleError } = useErrorHandler();

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'exponential',
      onError,
      onSuccess
    } = options;

    setIsRetrying(true);
    setAttemptCount(0);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        const result = await operation();
        setIsRetrying(false);
        setAttemptCount(0);
        onSuccess?.();
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          setIsRetrying(false);
          setAttemptCount(0);
          handleError(err, {
            toastMessage: `Failed after ${maxAttempts} attempts: ${err.message}`
          });
          throw err;
        }

        onError?.(err, attempt);

        // Calculate delay with backoff
        const currentDelay = backoff === 'exponential' 
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;

        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw new Error('Retry loop completed without success');
  }, [handleError]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
  }, []);

  return { retry, isRetrying, attemptCount, reset };
};
