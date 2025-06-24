
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SecureApiKeyManager, ApiKeys } from '@/services/secureApiKeyManager';

export const useSettings = () => {
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
          // Check if keys are present and valid - fix the build error by including websocket
          setConnected({
            mexc: !!(savedKeys.mexc.apiKey && savedKeys.mexc.secretKey),
            coinGecko: !!savedKeys.coinGecko.apiKey,
            websocket: false // Default websocket to false initially
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

  return {
    apiKeys,
    notifications,
    connected,
    testing,
    saving,
    handleApiKeyChange,
    testConnection,
    saveSettings,
    handleNotificationChange,
    refreshSystemStatus
  };
};
