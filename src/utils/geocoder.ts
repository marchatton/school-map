export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress?: string;
  confidence?: number;
}

export interface GeocodingError {
  message: string;
  code: 'NETWORK_ERROR' | 'RATE_LIMIT' | 'NO_RESULTS' | 'INVALID_ADDRESS';
}

/**
 * Geocoding service interface
 */
export interface GeocodingService {
  geocodeAddress(address: string): Promise<GeocodingResult>;
  geocodeBatch(addresses: string[]): Promise<Map<string, GeocodingResult | GeocodingError>>;
}

/**
 * Nominatim (OpenStreetMap) geocoding service implementation
 * Free service with rate limiting - good for development and small-scale use
 */
export class NominatimGeocoder implements GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  async geocodeAddress(address: string): Promise<GeocodingResult> {
    await this.enforceRateLimit();

    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
      countrycodes: 'gb', // Restrict to UK
      addressdetails: '1',
      extratags: '1'
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'SchoolMapApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('No results found for address');
      }

      const result = data[0];
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        formattedAddress: result.display_name,
        confidence: this.calculateConfidence(result)
      };

    } catch (error) {
      throw this.handleError(error, address);
    }
  }

  async geocodeBatch(addresses: string[]): Promise<Map<string, GeocodingResult | GeocodingError>> {
    const results = new Map<string, GeocodingResult | GeocodingError>();

    for (const address of addresses) {
      try {
        const result = await this.geocodeAddress(address);
        results.set(address, result);
      } catch (error) {
        results.set(address, error as GeocodingError);
      }
    }

    return results;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  private calculateConfidence(result: any): number {
    // Calculate confidence based on result properties
    let confidence = 0.5; // Base confidence

    if (result.class === 'amenity' && result.type === 'school') {
      confidence += 0.3; // High confidence for schools
    }
    
    if (result.importance) {
      confidence += result.importance * 0.2;
    }

    // Higher confidence for more specific address types
    if (result.addresstype === 'amenity') confidence += 0.2;
    if (result.addresstype === 'house') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private handleError(error: any, address: string): GeocodingError {
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      return {
        message: `Rate limit exceeded for address: ${address}`,
        code: 'RATE_LIMIT'
      };
    }

    if (error.message?.includes('No results')) {
      return {
        message: `No geocoding results found for address: ${address}`,
        code: 'NO_RESULTS'
      };
    }

    if (error.name === 'TypeError' || error.message?.includes('Network error') || error.message?.includes('fetch')) {
      return {
        message: `Network error while geocoding address: ${address} - ${error.message}`,
        code: 'NETWORK_ERROR'
      };
    }

    return {
      message: `Invalid address or geocoding error: ${address} - ${error.message}`,
      code: 'INVALID_ADDRESS'
    };
  }
}

/**
 * Cache for geocoding results to avoid repeated API calls
 */
export class GeocodingCache {
  private cache = new Map<string, GeocodingResult>();
  private readonly maxSize = 1000;

  get(address: string): GeocodingResult | undefined {
    return this.cache.get(this.normalizeAddress(address));
  }

  set(address: string, result: GeocodingResult): void {
    const normalizedAddress = this.normalizeAddress(address);
    
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(normalizedAddress, result);
  }

  has(address: string): boolean {
    return this.cache.has(this.normalizeAddress(address));
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private normalizeAddress(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }
}

/**
 * Main geocoding utility with caching
 */
export class CachedGeocoder implements GeocodingService {
  private geocoder: GeocodingService;
  private cache: GeocodingCache;

  constructor(geocoder: GeocodingService = new NominatimGeocoder()) {
    this.geocoder = geocoder;
    this.cache = new GeocodingCache();
  }

  async geocodeAddress(address: string): Promise<GeocodingResult> {
    // Check cache first
    const cached = this.cache.get(address);
    if (cached) {
      return cached;
    }

    // Geocode and cache result
    const result = await this.geocoder.geocodeAddress(address);
    this.cache.set(address, result);
    return result;
  }

  async geocodeBatch(addresses: string[]): Promise<Map<string, GeocodingResult | GeocodingError>> {
    const results = new Map<string, GeocodingResult | GeocodingError>();
    const uncachedAddresses: string[] = [];

    // Check cache for each address
    for (const address of addresses) {
      const cached = this.cache.get(address);
      if (cached) {
        results.set(address, cached);
      } else {
        uncachedAddresses.push(address);
      }
    }

    // Geocode uncached addresses
    if (uncachedAddresses.length > 0) {
      const geocodedResults = await this.geocoder.geocodeBatch(uncachedAddresses);
      
      for (const [address, result] of Array.from(geocodedResults.entries())) {
        results.set(address, result);
        
        // Cache successful results
        if ('coordinates' in result) {
          this.cache.set(address, result);
        }
      }
    }

    return results;
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: 1000
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Default export - cached geocoder instance
export const geocoder = new CachedGeocoder();

/**
 * Utility function to validate coordinates
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180 &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng)
  );
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}