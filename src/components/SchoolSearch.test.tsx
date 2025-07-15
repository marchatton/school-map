import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchoolSearch from './SchoolSearch';
import { School, SchoolType, Gender, Level, County, SchoolColor } from '../types/School';

const mockSchools: School[] = [
  {
    id: '1',
    name: 'Test Grammar School',
    address: '123 Test Street',
    postcode: 'TG1 2ST',
    borough: 'Test Borough',
    county: County.LONDON,
    schoolType: SchoolType.GRAMMAR,
    gender: Gender.COED,
    level: Level.SECONDARY,
    color: SchoolColor.COED_SECONDARY,
    coordinates: { lat: 51.5074, lng: -0.1278 },
    cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true },
    competitiveness: 3,
    notes: 'Test grammar school'
  },
  {
    id: '2',
    name: 'Private School Example',
    address: '456 Example Road',
    postcode: 'PE2 3XM',
    borough: 'Example Borough',
    county: County.KENT,
    schoolType: SchoolType.PRIVATE,
    gender: Gender.GIRLS,
    level: Level.SECONDARY,
    color: SchoolColor.GIRLS_SECONDARY,
    coordinates: { lat: 51.5155, lng: -0.0755 },
    cost: { amount: 25000, currency: 'GBP', period: 'year', isFree: false },
    competitiveness: 4,
    notes: 'Private girls school'
  }
];

describe('SchoolSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder', () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search schools by name, address, or postcode...');
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Custom search placeholder';
    render(<SchoolSearch schools={mockSchools} placeholder={customPlaceholder} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('shows search results when typing', async () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });
  });

  it('shows no results message when no matches found', async () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No schools found')).toBeInTheDocument();
      expect(screen.getByText('Try searching by school name, address, or postcode')).toBeInTheDocument();
    });
  });

  it('calls onSearchResult callback when searching', async () => {
    const mockOnSearchResult = jest.fn();
    render(<SchoolSearch schools={mockSchools} onSearchResult={mockOnSearchResult} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    await waitFor(() => {
      expect(mockOnSearchResult).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            school: expect.objectContaining({ name: 'Test Grammar School' }),
            matchType: 'name',
            relevanceScore: expect.any(Number)
          })
        ])
      );
    });
  });

  it('calls onSchoolSelect callback when result is clicked', async () => {
    const mockOnSchoolSelect = jest.fn();
    render(<SchoolSearch schools={mockSchools} onSchoolSelect={mockOnSchoolSelect} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    await waitFor(() => {
      const results = screen.getAllByRole('option');
      fireEvent.click(results[0]);
    });
    
    expect(mockOnSchoolSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Grammar School' })
    );
  });

  it('supports keyboard navigation', async () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'School' } });
    
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
    
    // Navigate down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    const results = screen.getAllByRole('option');
    expect(results[0]).toHaveClass('selected');
  });

  it('closes dropdown with Escape key', async () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows clear button when input has value', async () => {
    render(<SchoolSearch schools={mockSchools} />);
    
    const input = screen.getByRole('combobox');
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const mockOnSearchResult = jest.fn();
    render(<SchoolSearch schools={mockSchools} onSearchResult={mockOnSearchResult} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnSearchResult).toHaveBeenLastCalledWith([]);
  });

  it('limits results to maxResults prop', async () => {
    render(<SchoolSearch schools={mockSchools} maxResults={1} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'School' } }); // Should match both schools
    
    await waitFor(() => {
      const results = screen.getAllByRole('option');
      expect(results).toHaveLength(1);
    });
  });

  it('handles empty schools array', () => {
    render(<SchoolSearch schools={[]} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('clears results when input is emptied', async () => {
    const mockOnSearchResult = jest.fn();
    render(<SchoolSearch schools={mockSchools} onSearchResult={mockOnSearchResult} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Grammar' } });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    fireEvent.change(input, { target: { value: '' } });
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(mockOnSearchResult).toHaveBeenLastCalledWith([]);
  });
});