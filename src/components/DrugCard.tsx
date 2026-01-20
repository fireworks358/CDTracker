import { AlertTriangle } from 'lucide-react';
import type { Drug } from '@/types';
import { getStockStatus, getStockStatusClass, hasOOD } from '@/lib/stockCalculations';
import { cn } from '@/lib/utils';

interface DrugCardProps {
  drug: Drug;
  onClick: (drug: Drug) => void;
}

export function DrugCard({ drug, onClick }: DrugCardProps) {
  const status = getStockStatus(drug.stockLevels);
  const statusClass = getStockStatusClass(status);
  const showOODWarning = hasOOD(drug);

  const { available, total, minimumStock, ood } = drug.stockLevels;

  return (
    <button
      type="button"
      onClick={() => onClick(drug)}
      className={cn(
        'relative w-full text-left rounded-xl p-5 min-h-[140px] touch-active transition-all',
        'flex flex-col justify-between',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        statusClass
      )}
    >
      {/* OOD Warning Badge */}
      {showOODWarning && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <AlertTriangle className="h-3 w-3" />
          <span>{ood} OOD</span>
        </div>
      )}

      {/* Drug Info */}
      <div className="pr-16">
        <h3 className="text-lg font-bold text-gray-900 leading-tight">
          {drug.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {drug.strength} • {drug.presentation}
        </p>
      </div>

      {/* Stock Display */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{available}</span>
            <span className="text-lg text-gray-500">/ {total}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available / Total (Min: {minimumStock})
          </p>
        </div>

        {/* Status Indicator */}
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold uppercase',
          status === 'critical' && 'bg-red-200 text-red-800',
          status === 'warning' && 'bg-yellow-200 text-yellow-800',
          status === 'sufficient' && 'bg-green-200 text-green-800'
        )}>
          {status === 'critical' && 'Low Stock'}
          {status === 'warning' && 'Reorder'}
          {status === 'sufficient' && 'OK'}
        </div>
      </div>
    </button>
  );
}
