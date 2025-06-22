
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function StressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Stress Testing
        </CardTitle>
        <CardDescription>
          Scenario analysis and portfolio sensitivity testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Stress testing coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
