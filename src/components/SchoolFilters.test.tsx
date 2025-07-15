import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchoolFilters from './SchoolFilters';
import { SchoolType, Gender, Level, County, SchoolFilters as Filters } from '../types/School';

describe('SchoolFilters Component', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all filter sections', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Filter Schools')).toBeInTheDocument();
    expect(screen.getByText('School Type')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('County')).toBeInTheDocument();
  });

  it('renders all school type options', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Grammar')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('State Primary')).toBeInTheDocument();
    expect(screen.getByText('State Primary (Faith)')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive')).toBeInTheDocument();
  });

  it('renders all gender options', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Boys')).toBeInTheDocument();
    expect(screen.getByText('Girls')).toBeInTheDocument();
    expect(screen.getByText('Co-ed')).toBeInTheDocument();
  });

  it('renders all level options', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('renders all county options', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Buckinghamshire')).toBeInTheDocument();
    expect(screen.getByText('Kent')).toBeInTheDocument();
  });

  it('calls onFiltersChange when a filter is selected', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    const grammarCheckbox = screen.getByLabelText('Grammar');
    fireEvent.click(grammarCheckbox);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        schoolTypes: [SchoolType.GRAMMAR]
      });
    });
  });

  it('adds multiple filters of the same type', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    const grammarCheckbox = screen.getByLabelText('Grammar');
    const privateCheckbox = screen.getByLabelText('Private');
    
    fireEvent.click(grammarCheckbox);
    fireEvent.click(privateCheckbox);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        schoolTypes: [SchoolType.GRAMMAR, SchoolType.PRIVATE]
      });
    });
  });

  it('removes filter when unchecked', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    const grammarCheckbox = screen.getByLabelText('Grammar');
    
    // Check
    fireEvent.click(grammarCheckbox);
    
    // Uncheck
    fireEvent.click(grammarCheckbox);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({});
    });
  });

  it('shows advanced filters when toggle is clicked', () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.queryByText('Annual Cost (£)')).not.toBeInTheDocument();
    
    const advancedToggle = screen.getByText('Show Advanced Filters');
    fireEvent.click(advancedToggle);
    
    expect(screen.getByText('Annual Cost (£)')).toBeInTheDocument();
    expect(screen.getByText('Competitiveness')).toBeInTheDocument();
    expect(screen.getByText('Boarding Options')).toBeInTheDocument();
    expect(screen.getByText('Ranking Position')).toBeInTheDocument();
  });

  it('handles cost range filter', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Show advanced filters
    fireEvent.click(screen.getByText('Show Advanced Filters'));
    
    const minInput = screen.getByPlaceholderText('Min');
    const maxInput = screen.getByPlaceholderText('Max');
    
    fireEvent.change(minInput, { target: { value: '10000' } });
    fireEvent.change(maxInput, { target: { value: '30000' } });
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        costRange: { min: 10000, max: 30000 }
      });
    });
  });

  it('displays filter count when filters are active', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    const grammarCheckbox = screen.getByLabelText('Grammar');
    const boysCheckbox = screen.getByLabelText('Boys');
    
    fireEvent.click(grammarCheckbox);
    fireEvent.click(boysCheckbox);
    
    await waitFor(() => {
      const filterCount = screen.getByText('2');
      expect(filterCount).toHaveClass('filter-count');
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Add some filters
    fireEvent.click(screen.getByLabelText('Grammar'));
    fireEvent.click(screen.getByLabelText('Boys'));
    
    // Clear all
    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({});
    });
  });

  it('collapses and expands when toggle button is clicked', () => {
    const mockToggle = jest.fn();
    render(
      <SchoolFilters 
        onFiltersChange={mockOnFiltersChange}
        isExpanded={true}
        onToggleExpanded={mockToggle}
      />
    );
    
    const toggleButton = screen.getByRole('button', { name: /collapse filters/i });
    fireEvent.click(toggleButton);
    
    expect(mockToggle).toHaveBeenCalled();
  });

  it('hides content when collapsed', () => {
    render(
      <SchoolFilters 
        onFiltersChange={mockOnFiltersChange}
        isExpanded={false}
      />
    );
    
    expect(screen.queryByText('School Type')).not.toBeInTheDocument();
    expect(screen.getByText('Filter Schools')).toBeInTheDocument();
  });

  it('applies initial filters', () => {
    const initialFilters: Filters = {
      schoolTypes: [SchoolType.GRAMMAR],
      genders: [Gender.BOYS]
    };
    
    render(
      <SchoolFilters 
        onFiltersChange={mockOnFiltersChange}
        initialFilters={initialFilters}
      />
    );
    
    expect(screen.getByLabelText('Grammar')).toBeChecked();
    expect(screen.getByLabelText('Boys')).toBeChecked();
  });

  it('handles competitiveness filter', async () => {
    render(<SchoolFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Show advanced filters
    fireEvent.click(screen.getByText('Show Advanced Filters'));
    
    const level3 = screen.getByLabelText('★★★ (3)');
    fireEvent.click(level3);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        competitiveness: [3]
      });
    });
  });
});