
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { memoryManager } from '@/lib/performance/MemoryManager';
import { bundleOptimizer } from '@/lib/performance/BundleOptimizer';
import { optimizedWsService } from '@/services/optimizedWebSocketService';

const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const updatePerformanceData = () => {
      const memoryStats = memoryManager.getMemoryStats();
      const bundleStats = bundleOptimizer.getLoadingStats();
      const wsStats = optimizedWsService.getPerformanceStats();
      const connectionStatus = optimizedWsService.getConnectionStatus();

      setPerformanceData({
        memory: memoryStats,
        bundle: bundleStats,
        websocket: wsStats,
        connection: connectionStatus,
        timestamp: Date.now()
      });
    };

    updatePerformanceData();
    const interval = setInterval(updatePerformanceData, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // Trigger optimizations
      await bundleOptimizer.preloadCriticalComponents();
      bundleOptimizer.clearUnusedResources();
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      console.log('🚀 Performance optimization completed');
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Loading performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceStatus = () => {
    const memoryUsage = performanceData.memory?.percentage || 0;
    if (memoryUsage > 80) return { status: 'critical', color: 'destructive', icon: AlertCircle };
    if (memoryUsage > 60) return { status: 'warning', color: 'secondary', icon: TrendingUp };
    return { status: 'good', color: 'default', icon: TrendingDown };
  };

  const performanceStatus = getPerformanceStatus();
  const StatusIcon = performanceStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time system performance monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={performanceStatus.color as any} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {performanceStatus.status.toUpperCase()}
          </Badge>
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            size="sm"
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="bundle">Bundle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.memory?.percentage || 0}%
                </div>
                <Progress 
                  value={performanceData.memory?.percentage || 0} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {performanceData.memory?.used || 0}MB / {performanceData.memory?.total || 0}MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WebSocket</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.connection?.state || 'Unknown'}
                </div>
                <p className="text-xs text-muted-foreference mt-1">
                  Queue: {performanceData.websocket?.messageQueue || 0}
                </p>
                <p className="text-xs text-muted-foreference">
                  Subscribers: {performanceData.websocket?.subscribers || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bundle</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.bundle?.cachedComponents || 0}
                </div>
                <p className="text-xs text-muted-foreference mt-1">
                  Cached Components
                </p>
                <p className="text-xs text-muted-foreference">
                  Preloaded: {performanceData.bundle?.preloadedComponents || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cleanup Tasks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.memory?.cleanupTasks || 0}
                </div>
                <p className="text-xs text-muted-foreference mt-1">
                  Active Tasks
                </p>
                <p className="text-xs text-muted-foreference">
                  Observers: {performanceData.memory?.observers || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Management</CardTitle>
              <CardDescription>Detailed memory usage and cleanup statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used Memory</span>
                  <span>{performanceData.memory?.used || 0}MB</span>
                </div>
                <Progress value={performanceData.memory?.percentage || 0} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Memory</div>
                  <div className="text-muted-foreground">{performanceData.memory?.total || 0}MB</div>
                </div>
                <div>
                  <div className="font-medium">Memory Limit</div>
                  <div className="text-muted-foreground">{performanceData.memory?.limit || 0}MB</div>
                </div>
                <div>
                  <div className="font-medium">Event Listeners</div>
                  <div className="text-muted-foreground">{performanceData.memory?.eventListeners || 0}</div>
                </div>
                <div>
                  <div className="font-medium">Observers</div>
                  <div className="text-muted-foreground">{performanceData.memory?.observers || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance</CardTitle>
              <CardDescription>WebSocket connection and data flow statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Connection State</div>
                  <Badge variant={performanceData.connection?.state === 'connected' ? 'default' : 'secondary'}>
                    {performanceData.connection?.state || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium">Reconnect Attempts</div>
                  <div className="text-muted-foreground">{performanceData.connection?.reconnectAttempts || 0}</div>
                </div>
                <div>
                  <div className="font-medium">Message Queue</div>
                  <div className="text-muted-foreground">{performanceData.websocket?.messageQueue || 0}</div>
                </div>
                <div>
                  <div className="font-medium">Pending Batch</div>
                  <div className="text-muted-foreground">{performanceData.websocket?.pendingBatch || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Optimization</CardTitle>
              <CardDescription>Component loading and caching statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Cached Components</div>
                  <div className="text-muted-foreground">{performanceData.bundle?.cachedComponents || 0}</div>
                </div>
                <div>
                  <div className="font-medium">Preloaded Components</div>
                  <div className="text-muted-foreground">{performanceData.bundle?.preloadedComponents || 0}</div>
                </div>
                <div>
                  <div className="font-medium">Critical Resources</div>
                  <Badge variant={performanceData.bundle?.criticalResourcesLoaded ? 'default' : 'secondary'}>
                    {performanceData.bundle?.criticalResourcesLoaded ? 'Loaded' : 'Loading'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
