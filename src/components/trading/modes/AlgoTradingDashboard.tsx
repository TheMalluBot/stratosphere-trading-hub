
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Cpu, Zap, Activity, Settings, TrendingUp } from "lucide-react";
import { useAlgoTrading } from "@/hooks/useAlgoTrading";

interface AlgoTradingDashboardProps {
  symbol: string;
  currentPrice: number;
}

export const AlgoTradingDashboard = ({ symbol, currentPrice }: AlgoTradingDashboardProps) => {
  const { activeStrategies, metrics } = useAlgoTrading();

  return (
    <div className="space-y-6">
      {/* Algo Trading Status */}
      <Alert className="border-purple-500 bg-purple-50">
        <Bot className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Algorithmic Trading Active:</strong> {activeStrategies.length} strategies running. All execution is automated.
        </AlertDescription>
      </Alert>

      {/* Strategy Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeStrategies}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All strategies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-muted-foreground">Executed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.averageWinRate.toFixed(1)}%</div>
            <Progress value={metrics.averageWinRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            System Performance
          </CardTitle>
          <CardDescription>
            Real-time monitoring of algorithmic trading system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Execution Speed</div>
              <div className="text-2xl font-bold text-green-600">12ms</div>
              <div className="text-xs text-muted-foreground">Average latency</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">System Load</div>
              <div className="text-2xl font-bold text-yellow-600">45%</div>
              <Progress value={45} className="mt-1" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Data Feed</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <div className="text-xs text-muted-foreground">Real-time data</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Strategy Health Monitor
          </CardTitle>
          <CardDescription>
            Monitor the performance and health of your active strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeStrategies.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active strategies</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a strategy to see real-time monitoring here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeStrategies.slice(0, 3).map((strategy) => (
                <div key={strategy.executionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{strategy.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {strategy.symbol} • {strategy.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${strategy.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${strategy.pnl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {strategy.winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithmic Controls</CardTitle>
          <CardDescription>
            Manage your automated trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Emergency Stop All
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Optimize Parameters
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
