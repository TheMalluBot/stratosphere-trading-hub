import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';
import { useTheme } from '@/context/ThemeContext';

export function PerformanceMonitor() {
  const { theme } = useTheme();
  const metrics = usePerformanceMonitor();
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <p className="text-sm text-muted-foreground">Memory Usage</p>
            <p className="text-2xl font-bold">{metrics.memory} MB</p>
          </div>
          <div className="border rounded p-4">
            <p className="text-sm text-muted-foreground">CPU Load</p>
            <p className="text-2xl font-bold">{metrics.cpu}%</p>
          </div>
          <div className="border rounded p-4">
            <p className="text-sm text-muted-foreground">Network Latency</p>
            <p className="text-2xl font-bold">{metrics.latency}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
