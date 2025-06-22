
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, BarChart3, Activity, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";

interface BenchmarkMetric {
  name: string;
  portfolio: number;
  benchmark: number;
  difference: number;
  status: 'outperform' | 'underperform' | 'neutral';
}

const performanceComparison = [
  { date: '2024-01', portfolio: 8.2, sp500: 6.5, nasdaq: 7.8, russell: 5.9 },
  { date: '2024-02', portfolio: 12.1, sp500: 9.3, nasdaq: 11.5, russell: 8.7 },
  { date: '2024-03', portfolio: -3.4, sp500: -1.8, nasdaq: -2.9, russell: -1.2 },
  { date: '2024-04', portfolio: 15.7, sp500: 11.2, nasdaq: 14.3, russell: 10.8 },
  { date: '2024-05', portfolio: 9.8, sp500: 8.1, nasdaq: 9.2, russell: 7.6 },
  { date: '2024-06', portfolio: 18.3, sp500: 14.7, nasdaq: 16.9, russell: 13.4 }
];

const benchmarkMetrics: BenchmarkMetric[] = [
  { name: 'Total Return', portfolio: 14.2, benchmark: 11.8, difference: 2.4, status: 'outperform' },
  { name: 'Sharpe Ratio', portfolio: 1.34, benchmark: 1.12, difference: 0.22, status: 'outperform' },
  { name: 'Volatility', portfolio: 16.8, benchmark: 18.2, difference: -1.4, status: 'outperform' },
  { name: 'Max Drawdown', portfolio: -8.7, benchmark: -12.3, difference: 3.6, status: 'outperform' },
  { name: 'Beta', portfolio: 1.12, benchmark: 1.00, difference: 0.12, status: 'neutral' },
  { name: 'Alpha', portfolio: 2.8, benchmark: 0.0, difference: 2.8, status: 'outperform' }
];

const trackingData = [
  { date: '2024-01', trackingError: 2.1, informationRatio: 0.45 },
  { date: '2024-02', trackingError: 2.8, informationRatio: 0.52 },
  { date: '2024-03', trackingError: 3.2, informationRatio: 0.38 },
  { date: '2024-04', trackingError: 2.9, informationRatio: 0.67 },
  { date: '2024-05', trackingError: 2.4, informationRatio: 0.71 },
  { date: '2024-06', trackingError: 2.2, informationRatio: 0.78 }
];

const riskReturnScatter = [
  { risk: 16.8, return: 14.2, name: 'Portfolio' },
  { risk: 18.2, return: 11.8, name: 'S&P 500' },
  { risk: 19.5, return: 13.1, name: 'NASDAQ' },
  { risk: 17.1, return: 10.5, name: 'Russell 2000' },
  { risk: 15.3, return: 9.8, name: 'Russell 1000' },
  { risk: 12.4, return: 6.2, name: 'Bonds' }
];

export function BenchmarkAnalysis() {
  const [selectedBenchmark, setSelectedBenchmark] = useState("sp500");
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshData = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'outperform': return 'text-green-600';
      case 'underperform': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'outperform': return 'default';
      case 'underperform': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'outline';
    }
  };

  const currentTrackingError = trackingData[trackingData.length - 1]?.trackingError || 0;
  const currentInfoRatio = trackingData[trackingData.length - 1]?.informationRatio || 0;

  return (
    <div className="space-y-6">
      {/* Benchmark Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alpha</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+2.8%</div>
            <p className="text-xs text-muted-foreground">
              Excess return vs benchmark
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.12</div>
            <p className="text-xs text-muted-foreground">
              Market sensitivity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking Error</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTrackingError.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Standard deviation of excess returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Information Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentInfoRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Alpha per unit of tracking error
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Benchmark Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Benchmark Analysis Dashboard
            </div>
            <Button onClick={refreshData} disabled={isUpdating} size="sm" variant="outline">
              <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Performance comparison and tracking analysis vs market benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
              <TabsTrigger value="tracking">Tracking Analysis</TabsTrigger>
              <TabsTrigger value="riskreturn">Risk-Return</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={3} name="Portfolio" />
                    <Line type="monotone" dataKey="sp500" stroke="#6b7280" strokeWidth={2} name="S&P 500" />
                    <Line type="monotone" dataKey="nasdaq" stroke="#10b981" strokeWidth={2} name="NASDAQ" />
                    <Line type="monotone" dataKey="russell" stroke="#f59e0b" strokeWidth={2} name="Russell 2000" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Portfolio Return</div>
                  <div className="text-xl font-bold text-green-600">+14.2%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">S&P 500 Return</div>
                  <div className="text-xl font-bold">+11.8%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Excess Return</div>
                  <div className="text-xl font-bold text-green-600">+2.4%</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="space-y-3">
                {benchmarkMetrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{metric.name}</h4>
                        <Badge variant={getStatusBadge(metric.status)}>
                          {metric.status === 'outperform' ? 'Outperform' : 
                           metric.status === 'underperform' ? 'Underperform' : 'Neutral'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[200px]">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Portfolio:</span>
                        <span className="font-medium">
                          {metric.name.includes('Drawdown') && metric.portfolio < 0 ? '' : 
                           metric.portfolio > 0 && !metric.name.includes('Drawdown') && !metric.name.includes('Volatility') ? '+' : ''}
                          {metric.portfolio.toFixed(2)}
                          {metric.name.includes('Return') || metric.name.includes('Drawdown') || metric.name.includes('Volatility') ? '%' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Benchmark:</span>
                        <span className="font-medium">
                          {metric.benchmark.toFixed(2)}
                          {metric.name.includes('Return') || metric.name.includes('Drawdown') || metric.name.includes('Volatility') ? '%' : ''}
                        </span>
                      </div>
                      <div className={`text-sm ${getStatusColor(metric.status)}`}>
                        Difference: {metric.difference >= 0 ? '+' : ''}{metric.difference.toFixed(2)}
                        {metric.name.includes('Return') || metric.name.includes('Drawdown') || metric.name.includes('Volatility') ? '%' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trackingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="trackingError" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Tracking Error %" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="informationRatio" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Information Ratio" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">Tracking Error Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-medium">{currentTrackingError.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average:</span>
                      <span className="font-medium">2.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Trend:</span>
                      <span className="text-green-600 font-medium">Decreasing</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Information Ratio</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-medium">{currentInfoRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average:</span>
                      <span className="font-medium">0.58</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Trend:</span>
                      <span className="text-green-600 font-medium">Improving</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="riskreturn" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={riskReturnScatter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk" name="Risk %" />
                    <YAxis dataKey="return" name="Return %" />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'risk' ? 'Risk' : 'Return'
                      ]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                    />
                    <Scatter dataKey="return" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {riskReturnScatter.map((point) => (
                  <div key={point.name} className="p-3 border rounded-lg">
                    <div className="font-semibold mb-2">{point.name}</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return:</span>
                        <span className={point.name === 'Portfolio' ? 'text-green-600 font-medium' : ''}>
                          {point.return.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk:</span>
                        <span className={point.name === 'Portfolio' ? 'font-medium' : ''}>
                          {point.risk.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sharpe:</span>
                        <span className={point.name === 'Portfolio' ? 'font-medium' : ''}>
                          {(point.return / point.risk).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
