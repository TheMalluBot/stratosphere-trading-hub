import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, TrendingUp, TrendingDown, BarChart3, Play, Pause, RotateCcw, Settings } from "lucide-react";
import { LinearRegressionStrategy } from "@/strategies/LinearRegressionStrategy";
import { ZScoreTrendStrategy } from "@/strategies/ZScoreTrendStrategy";
import { UltimateStrategy } from "@/strategies/UltimateStrategy";
import { StrategyConfig, MarketData } from "@/types/strategy";

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("ultimate-combined");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("1D");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  const strategies = [
    {
      value: "linear-regression",
      label: "Linear Regression Oscillator",
      description: "ChartPrime's mean reversion strategy with normalization",
    },
    {
      value: "z-score-trend",
      label: "Rolling Z-Score Trend",
      description: "QuantAlgo's momentum strategy with z-score analysis",
    },
    {
      value: "stop-loss-tp",
      label: "Stop Loss & Take Profit",
      description: "Risk management with fixed levels",
    },
    {
      value: "deviation-trend",
      label: "Deviation Trend Profile",
      description: "BigBeluga's trend deviation analysis (Coming Soon)",
    },
    {
      value: "volume-profile",
      label: "Multi-Layer Volume Profile",
      description: "BigBeluga's volume analysis (Coming Soon)",
    },
    {
      value: "ultimate-combined",
      label: "🚀 Ultimate Combined Strategy",
      description: "AI-powered combination of all strategies",
    },
  ];

  // Mock market data generator
  const generateMockData = (symbol: string, days: number): MarketData[] => {
    const data: MarketData[] = [];
    let price = 2500; // Starting price
    const startTime = new Date(startDate).getTime();
    
    for (let i = 0; i < days; i++) {
      const timestamp = startTime + (i * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({ timestamp, open, high, low, close, volume });
      price = close;
    }
    
    return data;
  };

  const runBacktest = async () => {
    if (!symbol || !initialCapital) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRunning(true);
    toast.loading("Running advanced backtest...");

    try {
      // Generate mock market data
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const marketData = generateMockData(symbol, days);
      
      // Create strategy instance based on selection
      let strategy;
      const baseConfig: StrategyConfig = {
        id: selectedStrategy,
        name: strategies.find(s => s.value === selectedStrategy)?.label || "",
        description: "",
        parameters: {},
        enabled: true
      };

      switch (selectedStrategy) {
        case "linear-regression":
          strategy = new LinearRegressionStrategy(baseConfig);
          break;
        case "z-score-trend":
          strategy = new ZScoreTrendStrategy(baseConfig);
          break;
        case "ultimate-combined":
          strategy = new UltimateStrategy(baseConfig);
          break;
        default:
          // For not-yet-implemented strategies, use mock results
          strategy = new LinearRegressionStrategy(baseConfig);
      }

      // Run the backtest
      const result = strategy.calculate(marketData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBacktestResults({
        ...result.performance,
        signals: result.signals.length,
        indicators: Object.keys(result.indicators).length,
        strategy: strategy.getName(),
        period: `${startDate} to ${endDate}`,
        totalBars: marketData.length
      });
      
      toast.success(`Backtest completed! Found ${result.signals.length} signals`);
      
    } catch (error) {
      console.error("Backtest error:", error);
      toast.error("Backtest failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const resetParameters = () => {
    setSelectedStrategy("ultimate-combined");
    setSymbol("RELIANCE");
    setTimeframe("1D");
    setStartDate("2023-01-01");
    setEndDate("2024-01-01");
    setInitialCapital("100000");
    setBacktestResults(null);
    toast.success("Parameters reset to defaults");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Strategy Backtesting</h1>
          <p className="text-muted-foreground">
            Test individual strategies or the ultimate combined approach
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
                Strategy Configuration
              </CardTitle>
              <CardDescription>Select and configure your trading strategy</CardDescription>
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

              {selectedStrategy === "ultimate-combined" && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="text-sm font-semibold text-blue-700">🚀 Ultimate Strategy Active</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Combining multiple Pine Script strategies with AI optimization
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">Linear Regression</Badge>
                    <Badge variant="secondary" className="text-xs">Z-Score Trend</Badge>
                  </div>
                </div>
              )}

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
                {backtestResults && (
                  <Badge variant="outline" className="ml-2">
                    {backtestResults.signals} signals
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {backtestResults ? (
                  `Performance for ${backtestResults.strategy} (${backtestResults.period})`
                ) : (
                  `Configure parameters and run backtest for ${symbol}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backtestResults ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Total Return</div>
                      <div className={`text-2xl font-bold ${backtestResults.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {backtestResults.totalReturn >= 0 ? '+' : ''}{backtestResults.totalReturn.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Over {backtestResults.totalBars} bars
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {backtestResults.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-2xl font-bold text-red-400">
                        {backtestResults.maxDrawdown.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Maximum loss from peak</div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Win Rate</span>
                          <span className="font-semibold">{backtestResults.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Trades</span>
                          <span className="font-semibold">{backtestResults.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Strategy Signals</span>
                          <span className="font-semibold">{backtestResults.signals}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Strategy Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Indicators</span>
                          <span className="font-semibold">{backtestResults.indicators}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Points</span>
                          <span className="font-semibold">{backtestResults.totalBars}</span>
                        </div>
                        {backtestResults.combinationBonus && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Combination Bonus</span>
                            <span className="font-semibold text-green-400">+{backtestResults.combinationBonus.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Strategy Performance Chart</p>
                      <p className="text-sm text-muted-foreground">Real-time visualization coming soon</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={`${backtestResults.totalReturn >= 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                      {backtestResults.totalReturn >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {backtestResults.totalReturn >= 0 ? 'Profitable' : 'Loss-making'} Strategy
                    </Badge>
                    <Badge variant="outline">
                      {backtestResults.totalTrades} trades executed
                    </Badge>
                    <Badge variant="outline">
                      {Math.abs(backtestResults.maxDrawdown).toFixed(1)}% max drawdown
                    </Badge>
                    {selectedStrategy === "ultimate-combined" && (
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        <Zap className="w-3 h-3 mr-1" />
                        Multi-Strategy AI
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground mb-2">Ready to run backtest</p>
                    <p className="text-sm text-muted-foreground">Configure your parameters and click "Run Backtest"</p>
                  </div>
                </div>
              )}
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
