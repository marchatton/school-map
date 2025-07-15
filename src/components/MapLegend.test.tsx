import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapLegend from './MapLegend';
import { SchoolColor } from '../types/School';

describe('MapLegend Component', () => {
  it('renders with default props', () => {
    render(<MapLegend />);
    
    expect(screen.getByText('School Map Legend')).toBeInTheDocument();
    expect(screen.getByText('School Colors')).toBeInTheDocument();
    expect(screen.getByText('School Types')).toBeInTheDocument();
    expect(screen.getByText('Cluster Info')).toBeInTheDocument();
  });

  it('renders all color legend items', () => {
    render(<MapLegend />);
    
    expect(screen.getByText('Girls Secondary')).toBeInTheDocument();
    expect(screen.getByText('Girls Primary')).toBeInTheDocument();
    expect(screen.getByText('Boys Secondary')).toBeInTheDocument();
    expect(screen.getByText('Boys Primary')).toBeInTheDocument();
    expect(screen.getByText('Co-ed Secondary')).toBeInTheDocument();
    expect(screen.getByText('Co-ed Primary')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('renders all school type items', () => {
    render(<MapLegend />);
    
    expect(screen.getByText('Grammar')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('State Primary')).toBeInTheDocument();
    expect(screen.getByText('State Primary (Faith)')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive')).toBeInTheDocument();
  });

  it('renders cluster information', () => {
    render(<MapLegend />);
    
    expect(screen.getByText('Cluster Size')).toBeInTheDocument();
    expect(screen.getByText('Cluster Color')).toBeInTheDocument();
    expect(screen.getByText('Number shows schools in cluster')).toBeInTheDocument();
    expect(screen.getByText('Based on majority school type')).toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    const { rerender } = render(<MapLegend position="topright" />);
    expect(document.querySelector('.map-legend-topright')).toBeInTheDocument();
    
    rerender(<MapLegend position="topleft" />);
    expect(document.querySelector('.map-legend-topleft')).toBeInTheDocument();
    
    rerender(<MapLegend position="bottomright" />);
    expect(document.querySelector('.map-legend-bottomright')).toBeInTheDocument();
    
    rerender(<MapLegend position="bottomleft" />);
    expect(document.querySelector('.map-legend-bottomleft')).toBeInTheDocument();
  });

  it('toggles visibility when toggle button is clicked', () => {
    const mockOnToggle = jest.fn();
    render(<MapLegend onToggle={mockOnToggle} />);
    
    const toggleButton = screen.getByRole('button', { name: /collapse legend/i });
    expect(toggleButton).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('shows correct toggle button text based on visibility', () => {
    const { rerender } = render(<MapLegend isVisible={true} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /collapse legend/i })).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
    
    rerender(<MapLegend isVisible={false} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /expand legend/i })).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('hides content when not visible', () => {
    render(<MapLegend isVisible={false} />);
    
    // Content should not be rendered when not visible
    expect(screen.queryByText('School Colors')).not.toBeInTheDocument();
    expect(screen.queryByText('School Types')).not.toBeInTheDocument();
    expect(screen.queryByText('Cluster Info')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for visibility', () => {
    const { rerender } = render(<MapLegend isVisible={true} />);
    expect(document.querySelector('.map-legend.visible')).toBeInTheDocument();
    
    rerender(<MapLegend isVisible={false} />);
    expect(document.querySelector('.map-legend.collapsed')).toBeInTheDocument();
  });

  it('renders without toggle button when onToggle is not provided', () => {
    render(<MapLegend />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has proper color indicators with correct styles', () => {
    render(<MapLegend />);
    
    const colorIndicators = document.querySelectorAll('.legend-color-indicator');
    expect(colorIndicators).toHaveLength(7); // 7 school color types
    
    // Check that each color indicator has a background color
    colorIndicators.forEach(indicator => {
      const style = window.getComputedStyle(indicator);
      expect(style.backgroundColor).toBeTruthy();
    });
  });

  it('has accessibility attributes on toggle button', () => {
    render(<MapLegend isVisible={true} onToggle={() => {}} />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse legend');
    expect(toggleButton).toHaveAttribute('title', 'Collapse legend');
  });

  it('displays cluster example with correct styling', () => {
    render(<MapLegend />);
    
    const clusterIcon = document.querySelector('.legend-cluster-icon');
    expect(clusterIcon).toBeInTheDocument();
    expect(clusterIcon).toHaveTextContent('15');
    
    const clusterColorSamples = document.querySelectorAll('.cluster-color-sample');
    expect(clusterColorSamples).toHaveLength(3);
  });

  it('handles missing onToggle prop gracefully', () => {
    render(<MapLegend isVisible={true} />);
    
    // Should render without errors even without onToggle
    expect(screen.getByText('School Map Legend')).toBeInTheDocument();
  });
});