// Enums for school categorization
export enum SchoolType {
  GRAMMAR = 'Grammar',
  PRIVATE = 'Private',
  STATE_PRIMARY = 'State Primary',
  STATE_PRIMARY_FAITH = 'State Primary (Faith)',
  COMPREHENSIVE = 'Comprehensive'
}

export enum Gender {
  BOYS = 'Boys',
  GIRLS = 'Girls',
  COED = 'Co-ed'
}

export enum Level {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary'
}

export enum County {
  LONDON = 'London',
  BUCKINGHAMSHIRE = 'Buckinghamshire',
  KENT = 'Kent'
}

export enum Competitiveness {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}

// Color coding for map markers
export enum SchoolColor {
  GIRLS_SECONDARY = '#FF69B4',     // Pink
  GIRLS_PRIMARY = '#9370DB',       // Purple
  BOYS_SECONDARY = '#00008B',      // Dark Blue
  BOYS_PRIMARY = '#87CEEB',        // Light Blue
  COED_SECONDARY = '#228B22',      // Green
  COED_PRIMARY = '#FFD700',        // Yellow
  OTHER = '#FF0000'                // Red
}

// Interface for geographical coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interface for cost information
export interface Cost {
  amount: number;
  currency: string;
  period: 'year' | 'term';
  isFree: boolean;
  voluntaryContribution?: number;
  includesVAT?: boolean;
}

// Interface for success rate information
export interface SuccessRate {
  percentage?: number;
  description: string;
  type: 'exact' | 'qualitative';
  targetSchools?: string[];
}

// Interface for transport information
export interface Transport {
  nearestStation?: string;
  walkingTime?: string;
  journeyTime?: string;
  busRoutes?: string[];
}

// Main School interface
export interface School {
  id: string;
  name: string;
  schoolType: SchoolType;
  gender: Gender;
  level: Level;
  address: string;
  postcode: string;
  coordinates?: Coordinates;
  
  // Academic information
  ranking?: {
    position: number;
    total?: number;
    source: string;
    year?: number;
  };
  
  // Cost information
  cost: Cost;
  
  // Competitiveness (1-5 scale)
  competitiveness: Competitiveness;
  
  // Additional information
  notes: string;
  website?: string;
  ofstedRating?: string;
  
  // Success rates (for primary schools)
  successRates?: SuccessRate[];
  
  // Transport links
  transport?: Transport;
  
  // Admissions information
  admissions?: {
    catchmentArea?: string;
    catchmentRadius?: number;
    specialRequirements?: string;
    applicationDeadline?: string;
  };
  
  // Location grouping
  borough: string;
  county: County;
  
  // Visual properties
  color: SchoolColor;
  
  // Boarding information
  boardingOptions?: 'Day' | 'Boarding' | 'Both';
  
  // Religious affiliation
  religiousAffiliation?: string;
}

// Interface for parsed school data collection
export interface SchoolDatabase {
  schools: School[];
  lastUpdated: string;
  version: string;
}

// Utility type for school filtering
export interface SchoolFilters {
  schoolTypes?: SchoolType[];
  genders?: Gender[];
  levels?: Level[];
  costRange?: {
    min: number;
    max: number;
  };
  competitiveness?: Competitiveness[];
  counties?: ('London' | 'Buckinghamshire' | 'Kent')[];
  boroughs?: string[];
  rankingRange?: {
    min: number;
    max: number;
  };
  religiousAffiliation?: string[];
  boardingOptions?: ('Day' | 'Boarding' | 'Both')[];
}

// Interface for search results
export interface SearchResult {
  school: School;
  matchType: 'name' | 'address' | 'postcode';
  relevanceScore: number;
}