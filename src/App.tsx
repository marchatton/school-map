import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Map from './components/Map';
import SchoolSearch from './components/SchoolSearch';
import SchoolFilters from './components/SchoolFilters';
import SchoolDetailsModal from './components/SchoolDetailsModal';
import SchoolComparison from './components/SchoolComparison';
import SchoolFavorites from './components/SchoolFavorites';
import SchoolShareModal from './components/SchoolShareModal';
import PrintView from './components/PrintView';
import PrintControls from './components/PrintControls';
import ExportModal from './components/ExportModal';
import PerformanceMonitor from './components/PerformanceMonitor';
import { School, SearchResult, SchoolFilters as Filters } from './types/School';
import { loadSchoolData } from './utils/dataParser';
import { dataValidator } from './utils/dataValidator';
import { filterSchools } from './utils/filterSchools';
import { 
  getFavoriteSchoolIds, 
  addToFavorites, 
  removeFromFavorites, 
  clearAllFavorites,
  isFavorite 
} from './utils/favoritesStorage';
import { usePrint } from './hooks/usePrint';
import { useOptimizedSchoolFilter } from './hooks/usePerformance';

function App() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(true);
  const [modalSchool, setModalSchool] = useState<School | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comparisonSchools, setComparisonSchools] = useState<School[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favoriteSchoolIds, setFavoriteSchoolIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [shareSchool, setShareSchool] = useState<School | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showPrintControls, setShowPrintControls] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Print hook
  const {
    isPrinting,
    printSchools,
    printOptions,
    printSchool,
    printMultipleSchools,
    printFavorites,
    printComparison,
    printSearchResults,
    printFilteredResults,
    cancelPrint,
    updatePrintOptions
  } = usePrint();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load and validate school data
        const { schools: parsedSchools } = await loadSchoolData();
        const validationSummary = await dataValidator.validateSchoolData(parsedSchools);
        
        // Use only valid schools
        const validSchools = validationSummary.validationResults
          .filter(result => result.isValid)
          .map(result => result.school);
        
        setSchools(validSchools);
        
        // Load favorites from localStorage
        setFavoriteSchoolIds(getFavoriteSchoolIds());
        
        if (validSchools.length === 0) {
          setError('No valid schools found in the data');
        }
      } catch (err) {
        setError('Failed to load school data: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSchoolClick = (school: School) => {
    setSelectedSchoolId(school.id);
    setModalSchool(school);
    setIsModalOpen(true);
  };

  const handleSearchResult = (results: SearchResult[]) => {
    setSearchResults(results);
    // Clear previous selection when searching
    if (results.length > 0) {
      setSelectedSchoolId(undefined);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchoolId(school.id);
    // Clear search results to show all schools again
    setSearchResults([]);
    // Open modal for selected school
    setModalSchool(school);
    setIsModalOpen(true);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Clear search when filters change
    setSearchResults([]);
    setSelectedSchoolId(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalSchool(null);
  };

  const handleAddToComparison = (school: School) => {
    if (!comparisonSchools.find(s => s.id === school.id)) {
      setComparisonSchools(prev => [...prev, school]);
      if (!showComparison) {
        setShowComparison(true);
      }
    }
  };

  const handleRemoveFromComparison = (schoolId: string) => {
    setComparisonSchools(prev => prev.filter(s => s.id !== schoolId));
  };

  const handleClearComparison = () => {
    setComparisonSchools([]);
  };

  const handleToggleComparison = () => {
    setShowComparison(!showComparison);
  };

  const handleAddToFavorites = (school: School) => {
    if (!isFavorite(school.id)) {
      addToFavorites(school.id);
      setFavoriteSchoolIds(getFavoriteSchoolIds());
    }
  };

  const handleRemoveFromFavorites = (schoolId: string) => {
    removeFromFavorites(schoolId);
    setFavoriteSchoolIds(getFavoriteSchoolIds());
  };

  const handleClearAllFavorites = () => {
    clearAllFavorites();
    setFavoriteSchoolIds([]);
  };

  const handleToggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const handleShareSchool = (school: School) => {
    setShareSchool(school);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareSchool(null);
  };

  const handleTogglePrintControls = () => {
    setShowPrintControls(!showPrintControls);
  };

  const handlePrintComplete = () => {
    // Called when printing is complete
    console.log('Print completed');
  };

  const handleToggleExportModal = () => {
    setIsExportModalOpen(!isExportModalOpen);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };

  const handleTogglePerformanceMonitor = () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  };

  // Apply filters to schools using optimized filtering
  const filteredSchools = useOptimizedSchoolFilter(schools, filters);

  // Get favorite schools
  const favoriteSchools = useMemo(() => {
    return schools.filter(school => favoriteSchoolIds.includes(school.id));
  }, [schools, favoriteSchoolIds]);

  // Determine which schools to display
  const displaySchools = useMemo(() => {
    if (searchResults.length > 0) {
      // If searching, filter the search results
      return filterSchools(
        searchResults.map(result => result.school),
        filters
      );
    }
    // Otherwise use filtered schools
    return filteredSchools;
  }, [searchResults, filteredSchools, filters]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>School Map - London, Buckinghamshire & Kent</h1>
        <p className="app-subtitle">Interactive map of Grammar, Private & Primary Schools</p>
      </header>
      
      <main className="app-main">
        {loading && (
          <div className="app-loading">
            <div className="loading-spinner"></div>
            <p>Loading school data...</p>
          </div>
        )}
        
        {error && (
          <div className="app-error">
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        
        {!loading && !error && schools.length > 0 && (
          <>
            <div className="app-sidebar">
              <div className="app-controls">
                <div className="app-search">
                  <SchoolSearch
                    schools={filteredSchools}
                    onSearchResult={handleSearchResult}
                    onSchoolSelect={handleSchoolSelect}
                    onAddToComparison={handleAddToComparison}
                    onAddToFavorites={handleAddToFavorites}
                    onShareSchool={handleShareSchool}
                  />
                </div>
                
                <div className="app-stats">
                  <span>
                    {displaySchools.length} of {schools.length} schools
                    {searchResults.length > 0 && ` (${searchResults.length} matching search)`}
                  </span>
                  <div className="app-action-buttons">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={handleTogglePrintControls}
                      title="Print schools"
                    >
                      🖨️ Print
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={handleToggleExportModal}
                      title="Export school data"
                    >
                      📥 Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="app-filters">
                <SchoolFilters
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filters}
                  isExpanded={showFilters}
                  onToggleExpanded={() => setShowFilters(!showFilters)}
                />
              </div>
            </div>
            
            <div className="app-map">
              <Map
                schools={displaySchools}
                onSchoolClick={handleSchoolClick}
                selectedSchoolId={selectedSchoolId}
              />
            </div>
            
            <SchoolDetailsModal
              school={modalSchool}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onAddToComparison={handleAddToComparison}
              onAddToFavorites={handleAddToFavorites}
              onShareSchool={handleShareSchool}
              onPrintSchool={printSchool}
              isFavorite={modalSchool ? isFavorite(modalSchool.id) : false}
            />
            
            <SchoolComparison
              selectedSchools={comparisonSchools}
              onRemoveSchool={handleRemoveFromComparison}
              onClearAll={handleClearComparison}
              isVisible={showComparison}
              onToggleVisibility={handleToggleComparison}
            />
            
            <SchoolFavorites
              favoriteSchools={favoriteSchools}
              onRemoveFavorite={handleRemoveFromFavorites}
              onClearAllFavorites={handleClearAllFavorites}
              onSchoolSelect={handleSchoolSelect}
              onAddToComparison={handleAddToComparison}
              isVisible={showFavorites}
              onToggleVisibility={handleToggleFavorites}
            />
            
            <SchoolShareModal
              school={shareSchool}
              isOpen={isShareModalOpen}
              onClose={handleCloseShareModal}
            />
            
            <PrintControls
              schools={displaySchools}
              onPrint={printMultipleSchools}
              onPrintFavorites={printFavorites}
              onPrintComparison={printComparison}
              favoriteSchools={favoriteSchools}
              comparisonSchools={comparisonSchools}
              searchQuery={searchResults.length > 0 ? 'search results' : undefined}
              filterDescription={Object.keys(filters).length > 0 ? 'filtered schools' : undefined}
              isVisible={showPrintControls}
              onToggleVisibility={handleTogglePrintControls}
            />
            
            <PrintView
              schools={printSchools}
              title={printOptions.title}
              isPrinting={isPrinting}
              onPrintComplete={handlePrintComplete}
            />
            
            <ExportModal
              schools={displaySchools}
              title="School Data Export"
              isOpen={isExportModalOpen}
              onClose={handleCloseExportModal}
            />
            
            {process.env.NODE_ENV === 'development' && (
              <PerformanceMonitor
                isVisible={showPerformanceMonitor}
                onToggle={handleTogglePerformanceMonitor}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;