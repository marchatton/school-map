import React, { useEffect } from 'react';
import { School } from '../types/School';
import './PrintView.css';

interface PrintViewProps {
  schools: School[];
  title?: string;
  isPrinting: boolean;
  onPrintComplete?: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({
  schools,
  title = 'School Information',
  isPrinting,
  onPrintComplete
}) => {
  useEffect(() => {
    if (isPrinting && schools.length > 0) {
      // Give browser time to render before printing
      setTimeout(() => {
        window.print();
        onPrintComplete?.();
      }, 500);
    }
  }, [isPrinting, schools, onPrintComplete]);

  if (!isPrinting || schools.length === 0) return null;

  // Format cost display
  const formatCost = (cost: School['cost']) => {
    if (cost.isFree) return 'Free';
    return `£${cost.amount.toLocaleString()} per ${cost.period}`;
  };

  // Format competitiveness
  const formatCompetitiveness = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  // Format date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="print-view">
      <div className="print-header">
        <h1 className="print-title">{title}</h1>
        <div className="print-meta">
          <span>Printed on {formatDate()}</span>
          <span className="print-count">{schools.length} {schools.length === 1 ? 'school' : 'schools'}</span>
        </div>
      </div>

      <div className="print-content">
        {schools.map((school, index) => (
          <div key={school.id} className="print-school-card">
            <div className="print-school-header">
              <h2 className="print-school-name">
                {index + 1}. {school.name}
              </h2>
              <div className="print-school-badges">
                <span className="print-badge" data-type={school.schoolType}>
                  {school.schoolType}
                </span>
                <span className="print-badge">{school.gender}</span>
                <span className="print-badge">{school.level}</span>
              </div>
            </div>

            <div className="print-school-body">
              <div className="print-section">
                <h3 className="print-section-title">Contact Information</h3>
                <div className="print-info-grid">
                  <div className="print-info-item">
                    <strong>Address:</strong>
                    <span>{school.address}, {school.postcode}</span>
                  </div>
                  <div className="print-info-item">
                    <strong>Location:</strong>
                    <span>{school.borough}, {school.county}</span>
                  </div>
                  {school.website && (
                    <div className="print-info-item">
                      <strong>Website:</strong>
                      <span className="print-website">{school.website}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="print-section">
                <h3 className="print-section-title">Academic Information</h3>
                <div className="print-info-grid">
                  <div className="print-info-item">
                    <strong>Cost:</strong>
                    <span className="print-cost">{formatCost(school.cost)}</span>
                  </div>
                  <div className="print-info-item">
                    <strong>Competitiveness:</strong>
                    <span className="print-competitiveness">
                      {formatCompetitiveness(school.competitiveness)} ({school.competitiveness}/5)
                    </span>
                  </div>
                  {school.ofstedRating && (
                    <div className="print-info-item">
                      <strong>Ofsted Rating:</strong>
                      <span className="print-ofsted">{school.ofstedRating}</span>
                    </div>
                  )}
                  {school.ranking && (
                    <div className="print-info-item">
                      <strong>Ranking:</strong>
                      <span>
                        #{school.ranking.position}
                        {school.ranking.total && ` of ${school.ranking.total}`}
                        {school.ranking.source && ` (${school.ranking.source})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(school.boardingOptions || school.religiousAffiliation) && (
                <div className="print-section">
                  <h3 className="print-section-title">Additional Information</h3>
                  <div className="print-info-grid">
                    {school.boardingOptions && (
                      <div className="print-info-item">
                        <strong>Boarding:</strong>
                        <span>{school.boardingOptions}</span>
                      </div>
                    )}
                    {school.religiousAffiliation && (
                      <div className="print-info-item">
                        <strong>Religious Affiliation:</strong>
                        <span>{school.religiousAffiliation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {school.transport && (
                <div className="print-section">
                  <h3 className="print-section-title">Transport Links</h3>
                  <div className="print-info-grid">
                    {school.transport.nearestStation && (
                      <div className="print-info-item">
                        <strong>Nearest Station:</strong>
                        <span>{school.transport.nearestStation}</span>
                      </div>
                    )}
                    {school.transport.walkingTime && (
                      <div className="print-info-item">
                        <strong>Walking Time:</strong>
                        <span>{school.transport.walkingTime}</span>
                      </div>
                    )}
                    {school.transport.journeyTime && (
                      <div className="print-info-item">
                        <strong>Journey Time:</strong>
                        <span>{school.transport.journeyTime}</span>
                      </div>
                    )}
                    {school.transport.busRoutes && school.transport.busRoutes.length > 0 && (
                      <div className="print-info-item">
                        <strong>Bus Routes:</strong>
                        <span>{school.transport.busRoutes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {school.successRates && school.successRates.length > 0 && (
                <div className="print-section">
                  <h3 className="print-section-title">Success Rates</h3>
                  <div className="print-success-rates">
                    {school.successRates.map((rate, idx) => (
                      <div key={idx} className="print-success-rate">
                        <strong>{rate.description}:</strong>
                        {rate.percentage && <span> {rate.percentage}%</span>}
                        {rate.targetSchools && rate.targetSchools.length > 0 && (
                          <div className="print-target-schools">
                            Target schools: {rate.targetSchools.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {school.admissions && (
                <div className="print-section">
                  <h3 className="print-section-title">Admissions</h3>
                  <div className="print-info-grid">
                    {school.admissions.catchmentArea && (
                      <div className="print-info-item">
                        <strong>Catchment Area:</strong>
                        <span>{school.admissions.catchmentArea}</span>
                      </div>
                    )}
                    {school.admissions.catchmentRadius && (
                      <div className="print-info-item">
                        <strong>Catchment Radius:</strong>
                        <span>{school.admissions.catchmentRadius} miles</span>
                      </div>
                    )}
                    {school.admissions.specialRequirements && (
                      <div className="print-info-item">
                        <strong>Special Requirements:</strong>
                        <span>{school.admissions.specialRequirements}</span>
                      </div>
                    )}
                    {school.admissions.applicationDeadline && (
                      <div className="print-info-item">
                        <strong>Application Deadline:</strong>
                        <span>{school.admissions.applicationDeadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {school.notes && (
                <div className="print-section">
                  <h3 className="print-section-title">Additional Notes</h3>
                  <div className="print-notes">{school.notes}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="print-footer">
        <div className="print-footer-content">
          <span>School Map - London, Buckinghamshire & Kent</span>
          <span>Page <span className="print-page-number"></span></span>
        </div>
      </div>
    </div>
  );
};

export default PrintView;