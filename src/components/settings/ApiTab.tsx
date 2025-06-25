
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Key, TestTube, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ApiTabProps {
  apiKeys: {
    mexc: { apiKey: string; secretKey: string };
    coinGecko: { apiKey: string };
  };
  connected: boolean;
  testing: boolean;
  saving: boolean;
  onApiKeyChange: (provider: 'mexc' | 'coinGecko', field: string, value: string) => void;
  onTestConnection: () => void;
  onSaveSettings: () => void;
}

const ApiTab = ({
  apiKeys,
  connected,
  testing,
  saving,
  onApiKeyChange,
  onTestConnection,
  onSaveSettings
}: ApiTabProps) => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          API keys are stored securely and encrypted. Never share your private keys with anyone.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                MEXC Exchange API
              </CardTitle>
              <CardDescription>
                Connect to MEXC for live trading capabilities
              </CardDescription>
            </div>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mexc-api-key">API Key</Label>
            <Input
              id="mexc-api-key"
              type="password"
              placeholder="Enter your MEXC API key"
              value={apiKeys.mexc.apiKey}
              onChange={(e) => onApiKeyChange('mexc', 'apiKey', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mexc-secret-key">Secret Key</Label>
            <Input
              id="mexc-secret-key"
              type="password"
              placeholder="Enter your MEXC secret key"
              value={apiKeys.mexc.secretKey}
              onChange={(e) => onApiKeyChange('mexc', 'secretKey', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            CoinGecko API
          </CardTitle>
          <CardDescription>
            Enhanced market data and analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coingecko-api-key">API Key (Optional)</Label>
            <Input
              id="coingecko-api-key"
              type="password"
              placeholder="Enter your CoinGecko API key"
              value={apiKeys.coinGecko.apiKey}
              onChange={(e) => onApiKeyChange('coinGecko', 'apiKey', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={onTestConnection}
          disabled={testing || saving}
          variant="outline"
          className="flex items-center gap-2"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4" />
          )}
          Test Connection
        </Button>
        <Button
          onClick={onSaveSettings}
          disabled={saving || testing}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default ApiTab;
