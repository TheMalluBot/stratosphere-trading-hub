
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketOverviewProps {
  marketData: MarketData[];
}

const MarketOverview = ({ marketData }: MarketOverviewProps) => {
  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Indian Markets</CardTitle>
          <CardDescription>Live indices and market status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.slice(0, 2).map((item) => (
              <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-semibold">{item.symbol}</div>
                  <div className="text-2xl font-bold">{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
                  </div>
                  <Badge variant={item.changePercent >= 0 ? "default" : "destructive"} className="mt-1">
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Markets</CardTitle>
          <CardDescription>Major cryptocurrencies on MEXC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.slice(2, 4).map((item) => (
              <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-semibold">{item.symbol}</div>
                  <div className="text-2xl font-bold">{formatCryptoPrice(item.price)}</div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}</span>
                  </div>
                  <Badge variant={item.changePercent >= 0 ? "default" : "destructive"} className="mt-1">
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;
