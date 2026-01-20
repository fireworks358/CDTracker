import { useState } from 'react';
import type { Drug, AdminEditFormData, Presentation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

interface AdminEditFormProps {
  drug: Drug;
  onSubmit: (data: AdminEditFormData) => void;
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

export function AdminEditForm({ drug, onSubmit, onCancel }: AdminEditFormProps) {
  const [name, setName] = useState(drug.name);
  const [strength, setStrength] = useState(drug.strength);
  const [presentation, setPresentation] = useState<Presentation>(drug.presentation);
  const [minimumStock, setMinimumStock] = useState(drug.stockLevels.minimumStock);
  const [available, setAvailable] = useState(drug.stockLevels.available);
  const [ood, setOod] = useState(drug.stockLevels.ood);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && strength.trim()) {
      onSubmit({
        name: name.trim(),
        strength: strength.trim(),
        presentation,
        minimumStock,
        available,
        ood,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Admin mode allows direct modification of all values including stock levels.
        </p>
      </div>

      <div>
        <Label htmlFor="admin-name" className="text-base font-semibold">
          Drug Name
        </Label>
        <Input
          id="admin-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 h-14 text-lg"
          required
        />
      </div>

      <div>
        <Label htmlFor="admin-strength" className="text-base font-semibold">
          Strength
        </Label>
        <Input
          id="admin-strength"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="admin-available" className="text-base font-semibold">
            Available Stock
          </Label>
          <Input
            id="admin-available"
            type="number"
            min={0}
            value={available}
            onChange={(e) => setAvailable(Math.max(0, parseInt(e.target.value) || 0))}
            className="mt-2 h-14 text-lg"
          />
        </div>

        <div>
          <Label htmlFor="admin-ood" className="text-base font-semibold">
            OOD Stock
          </Label>
          <Input
            id="admin-ood"
            type="number"
            min={0}
            value={ood}
            onChange={(e) => setOod(Math.max(0, parseInt(e.target.value) || 0))}
            className="mt-2 h-14 text-lg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="admin-minStock" className="text-base font-semibold">
          Minimum Stock Level
        </Label>
        <Input
          id="admin-minStock"
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

      <div className="pt-2 border-t">
        <p className="text-sm text-gray-500 mb-3">
          Total stock will be calculated as: Available ({available}) + OOD ({ood}) = {available + ood}
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
          className="flex-1 bg-amber-600 hover:bg-amber-700"
          disabled={!name.trim() || !strength.trim()}
        >
          Save Admin Changes
        </Button>
      </div>
    </form>
  );
}
