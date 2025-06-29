
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, BookOpen, Target, TrendingUp, Award } from "lucide-react";
import { useState } from "react";

interface PaperTradingDashboardProps {
  symbol: string;
  currentPrice: number;
}

export const PaperTradingDashboard = ({ symbol, currentPrice }: PaperTradingDashboardProps) => {
  const [virtualBalance] = useState(100000);
  const [totalPnL] = useState(5750.25);
  const [tradingLevel] = useState(3);
  const [completedChallenges] = useState(7);
  const [winRate] = useState(68.5);

  return (
    <div className="space-y-6">
      {/* Paper Trading Info */}
      <Alert className="border-blue-500 bg-blue-50">
        <Activity className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Paper Trading Mode:</strong> Practice with virtual money using real market data. Perfect your strategies risk-free!
        </AlertDescription>
      </Alert>

      {/* Virtual Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Virtual Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${virtualBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Starting: $100,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPnL >= 0 ? '+' : ''}{((totalPnL / 100000) * 100).toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{winRate}%</div>
            <Progress value={winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trading Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Level {tradingLevel}</div>
              <Badge variant="outline">Intermediate</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Keep practicing!</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Progress
          </CardTitle>
          <CardDescription>
            Master trading concepts through hands-on practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Basic Order Types</span>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Management</span>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Technical Analysis</span>
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Portfolio Management</span>
              <Badge className="bg-gray-100 text-gray-800">Locked</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trading Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to unlock new features and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Make 10 Profitable Trades</span>
                <Award className="w-4 h-4 text-green-500" />
              </div>
              <Progress value={100} className="h-2" />
              <div className="text-xs text-muted-foreground">Completed: 10/10</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Achieve 70% Win Rate</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <Progress value={68.5} className="h-2" />
              <div className="text-xs text-muted-foreground">Progress: 68.5/70%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Practice</CardTitle>
          <CardDescription>
            Suggested areas to focus on based on your trading history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Practice Swing Trading Strategies
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="w-4 h-4 mr-2" />
              Improve Stop Loss Placement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Study Support & Resistance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
