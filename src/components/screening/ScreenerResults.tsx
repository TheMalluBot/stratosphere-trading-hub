
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, TrendingDown, Star, Plus } from "lucide-react";

interface ScreenerResultsProps {
  results: any[];
}

export function ScreenerResults({ results }: ScreenerResultsProps) {
  if (results.length === 0) {
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
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run a screening to see results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Screening Results
          <Badge variant="secondary" className="ml-auto">
            {results.length} matches
          </Badge>
        </CardTitle>
        <CardDescription>
          Stocks matching your screening criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((stock, index) => (
          <div key={stock.symbol} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{stock.symbol}</h3>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">${stock.price}</div>
                <div className={`text-sm flex items-center gap-1 ${getChangeColor(stock.change)}`}>
                  {getChangeIcon(stock.change)}
                  {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Screening Score</span>
                <span className={`text-sm font-medium ${getScoreColor(stock.score)}`}>
                  {stock.score}/10
                </span>
              </div>
              <Progress value={stock.score * 10} className="h-2" />
            </div>

            {/* Technical Patterns (if available) */}
            {stock.patterns && stock.patterns.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">Detected Patterns</div>
                <div className="flex flex-wrap gap-1">
                  {stock.patterns.map((pattern: string) => (
                    <Badge key={pattern} variant="secondary" className="text-xs">
                      {pattern.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Metrics (if available) */}
            {(stock.pe || stock.roe || stock.marketCap) && (
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                {stock.marketCap && (
                  <div>
                    <div className="text-muted-foreground">Market Cap</div>
                    <div className="font-medium">{stock.marketCap}</div>
                  </div>
                )}
                {stock.pe && (
                  <div>
                    <div className="text-muted-foreground">P/E Ratio</div>
                    <div className="font-medium">{stock.pe}</div>
                  </div>
                )}
                {stock.roe && (
                  <div>
                    <div className="text-muted-foreground">ROE</div>
                    <div className="font-medium">{stock.roe}%</div>
                  </div>
                )}
                {stock.rsi && (
                  <div>
                    <div className="text-muted-foreground">RSI</div>
                    <div className="font-medium">{stock.rsi}</div>
                  </div>
                )}
              </div>
            )}

            {/* Volume (if available) */}
            {stock.volume && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground">Volume</div>
                <div className="text-sm font-medium">
                  {(stock.volume / 1000000).toFixed(1)}M
                </div>
              </div>
            )}

            {/* Sector (if available) */}
            {stock.sector && (
              <div className="mb-3">
                <Badge variant="outline" className="text-xs">
                  {stock.sector}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" className="flex-1">
                <Plus className="w-3 h-3 mr-1" />
                Add to Watchlist
              </Button>
              <Button size="sm" variant="outline">
                <Star className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {results.length > 0 && (
          <div className="pt-4 border-t text-center">
            <Button variant="outline" size="sm">
              Export Results
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
