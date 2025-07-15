import { School, SchoolFilters } from '../types/School';

/**
 * Filters schools based on the provided filter criteria
 * @param schools - Array of schools to filter
 * @param filters - Filter criteria to apply
 * @returns Filtered array of schools
 */
export function filterSchools(schools: School[], filters: SchoolFilters): School[] {
  if (!filters || Object.keys(filters).length === 0) {
    return schools;
  }

  return schools.filter(school => {
    // School Type Filter
    if (filters.schoolTypes && filters.schoolTypes.length > 0) {
      if (!filters.schoolTypes.includes(school.schoolType)) {
        return false;
      }
    }

    // Gender Filter
    if (filters.genders && filters.genders.length > 0) {
      if (!filters.genders.includes(school.gender)) {
        return false;
      }
    }

    // Level Filter
    if (filters.levels && filters.levels.length > 0) {
      if (!filters.levels.includes(school.level)) {
        return false;
      }
    }

    // County Filter
    if (filters.counties && filters.counties.length > 0) {
      if (!filters.counties.includes(school.county)) {
        return false;
      }
    }

    // Cost Range Filter
    if (filters.costRange) {
      const cost = school.cost.amount;
      if (filters.costRange.min !== undefined && cost < filters.costRange.min) {
        return false;
      }
      if (filters.costRange.max !== undefined && cost > filters.costRange.max) {
        return false;
      }
    }

    // Competitiveness Filter
    if (filters.competitiveness && filters.competitiveness.length > 0) {
      if (!filters.competitiveness.includes(school.competitiveness)) {
        return false;
      }
    }

    // Ranking Range Filter
    if (filters.rankingRange) {
      // If school has no ranking, exclude it when ranking filter is active
      if (!school.ranking) {
        return false;
      }
      const position = school.ranking.position;
      if (filters.rankingRange.min !== undefined && position < filters.rankingRange.min) {
        return false;
      }
      if (filters.rankingRange.max !== undefined && position > filters.rankingRange.max) {
        return false;
      }
    }

    // Boarding Options Filter
    if (filters.boardingOptions && filters.boardingOptions.length > 0) {
      if (!school.boardingOptions || !filters.boardingOptions.includes(school.boardingOptions)) {
        return false;
      }
    }

    // Religious Affiliation Filter
    if (filters.religiousAffiliation && filters.religiousAffiliation.length > 0) {
      if (!school.religiousAffiliation || 
          !filters.religiousAffiliation.includes(school.religiousAffiliation)) {
        return false;
      }
    }

    // All filters passed
    return true;
  });
}

/**
 * Get a summary of active filters
 * @param filters - Filter criteria
 * @returns Object with filter summary
 */
export function getFilterSummary(filters: SchoolFilters): {
  activeCount: number;
  description: string[];
} {
  const descriptions: string[] = [];
  let activeCount = 0;

  if (filters.schoolTypes && filters.schoolTypes.length > 0) {
    activeCount += filters.schoolTypes.length;
    descriptions.push(`${filters.schoolTypes.length} school type(s)`);
  }

  if (filters.genders && filters.genders.length > 0) {
    activeCount += filters.genders.length;
    descriptions.push(`${filters.genders.join(', ')}`);
  }

  if (filters.levels && filters.levels.length > 0) {
    activeCount += filters.levels.length;
    descriptions.push(`${filters.levels.join(' & ')}`);
  }

  if (filters.counties && filters.counties.length > 0) {
    activeCount += filters.counties.length;
    descriptions.push(`${filters.counties.join(', ')}`);
  }

  if (filters.costRange) {
    activeCount++;
    const min = filters.costRange.min ?? 0;
    const max = filters.costRange.max;
    if (max !== undefined) {
      descriptions.push(`£${min.toLocaleString()}-£${max.toLocaleString()}/year`);
    } else {
      descriptions.push(`£${min.toLocaleString()}+/year`);
    }
  }

  if (filters.competitiveness && filters.competitiveness.length > 0) {
    activeCount += filters.competitiveness.length;
    descriptions.push(`Competitiveness: ${filters.competitiveness.join(', ')}`);
  }

  if (filters.rankingRange) {
    activeCount++;
    const min = filters.rankingRange.min ?? 1;
    const max = filters.rankingRange.max;
    if (max !== undefined) {
      descriptions.push(`Rank ${min}-${max}`);
    } else {
      descriptions.push(`Rank ${min}+`);
    }
  }

  if (filters.boardingOptions && filters.boardingOptions.length > 0) {
    activeCount += filters.boardingOptions.length;
    descriptions.push(filters.boardingOptions.join(', '));
  }

  return { activeCount, description: descriptions };
}