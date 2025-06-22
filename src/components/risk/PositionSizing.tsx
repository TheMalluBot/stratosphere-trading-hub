
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export function PositionSizing() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Position Sizing Algorithms
        </CardTitle>
        <CardDescription>
          Kelly Criterion, Fixed Fractional, and volatility-based sizing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Position sizing tools coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
