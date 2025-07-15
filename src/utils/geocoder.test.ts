import {
  NominatimGeocoder,
  GeocodingCache,
  CachedGeocoder,
  isValidCoordinates,
  calculateDistance,
  Coordinates,
  GeocodingResult,
  GeocodingError
} from './geocoder';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Geocoder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('NominatimGeocoder', () => {
    let geocoder: NominatimGeocoder;

    beforeEach(() => {
      geocoder = new NominatimGeocoder();
    });

    it('should geocode a valid address successfully', async () => {
      const mockResponse = [
        {
          lat: '51.5287718',
          lon: '-0.2416794',
          display_name: 'Central Square, Hampstead Garden Suburb, London NW11 7BN, UK',
          class: 'amenity',
          type: 'school',
          importance: 0.7,
          addresstype: 'amenity'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await geocoder.geocodeAddress('Central Square, Hampstead Garden Suburb, London NW11 7BN');

      expect(result.coordinates.lat).toBe(51.5287718);
      expect(result.coordinates.lng).toBe(-0.2416794);
      expect(result.formattedAddress).toBe(mockResponse[0].display_name);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle no results error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      await expect(geocoder.geocodeAddress('Invalid Address')).rejects.toMatchObject({
        code: 'NO_RESULTS',
        message: expect.stringContaining('No geocoding results found')
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(geocoder.geocodeAddress('Some Address')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: expect.stringContaining('Network error')
      });
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(geocoder.geocodeAddress('Some Address')).rejects.toMatchObject({
        code: 'INVALID_ADDRESS',
        message: expect.stringContaining('HTTP 500')
      });
    });

    it('should geocode multiple addresses in batch', async () => {
      const mockResponse1 = [
        {
          lat: '51.5287718',
          lon: '-0.2416794',
          display_name: 'Address 1',
          class: 'amenity',
          type: 'school',
          importance: 0.7
        }
      ];

      const mockResponse2 = [
        {
          lat: '51.6287718',
          lon: '-0.3416794',
          display_name: 'Address 2',
          class: 'amenity',
          type: 'school',
          importance: 0.6
        }
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2
        } as Response);

      const addresses = ['Address 1', 'Address 2'];
      const results = await geocoder.geocodeBatch(addresses);

      expect(results.size).toBe(2);
      expect(results.get('Address 1')).toMatchObject({
        coordinates: { lat: 51.5287718, lng: -0.2416794 }
      });
      expect(results.get('Address 2')).toMatchObject({
        coordinates: { lat: 51.6287718, lng: -0.3416794 }
      });
    });
  });

  describe('GeocodingCache', () => {
    let cache: GeocodingCache;

    beforeEach(() => {
      cache = new GeocodingCache();
    });

    it('should store and retrieve cached results', () => {
      const result: GeocodingResult = {
        coordinates: { lat: 51.5, lng: -0.1 },
        formattedAddress: 'Test Address'
      };

      cache.set('Test Address', result);
      
      expect(cache.has('Test Address')).toBe(true);
      expect(cache.get('Test Address')).toEqual(result);
      expect(cache.size()).toBe(1);
    });

    it('should normalize addresses for consistency', () => {
      const result: GeocodingResult = {
        coordinates: { lat: 51.5, lng: -0.1 }
      };

      cache.set('  Test   Address  ', result);
      
      expect(cache.has('test address')).toBe(true);
      expect(cache.get('TEST ADDRESS')).toEqual(result);
      expect(cache.has('  test   address  ')).toBe(true);
    });

    it('should enforce max cache size', () => {
      // Mock maxSize to be smaller for testing
      const smallCache = new GeocodingCache();
      (smallCache as any).maxSize = 2;

      const result1: GeocodingResult = { coordinates: { lat: 1, lng: 1 } };
      const result2: GeocodingResult = { coordinates: { lat: 2, lng: 2 } };
      const result3: GeocodingResult = { coordinates: { lat: 3, lng: 3 } };

      smallCache.set('Address 1', result1);
      smallCache.set('Address 2', result2);
      smallCache.set('Address 3', result3);

      expect(smallCache.size()).toBe(2);
      expect(smallCache.has('Address 1')).toBe(false); // Should be evicted
      expect(smallCache.has('Address 2')).toBe(true);
      expect(smallCache.has('Address 3')).toBe(true);
    });

    it('should clear all cached results', () => {
      const result: GeocodingResult = { coordinates: { lat: 51.5, lng: -0.1 } };
      cache.set('Test Address', result);
      
      expect(cache.size()).toBe(1);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('Test Address')).toBe(false);
    });
  });

  describe('CachedGeocoder', () => {
    let mockGeocoder: jest.Mocked<NominatimGeocoder>;
    let cachedGeocoder: CachedGeocoder;

    beforeEach(() => {
      mockGeocoder = {
        geocodeAddress: jest.fn(),
        geocodeBatch: jest.fn()
      } as any;
      cachedGeocoder = new CachedGeocoder(mockGeocoder);
    });

    it('should use cache for repeated requests', async () => {
      const result: GeocodingResult = {
        coordinates: { lat: 51.5, lng: -0.1 },
        formattedAddress: 'Test Address'
      };

      mockGeocoder.geocodeAddress.mockResolvedValue(result);

      // First call should hit the geocoder
      const firstResult = await cachedGeocoder.geocodeAddress('Test Address');
      expect(mockGeocoder.geocodeAddress).toHaveBeenCalledTimes(1);
      expect(firstResult).toEqual(result);

      // Second call should use cache
      const secondResult = await cachedGeocoder.geocodeAddress('Test Address');
      expect(mockGeocoder.geocodeAddress).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(secondResult).toEqual(result);
    });

    it('should provide cache statistics', () => {
      const stats = cachedGeocoder.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
    });
  });

  describe('Utility functions', () => {
    describe('isValidCoordinates', () => {
      it('should validate correct coordinates', () => {
        expect(isValidCoordinates({ lat: 51.5, lng: -0.1 })).toBe(true);
        expect(isValidCoordinates({ lat: -90, lng: -180 })).toBe(true);
        expect(isValidCoordinates({ lat: 90, lng: 180 })).toBe(true);
        expect(isValidCoordinates({ lat: 0, lng: 0 })).toBe(true);
      });

      it('should reject invalid coordinates', () => {
        expect(isValidCoordinates({ lat: 91, lng: 0 })).toBe(false);
        expect(isValidCoordinates({ lat: -91, lng: 0 })).toBe(false);
        expect(isValidCoordinates({ lat: 0, lng: 181 })).toBe(false);
        expect(isValidCoordinates({ lat: 0, lng: -181 })).toBe(false);
        expect(isValidCoordinates({ lat: NaN, lng: 0 })).toBe(false);
        expect(isValidCoordinates({ lat: 0, lng: NaN })).toBe(false);
      });
    });

    describe('calculateDistance', () => {
      it('should calculate distance between coordinates correctly', () => {
        const london: Coordinates = { lat: 51.5074, lng: -0.1278 };
        const paris: Coordinates = { lat: 48.8566, lng: 2.3522 };

        const distance = calculateDistance(london, paris);
        
        // Distance between London and Paris is approximately 344 km
        expect(distance).toBeGreaterThan(340);
        expect(distance).toBeLessThan(350);
      });

      it('should return 0 for identical coordinates', () => {
        const coord: Coordinates = { lat: 51.5, lng: -0.1 };
        const distance = calculateDistance(coord, coord);
        expect(distance).toBe(0);
      });

      it('should handle coordinates at different hemispheres', () => {
        const north: Coordinates = { lat: 51.5, lng: -0.1 };
        const south: Coordinates = { lat: -33.9, lng: 18.4 }; // Cape Town

        const distance = calculateDistance(north, south);
        expect(distance).toBeGreaterThan(9000); // Should be > 9000 km
      });
    });
  });
});