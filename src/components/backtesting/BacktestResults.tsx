
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Zap, Activity, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BacktestResultsProps {
  backtestResults: any;
  symbol: string;
  selectedStrategy: string;
}

export const BacktestResults = ({ backtestResults, symbol, selectedStrategy }: BacktestResultsProps) => {
  const strategies = [
    {
      value: "linear-regression",
      label: "Linear Regression Oscillator",
    },
    {
      value: "z-score-trend",
      label: "Rolling Z-Score Trend",
    },
    {
      value: "stop-loss-tp",
      label: "Stop Loss & Take Profit",
    },
    {
      value: "deviation-trend",
      label: "Deviation Trend Profile",
    },
    {
      value: "volume-profile",
      label: "Multi-Layer Volume Profile",
    },
    {
      value: "ultimate-combined",
      label: "🚀 Ultimate Combined Strategy",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Enhanced Backtest Results
          {backtestResults && (
            <Badge variant="outline" className="ml-2">
              {backtestResults.signals} signals
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {backtestResults ? (
            `Multi-threaded analysis for ${backtestResults.strategy} (${backtestResults.period})`
          ) : (
            `Configure parameters and run enhanced backtest for ${symbol}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {backtestResults ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
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
                  <h4 className="font-semibold">Processing Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPU Cores Used</span>
                      <span className="font-semibold">{navigator.hardwareConcurrency || 4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Points</span>
                      <span className="font-semibold">{backtestResults.totalBars}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Mode</span>
                      <span className="font-semibold text-green-400">Multi-threaded</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {backtestResults.advanced ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Advanced Ratios
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calmar Ratio</span>
                        <span className="font-semibold">{backtestResults.advanced.calmarRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sortino Ratio</span>
                        <span className="font-semibold">{backtestResults.advanced.sortinoRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Information Ratio</span>
                        <span className="font-semibold">{backtestResults.advanced.informationRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Factor</span>
                        <span className="font-semibold">{backtestResults.advanced.profitFactor.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Risk Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ulcer Index</span>
                        <span className="font-semibold">{backtestResults.advanced.ulcerIndex.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">VaR (95%)</span>
                        <span className="font-semibold text-red-400">{(backtestResults.advanced.var95 * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CVaR (95%)</span>
                        <span className="font-semibold text-red-400">{(backtestResults.advanced.cvar95 * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Enable Advanced Analytics to see detailed metrics</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <div className="space-y-2 text-sm">
                  <p>• Maximum drawdown represents the worst peak-to-trough decline</p>
                  <p>• Sharpe ratio measures risk-adjusted returns</p>
                  <p>• VaR shows potential losses at 95% confidence level</p>
                  <p>• CVaR shows expected losses beyond the VaR threshold</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">Enhanced Backtest Engine Ready</p>
              <p className="text-sm text-muted-foreground">Multi-threaded processing with advanced analytics</p>
            </div>
          </div>
        )}

        {backtestResults && (
          <div className="flex gap-2 flex-wrap mt-4">
            <Badge variant="outline" className={`${backtestResults.totalReturn >= 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
              {backtestResults.totalReturn >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {backtestResults.totalReturn >= 0 ? 'Profitable' : 'Loss-making'} Strategy
            </Badge>
            <Badge variant="outline">
              {backtestResults.totalTrades} trades executed
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              Multi-threaded Engine
            </Badge>
            {backtestResults.advanced && (
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                <Activity className="w-3 h-3 mr-1" />
                Advanced Analytics
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
