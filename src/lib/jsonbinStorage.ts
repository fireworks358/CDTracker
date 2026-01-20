import type { Drug } from '@/types';
import { sampleDrugs } from '@/data/sampleDrugs';

const JSONBIN_CONFIG_KEY = 'cdtracker_jsonbin_config';
const LOCAL_STORAGE_KEY = 'cdtracker_drugs';

interface JSONBinConfig {
  binId: string;
  apiKey: string;
}

/**
 * Get JSONBin configuration from localStorage
 */
export function getJSONBinConfig(): JSONBinConfig | null {
  try {
    const config = localStorage.getItem(JSONBIN_CONFIG_KEY);
    if (config) {
      return JSON.parse(config) as JSONBinConfig;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save JSONBin configuration to localStorage
 */
export function saveJSONBinConfig(config: JSONBinConfig): void {
  localStorage.setItem(JSONBIN_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Clear JSONBin configuration
 */
export function clearJSONBinConfig(): void {
  localStorage.removeItem(JSONBIN_CONFIG_KEY);
}

/**
 * Check if JSONBin is configured
 */
export function isJSONBinConfigured(): boolean {
  const config = getJSONBinConfig();
  return config !== null && config.binId !== '' && config.apiKey !== '';
}

/**
 * Load drugs from JSONBin
 */
export async function loadDrugsFromJSONBin(): Promise<Drug[]> {
  const config = getJSONBinConfig();

  if (!config) {
    throw new Error('JSONBin not configured');
  }

  const response = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}/latest`, {
    method: 'GET',
    headers: {
      'X-Master-Key': config.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load from JSONBin: ${response.statusText}`);
  }

  const data = await response.json();
  return data.record as Drug[];
}

/**
 * Save drugs to JSONBin
 */
export async function saveDrugsToJSONBin(drugs: Drug[]): Promise<void> {
  const config = getJSONBinConfig();

  if (!config) {
    throw new Error('JSONBin not configured');
  }

  const response = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': config.apiKey,
    },
    body: JSON.stringify(drugs),
  });

  if (!response.ok) {
    throw new Error(`Failed to save to JSONBin: ${response.statusText}`);
  }
}

/**
 * Create a new JSONBin and return the bin ID
 */
export async function createJSONBin(apiKey: string, initialData?: Drug[]): Promise<string> {
  const response = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': apiKey,
      'X-Bin-Name': 'CDTracker-Drugs',
    },
    body: JSON.stringify(initialData || sampleDrugs),
  });

  if (!response.ok) {
    throw new Error(`Failed to create JSONBin: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metadata.id;
}

/**
 * Test JSONBin connection
 */
export async function testJSONBinConnection(binId: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Migrate data from localStorage to JSONBin
 */
export async function migrateToJSONBin(apiKey: string): Promise<string> {
  // Get current data from localStorage
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  const currentDrugs = stored ? JSON.parse(stored) as Drug[] : sampleDrugs;

  // Create new bin with current data
  const binId = await createJSONBin(apiKey, currentDrugs);

  // Save config
  saveJSONBinConfig({ binId, apiKey });

  return binId;
}

/**
 * Load drugs - tries JSONBin first, falls back to localStorage
 */
export async function loadDrugs(): Promise<Drug[]> {
  if (isJSONBinConfigured()) {
    try {
      return await loadDrugsFromJSONBin();
    } catch (error) {
      console.error('Failed to load from JSONBin, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Drug[];
    }
    return sampleDrugs;
  } catch {
    return sampleDrugs;
  }
}

/**
 * Save drugs - saves to JSONBin if configured, always saves to localStorage as backup
 */
export async function saveDrugs(drugs: Drug[]): Promise<void> {
  // Always save to localStorage as backup
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drugs));

  // Also save to JSONBin if configured
  if (isJSONBinConfigured()) {
    try {
      await saveDrugsToJSONBin(drugs);
    } catch (error) {
      console.error('Failed to save to JSONBin:', error);
      throw error;
    }
  }
}
