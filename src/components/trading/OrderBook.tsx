
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol?: string;
}

const OrderBook = ({ symbol = "BTCUSDT" }: OrderBookProps) => {
  // Mock data for demonstration
  const generateOrderBookData = (basePrice: number, isBid: boolean): OrderBookEntry[] => {
    const data: OrderBookEntry[] = [];
    let total = 0;
    
    for (let i = 0; i < 10; i++) {
      const priceOffset = isBid ? -i * 0.5 : i * 0.5;
      const price = basePrice + priceOffset;
      const quantity = Math.random() * 2 + 0.1;
      total += quantity;
      
      data.push({
        price: Number(price.toFixed(2)),
        quantity: Number(quantity.toFixed(4)),
        total: Number(total.toFixed(4))
      });
    }
    
    return data;
  };

  const currentPrice = 45234.50;
  const bids = generateOrderBookData(currentPrice, true);
  const asks = generateOrderBookData(currentPrice, false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Order Book
        </CardTitle>
        <CardDescription>
          Live market depth for {symbol}
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
              {asks.reverse().map((ask, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-red-500/10 p-1 rounded">
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
              {bids.map((bid, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-green-500/10 p-1 rounded">
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

export default OrderBook;
