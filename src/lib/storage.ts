import type { Drug } from '@/types';
import { sampleDrugs } from '@/data/sampleDrugs';

const STORAGE_KEY = 'cdtracker_drugs';

/**
 * Load drugs from localStorage
 * Seeds with sample data on first load
 */
export function loadDrugs(): Drug[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored) as Drug[];
    }

    // First load - seed with sample data
    saveDrugs(sampleDrugs);
    return sampleDrugs;
  } catch (error) {
    console.error('Error loading drugs from localStorage:', error);
    return sampleDrugs;
  }
}

/**
 * Save drugs to localStorage
 */
export function saveDrugs(drugs: Drug[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drugs));
  } catch (error) {
    console.error('Error saving drugs to localStorage:', error);
  }
}

/**
 * Export all data as JSON string
 */
export function exportData(): string {
  const drugs = loadDrugs();
  return JSON.stringify(drugs, null, 2);
}

/**
 * Import data from JSON string
 */
export function importData(jsonString: string): Drug[] | null {
  try {
    const drugs = JSON.parse(jsonString) as Drug[];

    // Basic validation
    if (!Array.isArray(drugs)) {
      throw new Error('Invalid data format');
    }

    // Validate each drug has required fields
    for (const drug of drugs) {
      if (!drug.id || !drug.name || !drug.stockLevels) {
        throw new Error('Invalid drug data');
      }
    }

    saveDrugs(drugs);
    return drugs;
  } catch (error) {
    console.error('Error importing data:', error);
    return null;
  }
}

/**
 * Clear all data and reset to sample drugs
 */
export function resetData(): Drug[] {
  saveDrugs(sampleDrugs);
  return sampleDrugs;
}
