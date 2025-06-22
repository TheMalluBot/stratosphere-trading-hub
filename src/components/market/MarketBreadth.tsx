
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export function MarketBreadth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Market Breadth Analysis
        </CardTitle>
        <CardDescription>
          Advance/decline ratios and market participation metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Market breadth analysis coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
