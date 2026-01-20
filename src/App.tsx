import { useState } from 'react';
import { Plus, Pill, BarChart3, Settings, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import type { Drug } from '@/types';
import { useDrugs } from '@/hooks/useDrugs';
import { DrugGrid } from '@/components/DrugGrid';
import { ActionDrawer } from '@/components/ActionDrawer';
import { AddDrugForm } from '@/components/AddDrugForm';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { StorageSettings } from '@/components/StorageSettings';
import { Button } from '@/components/ui/button';
import { isJSONBinConfigured } from '@/lib/jsonbinStorage';

type View = 'inventory' | 'analytics';

function App() {
  const {
    drugs,
    isLoading,
    isSyncing,
    syncError,
    checkIn,
    checkOut,
    markOOD,
    editDrug,
    adminEdit,
    addDrug,
    clearAllLogs,
    reloadDrugs,
  } = useDrugs();

  const [currentView, setCurrentView] = useState<View>('inventory');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [isAddDrugOpen, setIsAddDrugOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const cloudConfigured = isJSONBinConfigured();

  const handleDrugClick = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsActionDrawerOpen(true);
  };

  const handleCloseActionDrawer = () => {
    setIsActionDrawerOpen(false);
    setSelectedDrug(null);
  };

  // Sort drugs: critical first, then warning, then sufficient
  const sortedDrugs = [...drugs].sort((a, b) => {
    const statusOrder = { critical: 0, warning: 1, sufficient: 2 };
    const aRatio = a.stockLevels.minimumStock > 0
      ? a.stockLevels.available / a.stockLevels.minimumStock
      : 2;
    const bRatio = b.stockLevels.minimumStock > 0
      ? b.stockLevels.available / b.stockLevels.minimumStock
      : 2;

    const aStatus = aRatio < 0.5 ? 'critical' : aRatio < 1 ? 'warning' : 'sufficient';
    const bStatus = bRatio < 0.5 ? 'critical' : bRatio < 1 ? 'warning' : 'sufficient';

    if (statusOrder[aStatus] !== statusOrder[bStatus]) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }

    // Secondary sort by name
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Analytics Dashboard
  if (currentView === 'analytics') {
    return (
      <AnalyticsDashboard
        drugs={drugs}
        onBack={() => setCurrentView('inventory')}
      />
    );
  }

  // Show Inventory View (default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-nhs-blue text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CD Tracker</h1>
                <p className="text-sm text-white/80">Theatre Pharmacy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-1.5 text-white/80">
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : syncError ? (
                  <AlertCircle className="h-4 w-4 text-red-300" />
                ) : cloudConfigured ? (
                  <Cloud className="h-4 w-4 text-green-300" />
                ) : (
                  <CloudOff className="h-4 w-4" />
                )}
              </div>

              <Button
                onClick={() => setIsSettingsOpen(true)}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 active:bg-white/30"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setCurrentView('analytics')}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20 active:bg-white/30"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics
              </Button>
              <Button
                onClick={() => setIsAddDrugOpen(true)}
                size="lg"
                className="bg-white text-nhs-blue hover:bg-white/90 active:bg-white/80"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Drug
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">
                {sortedDrugs.filter(d =>
                  d.stockLevels.minimumStock > 0 &&
                  d.stockLevels.available / d.stockLevels.minimumStock < 0.5
                ).length} Critical
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-600">
                {sortedDrugs.filter(d =>
                  d.stockLevels.minimumStock > 0 &&
                  d.stockLevels.available / d.stockLevels.minimumStock >= 0.5 &&
                  d.stockLevels.available / d.stockLevels.minimumStock < 1
                ).length} Warning
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">
                {sortedDrugs.filter(d =>
                  d.stockLevels.minimumStock === 0 ||
                  d.stockLevels.available / d.stockLevels.minimumStock >= 1
                ).length} OK
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-gray-600">
                {drugs.reduce((sum, d) => sum + d.stockLevels.ood, 0)} OOD
              </span>
            </div>
            <div className="ml-auto text-gray-500">
              {sortedDrugs.length} drugs total
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-8">
        <DrugGrid drugs={sortedDrugs} onDrugClick={handleDrugClick} />
      </main>

      {/* Action Drawer */}
      <ActionDrawer
        drug={selectedDrug}
        isOpen={isActionDrawerOpen}
        onClose={handleCloseActionDrawer}
        onCheckIn={checkIn}
        onCheckOut={checkOut}
        onMarkOOD={markOOD}
        onEdit={editDrug}
        onAdminEdit={adminEdit}
      />

      {/* Add Drug Form */}
      <AddDrugForm
        isOpen={isAddDrugOpen}
        onClose={() => setIsAddDrugOpen(false)}
        onSubmit={addDrug}
      />

      {/* Storage Settings */}
      <StorageSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChange={reloadDrugs}
        onClearAllLogs={clearAllLogs}
      />
    </div>
  );
}

export default App;
