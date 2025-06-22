
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface CustomScreenerProps {
  onResults: (results: any[]) => void;
}

export function CustomScreener({ onResults }: CustomScreenerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Custom Screener
        </CardTitle>
        <CardDescription>
          Create custom screening criteria combining multiple factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Custom screening coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
