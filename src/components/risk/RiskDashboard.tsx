
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function RiskDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Risk Dashboard
        </CardTitle>
        <CardDescription>
          Portfolio risk metrics and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Risk dashboard coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
