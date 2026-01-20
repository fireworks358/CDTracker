import { useState } from 'react';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import type { Drug, OODFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OODFormProps {
  drug: Drug;
  onSubmit: (data: OODFormData) => void;
  onCancel: () => void;
}

export function OODForm({ drug, onSubmit, onCancel }: OODFormProps) {
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = drug.stockLevels.available;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0 && quantity <= maxQuantity) {
      onSubmit({ quantity });
    }
  };

  const incrementQty = () => setQuantity((q) => Math.min(maxQuantity, q + 1));
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-orange-800 font-medium">
            Mark items as Out of Date
          </p>
          <p className="text-sm text-orange-700 mt-1">
            These items will be moved from Available to OOD stock. The total count remains the same.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="quantity" className="text-base font-semibold">
          Quantity to mark as OOD (max: {maxQuantity})
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={decrementQty}
            className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center touch-active"
            disabled={quantity <= 1}
          >
            <Minus className="h-6 w-6" />
          </button>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
            }
            className="h-14 text-2xl font-bold text-center"
          />
          <button
            type="button"
            onClick={incrementQty}
            className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center touch-active"
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
        <p className="text-sm text-gray-600">
          After update:
        </p>
        <p className="text-sm text-gray-600">
          • Available: <span className="font-semibold">{drug.stockLevels.available - quantity}</span>
        </p>
        <p className="text-sm text-gray-600">
          • Out of Date: <span className="font-semibold">{drug.stockLevels.ood + quantity}</span>
        </p>
        <p className="text-sm text-gray-600">
          • Total: <span className="font-semibold">{drug.stockLevels.total}</span> (unchanged)
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
          className="flex-1 bg-orange-500 hover:bg-orange-600"
          disabled={quantity < 1}
        >
          Mark as OOD
        </Button>
      </div>
    </form>
  );
}
 