
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, RefreshCw, Wifi, WifiOff, Database, Server, Clock } from 'lucide-react';

export interface SystemStatusProps {
  connectionStatus: boolean;
  onRefreshStatus: () => void;
}

const SystemStatus = ({ connectionStatus, onRefreshStatus }: SystemStatusProps) => {
  const systemMetrics = {
    uptime: '2h 34m',
    memoryUsage: 68,
    apiLatency: 45,
    wsConnections: connectionStatus ? 3 : 0,
    lastUpdate: new Date().toLocaleTimeString()
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Real-time system health and connectivity
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshStatus}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <div>
                <div className="text-sm font-medium">Connection</div>
                <Badge variant={connectionStatus ? "default" : "destructive"} className="text-xs">
                  {connectionStatus ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Database</div>
                <Badge variant="default" className="text-xs">Healthy</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">API</div>
                <Badge variant="default" className="text-xs">{systemMetrics.apiLatency}ms</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Uptime</div>
                <Badge variant="outline" className="text-xs">{systemMetrics.uptime}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span>{systemMetrics.memoryUsage}%</span>
              </div>
              <Progress value={systemMetrics.memoryUsage} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Last updated: {systemMetrics.lastUpdate}</span>
                <span>WebSocket connections: {systemMetrics.wsConnections}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;
