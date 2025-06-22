
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export function BenchmarkAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Benchmark Analysis
        </CardTitle>
        <CardDescription>
          Beta calculation and tracking error measurement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Benchmark analysis coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
