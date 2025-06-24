
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SystemStatusProps {
  connectionStatus: {
    mexc: boolean;
    coinGecko: boolean;
    websocket: boolean;
  };
  onRefreshStatus: () => void;
}

const SystemStatus = ({ connectionStatus, onRefreshStatus }: SystemStatusProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshStatus();
    setLastCheck(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allConnected = Object.values(connectionStatus).every(status => status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
            <Badge variant={allConnected ? "default" : "destructive"}>
              {allConnected ? "All Systems Operational" : "Service Issues"}
            </Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus.mexc ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">MEXC Exchange</p>
                <p className="text-sm text-muted-foreground">Trading & market data</p>
              </div>
            </div>
            <Badge variant={connectionStatus.mexc ? "default" : "destructive"}>
              {connectionStatus.mexc ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus.coinGecko ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">CoinGecko API</p>
                <p className="text-sm text-muted-foreground">Market analytics</p>
              </div>
            </div>
            <Badge variant={connectionStatus.coinGecko ? "default" : "destructive"}>
              {connectionStatus.coinGecko ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus.websocket ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Real-time Data</p>
                <p className="text-sm text-muted-foreground">Live price feeds</p>
              </div>
            </div>
            <Badge variant={connectionStatus.websocket ? "default" : "destructive"}>
              {connectionStatus.websocket ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        {!allConnected && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-600">Service Issues Detected</p>
              <p className="text-yellow-600 mt-1">
                Some services are not responding. Check your API keys and internet connection.
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
