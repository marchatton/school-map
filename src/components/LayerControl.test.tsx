import React from 'react';
import { render, screen } from '@testing-library/react';
import LayerControl, { MAP_LAYERS } from './LayerControl';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  LayersControl: {
    BaseLayer: ({ children, name }: any) => <div data-testid={`base-layer-${name}`}>{children}</div>,
    Overlay: ({ children, name }: any) => <div data-testid={`overlay-${name}`}>{children}</div>
  },
  TileLayer: ({ url }: any) => <div data-testid="tile-layer" data-url={url}></div>
}));

describe('LayerControl', () => {
  it('renders without crashing', () => {
    render(<LayerControl />);
  });

  it('renders all map layers', () => {
    render(<LayerControl />);
    
    MAP_LAYERS.forEach(layer => {
      expect(screen.getByTestId(`base-layer-${layer.name}`)).toBeInTheDocument();
    });
  });

  it('renders transport overlay', () => {
    render(<LayerControl />);
    
    expect(screen.getByTestId('overlay-Transport Lines')).toBeInTheDocument();
  });

  it('uses default layer when specified', () => {
    render(<LayerControl defaultLayer="satellite" />);
    
    // Component should render successfully with default layer
    expect(screen.getByTestId('base-layer-Satellite')).toBeInTheDocument();
  });

  it('has correct map layer configuration', () => {
    expect(MAP_LAYERS).toHaveLength(5);
    
    const expectedLayers = ['OpenStreetMap', 'Satellite', 'Terrain', 'Light', 'Dark'];
    expectedLayers.forEach((name, index) => {
      expect(MAP_LAYERS[index].name).toBe(name);
      expect(MAP_LAYERS[index].url).toBeDefined();
      expect(MAP_LAYERS[index].attribution).toBeDefined();
    });
  });

  it('has proper URL formats for all layers', () => {
    MAP_LAYERS.forEach(layer => {
      expect(layer.url).toMatch(/https?:\/\/.*\{z\}.*\{x\}.*\{y\}/);
    });
  });
});