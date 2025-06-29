import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Settings, Target, Shield, TrendingUp, AlertTriangle } from "lucide-react";

interface AdvancedOrderFormProps {
  symbol: string;
  currentPrice: number;
  tradingMode?: 'live' | 'paper' | 'algo' | 'backtest';
}

const AdvancedOrderForm = ({ symbol, currentPrice, tradingMode = 'live' }: AdvancedOrderFormProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop" | "trailing" | "iceberg">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [trailingDistance, setTrailingDistance] = useState("");
  const [icebergQuantity, setIcebergQuantity] = useState("");
  
  // Advanced features
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<"GTC" | "IOC" | "FOK">("GTC");
  const [postOnly, setPostOnly] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  
  // Risk management
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [positionSize, setPositionSize] = useState("");

  const handleAdvancedOrder = async () => {
    try {
      const orderData = {
        symbol,
        side,
        type: orderType,
        quantity: parseFloat(quantity),
        price: orderType !== "market" ? parseFloat(price) : undefined,
        stopPrice: orderType === "stop" ? parseFloat(stopPrice) : undefined,
        trailingDistance: orderType === "trailing" ? parseFloat(trailingDistance) : undefined,
        icebergQty: orderType === "iceberg" ? parseFloat(icebergQuantity) : undefined,
        timeInForce,
        postOnly,
        reduceOnly,
        stopLoss: useStopLoss ? parseFloat(stopLossPrice) : undefined,
        takeProfit: useTakeProfit ? parseFloat(takeProfitPrice) : undefined,
        tradingMode
      };

      console.log('Placing advanced order:', orderData);
      toast.success(`Advanced ${orderType} order placed for ${symbol} (${tradingMode} mode)`);
      
    } catch (error) {
      console.error('Advanced order failed:', error);
      toast.error('Failed to place advanced order');
    }
  };

  const calculatePositionSize = () => {
    const risk = riskPercentage[0] / 100;
    const stopDistance = Math.abs(currentPrice - parseFloat(stopLossPrice || currentPrice.toString()));
    const accountBalance = 10000; // Mock balance
    
    if (stopDistance > 0) {
      const calculatedSize = (accountBalance * risk) / stopDistance;
      setPositionSize(calculatedSize.toFixed(6));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Advanced Order Management
          <Badge variant="outline">{tradingMode.toUpperCase()}</Badge>
        </CardTitle>
        <CardDescription>
          Professional trading tools with risk management ({tradingMode} mode)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="order" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={side === "buy" ? "default" : "outline"}
                onClick={() => setSide("buy")}
                className="bg-green-600 hover:bg-green-700"
              >
                Buy
              </Button>
              <Button
                variant={side === "sell" ? "default" : "outline"}
                onClick={() => setSide("sell")}
                className="bg-red-600 hover:bg-red-700"
              >
                Sell
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop Loss</SelectItem>
                  <SelectItem value="trailing">Trailing Stop</SelectItem>
                  <SelectItem value="iceberg">Iceberg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {orderType !== "market" && (
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            {orderType === "stop" && (
              <div className="space-y-2">
                <Label>Stop Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                />
              </div>
            )}

            {orderType === "trailing" && (
              <div className="space-y-2">
                <Label>Trailing Distance (%)</Label>
                <Input
                  type="number"
                  placeholder="2.5"
                  value={trailingDistance}
                  onChange={(e) => setTrailingDistance(e.target.value)}
                />
              </div>
            )}

            {orderType === "iceberg" && (
              <div className="space-y-2">
                <Label>Iceberg Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.1"
                  value={icebergQuantity}
                  onChange={(e) => setIcebergQuantity(e.target.value)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="space-y-2">
              <Label>Risk Percentage: {riskPercentage[0]}%</Label>
              <Slider
                value={riskPercentage}
                onValueChange={setRiskPercentage}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="stop-loss">Stop Loss</Label>
              <Switch
                id="stop-loss"
                checked={useStopLoss}
                onCheckedChange={setUseStopLoss}
              />
            </div>

            {useStopLoss && (
              <div className="space-y-2">
                <Label>Stop Loss Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stopLossPrice}
                  onChange={(e) => {
                    setStopLossPrice(e.target.value);
                    calculatePositionSize();
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="take-profit">Take Profit</Label>
              <Switch
                id="take-profit"
                checked={useTakeProfit}
                onCheckedChange={setUseTakeProfit}
              />
            </div>

            {useTakeProfit && (
              <div className="space-y-2">
                <Label>Take Profit Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                />
              </div>
            )}

            {positionSize && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Calculated Position Size: {positionSize}</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label>Time in Force</Label>
              <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                  <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                  <SelectItem value="FOK">Fill or Kill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="post-only">Post Only</Label>
              <Switch
                id="post-only"
                checked={postOnly}
                onCheckedChange={setPostOnly}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="reduce-only">Reduce Only</Label>
              <Switch
                id="reduce-only"
                checked={reduceOnly}
                onCheckedChange={setReduceOnly}
              />
            </div>

            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">Advanced features require careful risk management</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleAdvancedOrder}
          className="w-full mt-4"
          disabled={!quantity}
        >
          Place Advanced Order
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedOrderForm;
