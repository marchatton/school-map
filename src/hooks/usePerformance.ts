/**
 * Performance-focused React hooks
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { debounce, throttle, optimizedSchoolFilter, optimizedSchoolSearch } from '../utils/performanceOptimizations';
import { School } from '../types/School';

/**
 * Debounced value hook for search inputs
 */
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

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback as T;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback as T;
}

/**
 * Optimized school filtering hook with memoization
 */
export function useOptimizedSchoolFilter(schools: School[], filters: any) {
  return useMemo(() => {
    return optimizedSchoolFilter(schools, filters);
  }, [schools, filters]);
}

/**
 * Optimized school search hook with debouncing
 */
export function useOptimizedSchoolSearch(schools: School[], query: string, debounceMs: number = 300) {
  const debouncedQuery = useDebounce(query, debounceMs);
  
  return useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return optimizedSchoolSearch(schools, debouncedQuery);
  }, [schools, debouncedQuery]);
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    
    // Stop scrolling indicator after scrolling stops
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  const visibleRange = useMemo(() => {
    const buffer = 5;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(itemCount, start + visibleCount + buffer * 2);
    
    return { start, end };
  }, [scrollTop, itemCount, itemHeight, containerHeight]);
  
  const totalHeight = itemCount * itemHeight;
  
  const getItemStyle = useCallback((index: number): React.CSSProperties => ({
    position: 'absolute',
    top: index * itemHeight,
    height: itemHeight,
    width: '100%'
  }), [itemHeight]);
  
  return {
    scrollTop,
    isScrolling,
    visibleRange,
    totalHeight,
    handleScroll,
    getItemStyle
  };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasBeenVisible]);

  return { isIntersecting, hasBeenVisible };
}

/**
 * Previous value hook for comparison
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Stable callback hook that doesn't change reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  const stableCallback = useCallback(
    ((...args: any[]) => callbackRef.current(...args)) as T,
    []
  );
  
  return stableCallback;
}

/**
 * Window size hook with throttling
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleResize = useThrottledCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
}

/**
 * Local storage hook with optimized storage
 */
export function useOptimizedLocalStorage<T>(
  key: string,
  initialValue: T,
  expirationMs: number = 86400000 // 24 hours
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiration) {
        localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      const item = {
        value,
        expiration: Date.now() + expirationMs
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, expirationMs]);

  return [storedValue, setValue];
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(name: string, dependencies: any[]) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name} render #${renderCount.current}, time since last: ${timeSinceLastRender}ms`);
    }
  }, dependencies);
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
}

/**
 * Async state hook with loading and error states
 */
export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    fetchData();
  }, dependencies);
  
  return { data, loading, error, refetch: fetchData };
}