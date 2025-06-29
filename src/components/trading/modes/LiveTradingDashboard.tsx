
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, DollarSign, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface LiveTradingDashboardProps {
  symbol: string;
  currentPrice: number;
  connectionStatus: { live: boolean; configured: boolean };
}

export const LiveTradingDashboard = ({ symbol, currentPrice, connectionStatus }: LiveTradingDashboardProps) => {
  const [riskLevel, setRiskLevel] = useState(2.5);
  const [accountBalance] = useState(50000);
  const [dailyPnL] = useState(1250.50);
  const [openPositions] = useState(3);

  return (
    <div className="space-y-6">
      {/* Connection Status Alert */}
      {!connectionStatus.configured && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Demo Mode Active:</strong> Configure your API keys in Settings to enable live trading with real funds.
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus.configured && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Live Trading Active:</strong> Connected to MEXC exchange. All trades will use real funds.
          </AlertDescription>
        </Alert>
      )}

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${dailyPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailyPnL >= 0 ? '+' : ''}{((dailyPnL / accountBalance) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPositions}</div>
            <p className="text-xs text-muted-foreground">Active trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskLevel}%</div>
            <Progress value={riskLevel * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Management
          </CardTitle>
          <CardDescription>
            Real-time risk monitoring and position management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Maximum Risk Per Trade</div>
              <div className="text-2xl font-bold text-blue-600">2.5%</div>
              <div className="text-xs text-muted-foreground">Of account balance</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Daily Loss Limit</div>
              <div className="text-2xl font-bold text-red-600">5.0%</div>
              <div className="text-xs text-muted-foreground">Auto-stop at limit</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Position Sizing</div>
              <div className="text-2xl font-bold text-green-600">Auto</div>
              <div className="text-xs text-muted-foreground">Kelly Criterion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common trading actions for live market execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Close All Positions
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Enable Stop Loss
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Buy {symbol}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
