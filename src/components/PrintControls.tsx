import React, { useState } from 'react';
import { School } from '../types/School';
import { PrintOptions } from '../hooks/usePrint';
import './PrintControls.css';

interface PrintControlsProps {
  schools: School[];
  onPrint: (schools: School[], options?: Partial<PrintOptions>) => void;
  onPrintFavorites?: (favoriteSchools: School[], options?: Partial<PrintOptions>) => void;
  onPrintComparison?: (comparisonSchools: School[], options?: Partial<PrintOptions>) => void;
  favoriteSchools?: School[];
  comparisonSchools?: School[];
  searchQuery?: string;
  filterDescription?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const PrintControls: React.FC<PrintControlsProps> = ({
  schools,
  onPrint,
  onPrintFavorites,
  onPrintComparison,
  favoriteSchools = [],
  comparisonSchools = [],
  searchQuery,
  filterDescription,
  isVisible,
  onToggleVisibility
}) => {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    title: 'School Information',
    includeHeader: true,
    includeFooter: true,
    orientation: 'portrait',
    paperSize: 'A4'
  });
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());

  const handlePrintOption = (key: keyof PrintOptions, value: any) => {
    setPrintOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSchoolSelection = (schoolId: string, isSelected: boolean) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(schoolId);
      } else {
        newSet.delete(schoolId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedSchools(new Set(schools.map(s => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedSchools(new Set());
  };

  const handlePrintSelected = () => {
    const schoolsToPrint = schools.filter(s => selectedSchools.has(s.id));
    if (schoolsToPrint.length > 0) {
      onPrint(schoolsToPrint, printOptions);
    }
  };

  const handlePrintAll = () => {
    onPrint(schools, printOptions);
  };

  const handlePrintFavorites = () => {
    if (onPrintFavorites && favoriteSchools.length > 0) {
      onPrintFavorites(favoriteSchools, {
        ...printOptions,
        title: 'Favorite Schools'
      });
    }
  };

  const handlePrintComparison = () => {
    if (onPrintComparison && comparisonSchools.length > 0) {
      onPrintComparison(comparisonSchools, {
        ...printOptions,
        title: 'School Comparison',
        orientation: 'landscape'
      });
    }
  };

  if (!isVisible) {
    return (
      <div className="print-controls-collapsed">
        <button
          className="print-toggle-btn"
          onClick={onToggleVisibility}
          title="Show print options"
        >
          🖨️
        </button>
      </div>
    );
  }

  return (
    <div className="print-controls">
      <div className="print-controls-header">
        <h3>Print Options</h3>
        <button
          className="print-toggle-btn"
          onClick={onToggleVisibility}
          title="Hide print options"
        >
          ✕
        </button>
      </div>

      <div className="print-controls-content">
        {/* Print Settings */}
        <div className="print-settings">
          <div className="print-setting">
            <label htmlFor="print-title">Title:</label>
            <input
              id="print-title"
              type="text"
              value={printOptions.title}
              onChange={(e) => handlePrintOption('title', e.target.value)}
              className="print-input"
            />
          </div>

          <div className="print-setting">
            <label htmlFor="print-orientation">Orientation:</label>
            <select
              id="print-orientation"
              value={printOptions.orientation}
              onChange={(e) => handlePrintOption('orientation', e.target.value)}
              className="print-select"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div className="print-setting">
            <label htmlFor="print-paper">Paper Size:</label>
            <select
              id="print-paper"
              value={printOptions.paperSize}
              onChange={(e) => handlePrintOption('paperSize', e.target.value)}
              className="print-select"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div className="print-checkboxes">
            <label className="print-checkbox">
              <input
                type="checkbox"
                checked={printOptions.includeHeader}
                onChange={(e) => handlePrintOption('includeHeader', e.target.checked)}
              />
              Include Header
            </label>
            <label className="print-checkbox">
              <input
                type="checkbox"
                checked={printOptions.includeFooter}
                onChange={(e) => handlePrintOption('includeFooter', e.target.checked)}
              />
              Include Footer
            </label>
          </div>
        </div>

        {/* Quick Print Actions */}
        <div className="print-actions">
          <h4>Quick Print</h4>
          <div className="print-quick-buttons">
            <button
              className="print-btn print-btn-primary"
              onClick={handlePrintAll}
              disabled={schools.length === 0}
            >
              🖨️ Print All ({schools.length})
            </button>
            
            {favoriteSchools.length > 0 && (
              <button
                className="print-btn print-btn-favorites"
                onClick={handlePrintFavorites}
              >
                ⭐ Print Favorites ({favoriteSchools.length})
              </button>
            )}
            
            {comparisonSchools.length > 0 && (
              <button
                className="print-btn print-btn-comparison"
                onClick={handlePrintComparison}
              >
                ⚖️ Print Comparison ({comparisonSchools.length})
              </button>
            )}
          </div>
        </div>

        {/* School Selection */}
        {schools.length > 0 && (
          <div className="print-selection">
            <div className="print-selection-header">
              <h4>Select Schools to Print</h4>
              <div className="print-selection-actions">
                <button
                  className="print-btn-small"
                  onClick={handleSelectAll}
                  disabled={selectedSchools.size === schools.length}
                >
                  Select All
                </button>
                <button
                  className="print-btn-small"
                  onClick={handleDeselectAll}
                  disabled={selectedSchools.size === 0}
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="print-school-list">
              {schools.slice(0, 10).map((school) => (
                <label key={school.id} className="print-school-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSchools.has(school.id)}
                    onChange={(e) => handleSchoolSelection(school.id, e.target.checked)}
                  />
                  <span className="print-school-name">{school.name}</span>
                  <span className="print-school-type">{school.schoolType}</span>
                </label>
              ))}
              {schools.length > 10 && (
                <div className="print-school-more">
                  And {schools.length - 10} more schools...
                </div>
              )}
            </div>

            <button
              className="print-btn print-btn-selected"
              onClick={handlePrintSelected}
              disabled={selectedSchools.size === 0}
            >
              🖨️ Print Selected ({selectedSchools.size})
            </button>
          </div>
        )}

        {/* Print Information */}
        <div className="print-info">
          <h4>Print Tips</h4>
          <ul className="print-tips">
            <li>Use landscape orientation for comparison tables</li>
            <li>Select "More settings" → "Options" → "Headers and footers" in your browser</li>
            <li>For best results, use "Save as PDF" instead of printing to paper</li>
            <li>Large school lists will be split across multiple pages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrintControls;