import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Key, Bell, Activity } from "lucide-react";
import { SecureApiKeyManager, ApiKeys } from "@/services/secureApiKeyManager";
import ApiKeySection from "@/components/settings/ApiKeySection";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SystemStatus from "@/components/settings/SystemStatus";

const Settings = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    mexc: { apiKey: "", secretKey: "" },
    coinGecko: { apiKey: "" }
  });

  const [notifications, setNotifications] = useState({
    trades: true,
    priceAlerts: true,
    systemUpdates: false,
    marketNews: true
  });

  const [connected, setConnected] = useState({
    mexc: false,
    coinGecko: false,
    websocket: false
  });

  const [testing, setTesting] = useState({
    mexc: false,
    coinGecko: false
  });

  const [saving, setSaving] = useState(false);

  // Load saved API keys on mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const savedKeys = await SecureApiKeyManager.getApiKeys();
        if (savedKeys) {
          setApiKeys(savedKeys);
          // Check if keys are present and valid
          setConnected({
            mexc: !!(savedKeys.mexc.apiKey && savedKeys.mexc.secretKey),
            coinGecko: !!savedKeys.coinGecko.apiKey
          });
        }
      } catch (error) {
        console.error('Failed to load API keys:', error);
        toast.error('Failed to load saved settings');
      }
    };

    loadApiKeys();
  }, []);

  const handleApiKeyChange = (provider: 'mexc' | 'coinGecko', field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const testConnection = async (provider: 'mexc' | 'coinGecko') => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    toast.loading(`Testing ${provider.toUpperCase()} connection...`);
    
    try {
      const isConnected = await SecureApiKeyManager.testConnection(provider);
      
      if (isConnected) {
        setConnected(prev => ({ ...prev, [provider]: true }));
        toast.success(`${provider.toUpperCase()} connected successfully!`);
      } else {
        setConnected(prev => ({ ...prev, [provider]: false }));
        toast.error(`Failed to connect to ${provider.toUpperCase()}. Please check your credentials.`);
      }
    } catch (error) {
      console.error(`${provider} connection test failed:`, error);
      setConnected(prev => ({ ...prev, [provider]: false }));
      toast.error(`${provider.toUpperCase()} connection test failed.`);
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await SecureApiKeyManager.saveApiKeys(apiKeys);
      
      // Update connection status
      setConnected(prev => ({
        ...prev,
        mexc: !!(apiKeys.mexc.apiKey && apiKeys.mexc.secretKey),
        coinGecko: !!apiKeys.coinGecko.apiKey
      }));
      
      toast.success("Settings saved successfully!");
      
      // Reload the page to reinitialize services with new keys
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const refreshSystemStatus = async () => {
    // Check all connections
    const mexcStatus = await SecureApiKeyManager.testConnection('mexc');
    const coinGeckoStatus = await SecureApiKeyManager.testConnection('coinGecko');
    
    setConnected(prev => ({
      mexc: mexcStatus,
      coinGecko: coinGeckoStatus,
      websocket: true // Assume websocket is working for now
    }));
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your crypto trading platform and API connections
          </p>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <ApiKeySection
            provider="mexc"
            title="MEXC API"
            description="Cryptocurrency trading and market data from MEXC exchange"
            apiKey={apiKeys.mexc.apiKey}
            secretKey={apiKeys.mexc.secretKey}
            connected={connected.mexc}
            testing={testing.mexc}
            onApiKeyChange={(field, value) => handleApiKeyChange('mexc', field, value)}
            onTestConnection={() => testConnection('mexc')}
          />

          <ApiKeySection
            provider="coinGecko"
            title="CoinGecko API"
            description="Comprehensive cryptocurrency market data and analytics"
            apiKey={apiKeys.coinGecko.apiKey}
            connected={connected.coinGecko}
            testing={testing.coinGecko}
            onApiKeyChange={(field, value) => handleApiKeyChange('coinGecko', field, value)}
            onTestConnection={() => testConnection('coinGecko')}
          />

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save API Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            notifications={notifications}
            onNotificationChange={handleNotificationChange}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemStatus
            connectionStatus={connected}
            onRefreshStatus={refreshSystemStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
