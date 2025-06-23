
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Loader2 } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

const PositionTracker = () => {
  const { portfolio, refreshPortfolio, isLoading } = usePortfolio();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Portfolio Positions
            </CardTitle>
            <CardDescription>
              Real-time portfolio tracking and performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={portfolio.totalChange >= 0 ? "default" : "destructive"} 
              className="text-sm"
            >
              {formatCurrency(portfolio.totalChange)} ({formatPercentage(portfolio.totalChangePercent)})
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPortfolio}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Value</div>
              <div className="text-lg font-semibold">{formatCurrency(portfolio.totalValue)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h Change</div>
              <div className={`text-lg font-semibold ${portfolio.totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(portfolio.totalChange)}
              </div>
            </div>
          </div>
        </div>

        {/* Positions List */}
        {portfolio.positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No positions found</p>
            <p className="text-xs">Start trading to see positions here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.positions.map((position) => (
              <div key={position.symbol} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{position.asset}</span>
                    <Badge variant="outline" className="text-xs">
                      {position.symbol}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(position.value)}</div>
                    <div className={`text-xs ${position.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(position.changePercent24h)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Quantity</div>
                    <div className="font-mono">{position.quantity.toFixed(6)} {position.asset}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Price</div>
                    <div className="font-mono">{formatCurrency(position.price)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Free</div>
                    <div className="font-mono text-green-500">{position.free.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Locked</div>
                    <div className="font-mono text-orange-500">{position.locked.toFixed(6)}</div>
                  </div>
                </div>

                {/* P&L Display */}
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">24h P&L</span>
                    <div className={`flex items-center gap-1 ${position.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {position.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="font-mono">{formatCurrency(Math.abs(position.change24h))}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last Update Info */}
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground text-center">
          Last updated: {new Date(portfolio.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionTracker;
