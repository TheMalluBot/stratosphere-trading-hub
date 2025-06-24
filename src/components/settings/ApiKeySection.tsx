
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Wifi, WifiOff, Eye, EyeOff, TestTube } from 'lucide-react';

interface ApiKeySectionProps {
  provider: 'mexc' | 'coinGecko';
  title: string;
  description: string;
  apiKey: string;
  secretKey?: string;
  connected: boolean;
  testing: boolean;
  onApiKeyChange: (field: string, value: string) => void;
  onTestConnection: () => void;
}

const ApiKeySection = ({
  provider,
  title,
  description,
  apiKey,
  secretKey,
  connected,
  testing,
  onApiKeyChange,
  onTestConnection
}: ApiKeySectionProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {title}
              <div className="flex items-center gap-1">
                {connected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
                {connected && <Badge variant="default" className="bg-green-500">Connected</Badge>}
              </div>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={onTestConnection}
            disabled={testing || !apiKey || (provider === 'mexc' && !secretKey)}
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${provider}-api-key`}>API Key</Label>
            <div className="relative">
              <Input
                id={`${provider}-api-key`}
                type={showApiKey ? "text" : "password"}
                placeholder="Your API Key"
                value={apiKey}
                onChange={(e) => onApiKeyChange('apiKey', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {provider === 'mexc' && (
            <div className="space-y-2">
              <Label htmlFor={`${provider}-secret-key`}>Secret Key</Label>
              <div className="relative">
                <Input
                  id={`${provider}-secret-key`}
                  type={showSecretKey ? "text" : "password"}
                  placeholder="Your Secret Key"
                  value={secretKey || ''}
                  onChange={(e) => onApiKeyChange('secretKey', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
          <p className="font-medium mb-1">🔒 Security Features:</p>
          <ul className="space-y-1 text-xs">
            <li>• Keys are encrypted with AES-256-GCM before storage</li>
            <li>• Automatic validation before saving</li>
            <li>• Secure connection testing</li>
            {provider === 'mexc' && <li>• Required for live trading execution</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeySection;
