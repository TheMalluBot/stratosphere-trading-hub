
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } = "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp, TrendingDown, BarChart3, Activity, Target } from "lucide-react";

const Analysis = () => {
  const [selectedSector, setSelectedSector] = useState("all");
  const [timeframe, setTimeframe] = useState("1M");

  const sectors = [
    { name: "IT", change: 2.45, stocks: 15, leader: "TCS" },
    { name: "Banking", change: -1.23, stocks: 12, leader: "HDFC Bank" },
    { name: "Energy", change: 3.78, stocks: 8, leader: "Reliance" },
    { name: "Pharma", change: 0.56, stocks: 10, leader: "Dr. Reddy's" },
    { name: "Auto", change: -0.89, stocks: 7, leader: "Maruti Suzuki" },
  ];

  const marketTrends = [
    { indicator: "Market Breadth", value: "Bullish", change: "+5.2%" },
    { indicator: "Volatility (VIX)", value: "Low", change: "-12.3%" },
    { indicator: "FII Flow", value: "Positive", change: "+₹2,450 Cr" },
    { indicator: "DII Flow", value: "Positive", change: "+₹1,890 Cr" },
  ];

  const topGainers = [
    { symbol: "RELIANCE", change: 4.56, price: 2456.75 },
    { symbol: "TCS", change: 3.24, price: 3890.50 },
    { symbol: "INFY", change: 2.89, price: 1654.30 },
  ];

  const topLosers = [
    { symbol: "HDFC", change: -2.45, price: 1598.20 },
    { symbol: "ICICI", change: -1.89, price: 987.45 },
    { symbol: "AXIS", change: -1.56, price: 756.80 },
  ];

  const cryptoTrends = [
    { symbol: "BTC/USDT", change: 2.34, price: 43250.00, volume: "2.1B" },
    { symbol: "ETH/USDT", change: 1.78, price: 2580.75, volume: "1.8B" },
    { symbol: "BNB/USDT", change: -0.56, price: 315.20, volume: "890M" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive market insights and sectoral analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1 Day</SelectItem>
              <SelectItem value="1W">1 Week</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {marketTrends.map((trend, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{trend.indicator}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trend.value}</div>
              <p className="text-xs text-muted-foreground">
                {trend.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sectors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sectors">Sectoral Analysis</TabsTrigger>
          <TabsTrigger value="stocks">Stock Analysis</TabsTrigger>
          <TabsTrigger value="crypto">Crypto Analysis</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="sectors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>
                How different sectors are performing in the current market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectors.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{sector.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sector.stocks} stocks • Leader: {sector.leader}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {sector.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-semibold">
                          {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                        </span>
                      </div>
                      <Badge variant={sector.change >= 0 ? "default" : "destructive"} className="mt-1">
                        {sector.change >= 0 ? 'Outperforming' : 'Underperforming'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Sector Heatmap
                </CardTitle>
                <CardDescription>Visual representation of sector performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Sector Heatmap</p>
                    <p className="text-sm text-muted-foreground">Integration ready for data visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Rotation Analysis</CardTitle>
                <CardDescription>Money flow between sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Money flowing into</span>
                    <Badge className="bg-green-500/10 text-green-400">Energy, IT</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Money flowing out of</span>
                    <Badge variant="destructive" className="bg-red-500/10">Banking, Auto</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neutral sectors</span>
                    <Badge variant="outline">Pharma, FMCG</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stocks" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  Top Gainers
                </CardTitle>
                <CardDescription>Best performing stocks today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGainers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">₹{stock.price.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">+{stock.change.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-5 h-5" />
                  Top Losers
                </CardTitle>
                <CardDescription>Worst performing stocks today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLosers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">₹{stock.price.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-semibold">{stock.change.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Screener Results</CardTitle>
              <CardDescription>Stocks matching your criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Advanced stock screening tools</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Filter stocks by technical indicators, fundamentals, and more
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Market Analysis</CardTitle>
              <CardDescription>Insights from MEXC exchange and CoinGecko data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cryptoTrends.map((crypto, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div className="font-semibold">{crypto.symbol}</div>
                      <div className="text-sm text-muted-foreground">${crypto.price.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Vol: {crypto.volume}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
                <CardDescription>Overall crypto market mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fear & Greed Index</span>
                    <Badge className="bg-orange-500/10 text-orange-400">Neutral (52)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bitcoin Dominance</span>
                    <span className="font-semibold">54.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Market Cap</span>
                    <span className="font-semibold">$1.65T</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hot Tokens on MEXC</CardTitle>
                <CardDescription>Trending cryptocurrencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PEPE/USDT</span>
                    <Badge className="bg-green-500/10 text-green-400">+45.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ARB/USDT</span>
                    <Badge className="bg-green-500/10 text-green-400">+23.4%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OP/USDT</span>
                    <Badge className="bg-green-500/10 text-green-400">+18.9%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis Dashboard</CardTitle>
              <CardDescription>Market-wide technical indicators and signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-2">Market Trend</div>
                  <div className="text-lg font-semibold text-green-400">Bullish</div>
                  <div className="text-xs text-muted-foreground">Based on moving averages</div>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-2">RSI (14)</div>
                  <div className="text-lg font-semibold">58.2</div>
                  <div className="text-xs text-muted-foreground">Neutral zone</div>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-2">MACD Signal</div>
                  <div className="text-lg font-semibold text-blue-400">Bullish</div>
                  <div className="text-xs text-muted-foreground">Above signal line</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strategy Signals Summary</CardTitle>
              <CardDescription>Aggregated signals from your Pine Script strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Linear Regression Oscillator</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    5 bullish signals detected across different timeframes and symbols
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">Z-Score Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3 mean reversion opportunities identified in overbought zones
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold text-orange-400">Stop Loss Strategy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    2 risk management alerts for existing positions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
