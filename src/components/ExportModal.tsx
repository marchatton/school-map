import React, { useState } from 'react';
import { School } from '../types/School';
import {
  downloadSchoolsCSV,
  downloadSchoolsJSON,
  downloadSchoolsExcel,
  downloadSummaryReport,
  generateExportSummary,
  validateExportData,
  ExportOptions
} from '../utils/exportUtils';
import './ExportModal.css';

interface ExportModalProps {
  schools: School[];
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'excel' | 'summary';

const ExportModal: React.FC<ExportModalProps> = ({
  schools,
  title = 'School Data Export',
  isOpen,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filename: '',
    includeHeader: true,
    delimiter: ',',
    includeCoordinates: true,
    includeAllFields: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const validation = validateExportData(schools);
  const summary = generateExportSummary(schools);

  const handleExportOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    if (!validation.isValid) {
      setExportStatus({
        type: 'error',
        message: `Cannot export: ${validation.errors.join(', ')}`
      });
      return;
    }

    setIsExporting(true);
    setExportStatus({ type: null, message: '' });

    try {
      const filename = exportOptions.filename || 
        `schools-${selectedFormat}-${new Date().toISOString().split('T')[0]}`;

      switch (selectedFormat) {
        case 'csv':
          downloadSchoolsCSV(schools, { ...exportOptions, filename: `${filename}.csv` });
          break;
        case 'json':
          downloadSchoolsJSON(schools, { ...exportOptions, filename: `${filename}.json` });
          break;
        case 'excel':
          downloadSchoolsExcel(schools, { ...exportOptions, filename: `${filename}.xlsx` });
          break;
        case 'summary':
          downloadSummaryReport(schools, title);
          break;
      }

      setExportStatus({
        type: 'success',
        message: `Successfully exported ${schools.length} schools as ${selectedFormat.toUpperCase()}`
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setExportStatus({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="export-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="export-modal-content">
        <div className="export-modal-header">
          <h2 id="export-modal-title" className="export-modal-title">
            Export School Data
          </h2>
          <button
            className="export-modal-close"
            onClick={onClose}
            aria-label="Close export dialog"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="export-modal-body">
          {/* Data Summary */}
          <div className="export-section">
            <h3 className="export-section-title">Data Summary</h3>
            <div className="export-summary">
              <div className="export-summary-item">
                <span className="export-summary-label">Total Schools:</span>
                <span className="export-summary-value">{summary.totalSchools}</span>
              </div>
              <div className="export-summary-grid">
                <div className="export-summary-column">
                  <h4>By Type:</h4>
                  {Object.entries(summary.byType).map(([type, count]) => (
                    <div key={type} className="export-summary-detail">
                      {type}: {count}
                    </div>
                  ))}
                </div>
                <div className="export-summary-column">
                  <h4>By County:</h4>
                  {Object.entries(summary.byCounty).map(([county, count]) => (
                    <div key={county} className="export-summary-detail">
                      {county}: {count}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="export-section">
            <h3 className="export-section-title">Export Format</h3>
            <div className="export-format-options">
              <label className="export-format-option">
                <input
                  type="radio"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                />
                <div className="export-format-info">
                  <span className="export-format-name">📊 CSV</span>
                  <span className="export-format-description">
                    Comma-separated values for Excel/Sheets
                  </span>
                </div>
              </label>
              
              <label className="export-format-option">
                <input
                  type="radio"
                  value="excel"
                  checked={selectedFormat === 'excel'}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                />
                <div className="export-format-info">
                  <span className="export-format-name">📈 Excel</span>
                  <span className="export-format-description">
                    Excel-compatible format (.xlsx)
                  </span>
                </div>
              </label>
              
              <label className="export-format-option">
                <input
                  type="radio"
                  value="json"
                  checked={selectedFormat === 'json'}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                />
                <div className="export-format-info">
                  <span className="export-format-name">🔧 JSON</span>
                  <span className="export-format-description">
                    Developer-friendly data format
                  </span>
                </div>
              </label>
              
              <label className="export-format-option">
                <input
                  type="radio"
                  value="summary"
                  checked={selectedFormat === 'summary'}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                />
                <div className="export-format-info">
                  <span className="export-format-name">📋 Summary Report</span>
                  <span className="export-format-description">
                    Statistical summary and analysis
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          {selectedFormat !== 'summary' && (
            <div className="export-section">
              <h3 className="export-section-title">Export Options</h3>
              <div className="export-options">
                <div className="export-option">
                  <label htmlFor="export-filename">Custom Filename:</label>
                  <input
                    id="export-filename"
                    type="text"
                    value={exportOptions.filename}
                    onChange={(e) => handleExportOptionChange('filename', e.target.value)}
                    placeholder={`schools-${selectedFormat}-${new Date().toISOString().split('T')[0]}`}
                    className="export-input"
                  />
                </div>

                {selectedFormat === 'csv' && (
                  <div className="export-option">
                    <label htmlFor="export-delimiter">Delimiter:</label>
                    <select
                      id="export-delimiter"
                      value={exportOptions.delimiter}
                      onChange={(e) => handleExportOptionChange('delimiter', e.target.value)}
                      className="export-select"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>
                )}

                <div className="export-checkboxes">
                  <label className="export-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeHeader}
                      onChange={(e) => handleExportOptionChange('includeHeader', e.target.checked)}
                    />
                    Include header row
                  </label>
                  
                  <label className="export-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCoordinates}
                      onChange={(e) => handleExportOptionChange('includeCoordinates', e.target.checked)}
                    />
                    Include GPS coordinates
                  </label>
                  
                  <label className="export-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAllFields}
                      onChange={(e) => handleExportOptionChange('includeAllFields', e.target.checked)}
                    />
                    Include all available fields
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="export-section">
              <h3 className="export-section-title">Data Validation</h3>
              <div className="export-validation">
                {validation.errors.length > 0 && (
                  <div className="export-validation-errors">
                    <h4>❌ Errors:</h4>
                    {validation.errors.map((error, index) => (
                      <div key={index} className="export-validation-message error">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                
                {validation.warnings.length > 0 && (
                  <div className="export-validation-warnings">
                    <h4>⚠️ Warnings:</h4>
                    {validation.warnings.slice(0, 5).map((warning, index) => (
                      <div key={index} className="export-validation-message warning">
                        {warning}
                      </div>
                    ))}
                    {validation.warnings.length > 5 && (
                      <div className="export-validation-message">
                        ...and {validation.warnings.length - 5} more warnings
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Status */}
          {exportStatus.type && (
            <div className={`export-status export-status-${exportStatus.type}`}>
              {exportStatus.message}
            </div>
          )}
        </div>

        <div className="export-modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting || !validation.isValid || schools.length === 0}
          >
            {isExporting ? '⏳ Exporting...' : `📥 Export ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;