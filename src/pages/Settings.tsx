import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Key, Shield, Bell, Palette, Wifi, WifiOff } from "lucide-react";
import { SecureApiKeyManager, ApiKeys } from "@/services/secureApiKeyManager";

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
    coinGecko: false
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
      setConnected({
        mexc: !!(apiKeys.mexc.apiKey && apiKeys.mexc.secretKey),
        coinGecko: !!apiKeys.coinGecko.apiKey
      });
      
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
        <TabsList>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          {/* MEXC API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    MEXC API
                    <div className="flex items-center gap-1">
                      {connected.mexc ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-gray-400" />
                      )}
                      {connected.mexc && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Cryptocurrency trading and market data from MEXC exchange
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('mexc')}
                  disabled={testing.mexc || !apiKeys.mexc.apiKey || !apiKeys.mexc.secretKey}
                >
                  {testing.mexc ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mexc-api-key">API Key</Label>
                  <Input
                    id="mexc-api-key"
                    type="password"
                    placeholder="Your MEXC API Key"
                    value={apiKeys.mexc.apiKey}
                    onChange={(e) => handleApiKeyChange('mexc', 'apiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mexc-secret-key">Secret Key</Label>
                  <Input
                    id="mexc-secret-key"
                    type="password"
                    placeholder="Your Secret Key"
                    value={apiKeys.mexc.secretKey}
                    onChange={(e) => handleApiKeyChange('mexc', 'secretKey', e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                <p className="font-medium mb-1">🔒 Enhanced Security:</p>
                <p>• API keys are encrypted with AES-256-GCM before storage</p>
                <p>• Keys are validated before saving</p>
                <p>• Required for real order execution and portfolio tracking</p>
                <p>• Get your API keys from MEXC exchange settings</p>
              </div>
            </CardContent>
          </Card>

          {/* CoinGecko API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    CoinGecko API
                    <div className="flex items-center gap-1">
                      {connected.coinGecko ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-gray-400" />
                      )}
                      {connected.coinGecko && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive cryptocurrency market data and analytics
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('coinGecko')}
                  disabled={testing.coinGecko}
                >
                  {testing.coinGecko ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coingecko-api-key">API Key (Optional)</Label>
                <Input
                  id="coingecko-api-key"
                  type="password"
                  placeholder="Your CoinGecko API Key (Pro)"
                  value={apiKeys.coinGecko.apiKey}
                  onChange={(e) => handleApiKeyChange('coinGecko', 'apiKey', e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Free tier available without API key</p>
                <p>• Pro API key provides higher rate limits</p>
                <p>• Used for market data, trends, and analytics</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save API Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Trade Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when trades are executed</p>
                </div>
                <Switch
                  checked={notifications.trades}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, trades: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alerts when watchlist items hit target prices</p>
                </div>
                <Switch
                  checked={notifications.priceAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, priceAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">System Updates</Label>
                  <p className="text-sm text-muted-foreground">Platform updates and maintenance notifications</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Market News</Label>
                  <p className="text-sm text-muted-foreground">Important market news and events</p>
                </div>
                <Switch
                  checked={notifications.marketNews}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, marketNews: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
