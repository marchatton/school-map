import React from 'react';
import { render, screen } from '@testing-library/react';
import Map from './Map';
import { School, SchoolType, Gender, Level, County, SchoolColor } from '../types/School';

// Mock SchoolMarker component
jest.mock('./SchoolMarker', () => {
  return function MockSchoolMarker({ school }: any) {
    return <div data-testid={`school-marker-${school.id}`}>School: {school.name}</div>;
  };
});

// Mock MapLegend component
jest.mock('./MapLegend', () => {
  return function MockMapLegend({ isVisible, position }: any) {
    return <div data-testid="map-legend" data-visible={isVisible} data-position={position}>Map Legend</div>;
  };
});

// Mock MapControls to avoid complex Leaflet control testing
const MockMapControls = () => <div data-testid="map-controls" />;
const MockMapController = () => <div data-testid="map-controller" />;

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>{children}</div>
  ),
  TileLayer: ({ attribution, url }: any) => (
    <div data-testid="tile-layer" data-attribution={attribution} data-url={url} />
  ),
  ScaleControl: ({ position }: any) => (
    <div data-testid="scale-control" data-position={position} />
  ),
  useMap: () => ({
    setView: jest.fn(),
    addControl: jest.fn(),
    removeControl: jest.fn()
  })
}));

// Mock react-leaflet-cluster
jest.mock('react-leaflet-cluster', () => {
  return function MockMarkerClusterGroup({ children }: any) {
    return <div data-testid="marker-cluster-group">{children}</div>;
  };
});

// Mock leaflet
jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
  Marker: {
    prototype: {
      options: {
        icon: null
      }
    }
  },
  Control: {
    extend: jest.fn(() => {
      return function MockControl() {
        return {
          addTo: jest.fn(),
          remove: jest.fn(),
          onAdd: jest.fn()
        };
      };
    }),
    Fullscreen: function MockFullscreen() {
      return {
        addTo: jest.fn(),
        remove: jest.fn()
      };
    }
  },
  control: {
    zoom: jest.fn(() => ({ addTo: jest.fn(), remove: jest.fn() }))
  },
  DomUtil: {
    create: jest.fn(() => ({ 
      style: {},
      href: '',
      title: '',
      innerHTML: ''
    }))
  },
  DomEvent: {
    on: jest.fn(),
    stopPropagation: jest.fn(),
    preventDefault: jest.fn()
  }
}));

// Mock leaflet-fullscreen
jest.mock('leaflet-fullscreen/dist/Leaflet.fullscreen.min.js', () => {});

