
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function RiskMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Risk Metrics
        </CardTitle>
        <CardDescription>
          Sharpe ratio, Sortino ratio, and correlation analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Risk metrics coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
