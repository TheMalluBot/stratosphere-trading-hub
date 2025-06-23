
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

interface MarketOverviewProps {
  marketData: MarketData[];
  loading?: boolean;
  lastUpdate?: Date;
  error?: string | null;
  onRefresh?: () => void;
}

const MarketOverview = ({ 
  marketData, 
  loading, 
  lastUpdate, 
  error, 
  onRefresh 
}: MarketOverviewProps) => {
  const [showAll, setShowAll] = useState(false);

  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toFixed(0)}`;
  };

  const displayedData = showAll ? marketData : marketData.slice(0, 6);
  const isDataStale = lastUpdate && (Date.now() - lastUpdate.getTime()) > 60000; // 1 minute

  // Calculate market sentiment
  const positiveCoins = marketData.filter(coin => coin.changePercent > 0).length;
  const totalCoins = marketData.length;
  const marketSentiment = totalCoins > 0 ? (positiveCoins / totalCoins) * 100 : 50;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Cryptocurrency Markets
              <div className="flex items-center gap-1">
                {error ? (
                  <WifiOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Wifi className="w-4 h-4 text-green-500" />
                )}
                <Badge 
                  variant={error ? "destructive" : "outline"} 
                  className={error ? "" : "bg-green-500/10 text-green-500"}
                >
                  {error ? 'OFFLINE' : 'LIVE'}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>Live prices from CoinGecko and MEXC APIs</span>
              {lastUpdate && (
                <span className={`text-xs ${isDataStale ? 'text-red-500' : 'text-muted-foreground'}`}>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                  {isDataStale && " (Stale)"}
                </span>
              )}
              {marketData.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs">Market Sentiment:</span>
                  <Badge 
                    variant="outline" 
                    className={
                      marketSentiment > 60 ? "bg-green-500/10 text-green-500" :
                      marketSentiment < 40 ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    }
                  >
                    {marketSentiment > 60 ? 'Bullish' : marketSentiment < 40 ? 'Bearish' : 'Neutral'} 
                    ({marketSentiment.toFixed(0)}%)
                  </Badge>
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            )}
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        {loading && marketData.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-20 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                      <div className="h-5 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedData.map((crypto) => (
                <div key={crypto.symbol} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{crypto.symbol}</span>
                        <span className="text-xs text-muted-foreground">{crypto.name}</span>
                      </div>
                      <div className="text-xl font-bold">{formatCryptoPrice(crypto.price)}</div>
                      {crypto.volume && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Vol: {formatVolume(crypto.volume)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 mb-1 ${crypto.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {crypto.changePercent >= 0 ? '+' : ''}${crypto.change.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant={crypto.changePercent >= 0 ? "default" : "destructive"}>
                        {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </Badge>
                      {crypto.marketCap && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Cap: {formatMarketCap(crypto.marketCap)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {crypto.high24h && crypto.low24h && (
                    <div className="mt-3 pt-3 border-t border-muted/50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">24h Range</span>
                        <span className="font-mono">
                          {formatCryptoPrice(crypto.low24h)} - {formatCryptoPrice(crypto.high24h)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {marketData.length > 6 && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${marketData.length} Coins`}
                </Button>
              </div>
            )}
          </>
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
