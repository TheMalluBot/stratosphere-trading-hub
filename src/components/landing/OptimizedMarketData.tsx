
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import type { CryptoMarketData } from '@/hooks/useCryptoData';

interface OptimizedMarketDataProps {
  marketData: CryptoMarketData[];
  loading: boolean;
}

const MarketDataItem = memo(({ crypto }: { crypto: CryptoMarketData }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
    <div>
      <div className="font-semibold text-base md:text-lg">{crypto.symbol}</div>
      <div className="text-lg md:text-xl font-bold">${crypto.price.toLocaleString()}</div>
    </div>
    <Badge 
      variant={crypto.changePercent >= 0 ? "default" : "destructive"}
      className="text-sm px-3 py-1"
    >
      {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
    </Badge>
  </div>
));

MarketDataItem.displayName = 'MarketDataItem';

const MarketDataSkeleton = memo(() => (
  <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="animate-pulse p-4 rounded-lg border">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
));

MarketDataSkeleton.displayName = 'MarketDataSkeleton';

export const OptimizedMarketData: React.FC<OptimizedMarketDataProps> = memo(({
  marketData,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          Live Market Data Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">Educational market data for learning purposes</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <MarketDataSkeleton />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {marketData.slice(0, 6).map((crypto) => (
              <MarketDataItem key={crypto.symbol} crypto={crypto} />
            ))}
          </div>
        )}
        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <Link to="/auth">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Explore Learning Tools
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedMarketData.displayName = 'OptimizedMarketData';
