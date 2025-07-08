import { useState, useEffect, useCallback, useMemo } from 'react';
import { Point, XYWH, Color } from '@/types';
import { clampNumber, parseNumericInput, getDistance, getAngle, generateId } from '@/utils';

// Hook for managing numeric input with validation
export function useNumericInput(
  initialValue: number,
  onChange: (value: number) => void,
  min?: number,
  max?: number
) {
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(initialValue.toString());
    setIsValid(true);
  }, [initialValue]);

  const handleChange = useCallback((value: string) => {
    setInputValue(value);
    const parsed = parseFloat(value);
    setIsValid(!isNaN(parsed));
  }, []);

  const handleCommit = useCallback(() => {
    const clampedValue = parseNumericInput(inputValue, initialValue, min, max);
    setInputValue(clampedValue.toString());
    setIsValid(true);
    onChange(clampedValue);
  }, [inputValue, initialValue, min, max, onChange]);

  return {
    inputValue,
    isValid,
    handleChange,
    handleCommit
  };
}

// Hook for managing drag operations
export function useDragState() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);

  const startDrag = useCallback((point: Point) => {
    setIsDragging(true);
    setDragStart(point);
    setDragCurrent(point);
  }, []);

  const updateDrag = useCallback((point: Point) => {
    if (isDragging) {
      setDragCurrent(point);
    }
  }, [isDragging]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, []);

  const dragDistance = useMemo(() => {
    if (!dragStart || !dragCurrent) return 0;
    return getDistance(dragStart, dragCurrent);
  }, [dragStart, dragCurrent]);

  const dragAngle = useMemo(() => {
    if (!dragStart || !dragCurrent) return 0;
    return getAngle(dragStart, dragCurrent);
  }, [dragStart, dragCurrent]);

  const dragDelta = useMemo(() => {
    if (!dragStart || !dragCurrent) return { x: 0, y: 0 };
    return {
      x: dragCurrent.x - dragStart.x,
      y: dragCurrent.y - dragStart.y
    };
  }, [dragStart, dragCurrent]);

  return {
    isDragging,
    dragStart,
    dragCurrent,
    dragDistance,
    dragAngle,
    dragDelta,
    startDrag,
    updateDrag,
    endDrag
  };
}

// Hook for managing selection state
export function useSelection<T>(initialSelection: T[] = []) {
  const [selection, setSelection] = useState<T[]>(initialSelection);

  const isSelected = useCallback((item: T) => {
    return selection.includes(item);
  }, [selection]);

  const select = useCallback((item: T) => {
    setSelection([item]);
  }, []);

  const multiSelect = useCallback((item: T) => {
    setSelection(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelection(items);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection([]);
  }, []);

  const selectRange = useCallback((items: T[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeItems = items.slice(start, end + 1);
    setSelection(rangeItems);
  }, []);

  return {
    selection,
    isSelected,
    select,
    multiSelect,
    selectAll,
    clearSelection,
    selectRange,
    hasSelection: selection.length > 0,
    selectionCount: selection.length
  };
}

// Hook for managing hover state with debouncing
export function useHover(delay: number = 300) {
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsHovered(true);
  }, [timeoutId]);

  const onMouseLeave = useCallback(() => {
    const id = setTimeout(() => {
      setIsHovered(false);
    }, delay);
    setTimeoutId(id);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave
  };
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      };

      // Build shortcut string
      const shortcutParts = [];
      if (modifiers.ctrl) shortcutParts.push('ctrl');
      if (modifiers.alt) shortcutParts.push('alt');
      if (modifiers.shift) shortcutParts.push('shift');
      if (modifiers.meta) shortcutParts.push('meta');
      shortcutParts.push(key);
      
      const shortcutString = shortcutParts.join('+');
      
      if (shortcuts[shortcutString]) {
        event.preventDefault();
        shortcuts[shortcutString]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Hook for managing local storage
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
}

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for managing component visibility
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  };
}

// Hook for managing loading states
export function useLoadingState(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  const withLoading = useCallback(async <T,>(
    asyncFunction: () => Promise<T>,
    onProgress?: (progress: number) => void
  ): Promise<T | null> => {
    startLoading();
    try {
      const result = await asyncFunction();
      stopLoading();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setLoadingError(errorMessage);
      return null;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    updateProgress,
    withLoading,
    hasError: !!error,
  };
}

// Hook for managing toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Hook for managing global loading state
export function useGlobalLoading() {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('Processing...');
  const [globalProgress, setGlobalProgress] = useState<number | undefined>(undefined);

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

  return {
    isGlobalLoading,
    globalMessage,
    globalProgress,
    showGlobalLoading,
    hideGlobalLoading,
    updateGlobalProgress,
  };
}

// Hook for async operations with automatic loading states
export function useAsync<T, P extends any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

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

// Hook for retry functionality
export function useRetry(maxRetries: number = 3, delay: number = 1000) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    let currentRetry = 0;
    
    while (currentRetry <= maxRetries) {
      try {
        setRetryCount(currentRetry);
        
        if (currentRetry > 0) {
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, delay * currentRetry));
        }
        
        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        currentRetry++;
        
        if (currentRetry > maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          throw error;
        }
      }
    }
    
    throw new Error('Max retries exceeded');
  }, [maxRetries, delay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
    canRetry: retryCount < maxRetries,
  };
}
