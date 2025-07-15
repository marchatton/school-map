/**
 * Utility functions for managing favorite schools in localStorage
 */

const FAVORITES_STORAGE_KEY = 'school-map-favorites';

export interface FavoriteSchool {
  id: string;
  dateAdded: string;
}

/**
 * Get favorite school IDs from localStorage
 */
export function getFavoriteSchoolIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    
    const favorites: FavoriteSchool[] = JSON.parse(stored);
    return favorites.map(fav => fav.id);
  } catch (error) {
    console.warn('Failed to load favorites from localStorage:', error);
    return [];
  }
}

/**
 * Get full favorite school data from localStorage
 */
export function getFavorites(): FavoriteSchool[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load favorites from localStorage:', error);
    return [];
  }
}

/**
 * Add a school to favorites
 */
export function addToFavorites(schoolId: string): void {
  try {
    const favorites = getFavorites();
    
    // Check if already in favorites
    if (favorites.some(fav => fav.id === schoolId)) {
      return;
    }
    
    // Add new favorite
    favorites.push({
      id: schoolId,
      dateAdded: new Date().toISOString()
    });
    
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to add school to favorites:', error);
  }
}

/**
 * Remove a school from favorites
 */
export function removeFromFavorites(schoolId: string): void {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(fav => fav.id !== schoolId);
    
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to remove school from favorites:', error);
  }
}

/**
 * Check if a school is in favorites
 */
export function isFavorite(schoolId: string): boolean {
  try {
    const favoriteIds = getFavoriteSchoolIds();
    return favoriteIds.includes(schoolId);
  } catch (error) {
    console.warn('Failed to check if school is favorite:', error);
    return false;
  }
}

/**
 * Clear all favorites
 */
export function clearAllFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
}

/**
 * Import favorites from JSON data
 */
export function importFavorites(jsonData: string): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;
  
  try {
    const data = JSON.parse(jsonData);
    
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    const favorites = getFavorites();
    const existingIds = new Set(favorites.map(fav => fav.id));
    
    for (const item of data) {
      try {
        // Validate item structure
        if (typeof item !== 'object' || !item.id) {
          errors.push(`Invalid item structure: missing id`);
          continue;
        }
        
        // Skip if already exists
        if (existingIds.has(item.id)) {
          continue;
        }
        
        // Add to favorites
        favorites.push({
          id: item.id,
          dateAdded: item.dateAdded || new Date().toISOString()
        });
        
        existingIds.add(item.id);
        imported++;
      } catch (error) {
        errors.push(`Failed to import item: ${error}`);
      }
    }
    
    // Save updated favorites
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    
    return { success: true, imported, errors };
  } catch (error) {
    return { 
      success: false, 
      imported: 0, 
      errors: [`Failed to parse JSON: ${error}`] 
    };
  }
}

/**
 * Export favorites as JSON string
 */
export function exportFavorites(): string {
  const favorites = getFavorites();
  return JSON.stringify(favorites, null, 2);
}

/**
 * Get statistics about favorites
 */
export function getFavoritesStats(): {
  total: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  try {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      return { total: 0, oldestDate: null, newestDate: null };
    }
    
    const dates = favorites.map(fav => fav.dateAdded).sort();
    
    return {
      total: favorites.length,
      oldestDate: dates[0],
      newestDate: dates[dates.length - 1]
    };
  } catch (error) {
    console.warn('Failed to get favorites stats:', error);
    return { total: 0, oldestDate: null, newestDate: null };
  }
}