describe('Map Component', () => {
  const mockSchools: School[] = [
    {
      id: '1',
      name: 'Test School 1',
      address: 'Test Address 1',
      postcode: 'SW1A 1AA',
      borough: 'Westminster',
      county: County.LONDON,
      schoolType: SchoolType.GRAMMAR,
      gender: Gender.COED,
      level: Level.SECONDARY,
      color: SchoolColor.COED_SECONDARY,
      coordinates: { lat: 51.5074, lng: -0.1278 },
      cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true },
      competitiveness: 3,
      notes: 'Test notes'
    },
    {
      id: '2',
      name: 'Test School 2',
      address: 'Test Address 2',
      postcode: 'E1 1AA',
      borough: 'Tower Hamlets',
      county: County.LONDON,
      schoolType: SchoolType.PRIVATE,
      gender: Gender.GIRLS,
      level: Level.SECONDARY,
      color: SchoolColor.GIRLS_SECONDARY,
      coordinates: { lat: 51.5155, lng: -0.0755 },
      cost: { amount: 25000, currency: 'GBP', period: 'year', isFree: false },
      competitiveness: 4,
      notes: 'Another test school'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render map container', () => {
    render(<Map schools={mockSchools} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should render with default center and zoom', () => {
    render(<Map schools={mockSchools} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveAttribute('center', '51.5074,-0.1278');
    expect(mapContainer).toHaveAttribute('zoom', '10');
  });

  it('should render with custom center and zoom', () => {
    const customCenter: [number, number] = [51.5155, -0.0755];
    const customZoom = 12;
    
    render(<Map schools={mockSchools} center={customCenter} zoom={customZoom} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveAttribute('center', '51.5155,-0.0755');
    expect(mapContainer).toHaveAttribute('zoom', '12');
  });

  it('should render tile layer with correct attribution', () => {
    render(<Map schools={mockSchools} />);
    
    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toBeInTheDocument();
    expect(tileLayer).toHaveAttribute('data-attribution', expect.stringContaining('OpenStreetMap'));
    expect(tileLayer).toHaveAttribute('data-url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });

  it('should set map bounds for Greater London area', () => {
    render(<Map schools={mockSchools} />);
    
    const mapContainer = screen.getByTestId('map-container');
    // Check that bounds are set
    expect(mapContainer).toHaveAttribute('bounds');
    expect(mapContainer).toHaveAttribute('maxBounds');
    expect(mapContainer).toHaveAttribute('maxBoundsViscosity', '1');
  });

  it('should set appropriate zoom limits', () => {
    render(<Map schools={mockSchools} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveAttribute('minZoom', '8');
    expect(mapContainer).toHaveAttribute('maxZoom', '18');
  });

  it('should render with full height and width', () => {
    render(<Map schools={mockSchools} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveStyle({ height: '100%', width: '100%' });
  });

  it('should handle empty schools array', () => {
    render(<Map schools={[]} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should accept onSchoolClick callback', () => {
    const mockOnSchoolClick = jest.fn();
    
    render(<Map schools={mockSchools} onSchoolClick={mockOnSchoolClick} />);
    
    // The callback will be tested when we add school markers
    expect(mockOnSchoolClick).not.toHaveBeenCalled();
  });

  it('should accept selectedSchoolId prop', () => {
    render(<Map schools={mockSchools} selectedSchoolId="1" />);
    
    // The selected school behavior will be tested when we add school markers
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should render markers within cluster group', () => {
    render(<Map schools={mockSchools} />);
    
    // Should have marker cluster group
    expect(screen.getByTestId('marker-cluster-group')).toBeInTheDocument();
    
    // Markers should be inside cluster group
    const clusterGroup = screen.getByTestId('marker-cluster-group');
    expect(clusterGroup).toContainElement(screen.getByTestId('school-marker-1'));
    expect(clusterGroup).toContainElement(screen.getByTestId('school-marker-2'));
  });

  it('should render schools as individual markers', () => {
    render(<Map schools={mockSchools} />);
    
    // Should render markers for each school
    expect(screen.getByTestId('school-marker-1')).toBeInTheDocument();
    expect(screen.getByTestId('school-marker-2')).toBeInTheDocument();
  });

  it('should render scale control', () => {
    render(<Map schools={mockSchools} />);
    
    // Should render scale control in bottom-right position
    const scaleControl = screen.getByTestId('scale-control');
    expect(scaleControl).toBeInTheDocument();
    expect(scaleControl).toHaveAttribute('data-position', 'bottomright');
  });

  it('should render map legend by default', () => {
    render(<Map schools={mockSchools} />);
    
    const legend = screen.getByTestId('map-legend');
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveAttribute('data-visible', 'true');
    expect(legend).toHaveAttribute('data-position', 'bottomleft');
  });

  it('should not render map legend when showLegend is false', () => {
    render(<Map schools={mockSchools} showLegend={false} />);
    
    expect(screen.queryByTestId('map-legend')).not.toBeInTheDocument();
  });

  it('should render legend in specified position', () => {
    render(<Map schools={mockSchools} legendPosition="topright" />);
    
    const legend = screen.getByTestId('map-legend');
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveAttribute('data-position', 'topright');
  });

  it('should accept all legend position options', () => {
    const positions = ['topright', 'topleft', 'bottomright', 'bottomleft'] as const;
    
    positions.forEach(position => {
      const { unmount } = render(<Map schools={mockSchools} legendPosition={position} />);
      
      const legend = screen.getByTestId('map-legend');
      expect(legend).toHaveAttribute('data-position', position);
      
      unmount();
    });
  });
});