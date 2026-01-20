export type Presentation =
  | 'Ampoule'
  | 'Vial'
  | 'Tablet'
  | 'Capsule'
  | 'Patch'
  | 'Pre-Filled Syringe'
  | 'Powder'
  | 'Bag'
  | 'Other';

export type TransactionType = 'CHECK_IN' | 'CHECK_OUT' | 'OOD' | 'PHARMACY_RETURN' | 'EDIT';

export type StockStatus = 'critical' | 'warning' | 'sufficient';

export interface TransactionLog {
  id: string;
  type: TransactionType;
  quantity: number;
  expiry?: string;       // ISO date for check-ins
  location?: string;     // For check-outs
  timestamp: string;     // ISO datetime
  notes?: string;
  previousValue?: number; // For edit logs
  newValue?: number;      // For edit logs
}

export interface StockLevels {
  total: number;         // Available + OOD
  available: number;     // Currently usable stock
  ood: number;           // Out of date items
  minimumStock: number;  // Minimum threshold for alerts
}

export interface Drug {
  id: string;
  name: string;
  strength: string;
  presentation: Presentation;
  stockLevels: StockLevels;
  logs: TransactionLog[];
  createdAt: string;
  updatedAt: string;
}

// Location options for check-out
export const THEATRE_LOCATIONS = {
  emergency: Array.from({ length: 22 }, (_, i) => `E${i + 1}`),
  day: Array.from({ length: 7 }, (_, i) => `D${i + 1}`),
  other: ['Remote', 'Pharmacy'],
} as const;

export type TheatreLocation =
  | typeof THEATRE_LOCATIONS.emergency[number]
  | typeof THEATRE_LOCATIONS.day[number]
  | typeof THEATRE_LOCATIONS.other[number];

// Form types
export interface CheckInFormData {
  quantity: number;
  expiryDate: string;
}

export interface CheckOutFormData {
  quantity: number;
  location: string;
}

export interface OODFormData {
  quantity: number;
}

export interface EditDrugFormData {
  name: string;
  strength: string;
  presentation: Presentation;
  minimumStock: number;
}

export interface AdminEditFormData {
  name: string;
  strength: string;
  presentation: Presentation;
  minimumStock: number;
  available: number;
  ood: number;
}

// Action types for the modal
export type ActionType = 'checkIn' | 'checkOut' | 'ood' | 'edit' | 'admin' | 'logs' | null;
