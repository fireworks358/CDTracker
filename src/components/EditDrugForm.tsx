import { useState } from 'react';
import type { Drug, EditDrugFormData, Presentation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EditDrugFormProps {
  drug: Drug;
  onSubmit: (data: EditDrugFormData) => void;
  onCancel: () => void;
}

const PRESENTATIONS: Presentation[] = [
  'Ampoule',
  'Vial',
  'Tablet',
  'Capsule',
  'Patch',
  'Pre-Filled Syringe',
  'Powder',
  'Bag',
  'Other',
];

export function EditDrugForm({ drug, onSubmit, onCancel }: EditDrugFormProps) {
  const [name, setName] = useState(drug.name);
  const [strength, setStrength] = useState(drug.strength);
  const [presentation, setPresentation] = useState<Presentation>(drug.presentation);
  const [minimumStock, setMinimumStock] = useState(drug.stockLevels.minimumStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && strength.trim()) {
      onSubmit({
        name: name.trim(),
        strength: strength.trim(),
        presentation,
        minimumStock,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-base font-semibold">
          Drug Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 h-14 text-lg"
          required
        />
      </div>

      <div>
        <Label htmlFor="strength" className="text-base font-semibold">
          Strength
        </Label>
        <Input
          id="strength"
          type="text"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
          placeholder="e.g., 10mg/ml"
          className="mt-2 h-14 text-lg"
          required
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Presentation</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {PRESENTATIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPresentation(p)}
              className={cn(
                'location-chip',
                presentation === p && 'border-primary bg-primary/10 text-primary'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="minStock" className="text-base font-semibold">
          Minimum Stock Level
        </Label>
        <Input
          id="minStock"
          type="number"
          min={0}
          value={minimumStock}
          onChange={(e) => setMinimumStock(Math.max(0, parseInt(e.target.value) || 0))}
          className="mt-2 h-14 text-lg"
        />
        <p className="text-sm text-gray-500 mt-1">
          Used to determine stock status alerts
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          disabled={!name.trim() || !strength.trim()}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
