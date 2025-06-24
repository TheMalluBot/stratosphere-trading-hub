
import { Button } from "@/components/ui/button";
import ApiKeySection from "./ApiKeySection";

interface ApiTabProps {
  apiKeys: {
    mexc: { apiKey: string; secretKey: string };
    coinGecko: { apiKey: string };
  };
  connected: {
    mexc: boolean;
    coinGecko: boolean;
    websocket: boolean;
  };
  testing: {
    mexc: boolean;
    coinGecko: boolean;
  };
  saving: boolean;
  onApiKeyChange: (provider: 'mexc' | 'coinGecko', field: string, value: string) => void;
  onTestConnection: (provider: 'mexc' | 'coinGecko') => void;
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
      <ApiKeySection
        provider="mexc"
        title="MEXC API"
        description="Cryptocurrency trading and market data from MEXC exchange"
        apiKey={apiKeys.mexc.apiKey}
        secretKey={apiKeys.mexc.secretKey}
        connected={connected.mexc}
        testing={testing.mexc}
        onApiKeyChange={(field, value) => onApiKeyChange('mexc', field, value)}
        onTestConnection={() => onTestConnection('mexc')}
      />

      <ApiKeySection
        provider="coinGecko"
        title="CoinGecko API"
        description="Comprehensive cryptocurrency market data and analytics"
        apiKey={apiKeys.coinGecko.apiKey}
        connected={connected.coinGecko}
        testing={testing.coinGecko}
        onApiKeyChange={(field, value) => onApiKeyChange('coinGecko', field, value)}
        onTestConnection={() => onTestConnection('coinGecko')}
      />

      <div className="flex justify-end">
        <Button onClick={onSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save API Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ApiTab;
