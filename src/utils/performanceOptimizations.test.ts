import {
  memoize,
  debounce,
  throttle,
  optimizedSchoolFilter,
  optimizedSchoolSearch,
  VirtualScrollManager,
  LazyLoadManager,
  clearMemoCache,
  getCacheStats
} from './performanceOptimizations';

import { School, SchoolType, Gender, Level, County } from '../types/School';

// Mock school data for testing
const mockSchools: School[] = [
  {
    id: '1',
    name: 'Test Grammar School',
    schoolType: SchoolType.GRAMMAR,
    gender: Gender.COED,
    level: Level.SECONDARY,
    address: '123 Test Street',
    postcode: 'SW1A 1AA',
    borough: 'Westminster',
    county: County.LONDON,
    coordinates: { lat: 51.5074, lng: -0.1278 },
    cost: { isFree: true, amount: 0, period: 'year' },
    competitiveness: 4,
    color: '#228B22'
  },
  {
    id: '2',
    name: 'Test Private School',
    schoolType: SchoolType.PRIVATE,
    gender: Gender.BOYS,
    level: Level.SECONDARY,
    address: '456 Private Road',
    postcode: 'SW1A 2BB',
    borough: 'Kensington',
    county: County.LONDON,
    coordinates: { lat: 51.5074, lng: -0.1278 },
    cost: { isFree: false, amount: 25000, period: 'year' },
    competitiveness: 5,
    color: '#9370DB'
  }
];

describe('performanceOptimizations', () => {
  beforeEach(() => {
    clearMemoCache();
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      let callCount = 0;
      const expensiveFunction = (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoizedFunction = memoize(
        expensiveFunction,
        (x) => x.toString()
      );

      expect(memoizedFunction(5)).toBe(10);
      expect(memoizedFunction(5)).toBe(10);
      expect(callCount).toBe(1); // Should only be called once
    });

    it('should respect TTL', (done) => {
      let callCount = 0;
      const expensiveFunction = (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoizedFunction = memoize(
        expensiveFunction,
        (x) => x.toString(),
        50 // 50ms TTL
      );

      memoizedFunction(5);
      expect(callCount).toBe(1);

      setTimeout(() => {
        memoizedFunction(5);
        expect(callCount).toBe(2); // Should be called again after TTL
        done();
      }, 60);
    });
  });

  describe('debounce', () => {
    it('should delay function execution', (done) => {
      let callCount = 0;
      const debouncedFunction = debounce(() => {
        callCount++;
      }, 50);

      debouncedFunction();
      debouncedFunction();
      debouncedFunction();

      expect(callCount).toBe(0); // Should not be called immediately

      setTimeout(() => {
        expect(callCount).toBe(1); // Should be called once after delay
        done();
      }, 60);
    });
  });

  describe('throttle', () => {
    it('should limit function execution frequency', (done) => {
      let callCount = 0;
      const throttledFunction = throttle(() => {
        callCount++;
      }, 50);

      throttledFunction();
      throttledFunction();
      throttledFunction();

      expect(callCount).toBe(1); // Should be called immediately once

      setTimeout(() => {
        throttledFunction();
        expect(callCount).toBe(2); // Should be called again after throttle period
        done();
      }, 60);
    });
  });

  describe('optimizedSchoolFilter', () => {
    it('should filter schools by type', () => {
      const filters = {
        schoolType: [SchoolType.GRAMMAR]
      };

      const result = optimizedSchoolFilter(mockSchools, filters);
      expect(result).toHaveLength(1);
      expect(result[0].schoolType).toBe(SchoolType.GRAMMAR);
    });

    it('should filter schools by multiple criteria', () => {
      const filters = {
        schoolType: [SchoolType.GRAMMAR, SchoolType.PRIVATE],
        gender: [Gender.COED]
      };

      const result = optimizedSchoolFilter(mockSchools, filters);
      expect(result).toHaveLength(1);
      expect(result[0].gender).toBe(Gender.COED);
    });

    it('should filter schools by cost range', () => {
      const filters = {
        costRange: [0, 1000]
      };

      const result = optimizedSchoolFilter(mockSchools, filters);
      expect(result).toHaveLength(1);
      expect(result[0].cost.isFree).toBe(true);
    });
  });

  describe('optimizedSchoolSearch', () => {
    it('should search schools by name', () => {
      const result = optimizedSchoolSearch(mockSchools, 'Grammar');
      expect(result).toHaveLength(1);
      expect(result[0].school.name).toContain('Grammar');
    });

    it('should search schools by postcode', () => {
      const result = optimizedSchoolSearch(mockSchools, 'SW1A 1AA');
      expect(result).toHaveLength(1);
      expect(result[0].school.postcode).toBe('SW1A 1AA');
    });

    it('should return results sorted by relevance', () => {
      const result = optimizedSchoolSearch(mockSchools, 'Test');
      expect(result).toHaveLength(2);
      expect(result[0].relevance).toBeGreaterThanOrEqual(result[1].relevance);
    });

    it('should return empty array for empty query', () => {
      const result = optimizedSchoolSearch(mockSchools, '');
      expect(result).toHaveLength(0);
    });
  });

  describe('VirtualScrollManager', () => {
    it('should calculate visible range correctly', () => {
      const manager = new VirtualScrollManager(400, 50, 2);
      const range = manager.getVisibleRange(100, 50);
      
      expect(range.start).toBeGreaterThanOrEqual(0);
      expect(range.end).toBeLessThanOrEqual(50);
      expect(range.end).toBeGreaterThan(range.start);
    });

    it('should calculate total height correctly', () => {
      const manager = new VirtualScrollManager(400, 50);
      const height = manager.getTotalHeight(20);
      expect(height).toBe(1000); // 20 * 50
    });

    it('should generate correct item styles', () => {
      const manager = new VirtualScrollManager(400, 50);
      const style = manager.getItemStyle(5);
      
      expect(style.position).toBe('absolute');
      expect(style.top).toBe(250); // 5 * 50
      expect(style.height).toBe(50);
    });
  });

  describe('LazyLoadManager', () => {
    it('should create intersection observer', () => {
      const manager = new LazyLoadManager();
      expect(manager).toBeDefined();
    });

    it('should clean up properly', () => {
      const manager = new LazyLoadManager();
      expect(() => manager.disconnect()).not.toThrow();
    });
  });

  describe('cache management', () => {
    it('should track cache stats', () => {
      const memoizedFunction = memoize(
        (x: number) => x * 2,
        (x) => x.toString()
      );

      memoizedFunction(1);
      memoizedFunction(2);

      const stats = getCacheStats();
      expect(stats.size).toBeGreaterThanOrEqual(2);
      expect(stats.entries).toContain('1');
      expect(stats.entries).toContain('2');
    });

    it('should clear cache', () => {
      const memoizedFunction = memoize(
        (x: number) => x * 2,
        (x) => x.toString()
      );

      memoizedFunction(1);
      let stats = getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      clearMemoCache();
      stats = getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});