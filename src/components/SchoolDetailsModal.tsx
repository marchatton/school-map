import React from 'react';
import { School } from '../types/School';
import './SchoolDetailsModal.css';

interface SchoolDetailsModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToComparison?: (school: School) => void;
  onAddToFavorites?: (school: School) => void;
  onShareSchool?: (school: School) => void;
  onPrintSchool?: (school: School) => void;
  isFavorite?: boolean;
}

const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({
  school,
  isOpen,
  onClose,
  onAddToComparison,
  onAddToFavorites,
  onShareSchool,
  onPrintSchool,
  isFavorite = false
}) => {
  if (!isOpen || !school) return null;

  // Format cost display
  const formatCost = (cost: School['cost']) => {
    if (cost.isFree) return 'Free';
    return `£${cost.amount.toLocaleString()} per ${cost.period}`;
  };

  // Format competitiveness stars
  const formatCompetitiveness = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  // Format address
  const formatAddress = () => {
    const parts = [school.address, school.postcode, school.borough, school.county];
    return parts.filter(part => part).join(', ');
  };

  // Handle backdrop click
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
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{school.name}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close school details"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* School Type Badge */}
          <div className="school-badges">
            <span 
              className="school-badge school-type-badge"
              style={{ backgroundColor: school.color }}
            >
              {school.schoolType}
            </span>
            <span className="school-badge gender-badge">
              {school.gender}
            </span>
            <span className="school-badge level-badge">
              {school.level}
            </span>
          </div>

          {/* Basic Information */}
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{formatAddress()}</span>
              </div>
              {school.website && (
                <div className="detail-item">
                  <span className="detail-label">Website:</span>
                  <a 
                    href={school.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {school.coordinates && (
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {school.coordinates.lat.toFixed(4)}, {school.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="detail-section">
            <h3 className="section-title">Academic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Cost:</span>
                <span className="detail-value cost-value">
                  {formatCost(school.cost)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Competitiveness:</span>
                <span className="detail-value competitiveness-value">
                  {formatCompetitiveness(school.competitiveness)}
                  <span className="competitiveness-number">({school.competitiveness}/5)</span>
                </span>
              </div>
              {school.ofstedRating && (
                <div className="detail-item">
                  <span className="detail-label">Ofsted Rating:</span>
                  <span className="detail-value ofsted-rating">
                    {school.ofstedRating}
                  </span>
                </div>
              )}
              {school.ranking && (
                <div className="detail-item">
                  <span className="detail-label">Ranking:</span>
                  <span className="detail-value">
                    #{school.ranking.position}
                    {school.ranking.total && ` of ${school.ranking.total}`}
                    {school.ranking.source && (
                      <span className="ranking-source"> ({school.ranking.source})</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(school.boardingOptions || school.religiousAffiliation) && (
            <div className="detail-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="detail-grid">
                {school.boardingOptions && (
                  <div className="detail-item">
                    <span className="detail-label">Boarding:</span>
                    <span className="detail-value">{school.boardingOptions}</span>
                  </div>
                )}
                {school.religiousAffiliation && (
                  <div className="detail-item">
                    <span className="detail-label">Religious Affiliation:</span>
                    <span className="detail-value">{school.religiousAffiliation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transport Information */}
          {school.transport && (
            <div className="detail-section">
              <h3 className="section-title">Transport Links</h3>
              <div className="detail-grid">
                {school.transport.nearestStation && (
                  <div className="detail-item">
                    <span className="detail-label">Nearest Station:</span>
                    <span className="detail-value">{school.transport.nearestStation}</span>
                  </div>
                )}
                {school.transport.walkingTime && (
                  <div className="detail-item">
                    <span className="detail-label">Walking Time:</span>
                    <span className="detail-value">{school.transport.walkingTime}</span>
                  </div>
                )}
                {school.transport.journeyTime && (
                  <div className="detail-item">
                    <span className="detail-label">Journey Time:</span>
                    <span className="detail-value">{school.transport.journeyTime}</span>
                  </div>
                )}
                {school.transport.busRoutes && school.transport.busRoutes.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Bus Routes:</span>
                    <span className="detail-value">
                      {school.transport.busRoutes.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Rates */}
          {school.successRates && school.successRates.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">Success Rates</h3>
              <div className="success-rates">
                {school.successRates.map((rate, index) => (
                  <div key={index} className="success-rate-item">
                    <div className="success-rate-description">{rate.description}</div>
                    {rate.percentage && (
                      <div className="success-rate-percentage">{rate.percentage}%</div>
                    )}
                    {rate.targetSchools && rate.targetSchools.length > 0 && (
                      <div className="success-rate-targets">
                        Target schools: {rate.targetSchools.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admissions Information */}
          {school.admissions && (
            <div className="detail-section">
              <h3 className="section-title">Admissions</h3>
              <div className="detail-grid">
                {school.admissions.catchmentArea && (
                  <div className="detail-item">
                    <span className="detail-label">Catchment Area:</span>
                    <span className="detail-value">{school.admissions.catchmentArea}</span>
                  </div>
                )}
                {school.admissions.catchmentRadius && (
                  <div className="detail-item">
                    <span className="detail-label">Catchment Radius:</span>
                    <span className="detail-value">{school.admissions.catchmentRadius} miles</span>
                  </div>
                )}
                {school.admissions.specialRequirements && (
                  <div className="detail-item">
                    <span className="detail-label">Special Requirements:</span>
                    <span className="detail-value">{school.admissions.specialRequirements}</span>
                  </div>
                )}
                {school.admissions.applicationDeadline && (
                  <div className="detail-item">
                    <span className="detail-label">Application Deadline:</span>
                    <span className="detail-value">{school.admissions.applicationDeadline}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {school.notes && (
            <div className="detail-section">
              <h3 className="section-title">Additional Notes</h3>
              <div className="notes-content">
                {school.notes}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {onAddToFavorites && (
            <button 
              className={`btn ${isFavorite ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => onAddToFavorites(school)}
              disabled={isFavorite}
            >
              {isFavorite ? '⭐ Favorited' : '⭐ Add to Favorites'}
            </button>
          )}
          {onAddToComparison && (
            <button 
              className="btn btn-secondary"
              onClick={() => onAddToComparison(school)}
            >
              ⚖️ Add to Comparison
            </button>
          )}
          {onShareSchool && (
            <button 
              className="btn btn-secondary"
              onClick={() => onShareSchool(school)}
            >
              📤 Share
            </button>
          )}
          {onPrintSchool && (
            <button 
              className="btn btn-secondary"
              onClick={() => onPrintSchool(school)}
            >
              🖨️ Print
            </button>
          )}
          {school.website && (
            <a 
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              🌐 Visit Website
            </a>
          )}
          <button 
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailsModal;