
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Zap } from "lucide-react";

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
  );
};
