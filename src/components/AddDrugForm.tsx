import { useState } from 'react';
import type { Presentation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AddDrugFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    strength: string;
    presentation: Presentation;
    minimumStock: number;
  }) => void;
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

export function AddDrugForm({ isOpen, onClose, onSubmit }: AddDrugFormProps) {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [presentation, setPresentation] = useState<Presentation>('Ampoule');
  const [minimumStock, setMinimumStock] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && strength.trim()) {
      onSubmit({
        name: name.trim(),
        strength: strength.trim(),
        presentation,
        minimumStock,
      });
      // Reset form
      setName('');
      setStrength('');
      setPresentation('Ampoule');
      setMinimumStock(10);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setStrength('');
    setPresentation('Ampoule');
    setMinimumStock(10);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Drug</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Drug Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morphine Sulphate"
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
              onClick={handleClose}
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
              Add Drug
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
