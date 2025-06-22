
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketOverviewProps {
  marketData: MarketData[];
  loading?: boolean;
  lastUpdate?: Date;
}

const MarketOverview = ({ marketData, loading, lastUpdate }: MarketOverviewProps) => {
  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const majorCryptos = marketData.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cryptocurrency Markets</CardTitle>
            <CardDescription>
              Live prices from CoinGecko and MEXC APIs
              {lastUpdate && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && marketData.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-3 rounded-lg border">
                  <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {majorCryptos.map((crypto) => (
              <div key={crypto.symbol} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-semibold text-lg">{crypto.symbol}</div>
                  <div className="text-xl font-bold">{formatCryptoPrice(crypto.price)}</div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${crypto.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">
                      {crypto.changePercent >= 0 ? '+' : ''}${crypto.change.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant={crypto.changePercent >= 0 ? "default" : "destructive"} className="mt-1">
                    {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {marketData.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No market data available</p>
            <p className="text-xs">Please check your internet connection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
