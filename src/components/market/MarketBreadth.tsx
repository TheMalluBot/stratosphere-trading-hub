
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export const MarketBreadth = () => {
  // Mock market breadth data
  const breadthData = [
    { time: '9:00', advancing: 65, declining: 35 },
    { time: '10:00', advancing: 72, declining: 28 },
    { time: '11:00', advancing: 58, declining: 42 },
    { time: '12:00', advancing: 45, declining: 55 },
    { time: '13:00', advancing: 38, declining: 62 },
    { time: '14:00', advancing: 52, declining: 48 },
    { time: '15:00', advancing: 68, declining: 32 },
    { time: '16:00', advancing: 75, declining: 25 }
  ];

  const currentMetrics = {
    advancing: 425,
    declining: 187,
    unchanged: 23,
    newHighs: 34,
    newLows: 8,
    volumeRatio: 2.3
  };

  const advanceDeclineRatio = (currentMetrics.advancing / currentMetrics.declining).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Advancing</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{currentMetrics.advancing}</div>
            <p className="text-xs text-muted-foreground">Coins moving up</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Declining</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{currentMetrics.declining}</div>
            <p className="text-xs text-muted-foreground">Coins moving down</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">A/D Ratio</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{advanceDeclineRatio}</div>
            <p className="text-xs text-muted-foreground">Advance/Decline</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">New Highs</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">{currentMetrics.newHighs}</div>
            <p className="text-xs text-muted-foreground">52-week highs</p>
          </CardContent>
        </Card>
      </div>

      {/* Advance/Decline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Market Breadth Timeline
          </CardTitle>
          <CardDescription>
            Hourly advance/decline ratio showing market participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breadthData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="advancing" fill="#22c55e" name="Advancing" />
                <Bar dataKey="declining" fill="#ef4444" name="Declining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Market Health Indicators</CardTitle>
          <CardDescription>
            Comprehensive view of market participation and strength
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Market Participation</span>
                <span className="text-sm text-green-500">Strong (78%)</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Buying Pressure</span>
                <span className="text-sm text-green-500">Bullish (65%)</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Volume Confirmation</span>
                <span className="text-sm text-blue-500">Confirmed (85%)</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-500">Bullish Market Breadth</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strong advance/decline ratio and volume confirmation suggest healthy market 
              participation across most cryptocurrency sectors. New highs outnumbering 
              new lows indicates continued upward momentum.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
