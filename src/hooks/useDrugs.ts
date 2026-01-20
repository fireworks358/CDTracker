import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Drug,
  TransactionLog,
  CheckInFormData,
  CheckOutFormData,
  OODFormData,
  EditDrugFormData,
  AdminEditFormData,
  Presentation,
} from '@/types';
import { loadDrugs, saveDrugs } from '@/lib/jsonbinStorage';
import {
  calculateCheckIn,
  calculateCheckOut,
  calculateOOD,
  calculatePharmacyReturn,
} from '@/lib/stockCalculations';
import { generateId, getISODate } from '@/lib/utils';

export function useDrugs() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Load drugs on mount (async)
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await loadDrugs();
        setDrugs(loaded);
      } catch (error) {
        console.error('Failed to load drugs:', error);
        setSyncError('Failed to load data');
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };
    load();
  }, []);

  // Save drugs whenever they change (async)
  useEffect(() => {
    if (isInitialLoad.current || isLoading) return;

    const save = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        await saveDrugs(drugs);
      } catch (error) {
        console.error('Failed to save drugs:', error);
        setSyncError('Failed to sync data');
      } finally {
        setIsSyncing(false);
      }
    };
    save();
  }, [drugs, isLoading]);

  // Reload drugs (for use after config changes)
  const reloadDrugs = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const loaded = await loadDrugs();
      setDrugs(loaded);
    } catch (error) {
      console.error('Failed to reload drugs:', error);
      setSyncError('Failed to reload data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDrugById = useCallback(
    (id: string): Drug | undefined => {
      return drugs.find((d) => d.id === id);
    },
    [drugs]
  );

  const checkIn = useCallback(
    (drugId: string, data: CheckInFormData): void => {
      setDrugs((prev) =>
        prev.map((drug) => {
          if (drug.id !== drugId) return drug;

          const newLog: TransactionLog = {
            id: generateId(),
            type: 'CHECK_IN',
            quantity: data.quantity,
            expiry: data.expiryDate,
            timestamp: getISODate(),
          };

          return {
            ...drug,
            stockLevels: calculateCheckIn(drug.stockLevels, data.quantity),
            logs: [...drug.logs, newLog],
            updatedAt: getISODate(),
          };
        })
      );
    },
    []
  );

  const checkOut = useCallback(
    (drugId: string, data: CheckOutFormData): void => {
      const isPharmacyReturn = data.location === 'Pharmacy';

      setDrugs((prev) =>
        prev.map((drug) => {
          if (drug.id !== drugId) return drug;

          const newLog: TransactionLog = {
            id: generateId(),
            type: isPharmacyReturn ? 'PHARMACY_RETURN' : 'CHECK_OUT',
            quantity: data.quantity,
            location: data.location,
            timestamp: getISODate(),
          };

          // If checking out to Pharmacy, remove from OOD count
          // Otherwise, remove from Available count
          const newStockLevels = isPharmacyReturn
            ? calculatePharmacyReturn(drug.stockLevels, data.quantity)
            : calculateCheckOut(drug.stockLevels, data.quantity);

          return {
            ...drug,
            stockLevels: newStockLevels,
            logs: [...drug.logs, newLog],
            updatedAt: getISODate(),
          };
        })
      );
    },
    []
  );

  const markOOD = useCallback((drugId: string, data: OODFormData): void => {
    setDrugs((prev) =>
      prev.map((drug) => {
        if (drug.id !== drugId) return drug;

        const newLog: TransactionLog = {
          id: generateId(),
          type: 'OOD',
          quantity: data.quantity,
          timestamp: getISODate(),
        };

        return {
          ...drug,
          stockLevels: calculateOOD(drug.stockLevels, data.quantity),
          logs: [...drug.logs, newLog],
          updatedAt: getISODate(),
        };
      })
    );
  }, []);

  const editDrug = useCallback(
    (drugId: string, data: EditDrugFormData): void => {
      setDrugs((prev) =>
        prev.map((drug) => {
          if (drug.id !== drugId) return drug;

          const newLog: TransactionLog = {
            id: generateId(),
            type: 'EDIT',
            quantity: 0,
            timestamp: getISODate(),
            notes: 'Drug details updated',
          };

          return {
            ...drug,
            name: data.name,
            strength: data.strength,
            presentation: data.presentation,
            stockLevels: {
              ...drug.stockLevels,
              minimumStock: data.minimumStock,
            },
            logs: [...drug.logs, newLog],
            updatedAt: getISODate(),
          };
        })
      );
    },
    []
  );

  const adminEdit = useCallback(
    (drugId: string, data: AdminEditFormData): void => {
      setDrugs((prev) =>
        prev.map((drug) => {
          if (drug.id !== drugId) return drug;

          const changes: string[] = [];
          if (drug.stockLevels.available !== data.available) {
            changes.push(`Available: ${drug.stockLevels.available} → ${data.available}`);
          }
          if (drug.stockLevels.ood !== data.ood) {
            changes.push(`OOD: ${drug.stockLevels.ood} → ${data.ood}`);
          }
          if (drug.name !== data.name) changes.push(`Name changed`);
          if (drug.strength !== data.strength) changes.push(`Strength changed`);
          if (drug.presentation !== data.presentation) changes.push(`Presentation changed`);
          if (drug.stockLevels.minimumStock !== data.minimumStock) {
            changes.push(`Min stock: ${drug.stockLevels.minimumStock} → ${data.minimumStock}`);
          }

          const newLog: TransactionLog = {
            id: generateId(),
            type: 'EDIT',
            quantity: 0,
            timestamp: getISODate(),
            notes: `Admin edit: ${changes.join(', ') || 'No changes'}`,
            previousValue: drug.stockLevels.available,
            newValue: data.available,
          };

          return {
            ...drug,
            name: data.name,
            strength: data.strength,
            presentation: data.presentation,
            stockLevels: {
              total: data.available + data.ood,
              available: data.available,
              ood: data.ood,
              minimumStock: data.minimumStock,
            },
            logs: [...drug.logs, newLog],
            updatedAt: getISODate(),
          };
        })
      );
    },
    []
  );

  const addDrug = useCallback(
    (data: {
      name: string;
      strength: string;
      presentation: Presentation;
      minimumStock: number;
    }): void => {
      const newDrug: Drug = {
        id: generateId(),
        name: data.name,
        strength: data.strength,
        presentation: data.presentation,
        stockLevels: {
          total: 0,
          available: 0,
          ood: 0,
          minimumStock: data.minimumStock,
        },
        logs: [],
        createdAt: getISODate(),
        updatedAt: getISODate(),
      };

      setDrugs((prev) => [...prev, newDrug]);
    },
    []
  );

  const deleteDrug = useCallback((drugId: string): void => {
    setDrugs((prev) => prev.filter((drug) => drug.id !== drugId));
  }, []);

  const clearAllLogs = useCallback((): void => {
    setDrugs((prev) =>
      prev.map((drug) => ({
        ...drug,
        logs: [],
        updatedAt: getISODate(),
      }))
    );
  }, []);

  return {
    drugs,
    isLoading,
    isSyncing,
    syncError,
    getDrugById,
    checkIn,
    checkOut,
    markOOD,
    editDrug,
    adminEdit,
    addDrug,
    deleteDrug,
    clearAllLogs,
    reloadDrugs,
  };
}
