
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TechnicalScreenerProps {
  onResults: (results: any[]) => void;
}

export function TechnicalScreener({ onResults }: TechnicalScreenerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Technical Screener
        </CardTitle>
        <CardDescription>
          Screen stocks based on technical indicators and patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Technical screening coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
