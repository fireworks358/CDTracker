import { useState, useEffect } from 'react';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import type { Drug, CheckOutFormData } from '@/types';
import { THEATRE_LOCATIONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CheckOutFormProps {
  drug: Drug;
  onSubmit: (data: CheckOutFormData) => void;
  onCancel: () => void;
}

export function CheckOutForm({ drug, onSubmit, onCancel }: CheckOutFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('');

  const isPharmacyReturn = location === 'Pharmacy';

  // When Pharmacy is selected, max is OOD count; otherwise, max is Available
  const maxQuantity = isPharmacyReturn
    ? drug.stockLevels.ood
    : drug.stockLevels.available;

  // Reset quantity when switching between pharmacy and non-pharmacy
  useEffect(() => {
    setQuantity(Math.min(quantity, maxQuantity) || 1);
  }, [location, maxQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0 && quantity <= maxQuantity && location) {
      onSubmit({ quantity, location });
    }
  };

  const incrementQty = () => setQuantity((q) => Math.min(maxQuantity, q + 1));
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));

  const canSubmit = location && quantity >= 1 && quantity <= maxQuantity && maxQuantity > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Selection First - so user sees pharmacy option */}
      <div>
        <Label className="text-base font-semibold">Location</Label>

        {/* Emergency Theatres */}
        <p className="text-sm text-gray-500 mt-3 mb-2">Emergency Theatres</p>
        <div className="grid grid-cols-6 gap-2">
          {THEATRE_LOCATIONS.emergency.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              data-selected={location === loc}
              className={cn(
                'location-chip text-sm',
                location === loc && 'border-primary bg-primary/10 text-primary'
              )}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Day Surgery */}
        <p className="text-sm text-gray-500 mt-4 mb-2">Day Surgery</p>
        <div className="grid grid-cols-7 gap-2">
          {THEATRE_LOCATIONS.day.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              data-selected={location === loc}
              className={cn(
                'location-chip text-sm',
                location === loc && 'border-primary bg-primary/10 text-primary'
              )}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Other */}
        <p className="text-sm text-gray-500 mt-4 mb-2">Other</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLocation('Remote')}
            data-selected={location === 'Remote'}
            className={cn(
              'location-chip',
              location === 'Remote' && 'border-primary bg-primary/10 text-primary'
            )}
          >
            Remote
          </button>
          <button
            type="button"
            onClick={() => setLocation('Pharmacy')}
            data-selected={location === 'Pharmacy'}
            className={cn(
              'location-chip',
              location === 'Pharmacy' && 'border-orange-500 bg-orange-50 text-orange-700'
            )}
          >
            Pharmacy (OOD Return)
          </button>
        </div>
      </div>

      {/* Pharmacy Return Notice */}
      {isPharmacyReturn && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-800 font-medium">
              Returning Out of Date Stock
            </p>
            <p className="text-sm text-orange-700 mt-1">
              This will remove items from your OOD count. You have {drug.stockLevels.ood} OOD items.
            </p>
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div>
        <Label htmlFor="quantity" className="text-base font-semibold">
          Quantity {isPharmacyReturn ? `(OOD: ${drug.stockLevels.ood})` : `(Available: ${drug.stockLevels.available})`}
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
            disabled={maxQuantity === 0}
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

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        {isPharmacyReturn ? (
          <div className="space-y-1 text-sm text-gray-600">
            <p>After pharmacy return:</p>
            <p>• OOD: <span className="font-semibold">{drug.stockLevels.ood - quantity}</span></p>
            <p>• Total: <span className="font-semibold">{drug.stockLevels.total - quantity}</span></p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            After check-out: <span className="font-semibold">{drug.stockLevels.available - quantity}</span> available
          </p>
        )}
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
          className={cn(
            'flex-1',
            isPharmacyReturn
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
          disabled={!canSubmit}
        >
          {isPharmacyReturn ? 'Return to Pharmacy' : 'Check Out'}
        </Button>
      </div>
    </form>
  );
}
