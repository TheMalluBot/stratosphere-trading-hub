
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Monitor, Cpu, HardDrive, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  connection: {
    type: string;
    speed: string;
    latency: number;
  };
  renderTime: number;
  bundleSize: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showPerformanceMonitor = process.env.NODE_ENV === 'development' || 
      localStorage.getItem('show_performance_monitor') === 'true';
    
    setIsVisible(showPerformanceMonitor);

    if (!showPerformanceMonitor) return;

    const updateMetrics = () => {
      // Memory usage
      const memory = (performance as any).memory || {};
      const memoryMetrics = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) || 0,
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) || 0,
        percentage: memory.totalJSHeapSize ? 
          Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100) : 0
      };

      // Connection info
      const connection = (navigator as any).connection || {};
      const connectionMetrics = {
        type: connection.effectiveType || 'unknown',
        speed: connection.downlink ? `${connection.downlink} Mbps` : 'unknown',
        latency: connection.rtt || 0
      };

      // Render performance
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const renderTime = navigationTiming ? 
        Math.round(navigationTiming.loadEventEnd - navigationTiming.navigationStart) : 0;

      // Bundle size estimation
      const scripts = Array.from(document.getElementsByTagName('script'));
      const bundleSize = scripts.reduce((total, script) => {
        if (script.src && script.src.includes('/assets/')) {
          // Estimate based on typical bundle sizes
          return total + 500; // KB estimate
        }
        return total;
      }, 0);

      setMetrics({
        memory: memoryMetrics,
        connection: connectionMetrics,
        renderTime,
        bundleSize
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !metrics) return null;

  const getPerformanceStatus = () => {
    if (metrics.memory.percentage > 80 || metrics.renderTime > 3000) {
      return { status: 'poor', color: 'destructive' };
    } else if (metrics.memory.percentage > 60 || metrics.renderTime > 1500) {
      return { status: 'fair', color: 'secondary' };
    } else {
      return { status: 'good', color: 'default' };
    }
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <CardTitle className="text-sm">Performance</CardTitle>
            </div>
            <Badge variant={performanceStatus.color as any}>
              {performanceStatus.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>Memory</span>
              </div>
              <span>{metrics.memory.used}MB / {metrics.memory.total}MB</span>
            </div>
            <Progress value={metrics.memory.percentage} className="h-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Wifi className="w-3 h-3" />
                <span>Connection</span>
              </div>
              <div className="text-muted-foreground">
                <div>{metrics.connection.type.toUpperCase()}</div>
                <div>{metrics.connection.speed}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <HardDrive className="w-3 h-3" />
                <span>Load Time</span>
              </div>
              <div className="text-muted-foreground">
                <div>{metrics.renderTime}ms</div>
                <div>~{metrics.bundleSize}KB</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
