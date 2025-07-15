import React, { useState, useEffect } from 'react';
import { SchoolType, Gender, Level, County, SchoolFilters as Filters } from '../types/School';
import { useDebouncedCallback } from '../hooks/usePerformance';
import './SchoolFilters.css';

interface SchoolFiltersProps {
  onFiltersChange: (filters: Filters) => void;
  initialFilters?: Filters;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const SchoolFilters: React.FC<SchoolFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  isExpanded = true,
  onToggleExpanded
}) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced filter change handler for better performance
  const debouncedOnFiltersChange = useDebouncedCallback(onFiltersChange, 150);

  // School type options
  const schoolTypeOptions = [
    { value: SchoolType.GRAMMAR, label: 'Grammar' },
    { value: SchoolType.PRIVATE, label: 'Private' },
    { value: SchoolType.STATE_PRIMARY, label: 'State Primary' },
    { value: SchoolType.STATE_PRIMARY_FAITH, label: 'State Primary (Faith)' },
    { value: SchoolType.COMPREHENSIVE, label: 'Comprehensive' }
  ];

  // Gender options
  const genderOptions = [
    { value: Gender.BOYS, label: 'Boys' },
    { value: Gender.GIRLS, label: 'Girls' },
    { value: Gender.COED, label: 'Co-ed' }
  ];

  // Level options
  const levelOptions = [
    { value: Level.PRIMARY, label: 'Primary' },
    { value: Level.SECONDARY, label: 'Secondary' }
  ];

  // County options
  const countyOptions = [
    { value: County.LONDON, label: 'London' },
    { value: County.BUCKINGHAMSHIRE, label: 'Buckinghamshire' },
    { value: County.KENT, label: 'Kent' }
  ];

  // Boarding options
  const boardingOptions = [
    { value: 'Day', label: 'Day Only' },
    { value: 'Boarding', label: 'Boarding Only' },
    { value: 'Both', label: 'Day & Boarding' }
  ];

  // Update parent component when filters change (debounced for better performance)
  useEffect(() => {
    debouncedOnFiltersChange(filters);
  }, [filters, debouncedOnFiltersChange]);

  // Handle checkbox changes
  const handleCheckboxChange = (
    category: keyof Filters,
    value: string
  ) => {
    setFilters(prev => {
      const currentValues = (prev[category] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues.length > 0 ? newValues : undefined
      };
    });
  };

  // Handle range changes
  const handleRangeChange = (
    category: 'costRange' | 'competitiveness' | 'rankingRange',
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? undefined : Number(value);
    
    setFilters(prev => {
      const currentRange = prev[category] || {};
      const newRange = {
        ...currentRange,
        [field]: numValue
      };
      
      // Only include range if at least one value is set
      const hasValues = newRange.min !== undefined || newRange.max !== undefined;
      
      return {
        ...prev,
        [category]: hasValues ? newRange : undefined
      };
    });
  };

  // Handle competitiveness checkbox changes
  const handleCompetitivenessChange = (value: number) => {
    setFilters(prev => {
      const current = prev.competitiveness || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        competitiveness: newValues.length > 0 ? newValues : undefined
      };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  // Count active filters
  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'object' && value !== null) {
      return count + Object.values(value).filter(v => v !== undefined).length;
    }
    return count + 1;
  }, 0);

  return (
    <div className={`school-filters ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filters-header">
        <h3 className="filters-title">
          Filter Schools
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
        </h3>
        <div className="filters-actions">
          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              aria-label="Clear all filters"
              title="Clear all filters"
            >
              Clear
            </button>
          )}
          {onToggleExpanded && (
            <button
              className="toggle-filters-btn"
              onClick={onToggleExpanded}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
              title={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* School Type Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">School Type</h4>
            <div className="filter-options">
              {schoolTypeOptions.map(option => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.schoolTypes || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('schoolTypes', option.value)}
                  />
                  <span className="checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Gender</h4>
            <div className="filter-options">
              {genderOptions.map(option => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.genders || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('genders', option.value)}
                  />
                  <span className="checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">Level</h4>
            <div className="filter-options">
              {levelOptions.map(option => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.levels || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('levels', option.value)}
                  />
                  <span className="checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* County Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">County</h4>
            <div className="filter-options">
              {countyOptions.map(option => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.counties || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('counties', option.value)}
                  />
                  <span className="checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            className="advanced-filters-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Filters</span>
            <span className="toggle-icon">{showAdvanced ? '▼' : '▶'}</span>
          </button>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="advanced-filters">
              {/* Cost Range Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Annual Cost (£)</h4>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    step="1000"
                    value={filters.costRange?.min || ''}
                    onChange={(e) => handleRangeChange('costRange', 'min', e.target.value)}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    step="1000"
                    value={filters.costRange?.max || ''}
                    onChange={(e) => handleRangeChange('costRange', 'max', e.target.value)}
                    className="range-input"
                  />
                </div>
              </div>

              {/* Competitiveness Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Competitiveness</h4>
                <div className="filter-options">
                  {[1, 2, 3, 4, 5].map(level => (
                    <label key={level} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={(filters.competitiveness || []).includes(level)}
                        onChange={() => handleCompetitivenessChange(level)}
                      />
                      <span className="checkbox-label">
                        {'★'.repeat(level)}
                        <span className="competitiveness-label"> ({level})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Boarding Options Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Boarding Options</h4>
                <div className="filter-options">
                  {boardingOptions.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={(filters.boardingOptions || []).includes(option.value as any)}
                        onChange={() => handleCheckboxChange('boardingOptions', option.value)}
                      />
                      <span className="checkbox-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ranking Range Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Ranking Position</h4>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Top"
                    min="1"
                    value={filters.rankingRange?.min || ''}
                    onChange={(e) => handleRangeChange('rankingRange', 'min', e.target.value)}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Bottom"
                    min="1"
                    value={filters.rankingRange?.max || ''}
                    onChange={(e) => handleRangeChange('rankingRange', 'max', e.target.value)}
                    className="range-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolFilters;