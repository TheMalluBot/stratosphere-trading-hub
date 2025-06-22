
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings as SettingsIcon, Key, Shield, Bell, Palette } from "lucide-react";

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    fyers: { appId: "", accessToken: "", secretKey: "" },
    flattrade: { userId: "", password: "", twoFA: "", vendor: "", apiKey: "", apiSecret: "" },
    mexc: { apiKey: "", secretKey: "" },
    trueData: { apiKey: "", secretKey: "" },
    coinGecko: { apiKey: "" }
  });

  const [notifications, setNotifications] = useState({
    trades: true,
    priceAlerts: true,
    systemUpdates: false,
    marketNews: true
  });

  const [connected, setConnected] = useState({
    fyers: false,
    flattrade: false,
    mexc: false,
    trueData: false,
    coinGecko: false
  });

  const handleApiKeyChange = (provider: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const testConnection = async (provider: string) => {
    toast.loading(`Testing ${provider} connection...`);
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setConnected(prev => ({ ...prev, [provider]: true }));
        toast.success(`${provider} connected successfully!`);
      } else {
        toast.error(`Failed to connect to ${provider}. Please check your credentials.`);
      }
    }, 2000);
  };

  const saveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your trading platform and API connections
          </p>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          {/* Fyers API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Fyers API
                    {connected.fyers && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Indian stock market data and trading through Fyers
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('fyers')}
                  disabled={!apiKeys.fyers.appId || !apiKeys.fyers.accessToken}
                >
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fyers-app-id">App ID</Label>
                  <Input
                    id="fyers-app-id"
                    type="text"
                    placeholder="Your Fyers App ID"
                    value={apiKeys.fyers.appId}
                    onChange={(e) => handleApiKeyChange('fyers', 'appId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fyers-access-token">Access Token</Label>
                  <Input
                    id="fyers-access-token"
                    type="password"
                    placeholder="Your Access Token"
                    value={apiKeys.fyers.accessToken}
                    onChange={(e) => handleApiKeyChange('fyers', 'accessToken', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fyers-secret">Secret Key</Label>
                <Input
                  id="fyers-secret"
                  type="password"
                  placeholder="Your Secret Key"
                  value={apiKeys.fyers.secretKey}
                  onChange={(e) => handleApiKeyChange('fyers', 'secretKey', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* FlatTrade API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    FlatTrade API
                    {connected.flattrade && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Order execution and portfolio management
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('flattrade')}
                  disabled={!apiKeys.flattrade.userId || !apiKeys.flattrade.apiKey}
                >
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flattrade-user-id">User ID</Label>
                  <Input
                    id="flattrade-user-id"
                    type="text"
                    placeholder="Your User ID"
                    value={apiKeys.flattrade.userId}
                    onChange={(e) => handleApiKeyChange('flattrade', 'userId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flattrade-password">Password</Label>
                  <Input
                    id="flattrade-password"
                    type="password"
                    placeholder="Your Password"
                    value={apiKeys.flattrade.password}
                    onChange={(e) => handleApiKeyChange('flattrade', 'password', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flattrade-api-key">API Key</Label>
                  <Input
                    id="flattrade-api-key"
                    type="password"
                    placeholder="Your API Key"
                    value={apiKeys.flattrade.apiKey}
                    onChange={(e) => handleApiKeyChange('flattrade', 'apiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flattrade-api-secret">API Secret</Label>
                  <Input
                    id="flattrade-api-secret"
                    type="password"
                    placeholder="Your API Secret"
                    value={apiKeys.flattrade.apiSecret}
                    onChange={(e) => handleApiKeyChange('flattrade', 'apiSecret', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MEXC API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    MEXC API
                    {connected.mexc && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Cryptocurrency trading and market data
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('mexc')}
                  disabled={!apiKeys.mexc.apiKey || !apiKeys.mexc.secretKey}
                >
                  Test Connection
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
            </CardContent>
          </Card>

          {/* TrueData API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    TrueData API
                    {connected.trueData && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Advanced market analysis and data feeds
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('trueData')}
                  disabled={!apiKeys.trueData.apiKey}
                >
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="truedata-api-key">API Key</Label>
                  <Input
                    id="truedata-api-key"
                    type="password"
                    placeholder="Your TrueData API Key"
                    value={apiKeys.trueData.apiKey}
                    onChange={(e) => handleApiKeyChange('trueData', 'apiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="truedata-secret-key">Secret Key</Label>
                  <Input
                    id="truedata-secret-key"
                    type="password"
                    placeholder="Your Secret Key"
                    value={apiKeys.trueData.secretKey}
                    onChange={(e) => handleApiKeyChange('trueData', 'secretKey', e.target.value)}
                  />
                </div>
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
                    {connected.coinGecko && <Badge variant="default" className="bg-green-500">Connected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Comprehensive cryptocurrency market data
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('coinGecko')}
                  disabled={!apiKeys.coinGecko.apiKey}
                >
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coingecko-api-key">API Key</Label>
                <Input
                  id="coingecko-api-key"
                  type="password"
                  placeholder="Your CoinGecko API Key"
                  value={apiKeys.coinGecko.apiKey}
                  onChange={(e) => handleApiKeyChange('coinGecko', 'apiKey', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              Save API Settings
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and trading permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Security settings will be available after API integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your trading platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Theme customization options coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
