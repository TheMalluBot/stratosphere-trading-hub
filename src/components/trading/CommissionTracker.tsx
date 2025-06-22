
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingDown, TrendingUp, Calculator, Target } from "lucide-react";

export function CommissionTracker() {
  const brokerCommissions = [
    {
      broker: "Fyers",
      stockCommission: 0.03,
      optionsCommission: 20,
      currency: "₹",
      rating: "A+",
      totalPaid: 2450,
      trades: 156,
      avgPerTrade: 15.71
    },
    {
      broker: "FlatTrade",
      stockCommission: 0.05,
      optionsCommission: 15,
      currency: "₹",
      rating: "A",
      totalPaid: 1890,
      trades: 98,
      avgPerTrade: 19.29
    },
    {
      broker: "MEXC",
      stockCommission: 0.1,
      optionsCommission: 0,
      currency: "%",
      rating: "B+",
      totalPaid: 890,
      trades: 45,
      avgPerTrade: 19.78
    }
  ];

  const monthlyCommissions = [
    { month: "Jan", amount: 450, savings: 120 },
    { month: "Feb", amount: 380, savings: 95 },
    { month: "Mar", amount: 520, savings: 150 },
    { month: "Apr", amount: 410, savings: 110 },
    { month: "May", amount: 390, savings: 105 },
    { month: "Jun", amount: 480, savings: 135 }
  ];

  const totalCommissions = brokerCommissions.reduce((sum, broker) => sum + broker.totalPaid, 0);
  const totalSavings = monthlyCommissions.reduce((sum, month) => sum + month.savings, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-400">+12% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">₹{totalSavings}</div>
            <p className="text-xs text-muted-foreground">
              Through optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Broker</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FlatTrade</div>
            <p className="text-xs text-muted-foreground">
              Lowest avg per trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="brokers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brokers">Broker Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="brokers">
          <Card>
            <CardHeader>
              <CardTitle>Broker Commission Comparison</CardTitle>
              <CardDescription>Compare costs across different brokers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brokerCommissions.map((broker, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{broker.broker}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{broker.rating}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {broker.trades} trades
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">₹{broker.totalPaid}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{broker.avgPerTrade.toFixed(2)} avg/trade
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm">Stock: {broker.stockCommission}%</div>
                      <div className="text-sm">Options: ₹{broker.optionsCommission}</div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Optimize
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Commission Trend</CardTitle>
                <CardDescription>Track commission costs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyCommissions.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₹{month.amount}</span>
                        <span className="text-xs text-green-400">
                          -₹{month.savings}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Commission distribution by asset type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Equity Trading</span>
                    <span>₹3,240 (65%)</span>
                  </div>
                  <Progress value={65} />
                  
                  <div className="flex items-center justify-between">
                    <span>Options Trading</span>
                    <span>₹1,450 (29%)</span>
                  </div>
                  <Progress value={29} />
                  
                  <div className="flex items-center justify-between">
                    <span>Crypto Trading</span>
                    <span>₹290 (6%)</span>
                  </div>
                  <Progress value={6} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Commission Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to reduce trading costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-500/20 bg-green-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-400">Switch to FlatTrade for Small Orders</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        For orders under ₹50,000, using FlatTrade could save you ₹450/month
                      </p>
                      <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                        Apply Recommendation
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-blue-500/20 bg-blue-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-400">Batch Small Orders</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Combining orders under ₹10,000 could reduce commission by 25%
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Enable Auto-Batching
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-400">Optimize Order Timing</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Trading during high liquidity periods can reduce slippage costs
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Set Smart Timing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
