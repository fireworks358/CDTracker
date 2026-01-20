import { useState, useEffect } from 'react';
import { Cloud, CloudOff, CheckCircle2, AlertCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  getJSONBinConfig,
  saveJSONBinConfig,
  clearJSONBinConfig,
  isJSONBinConfigured,
  testJSONBinConnection,
  migrateToJSONBin,
} from '@/lib/jsonbinStorage';

interface StorageSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
  onClearAllLogs: () => void;
}

export function StorageSettings({ isOpen, onClose, onConfigChange, onClearAllLogs }: StorageSettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [binId, setBinId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getJSONBinConfig();
      if (config) {
        setApiKey(config.apiKey);
        setBinId(config.binId);
      }
      setIsConfigured(isJSONBinConfigured());
      setTestResult(null);
      setError(null);
      setShowClearConfirm(false);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    if (!apiKey || !binId) {
      setError('Please enter both API Key and Bin ID');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const success = await testJSONBinConnection(binId, apiKey);
      setTestResult(success ? 'success' : 'error');
      if (!success) {
        setError('Connection failed. Please check your credentials.');
      }
    } catch {
      setTestResult('error');
      setError('Connection failed. Please check your credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey || !binId) {
      setError('Please enter both API Key and Bin ID');
      return;
    }

    setIsTesting(true);
    setError(null);

    try {
      const success = await testJSONBinConnection(binId, apiKey);
      if (success) {
        saveJSONBinConfig({ apiKey, binId });
        setIsConfigured(true);
        onConfigChange();
        onClose();
      } else {
        setError('Could not verify connection. Please check your credentials.');
      }
    } catch {
      setError('Failed to save configuration.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleMigrate = async () => {
    if (!apiKey) {
      setError('Please enter your API Key');
      return;
    }

    setIsMigrating(true);
    setError(null);

    try {
      const newBinId = await migrateToJSONBin(apiKey);
      setBinId(newBinId);
      setIsConfigured(true);
      onConfigChange();
    } catch (err) {
      setError(`Migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDisconnect = () => {
    clearJSONBinConfig();
    setApiKey('');
    setBinId('');
    setIsConfigured(false);
    setTestResult(null);
    setError(null);
    onConfigChange();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isConfigured ? (
              <Cloud className="h-5 w-5 text-green-600" />
            ) : (
              <CloudOff className="h-5 w-5 text-gray-400" />
            )}
            Cloud Storage Settings
          </DialogTitle>
          <DialogDescription>
            Configure JSONBin.io for cloud storage and sync across devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isConfigured && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Connected to JSONBin. Data syncs automatically.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-base font-semibold">
                API Key (X-Master-Key)
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="$2a$10$..."
                className="mt-2 h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a
                  href="https://jsonbin.io/app/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  jsonbin.io <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="binId" className="text-base font-semibold">
                Bin ID
              </Label>
              <Input
                id="binId"
                type="text"
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
                placeholder="Enter existing Bin ID or leave empty to create new"
                className="mt-2 h-12"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {testResult === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">Connection successful!</p>
            </div>
          )}

          <div className="space-y-3">
            {binId && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || isMigrating}
                  className="flex-1"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Test Connection
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isTesting || isMigrating || !apiKey || !binId}
                  className="flex-1"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save & Connect
                </Button>
              </div>
            )}

            {!binId && apiKey && (
              <Button
                type="button"
                onClick={handleMigrate}
                disabled={isMigrating || !apiKey}
                className="w-full"
              >
                {isMigrating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Create New Bin & Migrate Data
              </Button>
            )}

            {isConfigured && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Disconnect from JSONBin
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              JSONBin.io provides free JSON storage with 10,000 requests/month on the free tier.
              Your data is always backed up locally in case of connection issues.
            </p>
          </div>

          {/* Reset Analytics Section */}
          <div className="pt-4 border-t">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Reset Analytics</h3>
            <p className="text-xs text-gray-500 mb-3">
              Clear all transaction history and logs. This will not affect current stock levels.
            </p>
            {showClearConfirm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Are you sure? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      onClearAllLogs();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Logs
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Analytics Data
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
