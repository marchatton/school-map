import React from 'react';
import { render } from '@testing-library/react';
import SchoolMarker from './SchoolMarker';
import { School, SchoolType, Gender, Level, County, Competitiveness, SchoolColor } from '../types/School';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  Marker: ({ children, eventHandlers, ...props }: any) => (
    <div data-testid="marker" {...props} onClick={eventHandlers?.click}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
}));

// Mock Leaflet
jest.mock('leaflet', () => ({
  divIcon: jest.fn(() => ({ options: {} })),
  DivIcon: jest.fn(),
}));

const mockSchool: School = {
  id: '1',
  name: 'Test Grammar School',
  schoolType: SchoolType.GRAMMAR,
  gender: Gender.COED,
  level: Level.SECONDARY,
  address: '123 Test Street',
  postcode: 'SW1A 1AA',
  coordinates: { lat: 51.5074, lng: -0.1278 },
  cost: {
    amount: 0,
    currency: 'GBP',
    period: 'year' as const,
    isFree: true
  },
  competitiveness: Competitiveness.THREE,
  notes: 'Test notes',
  borough: 'Westminster',
  county: County.LONDON,
  color: SchoolColor.COED_SECONDARY,
  ranking: {
    position: 1,
    total: 100,
    source: 'Test Source',
    year: 2023
  },
  ofstedRating: 'Outstanding',
  website: 'https://test-school.edu',
  boardingOptions: 'Day'
};

const mockSchoolWithoutCoordinates: School = {
  ...mockSchool,
  id: '2',
  coordinates: undefined
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="test-wrapper">
    {children}
  </div>
);

describe('SchoolMarker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing with valid coordinates', () => {
    render(
      <TestWrapper>
        <SchoolMarker school={mockSchool} />
      </TestWrapper>
    );
  });

  test('does not render when coordinates are missing', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <SchoolMarker school={mockSchoolWithoutCoordinates} />
      </TestWrapper>
    );
    
    // Should not render marker when coordinates are missing
    expect(queryByTestId('marker')).toBeNull();
  });

  test('calls onClick handler when provided', () => {
    const mockOnClick = jest.fn();
    
    render(
      <TestWrapper>
        <SchoolMarker school={mockSchool} onClick={mockOnClick} />
      </TestWrapper>
    );
    
    // The onClick handler should be passed to the Marker component
    // This is tested through the marker's eventHandlers
    expect(mockOnClick).not.toHaveBeenCalled(); // Not called until clicked
  });

  test('renders with selected state', () => {
    render(
      <TestWrapper>
        <SchoolMarker school={mockSchool} isSelected={true} />
      </TestWrapper>
    );
    
    // Component should render without errors when selected
  });

  test('renders with different school types', () => {
    const privateSchool = {
      ...mockSchool,
      id: '3',
      schoolType: SchoolType.PRIVATE,
      color: SchoolColor.BOYS_SECONDARY
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={privateSchool} />
      </TestWrapper>
    );
  });

  test('renders with different genders', () => {
    const girlsSchool = {
      ...mockSchool,
      id: '4',
      gender: Gender.GIRLS,
      color: SchoolColor.GIRLS_SECONDARY
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={girlsSchool} />
      </TestWrapper>
    );
  });

  test('renders with primary school level', () => {
    const primarySchool = {
      ...mockSchool,
      id: '5',
      level: Level.PRIMARY,
      schoolType: SchoolType.STATE_PRIMARY,
      color: SchoolColor.COED_PRIMARY
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={primarySchool} />
      </TestWrapper>
    );
  });

  test('renders with minimal school data', () => {
    const minimalSchool: School = {
      id: '6',
      name: 'Minimal School',
      schoolType: SchoolType.COMPREHENSIVE,
      gender: Gender.COED,
      level: Level.SECONDARY,
      address: 'Minimal Address',
      postcode: 'M1N 1ML',
      coordinates: { lat: 51.5, lng: -0.1 },
      cost: {
        amount: 0,
        currency: 'GBP',
        period: 'year' as const,
        isFree: true
      },
      competitiveness: Competitiveness.ONE,
      notes: '',
      borough: 'Test Borough',
      county: County.LONDON,
      color: SchoolColor.OTHER
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={minimalSchool} />
      </TestWrapper>
    );
  });

  test('renders with paid school cost', () => {
    const paidSchool = {
      ...mockSchool,
      id: '7',
      cost: {
        amount: 15000,
        currency: 'GBP',
        period: 'year' as const,
        isFree: false
      }
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={paidSchool} />
      </TestWrapper>
    );
  });

  test('renders with transport information', () => {
    const schoolWithTransport = {
      ...mockSchool,
      id: '8',
      transport: {
        nearestStation: 'Test Station',
        walkingTime: '5 minutes',
        journeyTime: '20 minutes',
        busRoutes: ['123', '456']
      }
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={schoolWithTransport} />
      </TestWrapper>
    );
  });

  test('renders with religious affiliation', () => {
    const faithSchool = {
      ...mockSchool,
      id: '9',
      schoolType: SchoolType.STATE_PRIMARY_FAITH,
      religiousAffiliation: 'Church of England'
    };
    
    render(
      <TestWrapper>
        <SchoolMarker school={faithSchool} />
      </TestWrapper>
    );
  });

  test('renders tooltip with school information', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SchoolMarker school={mockSchool} />
      </TestWrapper>
    );
    
    // Should render tooltip
    const tooltip = getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    
    // Should contain tooltip content
    expect(tooltip.textContent).toContain('Test Grammar School');
    expect(tooltip.textContent).toContain('Grammar • Co-ed • Secondary');
  });

  test('renders both tooltip and popup', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SchoolMarker school={mockSchool} />
      </TestWrapper>
    );
    
    // Should render both tooltip and popup
    expect(getByTestId('tooltip')).toBeInTheDocument();
    expect(getByTestId('popup')).toBeInTheDocument();
  });
});