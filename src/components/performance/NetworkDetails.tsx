
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NetworkDetailsProps {
  performanceData: any;
}

export const NetworkDetails = ({ performanceData }: NetworkDetailsProps) => {
  return (
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
  );
};
