import { SchoolDataValidator, generateValidationReport, DataValidationSummary } from './dataValidator';
import { School, SchoolType, Gender, Level, SchoolColor, County } from '../types/School';
import * as geocoder from './geocoder';

// Mock the geocoder module
jest.mock('./geocoder');
const mockGeocoder = geocoder as jest.Mocked<typeof geocoder>;

// Create a mock for the geocoder instance
const mockGeocoderInstance = {
  geocodeAddress: jest.fn(),
  geocodeBatch: jest.fn()
};

// Mock the default export
(mockGeocoder.geocoder as any) = mockGeocoderInstance;

// Mock the dataParser module
jest.mock('./dataParser');

describe('SchoolDataValidator', () => {
  let validator: SchoolDataValidator;
  let validSchool: School;
  let invalidSchool: School;

  beforeEach(() => {
    validator = new SchoolDataValidator();
    
    validSchool = {
      id: '1',
      name: 'Test Grammar School',
      address: 'Central Square, Hampstead Garden Suburb, London NW11 7BN',
      postcode: 'NW11 7BN',
      borough: 'Barnet',
      county: County.LONDON,
      schoolType: SchoolType.GRAMMAR,
      gender: Gender.GIRLS,
      level: Level.SECONDARY,
      color: SchoolColor.GIRLS_SECONDARY,
      coordinates: { lat: 51.5287718, lng: -0.2416794 },
      ranking: { position: 9, source: '9th nationally' },
      cost: { amount: 0, currency: 'GBP', period: 'year' as const, isFree: true },
      competitiveness: 5,
      notes: 'Excellent school',
      website: 'https://example.com'
    };

    invalidSchool = {
      id: '', // Invalid ID
      name: 'A', // Too short name
      address: 'Short', // Too short address
      postcode: '',
      borough: '',
      county: County.LONDON,
      schoolType: SchoolType.GRAMMAR,
      gender: Gender.GIRLS,
      level: Level.SECONDARY,
      color: SchoolColor.OTHER, // Use valid color for other tests
      coordinates: { lat: 999, lng: -999 }, // Invalid coordinates
      ranking: undefined,
      cost: { amount: 0, currency: 'GBP', period: 'year' as const, isFree: true },
      competitiveness: 10, // Invalid competitiveness
      notes: '',
      website: 'not-a-url' // Invalid website URL
    };

    // Reset mocks
    jest.clearAllMocks();
    mockGeocoder.isValidCoordinates = jest.fn().mockImplementation((coords) => {
      return coords.lat >= -90 && coords.lat <= 90 && 
             coords.lng >= -180 && coords.lng <= 180 &&
             !isNaN(coords.lat) && !isNaN(coords.lng);
    });
  });

  describe('validateSchool', () => {
    it('should validate a correct school without issues', async () => {
      const result = await validator.validateSchool(validSchool);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.school).toEqual(validSchool);
    });

    it('should identify multiple validation issues in invalid school', async () => {
      const result = await validator.validateSchool(invalidSchool);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);

      // Check for specific validation issues
      const errorIssues = result.issues.filter(issue => issue.severity === 'error');
      expect(errorIssues.some(issue => issue.field === 'id')).toBe(true);
      expect(errorIssues.some(issue => issue.field === 'name')).toBe(true);
      expect(errorIssues.some(issue => issue.field === 'competitiveness')).toBe(true);
    });

    it('should attempt geocoding when coordinates are invalid', async () => {
      const schoolWithBadCoords = {
        ...validSchool,
        coordinates: { lat: NaN, lng: NaN }
      };

      const mockGeocodingResult = {
        coordinates: { lat: 51.5287718, lng: -0.2416794 },
        formattedAddress: 'Formatted Address',
        confidence: 0.8
      };

      mockGeocoderInstance.geocodeAddress.mockResolvedValue(mockGeocodingResult);

      const result = await validator.validateSchool(schoolWithBadCoords);

      expect(mockGeocoderInstance.geocodeAddress).toHaveBeenCalledWith(schoolWithBadCoords.address);
      expect(result.geocodingResult).toEqual(mockGeocodingResult);
      expect(result.school.coordinates).toEqual(mockGeocodingResult.coordinates);
    });

    it('should handle geocoding failures gracefully', async () => {
      const schoolWithBadCoords = {
        ...validSchool,
        coordinates: { lat: NaN, lng: NaN }
      };

      const geocodingError = {
        message: 'No results found',
        code: 'NO_RESULTS' as const
      };

      mockGeocoderInstance.geocodeAddress.mockRejectedValue(geocodingError);

      const result = await validator.validateSchool(schoolWithBadCoords);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'coordinates' && 
        issue.severity === 'error' &&
        issue.message.includes('Geocoding failed')
      )).toBe(true);
    });

    it('should warn about low geocoding confidence', async () => {
      const schoolWithBadCoords = {
        ...validSchool,
        coordinates: { lat: NaN, lng: NaN }
      };

      const mockGeocodingResult = {
        coordinates: { lat: 51.5287718, lng: -0.2416794 },
        formattedAddress: 'Formatted Address',
        confidence: 0.3 // Low confidence
      };

      mockGeocoderInstance.geocodeAddress.mockResolvedValue(mockGeocodingResult);

      const result = await validator.validateSchool(schoolWithBadCoords);

      expect(result.issues.some(issue => 
        issue.severity === 'warning' &&
        issue.message.includes('Geocoding confidence is low')
      )).toBe(true);
    });

    it('should validate required fields', async () => {
      const incompleteSchool = {
        ...validSchool,
        name: '',
        address: undefined as any,
        schoolType: null as any
      };

      const result = await validator.validateSchool(incompleteSchool);

      expect(result.isValid).toBe(false);
      
      const requiredFieldErrors = result.issues.filter(issue => 
        issue.severity === 'error' && 
        issue.message.includes('Required field')
      );
      
      expect(requiredFieldErrors.length).toBeGreaterThan(0);
    });

    it('should validate field formats correctly', async () => {
      const malformedSchool = {
        ...validSchool,
        id: '',
        name: 'AB', // Too short
        color: 'invalid' as any, // Invalid color enum
        cost: { amount: 'not-a-number' as any, currency: 'GBP', period: 'year' as const, isFree: false },
        competitiveness: 6, // Out of range
        website: 'definitely-not-a-url'
      };

      const result = await validator.validateSchool(malformedSchool);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.field === 'id' && issue.severity === 'error')).toBe(true);
      expect(result.issues.some(issue => issue.field === 'name' && issue.severity === 'error')).toBe(true);
      expect(result.issues.some(issue => issue.field === 'color' && issue.severity === 'error')).toBe(true);
      expect(result.issues.some(issue => issue.field === 'competitiveness' && issue.severity === 'error')).toBe(true);
      expect(result.issues.some(issue => issue.field === 'website' && issue.severity === 'warning')).toBe(true);
    });
  });

  describe('validateSchoolData', () => {
    it('should validate multiple schools and provide summary', async () => {
      const schools = [validSchool, invalidSchool];
      
      const summary = await validator.validateSchoolData(schools);

      expect(summary.totalSchools).toBe(2);
      expect(summary.validSchools).toBe(1);
      expect(summary.invalidSchools).toBe(1);
      expect(summary.validationResults).toHaveLength(2);
      expect(summary.issues.length).toBeGreaterThan(0);
    });

    it('should handle empty school array', async () => {
      const summary = await validator.validateSchoolData([]);

      expect(summary.totalSchools).toBe(0);
      expect(summary.validSchools).toBe(0);
      expect(summary.invalidSchools).toBe(0);
      expect(summary.validationResults).toHaveLength(0);
      expect(summary.issues).toHaveLength(0);
    });

    it('should process schools in batches', async () => {
      // Create 25 schools to test batching (batch size is 10)
      const schools = Array.from({ length: 25 }, (_, i) => ({
        ...validSchool,
        id: `${i + 1}`,
        name: `Test School ${i + 1}`
      }));

      const summary = await validator.validateSchoolData(schools);

      expect(summary.totalSchools).toBe(25);
      expect(summary.validSchools).toBe(25);
      expect(summary.validationResults).toHaveLength(25);
    });
  });
});

