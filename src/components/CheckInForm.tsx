import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Drug, CheckInFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CheckInFormProps {
  drug: Drug;
  onSubmit: (data: CheckInFormData) => void;
  onCancel: () => void;
}

export function CheckInForm({ drug, onSubmit, onCancel }: CheckInFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0 && expiryDate) {
      onSubmit({ quantity, expiryDate });
    }
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="quantity" className="text-base font-semibold">
          Quantity
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={decrementQty}
            className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center touch-active"
          >
            <Minus className="h-6 w-6" />
          </button>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-14 text-2xl font-bold text-center"
          />
          <button
            type="button"
            onClick={incrementQty}
            className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center touch-active"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="expiry" className="text-base font-semibold">
          Expiry Date (closest expiry)
        </Label>
        <Input
          id="expiry"
          type="date"
          min={today}
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="mt-2 h-14 text-lg"
          required
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          After check-in: <span className="font-semibold">{drug.stockLevels.available + quantity}</span> available
          ({drug.stockLevels.total + quantity} total)
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
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!expiryDate || quantity < 1}
        >
          Check In
        </Button>
      </div>
    </form>
  );
}
