import { useState, useEffect, useCallback, useMemo } from 'react';
import { Point, XYWH, Color } from '@/types';
import { clampNumber, parseNumericInput, getDistance, getAngle } from '@/utils';

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