describe('generateValidationReport', () => {
  it('should generate a readable validation report', () => {
    const summary: DataValidationSummary = {
      totalSchools: 10,
      validSchools: 8,
      invalidSchools: 2,
      geocodingErrors: 1,
      validationResults: [],
      issues: [
        {
          field: 'name',
          severity: 'error',
          message: 'School name is required'
        },
        {
          field: 'address',
          severity: 'warning',
          message: 'Address seems too short'
        },
        {
          field: 'coordinates',
          severity: 'info',
          message: 'Coordinates geocoded successfully'
        }
      ]
    };

    const report = generateValidationReport(summary);

    expect(report).toContain('School Data Validation Report');
    expect(report).toContain('Total Schools: 10');
    expect(report).toContain('Valid Schools: 8');
    expect(report).toContain('Invalid Schools: 2');
    expect(report).toContain('Success Rate: 80%');
    expect(report).toContain('Errors (1):');
    expect(report).toContain('Warnings (1):');
    expect(report).toContain('Info (1):');
    expect(report).toContain('School name is required');
    expect(report).toContain('Address seems too short');
  });

  it('should handle empty validation summary', () => {
    const summary: DataValidationSummary = {
      totalSchools: 0,
      validSchools: 0,
      invalidSchools: 0,
      geocodingErrors: 0,
      validationResults: [],
      issues: []
    };

    const report = generateValidationReport(summary);

    expect(report).toContain('Total Schools: 0');
    expect(report).toContain('Success Rate: 0%');
    expect(report).not.toContain('Errors (');
    expect(report).not.toContain('Warnings (');
  });

  it('should limit the number of displayed items', () => {
    const manyIssues = Array.from({ length: 15 }, (_, i) => ({
      field: 'name' as keyof School,
      severity: 'info' as const,
      message: `Info message ${i + 1}`
    }));

    const summary: DataValidationSummary = {
      totalSchools: 15,
      validSchools: 15,
      invalidSchools: 0,
      geocodingErrors: 0,
      validationResults: [],
      issues: manyIssues
    };

    const report = generateValidationReport(summary);

    expect(report).toContain('Info (15):');
    expect(report).toContain('... and 5 more info messages');
  });
});