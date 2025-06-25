import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap
} from 'lucide-react';
import { memoryManager } from '@/lib/performance/MemoryManager';
import { bundleOptimizer } from '@/lib/performance/BundleOptimizer';
import { optimizedWsService } from '@/services/optimizedWebSocketService';
import { PerformanceOverview } from './PerformanceOverview';
import { MemoryDetails } from './MemoryDetails';
import { NetworkDetails } from './NetworkDetails';

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
      await bundleOptimizer.preloadCriticalComponents();
      bundleOptimizer.clearUnusedResources();
      
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
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerformanceOverview performanceData={performanceData} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <MemoryDetails performanceData={performanceData} />
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <NetworkDetails performanceData={performanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
