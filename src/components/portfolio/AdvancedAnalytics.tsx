
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  alpha: number;
}

const performanceData = [
  { date: '2024-01', portfolio: 8.2, benchmark: 6.5 },
  { date: '2024-02', portfolio: 12.1, benchmark: 9.3 },
  { date: '2024-03', portfolio: -3.4, benchmark: -1.8 },
  { date: '2024-04', portfolio: 15.7, benchmark: 11.2 },
  { date: '2024-05', portfolio: 9.8, benchmark: 8.1 },
  { date: '2024-06', portfolio: 18.3, benchmark: 14.7 }
];

const sectorAllocation = [
  { name: 'Technology', value: 35, color: '#3b82f6' },
  { name: 'Healthcare', value: 20, color: '#10b981' },
  { name: 'Financial', value: 15, color: '#f59e0b' },
  { name: 'Consumer', value: 12, color: '#ef4444' },
  { name: 'Energy', value: 10, color: '#8b5cf6' },
  { name: 'Other', value: 8, color: '#6b7280' }
];

const topHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.5, value: 125000, return: 12.3 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.2, value: 108000, return: 8.7 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 6.8, value: 102000, return: 15.2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', weight: 5.9, value: 88500, return: -4.1 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 5.3, value: 79500, return: 28.9 }
];

export function AdvancedAnalytics() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [portfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 1500000,
    totalReturn: 187500,
    totalReturnPercent: 14.2,
    sharpeRatio: 1.34,
    sortinoRatio: 1.89,
    maxDrawdown: -8.7,
    volatility: 16.8,
    beta: 1.12,
    alpha: 2.8
  });

  const refreshAnalytics = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total invested capital
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(portfolioMetrics.totalReturn)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{portfolioMetrics.totalReturnPercent}% overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {portfolioMetrics.maxDrawdown}%
            </div>
            <p className="text-xs text-muted-foreground">
              Peak to trough decline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Portfolio Analytics Dashboard
            </div>
            <Button onClick={refreshAnalytics} disabled={isUpdating} size="sm" variant="outline">
              <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive performance analysis and portfolio breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="holdings">Top Holdings</TabsTrigger>
              <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} name="Portfolio" />
                    <Line type="monotone" dataKey="benchmark" stroke="#6b7280" strokeWidth={2} name="S&P 500" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {sectorAllocation.map((sector) => (
                    <div key={sector.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                        <span className="text-sm">{sector.name}</span>
                      </div>
                      <span className="text-sm font-medium">{sector.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="holdings" className="space-y-4">
              <div className="space-y-3">
                {topHoldings.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{holding.symbol}</span>
                        <Badge variant="secondary">{holding.weight}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{holding.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(holding.value)}</div>
                      <div className={`text-sm ${holding.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.return >= 0 ? '+' : ''}{holding.return.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility</span>
                    <span className="font-medium">{portfolioMetrics.volatility}%</span>
                  </div>
                  <Progress value={portfolioMetrics.volatility} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Beta</span>
                    <span className="font-medium">{portfolioMetrics.beta}</span>
                  </div>
                  <Progress value={portfolioMetrics.beta * 50} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alpha</span>
                    <span className="font-medium text-green-600">+{portfolioMetrics.alpha}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sortino Ratio</span>
                    <span className="font-medium">{portfolioMetrics.sortinoRatio}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
