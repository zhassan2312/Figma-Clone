'use client';

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { GlobalLoadingOverlay, Toast } from '@/components/common';
import { useToast } from '@/hooks/common';

interface LoadingContextType {
  isGlobalLoading: boolean;
  globalMessage: string;
  globalProgress?: number;
  showGlobalLoading: (message?: string, progress?: number) => void;
  hideGlobalLoading: () => void;
  updateGlobalProgress: (progress: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('Processing...');
  const [globalProgress, setGlobalProgress] = useState<number | undefined>(undefined);
  
  const { 
    toasts, 
    showToast, 
    hideToast, 
    clearAllToasts,
    showSuccess,
    showError,
    showWarning
  } = useToast();

  const showGlobalLoading = useCallback((message?: string, progress?: number) => {
    setIsGlobalLoading(true);
    if (message) setGlobalMessage(message);
    if (progress !== undefined) setGlobalProgress(progress);
  }, []);

  const hideGlobalLoading = useCallback(() => {
    setIsGlobalLoading(false);
    setGlobalProgress(undefined);
  }, []);

  const updateGlobalProgress = useCallback((progress: number) => {
    setGlobalProgress(progress);
  }, []);

  const value = {
    isGlobalLoading,
    globalMessage,
    globalProgress,
    showGlobalLoading,
    hideGlobalLoading,
    updateGlobalProgress,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      
      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay
        isVisible={isGlobalLoading}
        message={globalMessage}
        progress={globalProgress}
      />
      
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => hideToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for async operations with automatic loading and toast feedback
export function useAsyncWithFeedback<T, P extends any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    showGlobalLoading?: boolean;
    showToast?: boolean;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { showGlobalLoading, hideGlobalLoading, showToast } = useLoading();

  const execute = useCallback(async (...args: P) => {
    setLoading(true);
    setError(null);
    
    if (options.showGlobalLoading) {
      showGlobalLoading(options.loadingMessage || 'Processing...');
    }

    try {
      const result = await asyncFunction(...args);
      setData(result);
      
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
      setLoading(false);
      if (options.showGlobalLoading) {
        hideGlobalLoading();
      }
    }
  }, [asyncFunction, options, showGlobalLoading, hideGlobalLoading, showToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    hasData: data !== null,
    hasError: !!error,
  };
}
