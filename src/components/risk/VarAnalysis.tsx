
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

export function VarAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Value at Risk Analysis
        </CardTitle>
        <CardDescription>
          Historical, Monte Carlo, and Parametric VaR calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          VaR analysis coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
