
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Zap, 
  Target, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function SmartOrderRouter() {
  const [smartRoutingEnabled, setSmartRoutingEnabled] = useState(true);
  const [orderValue, setOrderValue] = useState("50000");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");

  const brokerRoutes = [
    {
      broker: "FlatTrade",
      score: 95,
      commission: 15,
      speed: "Fast",
      liquidity: "High",
      recommendation: "Best for this order",
      status: "recommended",
      executionTime: "0.2s",
      savings: 125
    },
    {
      broker: "Fyers",
      score: 88,
      commission: 18,
      speed: "Very Fast",
      liquidity: "Medium",
      recommendation: "Good alternative",
      status: "alternative",
      executionTime: "0.1s",
      savings: 95
    },
    {
      broker: "MEXC",
      score: 72,
      commission: 25,
      speed: "Medium",
      liquidity: "Low",
      recommendation: "Higher costs",
      status: "not-recommended",
      executionTime: "0.5s",
      savings: -45
    }
  ];

  const routingStrategies = [
    {
      name: "Cost Minimization",
      description: "Prioritize lowest commission and fees",
      active: true
    },
    {
      name: "Speed Optimization",
      description: "Fastest execution with acceptable costs",
      active: false
    },
    {
      name: "Liquidity Focus",
      description: "Best price improvement for large orders",
      active: false
    },
    {
      name: "Balanced",
      description: "Optimize across all factors",
      active: false
    }
  ];

  const recentRoutes = [
    {
      symbol: "TCS",
      broker: "FlatTrade",
      amount: "₹75,000",
      saved: "₹85",
      time: "2 min ago",
      status: "executed"
    },
    {
      symbol: "NIFTY50",
      broker: "Fyers", 
      amount: "₹1,20,000",
      saved: "₹150",
      time: "15 min ago",
      status: "executed"
    },
    {
      symbol: "BTCUSDT",
      broker: "MEXC",
      amount: "$2,500",
      saved: "$12",
      time: "1 hour ago",
      status: "executed"
    }
  ];

  const executeSmartRoute = (broker: string) => {
    toast.success(`Smart route executed via ${broker} - Saved ₹125 in costs`);
  };

  return (
    <div className="space-y-6">
      {/* Smart Routing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Smart Order Routing
          </CardTitle>
          <CardDescription>
            Intelligent order routing for optimal execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smart-routing">Enable Smart Routing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically route orders for best execution
              </p>
            </div>
            <Switch 
              id="smart-routing"
              checked={smartRoutingEnabled}
              onCheckedChange={setSmartRoutingEnabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
                  <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
                  <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Value</Label>
              <Input
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                placeholder="Order value"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routing Analysis */}
      {smartRoutingEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Route Analysis for {selectedSymbol}</CardTitle>
            <CardDescription>
              Comparing execution options for ₹{parseInt(orderValue).toLocaleString()} order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {brokerRoutes.map((route, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{route.broker}</h3>
                      <Badge 
                        variant={route.status === 'recommended' ? 'default' : 
                                route.status === 'alternative' ? 'secondary' : 'destructive'}
                      >
                        Score: {route.score}
                      </Badge>
                      {route.status === 'recommended' && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => executeSmartRoute(route.broker)}
                      disabled={route.status === 'not-recommended'}
                    >
                      Execute Route
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Commission</div>
                      <div className="font-medium">₹{route.commission}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Speed</div>
                      <div className="font-medium">{route.speed}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Liquidity</div>
                      <div className="font-medium">{route.liquidity}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Est. Savings</div>
                      <div className={`font-medium ${route.savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {route.savings > 0 ? '+' : ''}₹{route.savings}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    {route.recommendation} • Est. execution: {route.executionTime}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routing Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Strategies</CardTitle>
          <CardDescription>Configure how orders should be routed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routingStrategies.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{strategy.name}</h4>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </div>
                <Switch checked={strategy.active} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Smart Routes</CardTitle>
          <CardDescription>Recently executed smart routing decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="font-medium">{route.symbol} via {route.broker}</div>
                    <div className="text-sm text-muted-foreground">{route.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{route.amount}</div>
                  <div className="text-sm text-green-400">Saved {route.saved}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">₹12,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">+8% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.24s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">-15% improvement</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Of optimal routes executed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
