import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Maximize2, Settings, Activity } from "lucide-react";

const Charts = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("NIFTY50");
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candlestick");

  const symbols = [
    { value: "NIFTY50", label: "NIFTY 50", type: "index" },
    { value: "BANKNIFTY", label: "BANK NIFTY", type: "index" },
    { value: "RELIANCE", label: "Reliance Industries", type: "stock" },
    { value: "TCS", label: "Tata Consultancy Services", type: "stock" },
    { value: "BTCUSDT", label: "Bitcoin/USDT", type: "crypto" },
    { value: "ETHUSDT", label: "Ethereum/USDT", type: "crypto" },
  ];

  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
  const chartTypes = ["candlestick", "line", "area", "heikin-ashi"];

  const currentPrice = 21850.25;
  const priceChange = 125.30;
  const priceChangePercent = 0.58;

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Charts</h1>
          <p className="text-muted-foreground">
            Professional trading charts with technical analysis
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
          <label className="text-sm font-medium">Chart Type:</label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
              {currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}</span>
              <span>({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Chart Area */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {symbols.find(s => s.value === selectedSymbol)?.label} - {timeframe} ({chartType})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Enhanced Chart Integration</h3>
                  <p className="text-muted-foreground mb-4">
                    Ready for TradingView widget or Lightweight Charts integration
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="text-left">
                        <p className="font-medium mb-2">Chart Features:</p>
                        <ul className="space-y-1">
                          <li>• {chartType} chart type</li>
                          <li>• {timeframe} timeframe</li>
                          <li>• Volume analysis</li>
                          <li>• Drawing tools</li>
                        </ul>
                      </div>
                      <div className="text-left">
                        <p className="font-medium mb-2">Indicators:</p>
                        <ul className="space-y-1">
                          <li>• Moving averages</li>
                          <li>• RSI & MACD</li>
                          <li>• Bollinger Bands</li>
                          <li>• Custom studies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2 justify-center">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                      Symbol: {selectedSymbol}
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">
                      <Activity className="w-3 h-3 mr-1" />
                      Live Data
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Side Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
              <CardDescription>Real-time statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Open</div>
                  <div className="font-semibold">21,724.95</div>
                </div>
                <div>
                  <div className="text-muted-foreground">High</div>
                  <div className="font-semibold text-green-400">21,890.50</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Low</div>
                  <div className="font-semibold text-red-400">21,680.20</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-semibold">1.2M</div>
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
                <Badge variant="outline">21,780</Badge>
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
      </div>
    </div>
  );
};

export default Charts;
