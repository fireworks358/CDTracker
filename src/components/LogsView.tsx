import { ArrowLeft, PackagePlus, PackageMinus, AlertTriangle, Pencil, Building2 } from 'lucide-react';
import type { Drug, TransactionLog } from '@/types';
import { Button } from '@/components/ui/button';
import { StockChart } from './StockChart';
import { formatDateTime } from '@/lib/utils';

interface LogsViewProps {
  drug: Drug;
  onBack: () => void;
}

function getLogIcon(type: TransactionLog['type']) {
  switch (type) {
    case 'CHECK_IN':
      return <PackagePlus className="h-4 w-4 text-green-600" />;
    case 'CHECK_OUT':
      return <PackageMinus className="h-4 w-4 text-blue-600" />;
    case 'OOD':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'PHARMACY_RETURN':
      return <Building2 className="h-4 w-4 text-purple-600" />;
    case 'EDIT':
      return <Pencil className="h-4 w-4 text-gray-500" />;
  }
}

function getLogLabel(type: TransactionLog['type']) {
  switch (type) {
    case 'CHECK_IN':
      return 'Check In';
    case 'CHECK_OUT':
      return 'Check Out';
    case 'OOD':
      return 'Out of Date';
    case 'PHARMACY_RETURN':
      return 'Pharmacy Return';
    case 'EDIT':
      return 'Edit';
  }
}

function getLogDetails(log: TransactionLog) {
  switch (log.type) {
    case 'CHECK_IN':
      return `+${log.quantity} units${log.expiry ? ` (Exp: ${log.expiry})` : ''}`;
    case 'CHECK_OUT':
      return `-${log.quantity} units${log.location ? ` → ${log.location}` : ''}`;
    case 'OOD':
      return `${log.quantity} units marked OOD`;
    case 'PHARMACY_RETURN':
      return `-${log.quantity} OOD units returned to Pharmacy`;
    case 'EDIT':
      return log.notes || 'Details updated';
  }
}

export function LogsView({ drug, onBack }: LogsViewProps) {
  // Sort logs by timestamp, newest first
  const sortedLogs = [...drug.logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Actions
      </Button>

      {/* Stock Chart */}
      <div>
        <h3 className="text-base font-semibold mb-3">Stock Trend</h3>
        <StockChart drug={drug} />
      </div>

      {/* Transaction Log Table */}
      <div>
        <h3 className="text-base font-semibold mb-3">Recent Transactions</h3>
        {sortedLogs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No transactions recorded yet
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Details</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedLogs.map((log) => (
                  <tr key={log.id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.type)}
                        <span>{getLogLabel(log.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getLogDetails(log)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Stock Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-base font-semibold mb-2">Current Stock</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{drug.stockLevels.available}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{drug.stockLevels.ood}</p>
            <p className="text-xs text-gray-500">OOD</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{drug.stockLevels.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{drug.stockLevels.minimumStock}</p>
            <p className="text-xs text-gray-500">Minimum</p>
          </div>
        </div>
      </div>
    </div>
  );
}
