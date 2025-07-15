import React, { useState, useEffect, useRef, useMemo } from 'react';
import { School, SearchResult } from '../types/School';
import { useOptimizedSchoolSearch, useStableCallback } from '../hooks/usePerformance';
import './SchoolSearch.css';

interface SchoolSearchProps {
  schools: School[];
  onSearchResult?: (results: SearchResult[]) => void;
  onSchoolSelect?: (school: School) => void;
  onAddToComparison?: (school: School) => void;
  onAddToFavorites?: (school: School) => void;
  onShareSchool?: (school: School) => void;
  placeholder?: string;
  maxResults?: number;
}

const SchoolSearch: React.FC<SchoolSearchProps> = ({
  schools,
  onSearchResult,
  onSchoolSelect,
  onAddToComparison,
  onAddToFavorites,
  onShareSchool,
  placeholder = "Search schools by name, address, or postcode...",
  maxResults = 10
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use optimized search with debouncing
  const searchResults = useOptimizedSchoolSearch(schools, query, 300);
  
  // Convert optimized search results to SearchResult format
  const results = useMemo((): SearchResult[] => {
    return searchResults.map(({ school, relevance }) => ({
      school,
      matchType: 'name' as const, // Simplified for now
      relevanceScore: relevance
    })).slice(0, maxResults);
  }, [searchResults, maxResults]);

  // Update search results when they change
  useEffect(() => {
    if (query.trim() && results.length > 0) {
      onSearchResult?.(results);
    }
  }, [results, query, onSearchResult]);

  // Handle input change with stable callback
  const handleInputChange = useStableCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      onSearchResult?.([]);
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.school.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSchoolSelect?.(result.school);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearchResult?.([]);
    inputRef.current?.focus();
  };

  // Get match type label
  const getMatchTypeLabel = (matchType: SearchResult['matchType']): string => {
    switch (matchType) {
      case 'name': return 'School name';
      case 'address': return 'Address';
      case 'postcode': return 'Postcode';
      default: return '';
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="school-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search schools"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        <div className="search-input-icons">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="search-clear"
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <div className="search-icon" aria-hidden="true">
            🔍
          </div>
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results" role="listbox">
          {results.map((result, index) => (
            <div
              key={result.school.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleResultSelect(result)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="result-main">
                <div className="result-name">
                  {highlightMatch(result.school.name, query)}
                </div>
                <div className="result-details">
                  <span className="result-type">{result.school.schoolType}</span>
                  <span className="result-separator">•</span>
                  <span className="result-gender">{result.school.gender}</span>
                  <span className="result-separator">•</span>
                  <span className="result-level">{result.school.level}</span>
                </div>
              </div>
              <div className="result-location">
                <div className="result-address">
                  {highlightMatch(result.school.address, query)}
                </div>
                <div className="result-postcode">
                  {highlightMatch(result.school.postcode, query)}
                </div>
              </div>
              <div className="result-match-type">
                <span className="match-type-label">
                  {getMatchTypeLabel(result.matchType)}
                </span>
              </div>
              <div className="result-actions">
                <button
                  className="result-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSchoolSelect?.(result.school);
                  }}
                  title="View details"
                  aria-label={`View details for ${result.school.name}`}
                >
                  ℹ️
                </button>
                {onAddToFavorites && (
                  <button
                    className="result-favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToFavorites(result.school);
                    }}
                    title="Add to favorites"
                    aria-label={`Add ${result.school.name} to favorites`}
                  >
                    ⭐
                  </button>
                )}
                {onAddToComparison && (
                  <button
                    className="result-compare-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToComparison(result.school);
                    }}
                    title="Add to comparison"
                    aria-label={`Add ${result.school.name} to comparison`}
                  >
                    ⚖️
                  </button>
                )}
                {onShareSchool && (
                  <button
                    className="result-share-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareSchool(result.school);
                    }}
                    title="Share school"
                    aria-label={`Share ${result.school.name}`}
                  >
                    📤
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="search-no-results">
          <div className="no-results-icon">🔍</div>
          <div className="no-results-text">No schools found</div>
          <div className="no-results-suggestion">
            Try searching by school name, address, or postcode
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSearch;