
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Shield, AlertTriangle, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface RiskMetric {
  name: string;
  value: number;
  benchmark: number;
  status: 'good' | 'warning' | 'danger';
  description: string;
}

const riskMetrics: RiskMetric[] = [
  { name: 'Sharpe Ratio', value: 1.34, benchmark: 1.12, status: 'good', description: 'Risk-adjusted return measure' },
  { name: 'Sortino Ratio', value: 1.89, benchmark: 1.45, status: 'good', description: 'Downside risk-adjusted return' },
  { name: 'Information Ratio', value: 0.67, benchmark: 0.50, status: 'good', description: 'Active return vs tracking error' },
  { name: 'Calmar Ratio', value: 1.12, benchmark: 0.89, status: 'good', description: 'Annual return vs max drawdown' },
  { name: 'Maximum Drawdown', value: -8.7, benchmark: -12.3, status: 'good', description: 'Peak to trough decline' },
  { name: 'Volatility', value: 16.8, benchmark: 18.2, status: 'good', description: 'Standard deviation of returns' },
  { name: 'VaR (95%)', value: -2.3, benchmark: -2.8, status: 'warning', description: 'Value at Risk 95% confidence' },
  { name: 'Beta', value: 1.12, benchmark: 1.00, status: 'warning', description: 'Sensitivity to market movements' }
];

const drawdownData = [
  { date: '2024-01', drawdown: 0, portfolio: 100 },
  { date: '2024-02', drawdown: -2.1, portfolio: 97.9 },
  { date: '2024-03', drawdown: -5.4, portfolio: 94.6 },
  { date: '2024-04', drawdown: -8.7, portfolio: 91.3 },
  { date: '2024-05', drawdown: -4.2, portfolio: 95.8 },
  { date: '2024-06', drawdown: 0, portfolio: 100 }
];

const correlationMatrix = [
  { asset: 'Portfolio', portfolio: 1.00, sp500: 0.85, nasdaq: 0.78, bonds: -0.12, gold: 0.23 },
  { asset: 'S&P 500', portfolio: 0.85, sp500: 1.00, nasdaq: 0.89, bonds: -0.08, gold: 0.18 },
  { asset: 'NASDAQ', portfolio: 0.78, sp500: 0.89, nasdaq: 1.00, bonds: -0.15, gold: 0.09 },
  { asset: 'Bonds', portfolio: -0.12, sp500: -0.08, nasdaq: -0.15, bonds: 1.00, gold: 0.34 },
  { asset: 'Gold', portfolio: 0.23, sp500: 0.18, nasdaq: 0.09, bonds: 0.34, gold: 1.00 }
];

const rollingVolatility = [
  { date: '2024-01', volatility: 14.2 },
  { date: '2024-02', volatility: 15.8 },
  { date: '2024-03', volatility: 18.9 },
  { date: '2024-04', volatility: 21.3 },
  { date: '2024-05', volatility: 17.6 },
  { date: '2024-06', volatility: 16.8 }
];

export function RiskMetrics() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'outline';
    }
  };

  const getCorrelationColor = (value: number) => {
    const intensity = Math.abs(value);
    if (value > 0) {
      return `rgba(34, 197, 94, ${intensity})`;
    } else {
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Beta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.12</div>
            <p className="text-xs text-muted-foreground">
              12% more volatile than market
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1.34</div>
            <p className="text-xs text-muted-foreground">
              Above benchmark (1.12)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-8.7%</div>
            <p className="text-xs text-muted-foreground">
              Better than benchmark (-12.3%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VaR (95%)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">-2.3%</div>
            <p className="text-xs text-muted-foreground">
              Daily value at risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive risk metrics and portfolio sensitivity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Risk Overview</TabsTrigger>
              <TabsTrigger value="drawdown">Drawdown Analysis</TabsTrigger>
              <TabsTrigger value="correlation">Correlation Matrix</TabsTrigger>
              <TabsTrigger value="volatility">Volatility Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {riskMetrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{metric.name}</h4>
                        <Badge variant={getStatusBadge(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    
                    <div className="text-right min-w-[120px]">
                      <div className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value > 0 && !metric.name.includes('Drawdown') && !metric.name.includes('VaR') ? '+' : ''}
                        {metric.value.toFixed(2)}
                        {metric.name.includes('Drawdown') || metric.name.includes('Volatility') ? '%' : ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Benchmark: {metric.benchmark.toFixed(2)}
                        {metric.name.includes('Drawdown') || metric.name.includes('Volatility') ? '%' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drawdown" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={drawdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#ef4444" 
                      fill="#fecaca" 
                      name="Drawdown %" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Maximum Drawdown</div>
                  <div className="text-xl font-bold text-red-600">-8.7%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Recovery Time</div>
                  <div className="text-xl font-bold">2.1 months</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Pain Index</div>
                  <div className="text-xl font-bold">0.42</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Asset</th>
                      <th className="text-center p-2 border-b">Portfolio</th>
                      <th className="text-center p-2 border-b">S&P 500</th>
                      <th className="text-center p-2 border-b">NASDAQ</th>
                      <th className="text-center p-2 border-b">Bonds</th>
                      <th className="text-center p-2 border-b">Gold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.map((row) => (
                      <tr key={row.asset}>
                        <td className="p-2 font-medium border-b">{row.asset}</td>
                        <td 
                          className="p-2 text-center border-b"
                          style={{ backgroundColor: getCorrelationColor(row.portfolio) }}
                        >
                          {row.portfolio.toFixed(2)}
                        </td>
                        <td 
                          className="p-2 text-center border-b"
                          style={{ backgroundColor: getCorrelationColor(row.sp500) }}
                        >
                          {row.sp500.toFixed(2)}
                        </td>
                        <td 
                          className="p-2 text-center border-b"
                          style={{ backgroundColor: getCorrelationColor(row.nasdaq) }}
                        >
                          {row.nasdaq.toFixed(2)}
                        </td>
                        <td 
                          className="p-2 text-center border-b"
                          style={{ backgroundColor: getCorrelationColor(row.bonds) }}
                        >
                          {row.bonds.toFixed(2)}
                        </td>
                        <td 
                          className="p-2 text-center border-b"
                          style={{ backgroundColor: getCorrelationColor(row.gold) }}
                        >
                          {row.gold.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Correlation ranges from -1 (perfect negative correlation) to +1 (perfect positive correlation).</p>
                <p>Green indicates positive correlation, red indicates negative correlation.</p>
              </div>
            </TabsContent>

            <TabsContent value="volatility" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rollingVolatility}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="volatility" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Rolling Volatility %" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Volatility</div>
                  <div className="text-xl font-bold">16.8%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Volatility</div>
                  <div className="text-xl font-bold">17.4%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Volatility Trend</div>
                  <div className="text-xl font-bold text-green-600">Decreasing</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
