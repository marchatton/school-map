import { School, SchoolColor } from '../types/School';
import { geocoder, isValidCoordinates, GeocodingResult, GeocodingError } from './geocoder';
import { parseSchoolData, loadSchoolData } from './dataParser';

export interface ValidationResult {
  school: School;
  isValid: boolean;
  issues: ValidationIssue[];
  geocodingResult?: GeocodingResult;
}

export interface ValidationIssue {
  field: keyof School;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface DataValidationSummary {
  totalSchools: number;
  validSchools: number;
  invalidSchools: number;
  geocodingErrors: number;
  validationResults: ValidationResult[];
  issues: ValidationIssue[];
}

/**
 * Comprehensive data validator for school data
 */
export class SchoolDataValidator {
  
  /**
   * Validates a single school record
   */
  async validateSchool(school: School): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let geocodingResult: GeocodingResult | undefined;
    
    // Validate required fields
    this.validateRequiredFields(school, issues);
    
    // Validate field formats and values
    this.validateFieldFormats(school, issues);
    
    // Validate and potentially update coordinates
    const coordinatesValid = await this.validateCoordinates(school, issues);
    if (coordinatesValid.geocodingResult) {
      geocodingResult = coordinatesValid.geocodingResult;
      // Update school coordinates if they were invalid
      if (!school.coordinates || !isValidCoordinates(school.coordinates)) {
        school.coordinates = coordinatesValid.geocodingResult.coordinates;
      }
    }
    
    const isValid = issues.filter(issue => issue.severity === 'error').length === 0;
    
    return {
      school,
      isValid,
      issues,
      geocodingResult
    };
  }

  /**
   * Validates multiple schools and provides summary
   */
  async validateSchoolData(schools: School[]): Promise<DataValidationSummary> {
    const validationResults: ValidationResult[] = [];
    const allIssues: ValidationIssue[] = [];
    let geocodingErrors = 0;

    // Process schools in batches to avoid overwhelming the geocoding service
    const batchSize = 10;
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(school => this.validateSchool(school))
      );
      
      validationResults.push(...batchResults);
      
      // Collect issues and count geocoding errors
      for (const result of batchResults) {
        allIssues.push(...result.issues);
        if (result.issues.some(issue => 
          issue.field === 'coordinates' && issue.message.includes('geocoding')
        )) {
          geocodingErrors++;
        }
      }
      
      // Brief delay between batches to respect rate limits
      if (i + batchSize < schools.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const validSchools = validationResults.filter(r => r.isValid).length;
    
    return {
      totalSchools: schools.length,
      validSchools,
      invalidSchools: schools.length - validSchools,
      geocodingErrors,
      validationResults,
      issues: allIssues
    };
  }

