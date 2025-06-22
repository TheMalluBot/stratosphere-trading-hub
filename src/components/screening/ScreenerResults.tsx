
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface ScreenerResultsProps {
  results: any[];
}

export function ScreenerResults({ results }: ScreenerResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Screening Results
        </CardTitle>
        <CardDescription>
          Stocks matching your screening criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Run a screening to see results...
        </div>
      </CardContent>
    </Card>
  );
}
