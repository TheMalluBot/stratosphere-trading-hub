
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  threshold: number;
  unit: string;
}

const HealthMonitor = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { name: 'CPU Usage', status: 'healthy', value: 35, threshold: 80, unit: '%' },
    { name: 'Memory Usage', status: 'healthy', value: 62, threshold: 85, unit: '%' },
    { name: 'API Latency', status: 'healthy', value: 45, threshold: 200, unit: 'ms' },
    { name: 'Error Rate', status: 'healthy', value: 0.2, threshold: 5, unit: '%' },
    { name: 'Active Connections', status: 'healthy', value: 12, threshold: 100, unit: '' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 10;
        newValue = Math.max(0, Math.min(newValue, metric.threshold * 1.2));
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (newValue > metric.threshold) {
          status = 'critical';
        } else if (newValue > metric.threshold * 0.8) {
          status = 'warning';
        }

        return { ...metric, value: newValue, status };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const criticalMetrics = metrics.filter(m => m.status === 'critical');
  const warningMetrics = metrics.filter(m => m.status === 'warning');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          System Health Monitor
        </CardTitle>
        <CardDescription>
          Real-time monitoring of system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {criticalMetrics.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Critical issues detected: {criticalMetrics.map(m => m.name).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {warningMetrics.length > 0 && criticalMetrics.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: {warningMetrics.map(m => m.name).join(', ')} approaching limits
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                  <Badge variant={getStatusColor(metric.status) as any} className="text-xs">
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(metric.value / metric.threshold) * 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground text-right">
                Threshold: {metric.threshold}{metric.unit}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>Auto-refresh: 5s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMonitor;
