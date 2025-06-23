
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, Wifi, WifiOff } from "lucide-react";
import { useOrderBook } from "@/hooks/useOrderBook";

interface OrderBookProps {
  symbol?: string;
}

const OrderBook = ({ symbol = "BTCUSDT" }: OrderBookProps) => {
  const { orderBook, loading } = useOrderBook(symbol);

  if (loading || !orderBook) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Order Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading order book...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxTotal = Math.max(
    Math.max(...orderBook.bids.map(b => b.total)),
    Math.max(...orderBook.asks.map(a => a.total))
  );

  const currentPrice = orderBook.bids.length > 0 && orderBook.asks.length > 0 
    ? (orderBook.bids[0].price + orderBook.asks[0].price) / 2 
    : 45234.50;

  const spread = orderBook.asks.length > 0 && orderBook.bids.length > 0
    ? orderBook.asks[0].price - orderBook.bids[0].price
    : 0;

  const spreadPercentage = (spread / currentPrice) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Order Book
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
            <Wifi className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </CardTitle>
        <CardDescription>
          Live market depth for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Spread</div>
              <div className="text-sm font-mono">${spread.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Spread %</div>
              <div className="text-sm font-mono">{spreadPercentage.toFixed(3)}%</div>
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Asks</span>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-1 px-1">
                  <span>Price</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Total</span>
                  <span></span>
                </div>
                {orderBook.asks.slice().reverse().map((ask, index) => (
                  <div key={index} className="relative">
                    <Progress 
                      value={(ask.total / maxTotal) * 100} 
                      className="absolute inset-0 h-full opacity-20"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    />
                    <div className="relative grid grid-cols-4 gap-2 text-xs hover:bg-red-500/10 p-1 rounded">
                      <span className="text-red-500 font-mono">${ask.price.toLocaleString()}</span>
                      <span className="text-right font-mono">{ask.quantity.toFixed(4)}</span>
                      <span className="text-right font-mono text-muted-foreground">{ask.total.toFixed(4)}</span>
                      <div className="w-full bg-red-500/20 h-1 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Current Price */}
          <div className="flex items-center justify-center py-3 border rounded-lg bg-muted/50">
            <div className="text-center">
              <Badge variant="outline" className="text-lg font-mono">
                ${currentPrice.toLocaleString()}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Last Price</div>
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Bids</span>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-1 px-1">
                  <span>Price</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Total</span>
                  <span></span>
                </div>
                {orderBook.bids.map((bid, index) => (
                  <div key={index} className="relative">
                    <Progress 
                      value={(bid.total / maxTotal) * 100} 
                      className="absolute inset-0 h-full opacity-20"
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    />
                    <div className="relative grid grid-cols-4 gap-2 text-xs hover:bg-green-500/10 p-1 rounded">
                      <span className="text-green-500 font-mono">${bid.price.toLocaleString()}</span>
                      <span className="text-right font-mono">{bid.quantity.toFixed(4)}</span>
                      <span className="text-right font-mono text-muted-foreground">{bid.total.toFixed(4)}</span>
                      <div className="w-full bg-green-500/20 h-1 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Order Book Summary */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="text-center p-2 bg-green-500/10 rounded">
              <div className="text-green-500 font-semibold">
                ${orderBook.bids.reduce((sum, bid) => sum + (bid.price * bid.quantity), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Bids</div>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded">
              <div className="text-red-500 font-semibold">
                ${orderBook.asks.reduce((sum, ask) => sum + (ask.price * ask.quantity), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Asks</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBook;
