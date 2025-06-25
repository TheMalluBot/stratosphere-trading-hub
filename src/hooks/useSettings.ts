
import { useState, useEffect, useCallback } from 'react';
import { ApiKeyManager } from '@/services/apiKeyManager';
import { toast } from 'sonner';

export interface ApiKeys {
  mexc: {
    apiKey: string;
    secretKey: string;
  };
  coinGecko: {
    apiKey: string;
  };
}

export interface NotificationSettings {
  priceAlerts: boolean;
  orderExecutions: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const useSettings = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    mexc: { apiKey: '', secretKey: '' },
    coinGecko: { apiKey: '' }
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    priceAlerts: true,
    orderExecutions: true,
    systemUpdates: true,
    emailNotifications: false,
    pushNotifications: true
  });
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedKeys = await ApiKeyManager.getApiKeys();
      if (savedKeys) {
        setApiKeys(savedKeys);
        setConnected(true);
      }

      const savedNotifications = localStorage.getItem('notification_settings');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleApiKeyChange = useCallback((provider: 'mexc' | 'coinGecko', field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  }, []);

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      const mexcValid = await ApiKeyManager.testConnection('mexc');
      const coinGeckoValid = await ApiKeyManager.testConnection('coinGecko');
      
      if (mexcValid && coinGeckoValid) {
        setConnected(true);
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed - check your API keys');
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await ApiKeyManager.saveApiKeys(apiKeys);
      localStorage.setItem('notification_settings', JSON.stringify(notifications));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [apiKeys, notifications]);

  const handleNotificationChange = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const refreshSystemStatus = useCallback(async () => {
    await loadSettings();
    await testConnection();
  }, [testConnection]);

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
