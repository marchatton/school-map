import React from 'react';
import { SchoolColor, Gender, Level } from '../types/School';
import './MapLegend.css';

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

interface MapLegendProps {
  isVisible?: boolean;
  onToggle?: () => void;
  position?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
}

const MapLegend: React.FC<MapLegendProps> = ({ 
  isVisible = true, 
  onToggle,
  position = 'bottomleft'
}) => {
  const legendItems: LegendItem[] = [
    {
      color: SchoolColor.GIRLS_SECONDARY,
      label: 'Girls Secondary',
      description: 'Girls secondary schools'
    },
    {
      color: SchoolColor.GIRLS_PRIMARY,
      label: 'Girls Primary',
      description: 'Girls primary schools'
    },
    {
      color: SchoolColor.BOYS_SECONDARY,
      label: 'Boys Secondary',
      description: 'Boys secondary schools'
    },
    {
      color: SchoolColor.BOYS_PRIMARY,
      label: 'Boys Primary',
      description: 'Boys primary schools'
    },
    {
      color: SchoolColor.COED_SECONDARY,
      label: 'Co-ed Secondary',
      description: 'Co-educational secondary schools'
    },
    {
      color: SchoolColor.COED_PRIMARY,
      label: 'Co-ed Primary',
      description: 'Co-educational primary schools'
    },
    {
      color: SchoolColor.OTHER,
      label: 'Other',
      description: 'Other school types'
    }
  ];

  const schoolTypes = [
    { label: 'Grammar', description: 'Selective state schools' },
    { label: 'Private', description: 'Independent fee-paying schools' },
    { label: 'State Primary', description: 'State-funded primary schools' },
    { label: 'State Primary (Faith)', description: 'Faith-based state primary schools' },
    { label: 'Comprehensive', description: 'Non-selective state secondary schools' }
  ];

  return (
    <div className={`map-legend map-legend-${position} ${isVisible ? 'visible' : 'collapsed'}`}>
      <div className="legend-header">
        <h3 className="legend-title">School Map Legend</h3>
        {onToggle && (
          <button 
            className="legend-toggle"
            onClick={onToggle}
            aria-label={isVisible ? 'Collapse legend' : 'Expand legend'}
            title={isVisible ? 'Collapse legend' : 'Expand legend'}
          >
            {isVisible ? '−' : '+'}
          </button>
        )}
      </div>
      
      {isVisible && (
        <div className="legend-content">
          <div className="legend-section">
            <h4 className="legend-section-title">School Colors</h4>
            <div className="legend-items">
              {legendItems.map((item) => (
                <div key={item.label} className="legend-item">
                  <div 
                    className="legend-color-indicator"
                    style={{ backgroundColor: item.color }}
                    title={item.description}
                  />
                  <span className="legend-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="legend-section">
            <h4 className="legend-section-title">School Types</h4>
            <div className="legend-items">
              {schoolTypes.map((type) => (
                <div key={type.label} className="legend-item legend-type-item">
                  <span className="legend-type-dot">•</span>
                  <div className="legend-type-info">
                    <span className="legend-label">{type.label}</span>
                    <span className="legend-description">{type.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="legend-section">
            <h4 className="legend-section-title">Cluster Info</h4>
            <div className="legend-items">
              <div className="legend-item legend-cluster-item">
                <div className="legend-cluster-example">
                  <div className="legend-cluster-icon">15</div>
                </div>
                <div className="legend-type-info">
                  <span className="legend-label">Cluster Size</span>
                  <span className="legend-description">Number shows schools in cluster</span>
                </div>
              </div>
              <div className="legend-item legend-cluster-item">
                <div className="legend-cluster-colors">
                  <div className="cluster-color-sample" style={{ backgroundColor: '#228B22' }}></div>
                  <div className="cluster-color-sample" style={{ backgroundColor: '#9370DB' }}></div>
                  <div className="cluster-color-sample" style={{ backgroundColor: '#FFD700' }}></div>
                </div>
                <div className="legend-type-info">
                  <span className="legend-label">Cluster Color</span>
                  <span className="legend-description">Based on majority school type</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;