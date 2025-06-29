
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, BarChart3, Clock, Database, Play, TrendingUp } from "lucide-react";
import { useState } from "react";

interface BacktestDashboardProps {
  symbol: string;
}

export const BacktestDashboard = ({ symbol }: BacktestDashboardProps) => {
  const [backtestProgress] = useState(0);
  const [completedTests] = useState(12);
  const [bestStrategy] = useState("ML Momentum Strategy");
  const [bestReturn] = useState(34.5);

  return (
    <div className="space-y-6">
      {/* Backtesting Info */}
      <Alert className="border-orange-500 bg-orange-50">
        <TestTube className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Strategy Backtesting:</strong> Test your strategies against historical data to validate performance before live trading.
        </AlertDescription>
      </Alert>

      {/* Backtesting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{bestStrategy}</div>
            <p className="text-xs text-muted-foreground">Highest return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bestReturn}%</div>
            <p className="text-xs text-muted-foreground">Annual return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2Y</div>
            <p className="text-xs text-muted-foreground">Historical data</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Backtest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Backtest
          </CardTitle>
          <CardDescription>
            Monitor the progress of your running backtest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backtestProgress === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No backtest running</p>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Start New Backtest
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Linear Regression Strategy</span>
                <Badge variant="outline">Running</Badge>
              </div>
              <Progress value={backtestProgress} />
              <div className="text-sm text-muted-foreground">
                Testing period: 2022-01-01 to 2024-01-01
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Historical Performance
          </CardTitle>
          <CardDescription>
            Performance comparison of your tested strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">ML Momentum Strategy</div>
                <div className="text-sm text-muted-foreground">BTCUSDT • 2Y period</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">+34.5%</div>
                <div className="text-sm text-muted-foreground">Sharpe: 1.42</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Statistical Arbitrage</div>
                <div className="text-sm text-muted-foreground">ETHUSDT • 2Y period</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">+28.2%</div>
                <div className="text-sm text-muted-foreground">Sharpe: 1.18</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Pairs Trading</div>
                <div className="text-sm text-muted-foreground">BTC/ETH • 1Y period</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">+15.7%</div>
                <div className="text-sm text-muted-foreground">Sharpe: 0.95</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Sources
          </CardTitle>
          <CardDescription>
            Available historical data for backtesting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">BTCUSDT</span>
                <Badge className="bg-green-100 text-green-800">3Y Data</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                1m, 5m, 15m, 1h, 4h, 1d intervals
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ETHUSDT</span>
                <Badge className="bg-green-100 text-green-800">3Y Data</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                1m, 5m, 15m, 1h, 4h, 1d intervals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Backtesting Tools</CardTitle>
          <CardDescription>
            Advanced tools for strategy testing and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Quick Backtest
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Strategies
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Parameters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
