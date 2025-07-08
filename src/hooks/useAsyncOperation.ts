'use client';

import { useCallback, useState } from 'react';
import { useLoading } from '../components/LoadingProvider';

export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    showGlobalLoading?: boolean;
    showToast?: boolean;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showGlobalLoading, hideGlobalLoading, showToast } = useLoading();

  const execute = useCallback(async (...args: T): Promise<R> => {
    setIsLoading(true);
    setError(null);

    if (options.showGlobalLoading) {
      showGlobalLoading(options.loadingMessage || 'Processing...');
    }

    try {
      const result = await operation(...args);
      
      if (options.showToast && options.successMessage) {
        showToast(options.successMessage, 'success');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      if (options.showToast) {
        showToast(options.errorMessage || errorMessage, 'error');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      if (options.showGlobalLoading) {
        hideGlobalLoading();
      }
    }
  }, [operation, options, showGlobalLoading, hideGlobalLoading, showToast]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset,
  };
}
