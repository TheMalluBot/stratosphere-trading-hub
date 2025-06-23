
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Clock, TrendingUp, TrendingDown, X, CheckCircle2, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  quantity: number;
  price: number;
  status: "pending" | "filled" | "cancelled" | "partial";
  timestamp: number;
  filled?: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  timestamp: number;
  pnl?: number;
}

const TradingHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem("trading_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    // Mock trade history
    const mockTrades: Trade[] = [
      {
        id: "t1",
        symbol: "BTCUSDT",
        side: "buy",
        quantity: 0.25,
        price: 44800,
        timestamp: Date.now() - 3600000,
        pnl: 150.5
      },
      {
        id: "t2",
        symbol: "ETHUSDT",
        side: "sell",
        quantity: 1.5,
        price: 2420,
        timestamp: Date.now() - 7200000,
        pnl: -45.2
      }
    ];
    setTrades(mockTrades);
  }, []);

  const cancelOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: "cancelled" as const } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("trading_orders", JSON.stringify(updatedOrders));
    toast.success("Order cancelled successfully");
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "filled":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Trading History
        </CardTitle>
        <CardDescription>
          Track your orders and completed trades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Open Orders</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <ScrollArea className="h-96">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active orders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.symbol}</span>
                          <Badge variant={order.side === "buy" ? "default" : "destructive"}>
                            {order.side === "buy" ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {order.side.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{order.type.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={
                            order.status === "filled" ? "default" :
                            order.status === "cancelled" ? "destructive" :
                            order.status === "partial" ? "secondary" : "outline"
                          }>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <div className="text-muted-foreground">Quantity</div>
                          <div className="font-mono">{order.quantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-mono">${order.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-mono">${(order.quantity * order.price).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Time</div>
                          <div className="text-xs">{new Date(order.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      
                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          className="w-full mt-2"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trades">
            <ScrollArea className="h-96">
              {trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No completed trades</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div key={trade.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trade.symbol}</span>
                          <Badge variant={trade.side === "buy" ? "default" : "destructive"}>
                            {trade.side === "buy" ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {trade.side.toUpperCase()}
                          </Badge>
                        </div>
                        {trade.pnl && (
                          <div className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Quantity</div>
                          <div className="font-mono">{trade.quantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-mono">${trade.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Time</div>
                          <div className="text-xs">{new Date(trade.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingHistory;
