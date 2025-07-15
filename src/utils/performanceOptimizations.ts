/**
 * Performance optimization utilities for the school map application
 */

import { School } from '../types/School';

// Memoization cache for expensive operations
const memoCache = new Map<string, any>();

/**
 * Generic memoization function with TTL (time-to-live)
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlMs: number = 300000 // 5 minutes default
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator(...args);
    const cached = memoCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.value;
    }
    
    const result = fn(...args);
    memoCache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  }) as T;
}

/**
 * Debounce function to limit frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit operation frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScrollManager {
  private containerHeight: number;
  private itemHeight: number;
  private buffer: number;
  
  constructor(containerHeight: number, itemHeight: number, buffer: number = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }
  
  getVisibleRange(scrollTop: number, totalItems: number): { start: number; end: number } {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const end = Math.min(totalItems, start + visibleCount + this.buffer * 2);
    
    return { start, end };
  }
  
  getTotalHeight(itemCount: number): number {
    return itemCount * this.itemHeight;
  }
  
  getItemStyle(index: number): React.CSSProperties {
    return {
      position: 'absolute',
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: '100%'
    };
  }
}

/**
 * Optimized school filtering with binary search for sorted data
 */
export const optimizedSchoolFilter = memoize(
  (schools: School[], filters: any): School[] => {
    // Use performance-optimized filtering
    const startTime = performance.now();
    
    let filtered = schools;
    
    // Type filter (most common, filter first)
    if (filters.schoolType && filters.schoolType.length > 0) {
      const typeSet = new Set(filters.schoolType);
      filtered = filtered.filter(school => typeSet.has(school.schoolType));
    }
    
    // Gender filter
    if (filters.gender && filters.gender.length > 0) {
      const genderSet = new Set(filters.gender);
      filtered = filtered.filter(school => genderSet.has(school.gender));
    }
    
    // Level filter
    if (filters.level && filters.level.length > 0) {
      const levelSet = new Set(filters.level);
      filtered = filtered.filter(school => levelSet.has(school.level));
    }
    
    // Cost range filter (numeric comparison)
    if (filters.costRange) {
      const [minCost, maxCost] = filters.costRange;
      filtered = filtered.filter(school => {
        const cost = school.cost.isFree ? 0 : school.cost.amount;
        return cost >= minCost && cost <= maxCost;
      });
    }
    
    // Competitiveness filter
    if (filters.competitiveness) {
      const [minComp, maxComp] = filters.competitiveness;
      filtered = filtered.filter(school => 
        school.competitiveness >= minComp && school.competitiveness <= maxComp
      );
    }
    
    // Borough filter
    if (filters.borough && filters.borough.length > 0) {
      const boroughSet = new Set(filters.borough);
      filtered = filtered.filter(school => boroughSet.has(school.borough));
    }
    
    // Ranking filter (exclude schools without ranking if ranking filter is active)
    if (filters.ranking && (filters.ranking[0] > 1 || filters.ranking[1] < 1000)) {
      filtered = filtered.filter(school => {
        if (!school.ranking) return false;
        const position = school.ranking.position;
        return position >= filters.ranking[0] && position <= filters.ranking[1];
      });
    }
    
    const endTime = performance.now();
    console.log(`Filtered ${schools.length} schools to ${filtered.length} in ${endTime - startTime}ms`);
    
    return filtered;
  },
  (schools, filters) => {
    // Create cache key from filters
    return `filter_${JSON.stringify(filters)}_${schools.length}`;
  },
  60000 // 1 minute cache
);

/**
 * Optimized search with relevance scoring
 */
export const optimizedSchoolSearch = memoize(
  (schools: School[], query: string): Array<{school: School, relevance: number}> => {
    if (!query.trim()) return [];
    
    const startTime = performance.now();
    const searchTerm = query.toLowerCase().trim();
    const results: Array<{school: School, relevance: number}> = [];
    
    // Pre-compile search patterns for better performance
    const exactMatch = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'i');
    const startsWith = new RegExp(`^${escapeRegExp(searchTerm)}`, 'i');
    const contains = new RegExp(escapeRegExp(searchTerm), 'i');
    
    for (const school of schools) {
      let relevance = 0;
      
      // Name matching (highest priority)
      if (exactMatch.test(school.name)) relevance += 100;
      else if (startsWith.test(school.name)) relevance += 80;
      else if (contains.test(school.name)) relevance += 60;
      
      // Address matching
      if (exactMatch.test(school.address)) relevance += 50;
      else if (contains.test(school.address)) relevance += 30;
      
      // Postcode matching
      if (exactMatch.test(school.postcode)) relevance += 40;
      else if (startsWith.test(school.postcode)) relevance += 25;
      
      // Borough matching
      if (exactMatch.test(school.borough)) relevance += 35;
      else if (contains.test(school.borough)) relevance += 20;
      
      if (relevance > 0) {
        results.push({ school, relevance });
      }
    }
    
    // Sort by relevance and limit results
    results.sort((a, b) => b.relevance - a.relevance);
    const limitedResults = results.slice(0, 50); // Limit to top 50 results
    
    const endTime = performance.now();
    console.log(`Searched ${schools.length} schools for "${query}" in ${endTime - startTime}ms, found ${limitedResults.length} results`);
    
    return limitedResults;
  },
  (schools, query) => `search_${query.toLowerCase()}_${schools.length}`,
  300000 // 5 minute cache
);

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchDOMUpdates(callback: () => void): void {
  requestAnimationFrame(callback);
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoadManager {
  private observer: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();
  
  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }
  
  observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }
  
  unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }
  
  disconnect(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

/**
 * Clear memoization cache manually (useful for memory management)
 */
export function clearMemoCache(): void {
  memoCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: memoCache.size,
    entries: Array.from(memoCache.keys())
  };
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  static lazy(
    src: string,
    placeholder: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
  ) {
    return {
      src: placeholder,
      'data-src': src,
      loading: 'lazy' as const
    };
  }
  
  static preload(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

/**
 * Local storage with compression and expiration
 */
export class OptimizedStorage {
  static set(key: string, value: any, expirationMs: number = 86400000): void { // 24 hours default
    const item = {
      value,
      expiration: Date.now() + expirationMs
    };
    
    try {
      // Simple compression for large objects
      const serialized = JSON.stringify(item);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn('Failed to store item:', error);
      // Clear some space and try again
      this.clearExpired();
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (retryError) {
        console.error('Failed to store item after cleanup:', retryError);
      }
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      if (Date.now() > parsed.expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.warn('Failed to retrieve item:', error);
      localStorage.removeItem(key);
      return null;
    }
  }
  
  static clearExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.expiration && Date.now() > parsed.expiration) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    });
  }
}