import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as dataParser from './utils/dataParser';
import * as dataValidator from './utils/dataValidator';

// Mock the Map component
jest.mock('./components/Map', () => ({
  __esModule: true,
  default: ({ schools }: any) => (
    <div data-testid="map-component">Map with {schools.length} schools</div>
  )
}));

// Mock the SchoolSearch component
jest.mock('./components/SchoolSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="school-search">School Search</div>
}));

// Mock the SchoolFilters component
jest.mock('./components/SchoolFilters', () => ({
  __esModule: true,
  default: () => <div data-testid="school-filters">School Filters</div>
}));

// Mock the dataParser module
jest.mock('./utils/dataParser');
const mockDataParser = dataParser as jest.Mocked<typeof dataParser>;

// Mock the dataValidator module
jest.mock('./utils/dataValidator');
const mockDataValidator = dataValidator as jest.Mocked<typeof dataValidator>;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders school map title', () => {
    // Mock successful data loading
    mockDataParser.loadSchoolData.mockResolvedValue({
      schools: [],
      colorCoding: {}
    });
    
    mockDataValidator.dataValidator.validateSchoolData.mockResolvedValue({
      totalSchools: 0,
      validSchools: 0,
      invalidSchools: 0,
      geocodingErrors: 0,
      validationResults: [],
      issues: []
    });

    render(<App />);
    const titleElement = screen.getByText(/School Map - London, Buckinghamshire & Kent/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText(/Interactive map of Grammar, Private & Primary Schools/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading school data.../i)).toBeInTheDocument();
  });

  test('renders map when schools are loaded', async () => {
    const mockSchools = [
      { id: '1', name: 'School 1', coordinates: { lat: 51.5, lng: -0.1 } },
      { id: '2', name: 'School 2', coordinates: { lat: 51.6, lng: -0.2 } }
    ];

    mockDataParser.loadSchoolData.mockResolvedValue({
      schools: mockSchools as any,
      colorCoding: {}
    });
    
    mockDataValidator.dataValidator.validateSchoolData.mockResolvedValue({
      totalSchools: 2,
      validSchools: 2,
      invalidSchools: 0,
      geocodingErrors: 0,
      validationResults: mockSchools.map(school => ({
        school: school as any,
        isValid: true,
        issues: []
      })),
      issues: []
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
      expect(screen.getByText('Map with 2 schools')).toBeInTheDocument();
      expect(screen.getByText('2 of 2 schools')).toBeInTheDocument();
    });
  });

  test('shows error state when data loading fails', async () => {
    const errorMessage = 'Failed to fetch data';
    mockDataParser.loadSchoolData.mockRejectedValue(new Error(errorMessage));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Error Loading Data/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
      expect(screen.getByText(/Retry/i)).toBeInTheDocument();
    });
  });

  test('shows error when no valid schools found', async () => {
    mockDataParser.loadSchoolData.mockResolvedValue({
      schools: [{ id: '1', name: 'Invalid School' }] as any,
      colorCoding: {}
    });
    
    mockDataValidator.dataValidator.validateSchoolData.mockResolvedValue({
      totalSchools: 1,
      validSchools: 0,
      invalidSchools: 1,
      geocodingErrors: 0,
      validationResults: [],
      issues: []
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No valid schools found in the data/i)).toBeInTheDocument();
    });
  });
});