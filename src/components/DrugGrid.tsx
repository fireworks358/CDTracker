import type { Drug } from '@/types';
import { DrugCard } from './DrugCard';

interface DrugGridProps {
  drugs: Drug[];
  onDrugClick: (drug: Drug) => void;
}

export function DrugGrid({ drugs, onDrugClick }: DrugGridProps) {
  if (drugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <p className="text-lg">No drugs in inventory</p>
        <p className="text-sm mt-2">Add a drug to get started</p>
      </div>
    );
  }

  return (
    <div className="drug-grid">
      {drugs.map((drug) => (
        <DrugCard key={drug.id} drug={drug} onClick={onDrugClick} />
      ))}
    </div>
  );
}
