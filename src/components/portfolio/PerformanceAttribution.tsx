
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export function PerformanceAttribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Performance Attribution
        </CardTitle>
        <CardDescription>
          Sector and strategy performance breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Performance attribution coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
