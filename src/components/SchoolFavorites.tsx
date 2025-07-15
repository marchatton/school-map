import React, { useState, useEffect } from 'react';
import { School } from '../types/School';
import './SchoolFavorites.css';

interface SchoolFavoritesProps {
  favoriteSchools: School[];
  onRemoveFavorite: (schoolId: string) => void;
  onClearAllFavorites: () => void;
  onSchoolSelect: (school: School) => void;
  onAddToComparison?: (school: School) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const SchoolFavorites: React.FC<SchoolFavoritesProps> = ({
  favoriteSchools,
  onRemoveFavorite,
  onClearAllFavorites,
  onSchoolSelect,
  onAddToComparison,
  isVisible,
  onToggleVisibility
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'competitiveness' | 'dateAdded'>('dateAdded');
  const [searchQuery, setSearchQuery] = useState('');

  // Format cost display
  const formatCost = (cost: School['cost']) => {
    if (cost.isFree) return 'Free';
    return `£${cost.amount.toLocaleString()}/${cost.period}`;
  };

  // Format competitiveness
  const formatCompetitiveness = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  // Filter favorites based on search
  const filteredFavorites = favoriteSchools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.postcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort favorites based on selected criteria
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'cost':
        return a.cost.amount - b.cost.amount;
      case 'competitiveness':
        return b.competitiveness - a.competitiveness;
      case 'dateAdded':
        // Most recently added first (assuming they're added to end of array)
        return favoriteSchools.indexOf(b) - favoriteSchools.indexOf(a);
      default:
        return 0;
    }
  });

  // Export favorites to JSON
  const exportFavorites = () => {
    const dataStr = JSON.stringify(favoriteSchools, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `school-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <div className="favorites-toggle-collapsed">
        <button
          className="favorites-toggle-btn"
          onClick={onToggleVisibility}
          title="Show favorites"
        >
          <span className="favorites-icon">⭐</span>
          <span className="favorites-count">{favoriteSchools.length}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="school-favorites">
      <div className="favorites-header">
        <div className="favorites-title">
          <h3>Favorite Schools</h3>
          <span className="favorites-subtitle">
            {favoriteSchools.length} {favoriteSchools.length === 1 ? 'school' : 'schools'} saved
          </span>
        </div>
        <div className="favorites-controls">
          <button
            className="favorites-export-btn"
            onClick={exportFavorites}
            disabled={favoriteSchools.length === 0}
            title="Export favorites"
          >
            📥
          </button>
          <button
            className="favorites-clear-btn"
            onClick={onClearAllFavorites}
            disabled={favoriteSchools.length === 0}
            title="Clear all favorites"
          >
            Clear All
          </button>
          <button
            className="favorites-toggle-btn"
            onClick={onToggleVisibility}
            title="Hide favorites"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="favorites-content">
        {favoriteSchools.length === 0 ? (
          <div className="favorites-empty">
            <div className="empty-icon">⭐</div>
            <div className="empty-text">
              <h4>No favorite schools yet</h4>
              <p>Click the star icon on school markers, search results, or detail modals to save schools here.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="favorites-toolbar">
              <div className="favorites-search">
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="favorites-search-input"
                />
                {searchQuery && (
                  <button
                    className="favorites-search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="favorites-sort"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="cost">Cost Low-High</option>
                <option value="competitiveness">Most Competitive</option>
              </select>
            </div>

            <div className="favorites-list">
              {sortedFavorites.map((school) => (
                <div key={school.id} className="favorite-item">
                  <div className="favorite-main" onClick={() => onSchoolSelect(school)}>
                    <div className="favorite-header">
                      <div className="favorite-name">{school.name}</div>
                      <div className="favorite-type" style={{ backgroundColor: school.color }}>
                        {school.schoolType}
                      </div>
                    </div>
                    
                    <div className="favorite-details">
                      <div className="favorite-info">
                        <span className="favorite-gender">{school.gender}</span>
                        <span className="favorite-separator">•</span>
                        <span className="favorite-level">{school.level}</span>
                      </div>
                      <div className="favorite-location">
                        {school.borough}, {school.county}
                      </div>
                    </div>

                    <div className="favorite-meta">
                      <div className="favorite-cost">{formatCost(school.cost)}</div>
                      <div className="favorite-competitiveness">
                        {formatCompetitiveness(school.competitiveness)}
                      </div>
                    </div>

                    {school.ranking && (
                      <div className="favorite-ranking">
                        Ranked #{school.ranking.position}
                        {school.ranking.source && ` (${school.ranking.source})`}
                      </div>
                    )}
                  </div>

                  <div className="favorite-actions">
                    {onAddToComparison && (
                      <button
                        className="favorite-compare-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToComparison(school);
                        }}
                        title="Add to comparison"
                        aria-label={`Add ${school.name} to comparison`}
                      >
                        ⚖️
                      </button>
                    )}
                    <button
                      className="favorite-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(school.id);
                      }}
                      title="Remove from favorites"
                      aria-label={`Remove ${school.name} from favorites`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {searchQuery && filteredFavorites.length === 0 && (
              <div className="favorites-no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">
                  No favorites match "{searchQuery}"
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolFavorites;