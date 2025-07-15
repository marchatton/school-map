/**
 * Utility functions for exporting school data in various formats
 */

import { School } from '../types/School';

export interface ExportOptions {
  filename?: string;
  includeHeader?: boolean;
  delimiter?: string;
  dateFormat?: 'ISO' | 'UK' | 'US';
  includeCoordinates?: boolean;
  includeAllFields?: boolean;
}

/**
 * Convert schools data to CSV format
 */
export function schoolsToCSV(schools: School[], options: ExportOptions = {}): string {
  const {
    includeHeader = true,
    delimiter = ',',
    dateFormat = 'ISO',
    includeCoordinates = true,
    includeAllFields = false
  } = options;

  if (schools.length === 0) return '';

  // Define CSV headers based on options
  const basicHeaders = [
    'Name',
    'School Type',
    'Gender',
    'Level',
    'Address',
    'Postcode',
    'Borough',
    'County',
    'Cost',
    'Cost Amount',
    'Competitiveness',
    'Ofsted Rating',
    'Ranking Position',
    'Ranking Source',
    'Website'
  ];

  const extendedHeaders = [
    ...basicHeaders,
    'Religious Affiliation',
    'Boarding Options',
    'Nearest Station',
    'Walking Time',
    'Journey Time',
    'Bus Routes',
    'Catchment Area',
    'Catchment Radius',
    'Special Requirements',
    'Application Deadline',
    'Notes'
  ];

  const coordinateHeaders = ['Latitude', 'Longitude'];
  
  const headers = includeAllFields 
    ? [...extendedHeaders, ...(includeCoordinates ? coordinateHeaders : [])]
    : [...basicHeaders, ...(includeCoordinates ? coordinateHeaders : [])];

  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If the value contains the delimiter, newlines, or quotes, wrap in quotes and escape internal quotes
    if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Helper function to format cost
  const formatCost = (cost: School['cost']): string => {
    if (cost.isFree) return 'Free';
    return `£${cost.amount.toLocaleString()} per ${cost.period}`;
  };

  // Convert schools to CSV rows
  const rows = schools.map(school => {
    const basicRow = [
      school.name,
      school.schoolType,
      school.gender,
      school.level,
      school.address,
      school.postcode,
      school.borough,
      school.county,
      formatCost(school.cost),
      school.cost.isFree ? '0' : school.cost.amount.toString(),
      school.competitiveness.toString(),
      school.ofstedRating || '',
      school.ranking?.position.toString() || '',
      school.ranking?.source || '',
      school.website || ''
    ];

    const extendedRow = [
      ...basicRow,
      school.religiousAffiliation || '',
      school.boardingOptions || '',
      school.transport?.nearestStation || '',
      school.transport?.walkingTime || '',
      school.transport?.journeyTime || '',
      school.transport?.busRoutes?.join('; ') || '',
      school.admissions?.catchmentArea || '',
      school.admissions?.catchmentRadius?.toString() || '',
      school.admissions?.specialRequirements || '',
      school.admissions?.applicationDeadline || '',
      school.notes || ''
    ];

    const coordinateRow = includeCoordinates && school.coordinates 
      ? [school.coordinates.lat.toString(), school.coordinates.lng.toString()]
      : includeCoordinates 
        ? ['', '']
        : [];

    const finalRow = includeAllFields 
      ? [...extendedRow, ...coordinateRow]
      : [...basicRow, ...coordinateRow];

    return finalRow.map(escapeCSV).join(delimiter);
  });

  // Combine headers and rows
  const csvContent = [];
  if (includeHeader) {
    csvContent.push(headers.map(escapeCSV).join(delimiter));
  }
  csvContent.push(...rows);

  return csvContent.join('\n');
}

/**
 * Download schools data as CSV file
 */
export function downloadSchoolsCSV(schools: School[], options: ExportOptions = {}): void {
  const {
    filename = `schools-export-${new Date().toISOString().split('T')[0]}.csv`
  } = options;

  const csvContent = schoolsToCSV(schools, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, filename);
}

/**
 * Convert schools data to JSON format
 */
export function schoolsToJSON(schools: School[], options: ExportOptions = {}): string {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalSchools: schools.length,
      exportOptions: options
    },
    schools: schools.map(school => ({
      id: school.id,
      name: school.name,
      schoolType: school.schoolType,
      gender: school.gender,
      level: school.level,
      address: school.address,
      postcode: school.postcode,
      borough: school.borough,
      county: school.county,
      coordinates: options.includeCoordinates ? school.coordinates : undefined,
      cost: school.cost,
      competitiveness: school.competitiveness,
      color: school.color,
      ofstedRating: school.ofstedRating,
      ranking: school.ranking,
      website: school.website,
      religiousAffiliation: school.religiousAffiliation,
      boardingOptions: school.boardingOptions,
      transport: school.transport,
      successRates: school.successRates,
      admissions: school.admissions,
      notes: school.notes
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download schools data as JSON file
 */
export function downloadSchoolsJSON(schools: School[], options: ExportOptions = {}): void {
  const {
    filename = `schools-export-${new Date().toISOString().split('T')[0]}.json`
  } = options;

  const jsonContent = schoolsToJSON(schools, options);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  
  downloadBlob(blob, filename);
}

/**
 * Convert schools data to Excel-compatible format
 */
export function schoolsToExcel(schools: School[], options: ExportOptions = {}): string {
  // Excel uses tab-separated values for simple import
  return schoolsToCSV(schools, { ...options, delimiter: '\t' });
}

/**
 * Download schools data as Excel file
 */
export function downloadSchoolsExcel(schools: School[], options: ExportOptions = {}): void {
  const {
    filename = `schools-export-${new Date().toISOString().split('T')[0]}.xlsx`
  } = options;

  const excelContent = schoolsToExcel(schools, options);
  const blob = new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  downloadBlob(blob, filename);
}

/**
 * Generate summary statistics for exported data
 */
export function generateExportSummary(schools: School[]): {
  totalSchools: number;
  byType: Record<string, number>;
  byGender: Record<string, number>;
  byLevel: Record<string, number>;
  byCounty: Record<string, number>;
  costRange: { min: number; max: number; free: number };
  competitivenessDistribution: Record<number, number>;
} {
  const summary = {
    totalSchools: schools.length,
    byType: {} as Record<string, number>,
    byGender: {} as Record<string, number>,
    byLevel: {} as Record<string, number>,
    byCounty: {} as Record<string, number>,
    costRange: { min: Infinity, max: 0, free: 0 },
    competitivenessDistribution: {} as Record<number, number>
  };

  schools.forEach(school => {
    // Count by type
    summary.byType[school.schoolType] = (summary.byType[school.schoolType] || 0) + 1;
    
    // Count by gender
    summary.byGender[school.gender] = (summary.byGender[school.gender] || 0) + 1;
    
    // Count by level
    summary.byLevel[school.level] = (summary.byLevel[school.level] || 0) + 1;
    
    // Count by county
    summary.byCounty[school.county] = (summary.byCounty[school.county] || 0) + 1;
    
    // Cost analysis
    if (school.cost.isFree) {
      summary.costRange.free++;
    } else {
      summary.costRange.min = Math.min(summary.costRange.min, school.cost.amount);
      summary.costRange.max = Math.max(summary.costRange.max, school.cost.amount);
    }
    
    // Competitiveness distribution
    summary.competitivenessDistribution[school.competitiveness] = 
      (summary.competitivenessDistribution[school.competitiveness] || 0) + 1;
  });

  // Handle case where all schools are free
  if (summary.costRange.min === Infinity) {
    summary.costRange.min = 0;
  }

  return summary;
}

/**
 * Export summary report as text
 */
export function exportSummaryReport(schools: School[], title: string = 'School Data Export'): string {
  const summary = generateExportSummary(schools);
  const exportDate = new Date().toLocaleDateString('en-GB');
  
  let report = `${title}\n`;
  report += `Export Date: ${exportDate}\n`;
  report += `Total Schools: ${summary.totalSchools}\n\n`;
  
  report += `SCHOOL TYPES:\n`;
  Object.entries(summary.byType)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      report += `  ${type}: ${count}\n`;
    });
  
  report += `\nGENDER DISTRIBUTION:\n`;
  Object.entries(summary.byGender)
    .sort(([,a], [,b]) => b - a)
    .forEach(([gender, count]) => {
      report += `  ${gender}: ${count}\n`;
    });
  
  report += `\nLEVEL DISTRIBUTION:\n`;
  Object.entries(summary.byLevel)
    .sort(([,a], [,b]) => b - a)
    .forEach(([level, count]) => {
      report += `  ${level}: ${count}\n`;
    });
  
  report += `\nCOUNTY DISTRIBUTION:\n`;
  Object.entries(summary.byCounty)
    .sort(([,a], [,b]) => b - a)
    .forEach(([county, count]) => {
      report += `  ${county}: ${count}\n`;
    });
  
  report += `\nCOST ANALYSIS:\n`;
  report += `  Free Schools: ${summary.costRange.free}\n`;
  if (summary.costRange.max > 0) {
    report += `  Paid Schools Cost Range: £${summary.costRange.min.toLocaleString()} - £${summary.costRange.max.toLocaleString()}\n`;
  }
  
  report += `\nCOMPETITIVENESS DISTRIBUTION:\n`;
  for (let i = 1; i <= 5; i++) {
    const count = summary.competitivenessDistribution[i] || 0;
    const stars = '★'.repeat(i) + '☆'.repeat(5 - i);
    report += `  ${stars} (${i}/5): ${count}\n`;
  }
  
  return report;
}

/**
 * Download summary report as text file
 */
export function downloadSummaryReport(schools: School[], title?: string): void {
  const filename = `schools-summary-${new Date().toISOString().split('T')[0]}.txt`;
  const content = exportSummaryReport(schools, title);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  
  downloadBlob(blob, filename);
}

/**
 * Helper function to download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get appropriate file extension for format
 */
export function getFileExtension(format: 'csv' | 'json' | 'excel' | 'txt'): string {
  switch (format) {
    case 'csv': return '.csv';
    case 'json': return '.json';
    case 'excel': return '.xlsx';
    case 'txt': return '.txt';
    default: return '.txt';
  }
}

/**
 * Validate export data before processing
 */
export function validateExportData(schools: School[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(schools)) {
    errors.push('Schools data must be an array');
    return { isValid: false, errors, warnings };
  }

  if (schools.length === 0) {
    warnings.push('No schools to export');
  }

  schools.forEach((school, index) => {
    if (!school.id) {
      errors.push(`School at index ${index} missing required ID`);
    }
    if (!school.name) {
      errors.push(`School at index ${index} missing required name`);
    }
    if (!school.coordinates && warnings.length < 5) {
      warnings.push(`School "${school.name}" missing coordinates`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}