  /**
   * Loads and validates school data from markdown file
   */
  async validateFromMarkdown(): Promise<DataValidationSummary> {
    try {
      const { schools } = await loadSchoolData();
      return await this.validateSchoolData(schools);
    } catch (error) {
      return {
        totalSchools: 0,
        validSchools: 0,
        invalidSchools: 0,
        geocodingErrors: 1,
        validationResults: [],
        issues: [{
          field: 'name' as keyof School,
          severity: 'error',
          message: `Failed to load school data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  private validateRequiredFields(school: School, issues: ValidationIssue[]): void {
    const requiredFields: (keyof School)[] = [
      'id', 'name', 'address', 'schoolType', 'gender', 'level', 'color'
    ];

    for (const field of requiredFields) {
      const value = school[field];
      if (value === undefined || value === null || value === '') {
        issues.push({
          field,
          severity: 'error',
          message: `Required field '${field}' is missing or empty`
        });
      }
    }
  }

  private validateFieldFormats(school: School, issues: ValidationIssue[]): void {
    // Validate ID
    if (typeof school.id !== 'string' || school.id.trim() === '') {
      issues.push({
        field: 'id',
        severity: 'error',
        message: 'ID must be a non-empty string'
      });
    }

    // Validate name
    if (school.name && school.name.length < 3) {
      issues.push({
        field: 'name',
        severity: 'error',
        message: 'School name must be at least 3 characters long'
      });
    }

    // Validate address
    if (school.address && school.address.length < 10) {
      issues.push({
        field: 'address',
        severity: 'warning',
        message: 'Address seems too short, may cause geocoding issues'
      });
    }

    // Validate color (SchoolColor enum)
    if (school.color && !Object.values(SchoolColor).includes(school.color as SchoolColor)) {
      issues.push({
        field: 'color',
        severity: 'error',
        message: 'Color must be a valid school color from the defined color scheme'
      });
    }

    // Validate cost structure
    if (school.cost) {
      if (typeof school.cost.amount !== 'number') {
        issues.push({
          field: 'cost' as keyof School,
          severity: 'error',
          message: 'Cost amount must be a number'
        });
      }
      
      if (!['GBP', 'USD', 'EUR'].includes(school.cost.currency)) {
        issues.push({
          field: 'cost' as keyof School,
          severity: 'warning',
          message: 'Cost currency should be a valid currency code'
        });
      }
      
      if (!['year', 'term'].includes(school.cost.period)) {
        issues.push({
          field: 'cost' as keyof School,
          severity: 'warning',
          message: 'Cost period should be either "year" or "term"'
        });
      }
    }

    // Validate competitiveness range
    if (school.competitiveness !== undefined && (school.competitiveness < 1 || school.competitiveness > 5)) {
      issues.push({
        field: 'competitiveness',
        severity: 'error',
        message: 'Competitiveness must be between 1 and 5'
      });
    }

    // Validate website URL if provided
    if (school.website && school.website !== '') {
      try {
        new URL(school.website);
      } catch {
        issues.push({
          field: 'website',
          severity: 'warning',
          message: 'Website URL appears to be invalid'
        });
      }
    }
  }

  private async validateCoordinates(
    school: School, 
    issues: ValidationIssue[]
  ): Promise<{ geocodingResult?: GeocodingResult }> {
    
    // Check if coordinates are valid
    if (school.coordinates && isValidCoordinates(school.coordinates)) {
      return {}; // Coordinates are already valid
    }

    // Try to geocode the address
    if (!school.address) {
      issues.push({
        field: 'coordinates',
        severity: 'error',
        message: 'Invalid coordinates and no address provided for geocoding'
      });
      return {};
    }

    try {
      const geocodingResult = await geocoder.geocodeAddress(school.address);
      
      if (geocodingResult.confidence && geocodingResult.confidence < 0.5) {
        issues.push({
          field: 'coordinates',
          severity: 'warning',
          message: `Geocoding confidence is low (${Math.round(geocodingResult.confidence * 100)}%) for address: ${school.address}`
        });
      } else {
        issues.push({
          field: 'coordinates',
          severity: 'info',
          message: `Coordinates geocoded successfully for address: ${school.address}`
        });
      }

      return { geocodingResult };

    } catch (error) {
      const geocodingError = error as GeocodingError;
      issues.push({
        field: 'coordinates',
        severity: 'error',
        message: `Geocoding failed: ${geocodingError.message}`
      });
      return {};
    }
  }
}

/**
 * Utility function to get validation summary as a readable report
 */
export function generateValidationReport(summary: DataValidationSummary): string {
  const lines: string[] = [];
  
  lines.push('=== School Data Validation Report ===');
  lines.push('');
  lines.push(`Total Schools: ${summary.totalSchools}`);
  lines.push(`Valid Schools: ${summary.validSchools}`);
  lines.push(`Invalid Schools: ${summary.invalidSchools}`);
  lines.push(`Geocoding Errors: ${summary.geocodingErrors}`);
  lines.push(`Success Rate: ${summary.totalSchools > 0 ? 
    Math.round((summary.validSchools / summary.totalSchools) * 100) : 0}%`);
  lines.push('');

  // Group issues by severity
  const errors = summary.issues.filter(i => i.severity === 'error');
  const warnings = summary.issues.filter(i => i.severity === 'warning');
  const infos = summary.issues.filter(i => i.severity === 'info');

  if (errors.length > 0) {
    lines.push(`Errors (${errors.length}):`);
    errors.forEach(issue => {
      lines.push(`  - ${issue.message}`);
    });
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(`Warnings (${warnings.length}):`);
    warnings.forEach(issue => {
      lines.push(`  - ${issue.message}`);
    });
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push(`Info (${infos.length}):`);
    infos.slice(0, 10).forEach(issue => { // Limit info messages
      lines.push(`  - ${issue.message}`);
    });
    if (infos.length > 10) {
      lines.push(`  ... and ${infos.length - 10} more info messages`);
    }
    lines.push('');
  }

  // Schools with issues
  const schoolsWithIssues = summary.validationResults.filter(r => !r.isValid);
  if (schoolsWithIssues.length > 0) {
    lines.push('Schools with Validation Issues:');
    schoolsWithIssues.slice(0, 5).forEach(result => {
      lines.push(`  - ${result.school.name} (ID: ${result.school.id})`);
      result.issues.filter(i => i.severity === 'error').forEach(issue => {
        lines.push(`    • ${issue.message}`);
      });
    });
    if (schoolsWithIssues.length > 5) {
      lines.push(`  ... and ${schoolsWithIssues.length - 5} more schools with issues`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Export default validator instance
export const dataValidator = new SchoolDataValidator();