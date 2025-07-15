import React, { useState } from 'react';
import { School } from '../types/School';
import './SchoolComparison.css';

interface SchoolComparisonProps {
  selectedSchools: School[];
  onRemoveSchool: (schoolId: string) => void;
  onClearAll: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const SchoolComparison: React.FC<SchoolComparisonProps> = ({
  selectedSchools,
  onRemoveSchool,
  onClearAll,
  isVisible,
  onToggleVisibility
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'competitiveness' | 'ranking'>('name');

  // Format cost display
  const formatCost = (cost: School['cost']) => {
    if (cost.isFree) return 'Free';
    return `£${cost.amount.toLocaleString()}/${cost.period}`;
  };

  // Format competitiveness
  const formatCompetitiveness = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  // Sort schools based on selected criteria
  const sortedSchools = [...selectedSchools].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'cost':
        return a.cost.amount - b.cost.amount;
      case 'competitiveness':
        return b.competitiveness - a.competitiveness;
      case 'ranking':
        if (!a.ranking && !b.ranking) return 0;
        if (!a.ranking) return 1;
        if (!b.ranking) return -1;
        return a.ranking.position - b.ranking.position;
      default:
        return 0;
    }
  });

  if (!isVisible) {
    return (
      <div className="comparison-toggle-collapsed">
        <button
          className="comparison-toggle-btn"
          onClick={onToggleVisibility}
          title="Show comparison"
        >
          <span className="comparison-icon">⚖️</span>
          <span className="comparison-count">{selectedSchools.length}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="school-comparison">
      <div className="comparison-header">
        <div className="comparison-title">
          <h3>School Comparison</h3>
          <span className="comparison-subtitle">
            {selectedSchools.length} {selectedSchools.length === 1 ? 'school' : 'schools'} selected
          </span>
        </div>
        <div className="comparison-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="comparison-sort"
          >
            <option value="name">Sort by Name</option>
            <option value="cost">Sort by Cost</option>
            <option value="competitiveness">Sort by Competitiveness</option>
            <option value="ranking">Sort by Ranking</option>
          </select>
          <button
            className="comparison-clear-btn"
            onClick={onClearAll}
            disabled={selectedSchools.length === 0}
            title="Clear all schools"
          >
            Clear All
          </button>
          <button
            className="comparison-toggle-btn"
            onClick={onToggleVisibility}
            title="Hide comparison"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="comparison-content">
        {selectedSchools.length === 0 ? (
          <div className="comparison-empty">
            <div className="empty-icon">⚖️</div>
            <div className="empty-text">
              <h4>No schools selected for comparison</h4>
              <p>Click the "Compare" button on school markers or search results to add schools here.</p>
            </div>
          </div>
        ) : (
          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="comparison-header-cell">School</th>
                  {sortedSchools.map((school) => (
                    <th key={school.id} className="comparison-school-header">
                      <div className="school-header-content">
                        <div className="school-header-name">{school.name}</div>
                        <div className="school-header-type" style={{ backgroundColor: school.color }}>
                          {school.schoolType}
                        </div>
                        <button
                          className="school-remove-btn"
                          onClick={() => onRemoveSchool(school.id)}
                          title={`Remove ${school.name} from comparison`}
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="comparison-row-label">Gender & Level</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      <div>{school.gender}</div>
                      <div className="cell-secondary">{school.level}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="comparison-row-label">Location</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      <div>{school.borough}</div>
                      <div className="cell-secondary">{school.county}</div>
                      <div className="cell-postcode">{school.postcode}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="comparison-row-label">Cost</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      <div className="cost-value">{formatCost(school.cost)}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="comparison-row-label">Competitiveness</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      <div className="competitiveness-stars">
                        {formatCompetitiveness(school.competitiveness)}
                      </div>
                      <div className="cell-secondary">({school.competitiveness}/5)</div>
                    </td>
                  ))}
                </tr>
                {sortedSchools.some(school => school.ranking) && (
                  <tr>
                    <td className="comparison-row-label">Ranking</td>
                    {sortedSchools.map((school) => (
                      <td key={school.id} className="comparison-cell">
                        {school.ranking ? (
                          <div>
                            <div>#{school.ranking.position}</div>
                            {school.ranking.total && (
                              <div className="cell-secondary">of {school.ranking.total}</div>
                            )}
                            {school.ranking.source && (
                              <div className="cell-source">({school.ranking.source})</div>
                            )}
                          </div>
                        ) : (
                          <div className="cell-na">N/A</div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {sortedSchools.some(school => school.ofstedRating) && (
                  <tr>
                    <td className="comparison-row-label">Ofsted Rating</td>
                    {sortedSchools.map((school) => (
                      <td key={school.id} className="comparison-cell">
                        {school.ofstedRating ? (
                          <div className="ofsted-rating">{school.ofstedRating}</div>
                        ) : (
                          <div className="cell-na">N/A</div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {sortedSchools.some(school => school.boardingOptions) && (
                  <tr>
                    <td className="comparison-row-label">Boarding</td>
                    {sortedSchools.map((school) => (
                      <td key={school.id} className="comparison-cell">
                        {school.boardingOptions || <div className="cell-na">N/A</div>}
                      </td>
                    ))}
                  </tr>
                )}
                {sortedSchools.some(school => school.religiousAffiliation) && (
                  <tr>
                    <td className="comparison-row-label">Religious Affiliation</td>
                    {sortedSchools.map((school) => (
                      <td key={school.id} className="comparison-cell">
                        {school.religiousAffiliation || <div className="cell-na">N/A</div>}
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="comparison-row-label">Transport</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      {school.transport?.nearestStation ? (
                        <div>
                          <div>{school.transport.nearestStation}</div>
                          {school.transport.walkingTime && (
                            <div className="cell-secondary">{school.transport.walkingTime}</div>
                          )}
                        </div>
                      ) : (
                        <div className="cell-na">N/A</div>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="comparison-row-label">Website</td>
                  {sortedSchools.map((school) => (
                    <td key={school.id} className="comparison-cell">
                      {school.website ? (
                        <a
                          href={school.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          Visit Site
                        </a>
                      ) : (
                        <div className="cell-na">N/A</div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolComparison;