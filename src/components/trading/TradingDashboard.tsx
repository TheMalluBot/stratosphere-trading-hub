
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, DollarSign, BarChart3 } from "lucide-react";
import LivePriceDisplay from "./LivePriceDisplay";
import ErrorBoundary from "@/components/error/ErrorBoundary";

interface TradingDashboardProps {
  selectedSymbol: string;
  currentPrice: number;
  tradingMode: 'live' | 'paper' | 'algo' | 'backtest';
  connectionStatus: { live: boolean; configured: boolean };
}

export const TradingDashboard = ({ 
  selectedSymbol, 
  currentPrice, 
  tradingMode, 
  connectionStatus 
}: TradingDashboardProps) => {
  const getModeInfo = () => {
    switch (tradingMode) {
      case 'live':
        return {
          title: 'Live Trading Dashboard',
          description: connectionStatus.live ? 'Connected to live markets' : 'Demo mode - Configure API keys for live trading',
          color: 'text-green-500',
          bgColor: 'bg-green-50'
        };
      case 'paper':
        return {
          title: 'Paper Trading Dashboard',
          description: 'Practice environment with real market data',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        };
      case 'algo':
        return {
          title: 'Algorithmic Trading Dashboard',
          description: 'Automated strategy execution and monitoring',
          color: 'text-purple-500',
          bgColor: 'bg-purple-50'
        };
      case 'backtest':
        return {
          title: 'Backtesting Dashboard',
          description: 'Strategy testing and performance analysis',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50'
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className={`${modeInfo.bgColor} border-l-4 border-l-current`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl ${modeInfo.color} flex items-center gap-2`}>
                <BarChart3 className="w-5 h-5" />
                {modeInfo.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {modeInfo.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Price unavailable</div>}>
                <LivePriceDisplay 
                  symbol={selectedSymbol} 
                  showVolume={true}
                  showHighLow={true}
                />
              </ErrorBoundary>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedSymbol}</div>
            <p className="text-xs text-muted-foreground">Active trading pair</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mode Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={connectionStatus.live ? "default" : "secondary"}>
                {tradingMode.toUpperCase()}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.live ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {connectionStatus.live ? 'Live connection' : 'Demo mode'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Markets are open</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
