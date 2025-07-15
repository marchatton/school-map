import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { School, SchoolColor } from '../types/School';

interface SchoolMarkerProps {
  school: School;
  onClick?: (school: School) => void;
  isSelected?: boolean;
}

// Create custom icons for different school types and colors
const createCustomIcon = (school: School, isSelected: boolean = false): L.DivIcon => {
  const size = isSelected ? 32 : 24;
  const className = isSelected ? 'school-marker selected' : 'school-marker';
  
  return L.divIcon({
    html: `
      <div class="${className}" style="
        background-color: ${school.color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
      ">
        <div style="
          color: white;
          font-weight: bold;
          font-size: ${size > 24 ? '14px' : '12px'};
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">
          ${getSchoolTypeIcon(school)}
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Get icon character based on school type and gender
const getSchoolTypeIcon = (school: School): string => {
  switch (school.schoolType) {
    case 'Grammar':
      return 'G';
    case 'Private':
      return 'P';
    case 'State Primary':
    case 'State Primary (Faith)':
      return '1';
    case 'Comprehensive':
      return 'C';
    default:
      return 'S';
  }
};

// Helper function to format cost display
const formatCost = (cost: School['cost']): string => {
  if (cost.isFree) {
    return 'Free';
  }
  return `£${cost.amount.toLocaleString()}/${cost.period}`;
};

// Helper function to format competitiveness
const formatCompetitiveness = (level: number): string => {
  const labels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
  return labels[level] || 'Unknown';
};

const SchoolMarker: React.FC<SchoolMarkerProps> = ({ school, onClick, isSelected = false }) => {
  if (!school.coordinates) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(school);
    }
  };

  const customIcon = createCustomIcon(school, isSelected);

  return (
    <Marker
      position={[school.coordinates.lat, school.coordinates.lng]}
      icon={customIcon}
      eventHandlers={{
        click: handleClick,
      }}
      // Pass school data for clustering logic
      schoolData={school}
    >
      <Tooltip 
        className="school-tooltip enhanced-tooltip"
        direction="top"
        offset={[0, -15]}
        opacity={0.95}
        permanent={false}
      >
        <div className="tooltip-content">
          <div className="tooltip-header">
            <div className="tooltip-name">{school.name}</div>
            <div className="tooltip-badge" style={{ backgroundColor: school.color }}>
              {school.schoolType}
            </div>
          </div>
          <div className="tooltip-info">
            <div className="tooltip-details">
              <span className="tooltip-gender">{school.gender}</span>
              <span className="tooltip-separator">•</span>
              <span className="tooltip-level">{school.level}</span>
            </div>
            <div className="tooltip-meta">
              <div className="tooltip-cost">{formatCost(school.cost)}</div>
              <div className="tooltip-competitiveness">
                {'★'.repeat(school.competitiveness)}{'☆'.repeat(5 - school.competitiveness)}
              </div>
            </div>
          </div>
          <div className="tooltip-address">
            {school.address}, {school.postcode}
          </div>
          {school.ranking && (
            <div className="tooltip-ranking">
              Ranked #{school.ranking.position}
              {school.ranking.source && ` (${school.ranking.source})`}
            </div>
          )}
          <div className="tooltip-click-hint">
            Click for full details
          </div>
        </div>
      </Tooltip>
      
      <Popup className="school-popup" maxWidth={300}>
        <div className="school-popup-content">
          <div className="school-popup-header">
            <h3 className="school-name">{school.name}</h3>
            <div className="school-type-badge" style={{ backgroundColor: school.color }}>
              {school.schoolType} • {school.gender}
            </div>
          </div>
          
          <div className="school-popup-body">
            <div className="school-info-row">
              <strong>Address:</strong> {school.address}, {school.postcode}
            </div>
            
            <div className="school-info-row">
              <strong>Level:</strong> {school.level}
            </div>
            
            <div className="school-info-row">
              <strong>Cost:</strong> {formatCost(school.cost)}
            </div>
            
            <div className="school-info-row">
              <strong>Competitiveness:</strong> {formatCompetitiveness(school.competitiveness)}
            </div>
            
            {school.ranking && (
              <div className="school-info-row">
                <strong>Ranking:</strong> #{school.ranking.position} 
                {school.ranking.total && ` of ${school.ranking.total}`}
                {school.ranking.source && ` (${school.ranking.source})`}
              </div>
            )}
            
            {school.ofstedRating && (
              <div className="school-info-row">
                <strong>Ofsted:</strong> {school.ofstedRating}
              </div>
            )}
            
            {school.religiousAffiliation && (
              <div className="school-info-row">
                <strong>Faith:</strong> {school.religiousAffiliation}
              </div>
            )}
            
            {school.boardingOptions && (
              <div className="school-info-row">
                <strong>Boarding:</strong> {school.boardingOptions}
              </div>
            )}
            
            {school.transport?.nearestStation && (
              <div className="school-info-row">
                <strong>Transport:</strong> {school.transport.nearestStation}
                {school.transport.walkingTime && ` (${school.transport.walkingTime} walk)`}
              </div>
            )}
            
            {school.notes && (
              <div className="school-notes">
                <strong>Notes:</strong> {school.notes}
              </div>
            )}
            
            {school.website && (
              <div className="school-website">
                <a href={school.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default SchoolMarker;