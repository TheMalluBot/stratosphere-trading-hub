
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, BookOpen, Play, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: any;
  action: string;
}

interface OnboardingGuideProps {
  tradingMode: 'live' | 'paper' | 'algo' | 'backtest';
  onClose: () => void;
}

export const OnboardingGuide = ({ tradingMode, onClose }: OnboardingGuideProps) => {
  const getStepsForMode = (mode: string): OnboardingStep[] => {
    switch (mode) {
      case 'live':
        return [
          {
            id: 'api-setup',
            title: 'Configure API Keys',
            description: 'Set up your MEXC API keys for live trading',
            completed: false,
            icon: Settings,
            action: 'Go to Settings'
          },
          {
            id: 'risk-setup',
            title: 'Set Risk Parameters',
            description: 'Configure your risk management settings',
            completed: false,
            icon: TrendingUp,
            action: 'Configure Risk'
          },
          {
            id: 'first-trade',
            title: 'Place Your First Trade',
            description: 'Execute your first live trade',
            completed: false,
            icon: Play,
            action: 'Start Trading'
          }
        ];
      case 'paper':
        return [
          {
            id: 'portfolio-setup',
            title: 'Set Virtual Portfolio',
            description: 'Configure your starting virtual balance',
            completed: true,
            icon: Settings,
            action: 'Setup Complete'
          },
          {
            id: 'learn-basics',
            title: 'Learn Trading Basics',
            description: 'Complete the basic trading tutorial',
            completed: false,
            icon: BookOpen,
            action: 'Start Tutorial'
          },
          {
            id: 'practice-trade',
            title: 'Practice Trading',
            description: 'Make your first practice trades',
            completed: false,
            icon: Play,
            action: 'Start Practice'
          }
        ];
      case 'algo':
        return [
          {
            id: 'select-strategy',
            title: 'Choose Strategy',
            description: 'Select an algorithmic trading strategy',
            completed: false,
            icon: Settings,
            action: 'Browse Strategies'
          },
          {
            id: 'configure-params',
            title: 'Configure Parameters',
            description: 'Set up strategy parameters and risk limits',
            completed: false,
            icon: TrendingUp,
            action: 'Configure Strategy'
          },
          {
            id: 'start-algo',
            title: 'Start Algorithm',
            description: 'Launch your first automated strategy',
            completed: false,
            icon: Play,
            action: 'Start Algorithm'
          }
        ];
      case 'backtest':
        return [
          {
            id: 'select-data',
            title: 'Select Historical Data',
            description: 'Choose the data period for backtesting',
            completed: false,
            icon: Settings,
            action: 'Select Data'
          },
          {
            id: 'configure-test',
            title: 'Configure Test',
            description: 'Set up backtesting parameters',
            completed: false,
            icon: TrendingUp,
            action: 'Configure Test'
          },
          {
            id: 'run-backtest',
            title: 'Run Backtest',
            description: 'Execute your first strategy backtest',
            completed: false,
            icon: Play,
            action: 'Run Backtest'
          }
        ];
      default:
        return [];
    }
  };

  const [steps] = useState(getStepsForMode(tradingMode));
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'live': return 'Live Trading';
      case 'paper': return 'Paper Trading';
      case 'algo': return 'Algorithmic Trading';
      case 'backtest': return 'Strategy Backtesting';
      default: return 'Trading';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {getModeTitle(tradingMode)} Setup Guide
            </CardTitle>
            <CardDescription>
              Complete these steps to get started with {getModeTitle(tradingMode).toLowerCase()}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Skip Guide
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Setup Progress</span>
            <Badge variant="outline">{completedSteps}/{steps.length} Complete</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={step.completed ? "outline" : "default"}
                    disabled={step.completed}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {step.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
