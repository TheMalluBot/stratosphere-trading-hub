
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Activity, TrendingUp, TrendingDown, DollarSign, RotateCcw } from "lucide-react";

const PaperTrading = () => {
  const [balance, setBalance] = useState(100000);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState("market");

  const symbols = [
    { value: "RELIANCE", label: "Reliance Industries", price: 2456.75 },
    { value: "TCS", label: "Tata Consultancy Services", price: 3890.50 },
    { value: "BTCUSDT", label: "Bitcoin/USDT", price: 43250.00 },
  ];

  const [paperPositions] = useState([
    {
      symbol: "RELIANCE",
      side: "long",
      quantity: 50,
      avgPrice: 2420.50,
      currentPrice: 2456.75,
      pnl: 1812.5,
      pnlPercent: 1.5,
    },
    {
      symbol: "TCS",
      side: "long",
      quantity: 25,
      avgPrice: 3950.00,
      currentPrice: 3890.50,
      pnl: -1487.5,
      pnlPercent: -1.51,
    },
  ]);

  const [tradeHistory] = useState([
    {
      id: 1,
      symbol: "RELIANCE",
      side: "buy",
      quantity: 50,
      price: 2420.50,
      timestamp: "2024-01-20 10:30:00",
      pnl: 0,
    },
    {
      id: 2,
      symbol: "TCS",
      side: "buy",
      quantity: 25,
      price: 3950.00,
      timestamp: "2024-01-20 11:15:00",
      pnl: 0,
    },
  ]);

  const selectedSymbolData = symbols.find(s => s.value === selectedSymbol);
  const currentPrice = selectedSymbolData?.price || 0;
  const estimatedValue = parseFloat(quantity) * currentPrice;

  const totalPortfolioValue = balance + paperPositions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalPnL = paperPositions.reduce((acc, pos) => acc + pos.pnl, 0);

  const placePaperOrder = (side: 'buy' | 'sell') => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const cost = parseFloat(quantity) * currentPrice;
    
    if (side === 'buy' && cost > balance) {
      toast.error("Insufficient balance for this trade");
      return;
    }

    toast.success(`Paper ${side} order placed: ${quantity} shares of ${selectedSymbol} at ₹${currentPrice}`);
    setQuantity("");
  };

  const resetPaperAccount = () => {
    setBalance(100000);
    toast.success("Paper trading account reset to ₹1,00,000");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paper Trading</h1>
          <p className="text-muted-foreground">
            Practice trading strategies without real money
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Paper Mode
          </Badge>
          <Button variant="outline" onClick={resetPaperAccount}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Account
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total account value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unrealized P&L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paperPositions.length}</div>
            <p className="text-xs text-muted-foreground">
              Active trades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Paper Trading Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Place Paper Order</CardTitle>
              <CardDescription>Practice with virtual money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {quantity && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  <div className="text-lg font-semibold">
                    ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Current Price: ₹{currentPrice}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button 
                  onClick={() => placePaperOrder('buy')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Paper Buy
                </Button>
                <Button 
                  onClick={() => placePaperOrder('sell')}
                  variant="destructive"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Paper Sell
                </Button>
              </div>

              <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Virtual Trading - No Real Money</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions and History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="positions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="positions">Paper Positions</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="positions">
              <Card>
                <CardHeader>
                  <CardTitle>Paper Positions</CardTitle>
                  <CardDescription>Your virtual trading positions</CardDescription>
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
                        {paperPositions.map((position, index) => (
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

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Your paper trading transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="trading-table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>Side</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Timestamp</th>
                          <th>P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tradeHistory.map((trade) => (
                          <tr key={trade.id}>
                            <td className="font-semibold">{trade.symbol}</td>
                            <td>
                              <Badge variant={trade.side === "buy" ? "default" : "destructive"}>
                                {trade.side.toUpperCase()}
                              </Badge>
                            </td>
                            <td>{trade.quantity}</td>
                            <td>₹{trade.price.toFixed(2)}</td>
                            <td className="text-muted-foreground">{trade.timestamp}</td>
                            <td className="text-muted-foreground">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Track your paper trading performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-2xl font-bold text-green-400">75%</div>
                      <div className="text-xs text-muted-foreground">3 of 4 trades profitable</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Average Return</div>
                      <div className="text-2xl font-bold text-blue-400">+0.32%</div>
                      <div className="text-xs text-muted-foreground">Per trade</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Best Trade</div>
                      <div className="text-2xl font-bold text-green-400">+₹1,812</div>
                      <div className="text-xs text-muted-foreground">RELIANCE position</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Worst Trade</div>
                      <div className="text-2xl font-bold text-red-400">-₹1,487</div>
                      <div className="text-xs text-muted-foreground">TCS position</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaperTrading;
