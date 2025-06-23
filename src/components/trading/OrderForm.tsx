
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

interface OrderFormProps {
  selectedSymbol?: string;
  currentPrice?: number;
}

const OrderForm = ({ selectedSymbol = "BTCUSDT", currentPrice = 45000 }: OrderFormProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [balancePercentage, setBalancePercentage] = useState([25]);
  
  // Mock balance for demo
  const availableBalance = 10000;
  const maxQuantity = availableBalance / currentPrice;

  const handleSubmitOrder = () => {
    if (!quantity || (orderType !== "market" && !price)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const qty = parseFloat(quantity);
    const orderPrice = orderType === "market" ? currentPrice : parseFloat(price);
    const total = qty * orderPrice;

    if (side === "buy" && total > availableBalance) {
      toast.error("Insufficient balance for this trade");
      return;
    }

    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (orderType === "limit" && side === "buy" && parseFloat(price) > currentPrice * 1.1) {
      toast.error("Limit buy price is too high above market price");
      return;
    }

    if (orderType === "limit" && side === "sell" && parseFloat(price) < currentPrice * 0.9) {
      toast.error("Limit sell price is too low below market price");
      return;
    }

    const orderData = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      side,
      type: orderType,
      quantity: qty,
      price: orderPrice,
      stopPrice: orderType === "stop" ? parseFloat(stopPrice) : undefined,
      timestamp: Date.now(),
      status: "pending"
    };

    // Store order in localStorage for demo purposes
    const existingOrders = JSON.parse(localStorage.getItem("trading_orders") || "[]");
    existingOrders.push(orderData);
    localStorage.setItem("trading_orders", JSON.stringify(existingOrders));

    toast.success(`${side.toUpperCase()} order placed for ${quantity} ${selectedSymbol}`);
    
    // Reset form
    setQuantity("");
    setPrice("");
    setStopPrice("");
    setBalancePercentage([25]);
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === "market" ? currentPrice : parseFloat(price) || 0;
    return qty * orderPrice;
  };

  const handlePercentageChange = (value: number[]) => {
    setBalancePercentage(value);
    const percentage = value[0];
    const maxAffordable = side === "buy" ? availableBalance / currentPrice : maxQuantity;
    const calculatedQuantity = (maxAffordable * percentage) / 100;
    setQuantity(calculatedQuantity.toFixed(6));
  };

  const quickPriceAdjust = (adjustment: number) => {
    const newPrice = currentPrice * (1 + adjustment);
    setPrice(newPrice.toFixed(2));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Place Order
        </CardTitle>
        <CardDescription>
          Execute trades on {selectedSymbol} at ${currentPrice?.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Sell
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={side} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="order-type">Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance Percentage Slider */}
            <div className="space-y-2">
              <Label>Use Balance: {balancePercentage[0]}%</Label>
              <Slider
                value={balancePercentage}
                onValueChange={handlePercentageChange}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.000001"
                max={maxQuantity}
              />
              <div className="text-xs text-muted-foreground">
                Max: {maxQuantity.toFixed(6)} {selectedSymbol.replace("USDT", "")}
              </div>
            </div>

            {orderType !== "market" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price">Price (USDT)</Label>
                  {orderType === "limit" && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickPriceAdjust(-0.01)}
                        className="h-6 px-2 text-xs"
                      >
                        -1%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickPriceAdjust(0.01)}
                        className="h-6 px-2 text-xs"
                      >
                        +1%
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                />
              </div>
            )}

            {orderType === "stop" && (
              <div className="space-y-2">
                <Label htmlFor="stop-price">Stop Price (USDT)</Label>
                <Input
                  id="stop-price"
                  type="number"
                  placeholder="0.00"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  step="0.01"
                />
              </div>
            )}

            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Order Summary</span>
                <Badge variant={side === "buy" ? "default" : "destructive"}>
                  {side.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity || "0"} {selectedSymbol.replace("USDT", "")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${orderType === "market" ? currentPrice?.toLocaleString() : (price || "0")}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available:</span>
                  <span>${availableBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            {calculateTotal() > availableBalance * 0.5 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">High risk: Using over 50% of balance</span>
              </div>
            )}

            <Button 
              onClick={handleSubmitOrder}
              className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              disabled={!quantity || (orderType !== "market" && !price)}
            >
              Place {side.toUpperCase()} Order
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
