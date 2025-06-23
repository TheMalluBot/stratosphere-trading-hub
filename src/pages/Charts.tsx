
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Maximize2, Settings, Activity } from "lucide-react";
import TradingChart from "@/components/trading/TradingChart";
import { RiskDashboard } from "@/components/risk/RiskDashboard";

const Charts = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1D");

  const symbols = [
    { value: "BTCUSDT", label: "Bitcoin/USDT", type: "crypto" },
    { value: "ETHUSDT", label: "Ethereum/USDT", type: "crypto" },
    { value: "BNBUSDT", label: "BNB/USDT", type: "crypto" },
    { value: "ADAUSDT", label: "Cardano/USDT", type: "crypto" },
    { value: "SOLUSDT", label: "Solana/USDT", type: "crypto" },
    { value: "DOTUSDT", label: "Polkadot/USDT", type: "crypto" },
  ];

  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

  const currentPrice = 45234.25;
  const priceChange = 1125.30;
  const priceChangePercent = 2.55;

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Charts</h1>
          <p className="text-muted-foreground">
            Advanced trading charts with real-time data and technical analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Indicators
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Strategies
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Enhanced Chart Controls */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Symbol:</label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((symbol) => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  <div className="flex items-center gap-2">
                    <span>{symbol.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {symbol.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Timeframe:</label>
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="px-3"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${currentPrice.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}</span>
              <span>({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart and Analytics */}
      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Advanced Chart</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          <TradingChart symbol={selectedSymbol} />
          
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Market Data</CardTitle>
                <CardDescription>Real-time statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Open</div>
                    <div className="font-semibold">$44,108.95</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">High</div>
                    <div className="font-semibold text-green-400">$45,890.50</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Low</div>
                    <div className="font-semibold text-red-400">$43,680.20</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-semibold">12.8K BTC</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key signals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RSI (14)</span>
                  <Badge variant="outline">65.2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">MACD</span>
                  <Badge variant="default" className="bg-green-500">Bullish</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SMA (20)</span>
                  <Badge variant="outline">$44,780</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bollinger</span>
                  <Badge variant="secondary">Normal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Chart tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" variant="outline" className="w-full">
                  Add Trendline
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Fibonacci Retracement
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Support/Resistance
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Volume Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
                <CardDescription>Overall market indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Fear & Greed Index</span>
                    <Badge variant="default" className="bg-orange-500">68 - Greed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Cap Dominance</span>
                    <Badge variant="outline">BTC: 52.3%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Addresses</span>
                    <Badge variant="outline">1.2M (+5.2%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Signals</CardTitle>
                <CardDescription>Algorithmic recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Linear Regression</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bullish crossover detected. Entry signal confirmed.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">Z-Score Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Momentum building. Watch for continuation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Charts;
