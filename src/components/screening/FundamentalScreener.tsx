
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface FundamentalScreenerProps {
  onResults: (results: any[]) => void;
}

export function FundamentalScreener({ onResults }: FundamentalScreenerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Fundamental Screener
        </CardTitle>
        <CardDescription>
          Screen stocks based on financial metrics and ratios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Fundamental screening coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
