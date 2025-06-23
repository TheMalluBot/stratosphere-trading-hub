
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number;
  summary: string;
}

export const NewsSentiment = () => {
  // Mock news data
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin ETF Sees Record Inflows Amid Institutional Adoption',
      source: 'CoinDesk',
      time: '2 hours ago',
      sentiment: 'positive',
      impact: 85,
      summary: 'Major financial institutions continue to show strong interest in Bitcoin ETFs...'
    },
    {
      id: '2',
      title: 'Regulatory Uncertainty Clouds Cryptocurrency Market Outlook',
      source: 'Bloomberg',
      time: '4 hours ago',
      sentiment: 'negative',
      impact: 72,
      summary: 'New regulatory proposals could impact cryptocurrency trading and adoption...'
    },
    {
      id: '3',
      title: 'Ethereum Network Upgrade Shows Promising Results',
      source: 'The Block',
      time: '6 hours ago',
      sentiment: 'positive',
      impact: 68,
      summary: 'Recent network improvements demonstrate enhanced scalability and efficiency...'
    },
    {
      id: '4',
      title: 'Market Analysis: Consolidation Phase Expected to Continue',
      source: 'Cointelegraph',
      time: '8 hours ago',
      sentiment: 'neutral',
      impact: 45,
      summary: 'Technical analysis suggests current market conditions favor sideways movement...'
    }
  ];

  const overallSentiment = {
    positive: 45,
    negative: 25,
    neutral: 30
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'neutral': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Market Sentiment Analysis
          </CardTitle>
          <CardDescription>
            AI-powered sentiment analysis of cryptocurrency news and social media
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Positive</span>
              <span className="text-sm text-green-500">{overallSentiment.positive}%</span>
            </div>
            <Progress value={overallSentiment.positive} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Negative</span>
              <span className="text-sm text-red-500">{overallSentiment.negative}%</span>
            </div>
            <Progress value={overallSentiment.negative} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Neutral</span>
              <span className="text-sm text-gray-500">{overallSentiment.neutral}%</span>
            </div>
            <Progress value={overallSentiment.neutral} className="h-2" />
          </div>
          
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Overall Sentiment: Bullish</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Market sentiment remains positive with strong institutional interest
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Market News</CardTitle>
          <CardDescription>
            Recent news articles with sentiment analysis and market impact scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSentimentIcon(item.sentiment)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                      <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                        {item.sentiment}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Market Impact:</span>
                      <Progress value={item.impact} className="h-1 w-20" />
                      <span className="text-xs text-muted-foreground">{item.impact}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
