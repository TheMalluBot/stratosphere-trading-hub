
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle } from "lucide-react";

const Trading = () => {
  const [orderType, setOrderType] = useState("market");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [selectedBroker, setSelectedBroker] = useState("fyers");

  const symbols = [
    { value: "RELIANCE", label: "Reliance Industries", price: 2456.75, type: "stock" },
    { value: "TCS", label: "Tata Consultancy Services", price: 3890.50, type: "stock" },
    { value: "NIFTY50", label: "NIFTY 50", price: 21850.25, type: "index" },
    { value: "BTCUSDT", label: "Bitcoin/USDT", price: 43250.00, type: "crypto" },
  ];

  const brokers = [
    { value: "fyers", label: "Fyers", available: true },
    { value: "flattrade", label: "FlatTrade", available: true },
    { value: "mexc", label: "MEXC (Crypto)", available: true },
    { value: "paper", label: "Paper Trading", available: true },
  ];

  const [positions] = useState([
    {
      symbol: "RELIANCE",
      side: "long",
      quantity: 100,
      avgPrice: 2420.50,
      currentPrice: 2456.75,
      pnl: 3625,
      pnlPercent: 1.5,
    },
    {
      symbol: "TCS",
      side: "short",
      quantity: 50,
      avgPrice: 3920.00,
      currentPrice: 3890.50,
      pnl: 1475,
      pnlPercent: 0.75,
    },
  ]);

  const selectedSymbolData = symbols.find(s => s.value === selectedSymbol);
  const currentPrice = selectedSymbolData?.price || 0;
  const estimatedValue = parseFloat(quantity) * currentPrice;

  const placeBuyOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    toast.success(`Buy order placed: ${quantity} shares of ${selectedSymbol} at ₹${currentPrice}`);
  };

  const placeSellOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    toast.success(`Sell order placed: ${quantity} shares of ${selectedSymbol} at ₹${currentPrice}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Trading</h1>
          <p className="text-muted-foreground">
            Execute trades across multiple exchanges and brokers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Market Open
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
              <CardDescription>Execute buy/sell orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Broker/Exchange</Label>
                <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brokers.map((broker) => (
                      <SelectItem key={broker.value} value={broker.value} disabled={!broker.available}>
                        <div className="flex items-center justify-between w-full">
                          <span>{broker.label}</span>
                          {broker.available && <Badge variant="outline" className="ml-2 text-xs">Connected</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symbol</Label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{symbol.label}</span>
                          <span className="text-muted-foreground ml-2">₹{symbol.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Loss</SelectItem>
                    <SelectItem value="stop-limit">Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                {orderType !== "market" && (
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {quantity && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  <div className="text-lg font-semibold">
                    ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Stop Loss</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Take Profit</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button 
                  onClick={placeBuyOrder}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button 
                  onClick={placeSellOrder}
                  variant="destructive"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>

              {selectedBroker === "paper" && (
                <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Paper Trading Mode</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Positions and Orders */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="positions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
            </TabsList>

            <TabsContent value="positions">
              <Card>
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Your current trading positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="trading-table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>Side</th>
                          <th>Quantity</th>
                          <th>Avg Price</th>
                          <th>Current Price</th>
                          <th>P&L</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position, index) => (
                          <tr key={index}>
                            <td className="font-semibold">{position.symbol}</td>
                            <td>
                              <Badge variant={position.side === "long" ? "default" : "destructive"}>
                                {position.side.toUpperCase()}
                              </Badge>
                            </td>
                            <td>{position.quantity}</td>
                            <td>₹{position.avgPrice.toFixed(2)}</td>
                            <td>₹{position.currentPrice.toFixed(2)}</td>
                            <td className={position.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                              {position.pnl >= 0 ? "+" : ""}₹{position.pnl.toFixed(2)}
                              <div className="text-xs">
                                ({position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%)
                              </div>
                            </td>
                            <td>
                              <Button variant="outline" size="sm">
                                Close
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Active Orders</CardTitle>
                  <CardDescription>Pending and partially filled orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active orders</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Completed trades and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No trade history available</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Strategy Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Signals</CardTitle>
          <CardDescription>Algorithmic trading recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-green-400">Linear Regression Oscillator</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">RELIANCE</p>
              <p className="text-sm">Strong bullish signal detected. Consider long position.</p>
              <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                Execute Signal
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-400">Z-Score Trend</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">TCS</p>
              <p className="text-sm">Mean reversion opportunity identified.</p>
              <Button size="sm" variant="outline" className="mt-2">
                Monitor
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-orange-400">Stop Loss Strategy</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">NIFTY50</p>
              <p className="text-sm">Risk management signal activated.</p>
              <Button size="sm" variant="destructive" className="mt-2">
                Execute
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Trading;
