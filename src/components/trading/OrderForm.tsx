
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

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

  const handleSubmitOrder = () => {
    if (!quantity || (orderType !== "market" && !price)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const orderData = {
      symbol: selectedSymbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType !== "market" ? parseFloat(price) : currentPrice,
      stopPrice: orderType === "stop" ? parseFloat(stopPrice) : undefined,
      timestamp: Date.now()
    };

    // Store order in localStorage for demo purposes
    const existingOrders = JSON.parse(localStorage.getItem("trading_orders") || "[]");
    existingOrders.push({ ...orderData, id: Date.now().toString(), status: "pending" });
    localStorage.setItem("trading_orders", JSON.stringify(existingOrders));

    toast.success(`${side.toUpperCase()} order placed for ${quantity} ${selectedSymbol}`);
    
    // Reset form
    setQuantity("");
    setPrice("");
    setStopPrice("");
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === "market" ? currentPrice : parseFloat(price) || 0;
    return qty * orderPrice;
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

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.001"
              />
            </div>

            {orderType !== "market" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (USDT)</Label>
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
              </div>
            </div>

            <Button 
              onClick={handleSubmitOrder}
              className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
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
