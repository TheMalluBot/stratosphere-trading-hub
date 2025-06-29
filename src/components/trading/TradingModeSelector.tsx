
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Activity, Bot, TestTube, Zap, Shield, TrendingUp } from "lucide-react";

interface TradingModeSelectorProps {
  currentMode: 'live' | 'paper' | 'algo' | 'backtest';
  onModeChange: (mode: 'live' | 'paper' | 'algo' | 'backtest') => void;
  connectionStatus: { live: boolean; configured: boolean };
}

export const TradingModeSelector = ({ currentMode, onModeChange, connectionStatus }: TradingModeSelectorProps) => {
  const modes = [
    {
      id: 'live' as const,
      title: 'Live Trading',
      description: 'Execute real trades with live market data',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      features: ['Real-time execution', 'Live market data', 'Real money'],
      status: connectionStatus.live ? 'CONNECTED' : 'DEMO'
    },
    {
      id: 'paper' as const,
      title: 'Paper Trading',
      description: 'Practice trading with virtual money',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      features: ['Risk-free practice', 'Real market data', 'Virtual portfolio'],
      status: 'READY'
    },
    {
      id: 'algo' as const,
      title: 'Algorithmic Trading',
      description: 'Automated trading with custom strategies',
      icon: Bot,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 border-purple-200',
      features: ['Automated execution', 'Custom strategies', 'Advanced algorithms'],
      status: 'ADVANCED'
    },
    {
      id: 'backtest' as const,
      title: 'Strategy Backtesting',
      description: 'Test strategies on historical data',
      icon: TestTube,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 border-orange-200',
      features: ['Historical testing', 'Performance metrics', 'Strategy validation'],
      status: 'ANALYSIS'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <Card 
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isActive 
                ? `${mode.bgColor} border-2 shadow-md` 
                : 'border border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${mode.color}`} />
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {mode.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{mode.title}</CardTitle>
              <CardDescription className="text-sm">
                {mode.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {mode.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              {isActive && (
                <Button size="sm" className="w-full mt-3">
                  <Zap className="w-3 h-3 mr-1" />
                  Active Mode
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
