
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown } from "lucide-react";

interface StrategyPerformanceChartProps {
  strategyName: string;
  data: Array<{
    timestamp: string;
    pnl: number;
    cumulativePnl: number;
    trades: number;
  }>;
  totalReturn: number;
  winRate: number;
}

export const StrategyPerformanceChart = ({ 
  strategyName, 
  data, 
  totalReturn, 
  winRate 
}: StrategyPerformanceChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {totalReturn >= 0 ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          {strategyName} Performance
        </CardTitle>
        <CardDescription>
          Real-time performance tracking and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">Total Return</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{winRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-sm text-muted-foreground">Total Trades</div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke={totalReturn >= 0 ? "#10b981" : "#ef4444"}
                fill={totalReturn >= 0 ? "#10b981" : "#ef4444"}
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
