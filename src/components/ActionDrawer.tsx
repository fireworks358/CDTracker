import { useState } from 'react';
import { PackagePlus, PackageMinus, AlertTriangle, Pencil, History, ShieldAlert } from 'lucide-react';
import type { Drug, ActionType, CheckInFormData, CheckOutFormData, OODFormData, EditDrugFormData, AdminEditFormData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckInForm } from './CheckInForm';
import { CheckOutForm } from './CheckOutForm';
import { OODForm } from './OODForm';
import { EditDrugForm } from './EditDrugForm';
import { AdminEditForm } from './AdminEditForm';
import { LogsView } from './LogsView';

interface ActionDrawerProps {
  drug: Drug | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (drugId: string, data: CheckInFormData) => void;
  onCheckOut: (drugId: string, data: CheckOutFormData) => void;
  onMarkOOD: (drugId: string, data: OODFormData) => void;
  onEdit: (drugId: string, data: EditDrugFormData) => void;
  onAdminEdit: (drugId: string, data: AdminEditFormData) => void;
}

export function ActionDrawer({
  drug,
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  onMarkOOD,
  onEdit,
  onAdminEdit,
}: ActionDrawerProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const handleClose = () => {
    setActiveAction(null);
    onClose();
  };

  const handleActionComplete = () => {
    setActiveAction(null);
    onClose();
  };

  if (!drug) return null;

  const renderActionButtons = () => (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => setActiveAction('checkIn')}
        className="action-btn action-btn-checkin"
      >
        <PackagePlus className="h-8 w-8" />
        <span className="text-lg">Check In</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAction('checkOut')}
        className="action-btn action-btn-checkout"
        disabled={drug.stockLevels.available === 0}
      >
        <PackageMinus className="h-8 w-8" />
        <span className="text-lg">Check Out</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAction('ood')}
        className="action-btn action-btn-ood"
        disabled={drug.stockLevels.available === 0}
      >
        <AlertTriangle className="h-8 w-8" />
        <span className="text-lg">Mark OOD</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAction('edit')}
        className="action-btn action-btn-edit"
      >
        <Pencil className="h-8 w-8" />
        <span className="text-lg">Edit</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAction('admin')}
        className="action-btn col-span-2 bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
      >
        <ShieldAlert className="h-8 w-8" />
        <span className="text-lg">Admin</span>
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeAction) {
      case 'checkIn':
        return (
          <CheckInForm
            drug={drug}
            onSubmit={(data) => {
              onCheckIn(drug.id, data);
              handleActionComplete();
            }}
            onCancel={() => setActiveAction(null)}
          />
        );
      case 'checkOut':
        return (
          <CheckOutForm
            drug={drug}
            onSubmit={(data) => {
              onCheckOut(drug.id, data);
              handleActionComplete();
            }}
            onCancel={() => setActiveAction(null)}
          />
        );
      case 'ood':
        return (
          <OODForm
            drug={drug}
            onSubmit={(data) => {
              onMarkOOD(drug.id, data);
              handleActionComplete();
            }}
            onCancel={() => setActiveAction(null)}
          />
        );
      case 'edit':
        return (
          <EditDrugForm
            drug={drug}
            onSubmit={(data) => {
              onEdit(drug.id, data);
              handleActionComplete();
            }}
            onCancel={() => setActiveAction(null)}
          />
        );
      case 'admin':
        return (
          <AdminEditForm
            drug={drug}
            onSubmit={(data) => {
              onAdminEdit(drug.id, data);
              handleActionComplete();
            }}
            onCancel={() => setActiveAction(null)}
          />
        );
      case 'logs':
        return (
          <LogsView
            drug={drug}
            onBack={() => setActiveAction(null)}
          />
        );
      default:
        return (
          <>
            {renderActionButtons()}
            <button
              type="button"
              onClick={() => setActiveAction('logs')}
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold touch-active"
            >
              <History className="h-5 w-5" />
              <span>View Logs & Trends</span>
            </button>
          </>
        );
    }
  };

  const getDialogTitle = () => {
    switch (activeAction) {
      case 'checkIn':
        return `Check In - ${drug.name}`;
      case 'checkOut':
        return `Check Out - ${drug.name}`;
      case 'ood':
        return `Mark Out of Date - ${drug.name}`;
      case 'edit':
        return `Edit - ${drug.name}`;
      case 'admin':
        return `Admin Edit - ${drug.name}`;
      case 'logs':
        return `Logs & Trends - ${drug.name}`;
      default:
        return drug.name;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
          {!activeAction && (
            <DialogDescription>
              {drug.strength} • {drug.presentation} • Available: {drug.stockLevels.available}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
