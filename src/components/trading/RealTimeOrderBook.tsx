
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Loader2 } from "lucide-react";
import { useOrderBook } from "@/hooks/useOrderBook";

interface RealTimeOrderBookProps {
  symbol: string;
}

const RealTimeOrderBook = ({ symbol }: RealTimeOrderBookProps) => {
  const { orderBook, loading } = useOrderBook(symbol);

  if (loading || !orderBook) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Order Book
          </CardTitle>
          <CardDescription>Loading real-time market depth...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const currentPrice = (orderBook.bids[0]?.price + orderBook.asks[0]?.price) / 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Order Book
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">LIVE</Badge>
        </CardTitle>
        <CardDescription>
          Real-time market depth for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Asks (Sell Orders) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Asks</span>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-1">
                <span>Price (USDT)</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.asks.slice(0, 5).reverse().map((ask, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-red-500/10 p-1 rounded transition-colors">
                  <span className="text-red-500 font-mono">${ask.price.toLocaleString()}</span>
                  <span className="text-right font-mono">{ask.quantity}</span>
                  <span className="text-right font-mono">{ask.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Price */}
          <div className="flex items-center justify-center py-2 border rounded-lg bg-muted/50">
            <Badge variant="outline" className="text-lg">
              ${currentPrice.toLocaleString()}
            </Badge>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Bids</span>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-1">
                <span>Price (USDT)</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.bids.slice(0, 5).map((bid, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-green-500/10 p-1 rounded transition-colors">
                  <span className="text-green-500 font-mono">${bid.price.toLocaleString()}</span>
                  <span className="text-right font-mono">{bid.quantity}</span>
                  <span className="text-right font-mono">{bid.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeOrderBook;
