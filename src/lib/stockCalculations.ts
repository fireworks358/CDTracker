import type { Drug, StockStatus, StockLevels } from '@/types';

/**
 * Calculate the stock status based on available vs minimum stock
 * - critical: Available < 50% of minimum
 * - warning: Available < minimum
 * - sufficient: Available >= minimum
 */
export function getStockStatus(stockLevels: StockLevels): StockStatus {
  const { available, minimumStock } = stockLevels;

  if (minimumStock === 0) {
    return 'sufficient';
  }

  const percentage = (available / minimumStock) * 100;

  if (percentage < 50) {
    return 'critical';
  }

  if (percentage < 100) {
    return 'warning';
  }

  return 'sufficient';
}

/**
 * Get the CSS class for the card based on stock status
 */
export function getStockStatusClass(status: StockStatus): string {
  switch (status) {
    case 'critical':
      return 'card-critical';
    case 'warning':
      return 'card-warning';
    case 'sufficient':
      return 'card-sufficient';
  }
}

/**
 * Check if a drug has out-of-date items
 */
export function hasOOD(drug: Drug): boolean {
  return drug.stockLevels.ood > 0;
}

/**
 * Calculate stock after check-in
 */
export function calculateCheckIn(
  currentLevels: StockLevels,
  quantity: number
): StockLevels {
  return {
    ...currentLevels,
    available: currentLevels.available + quantity,
    total: currentLevels.total + quantity,
  };
}

/**
 * Calculate stock after check-out
 */
export function calculateCheckOut(
  currentLevels: StockLevels,
  quantity: number
): StockLevels {
  const newAvailable = Math.max(0, currentLevels.available - quantity);
  return {
    ...currentLevels,
    available: newAvailable,
    total: newAvailable + currentLevels.ood,
  };
}

/**
 * Calculate stock after marking items as out-of-date
 * Note: Total stays the same (Total = Available + OOD)
 */
export function calculateOOD(
  currentLevels: StockLevels,
  quantity: number
): StockLevels {
  const newAvailable = Math.max(0, currentLevels.available - quantity);
  const newOOD = currentLevels.ood + quantity;
  return {
    ...currentLevels,
    available: newAvailable,
    ood: newOOD,
    // Total remains: newAvailable + newOOD = (available - qty) + (ood + qty) = available + ood = total
  };
}

/**
 * Calculate stock after pharmacy return (returning OOD items to pharmacy)
 * Removes from OOD count and total
 */
export function calculatePharmacyReturn(
  currentLevels: StockLevels,
  quantity: number
): StockLevels {
  const newOOD = Math.max(0, currentLevels.ood - quantity);
  return {
    ...currentLevels,
    ood: newOOD,
    total: currentLevels.available + newOOD,
  };
}

/**
 * Get stock percentage for display
 */
export function getStockPercentage(stockLevels: StockLevels): number {
  if (stockLevels.minimumStock === 0) return 100;
  return Math.round((stockLevels.available / stockLevels.minimumStock) * 100);
}
