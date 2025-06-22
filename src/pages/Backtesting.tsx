
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, TrendingUp, TrendingDown, BarChart3, Play, Pause, RotateCcw } from "lucide-react";

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("linear-regression");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("1D");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [isRunning, setIsRunning] = useState(false);

  const strategies = [
    {
      value: "linear-regression",
      label: "Linear Regression Oscillator",
      description: "ChartPrime's mean reversion strategy",
    },
    {
      value: "z-score-trend",
      label: "Rolling Z-Score Trend",
      description: "QuantAlgo's momentum strategy",
    },
    {
      value: "stop-loss-tp",
      label: "Stop Loss & Take Profit",
      description: "Risk management with fixed levels",
    },
    {
      value: "custom",
      label: "Custom Strategy",
      description: "Upload your own Pine Script",
    },
  ];

  const [backtestResults] = useState({
    totalReturn: 23.45,
    annualizedReturn: 18.2,
    maxDrawdown: -8.7,
    sharpeRatio: 1.85,
    winRate: 68.5,
    totalTrades: 142,
    profitFactor: 2.34,
    avgWin: 1250,
    avgLoss: -580,
  });

  const runBacktest = () => {
    if (!symbol || !initialCapital) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRunning(true);
    toast.loading("Running backtest...");

    // Simulate backtest execution
    setTimeout(() => {
      setIsRunning(false);
      toast.success("Backtest completed successfully!");
    }, 3000);
  };

  const resetParameters = () => {
    setSymbol("RELIANCE");
    setTimeframe("1D");
    setStartDate("2023-01-01");
    setEndDate("2024-01-01");
    setInitialCapital("100000");
    toast.success("Parameters reset to defaults");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Backtesting</h1>
          <p className="text-muted-foreground">
            Test your trading strategies against historical data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetParameters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={runBacktest} disabled={isRunning}>
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Backtest Configuration
              </CardTitle>
              <CardDescription>Set up your strategy parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.value} value={strategy.value}>
                        <div>
                          <div className="font-medium">{strategy.label}</div>
                          <div className="text-xs text-muted-foreground">{strategy.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
                    <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
                    <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                    <SelectItem value="BTCUSDT">Bitcoin/USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1H">1 Hour</SelectItem>
                    <SelectItem value="1D">1 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial Capital (₹)</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                />
              </div>

              {selectedStrategy === "custom" && (
                <div className="space-y-2">
                  <Label>Pine Script Code</Label>
                  <Textarea
                    placeholder="Enter your Pine Script strategy code here..."
                    rows={6}
                  />
                </div>
              )}

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Selected Strategy</div>
                <div className="font-semibold">
                  {strategies.find(s => s.value === selectedStrategy)?.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {strategies.find(s => s.value === selectedStrategy)?.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Backtest Results
              </CardTitle>
              <CardDescription>
                Performance metrics for {symbol} ({startDate} to {endDate})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Return</div>
                  <div className="text-2xl font-bold text-green-400">
                    +{backtestResults.totalReturn}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Over {Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {backtestResults.sharpeRatio}
                  </div>
                  <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
                </div>

                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-400">
                    {backtestResults.maxDrawdown}%
                  </div>
                  <div className="text-xs text-muted-foreground">Maximum loss from peak</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annualized Return</span>
                      <span className="font-semibold text-green-400">+{backtestResults.annualizedReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-semibold">{backtestResults.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Factor</span>
                      <span className="font-semibold">{backtestResults.profitFactor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Trade Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Trades</span>
                      <span className="font-semibold">{backtestResults.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Win</span>
                      <span className="font-semibold text-green-400">₹{backtestResults.avgWin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Loss</span>
                      <span className="font-semibold text-red-400">₹{backtestResults.avgLoss}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Equity Curve Chart</p>
                  <p className="text-sm text-muted-foreground">Integration ready for TradingView charts</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Profitable Strategy
                </Badge>
                <Badge variant="outline">
                  High Frequency: {backtestResults.totalTrades} trades
                </Badge>
                <Badge variant="outline">
                  Low Risk: {Math.abs(backtestResults.maxDrawdown)}% max drawdown
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strategy Details */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Implementation</CardTitle>
          <CardDescription>
            How your selected strategy is implemented in the backtest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedStrategy === "linear-regression" && (
            <div className="space-y-4">
              <h4 className="font-semibold">Linear Regression Oscillator Strategy</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
                <ul className="text-sm space-y-1">
                  <li>• Entry: When Linear Regression Oscillator crosses above 0 (bullish) or below 0 (bearish)</li>
                  <li>• Exit: When oscillator reverses direction or hits threshold levels (+/- 1.5)</li>
                  <li>• Stop Loss: Dynamic based on invalidation levels from 5-bar lookback</li>
                  <li>• Position Size: Fixed percentage of capital per trade</li>
                </ul>
              </div>
            </div>
          )}

          {selectedStrategy === "z-score-trend" && (
            <div className="space-y-4">
              <h4 className="font-semibold">Rolling Z-Score Trend Strategy</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
                <ul className="text-sm space-y-1">
                  <li>• Entry: Z-Score momentum crossover with threshold confirmation</li>
                  <li>• Exit: Mean reversion signals or opposite momentum</li>
                  <li>• Risk Management: Overbought/oversold zone exits</li>
                  <li>• Lookback Period: 20 bars for rolling calculation</li>
                </ul>
              </div>
            </div>
          )}

          {selectedStrategy === "stop-loss-tp" && (
            <div className="space-y-4">
              <h4 className="font-semibold">Stop Loss & Take Profit Strategy</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
                <ul className="text-sm space-y-1">
                  <li>• Entry: SMA crossover signals (14 over 28)</li>
                  <li>• Stop Loss: Fixed amount in currency (₹100 default)</li>
                  <li>• Take Profit: Fixed amount in currency (₹200 default)</li>
                  <li>• Risk-Reward Ratio: 1:2 (configurable)</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Backtesting;
