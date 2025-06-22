
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, TrendingDown } from "lucide-react";

export function NewsSentiment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          News Sentiment Analysis
        </CardTitle>
        <CardDescription>
          Real-time market sentiment from news and social media
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          News sentiment analysis coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
