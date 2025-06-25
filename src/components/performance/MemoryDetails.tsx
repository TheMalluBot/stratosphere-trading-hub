
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MemoryDetailsProps {
  performanceData: any;
}

export const MemoryDetails = ({ performanceData }: MemoryDetailsProps) => {
  return (
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
  );
};
