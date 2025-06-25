
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface PerformanceOverviewProps {
  performanceData: any;
}

export const PerformanceOverview = ({ performanceData }: PerformanceOverviewProps) => {
  return (
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
  );
};
