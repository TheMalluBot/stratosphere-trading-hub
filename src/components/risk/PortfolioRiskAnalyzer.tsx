
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Shield, TrendingDown, AlertTriangle, Target, Activity, PieChart as PieChartIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface RiskMetric {
  name: string;
  value: number;
  status: 'low' | 'medium' | 'high';
  threshold: number;
}

interface AssetRisk {
  symbol: string;
  allocation: number;
  volatility: number;
  correlation: number;
  var: number;
  beta: number;
}

const PortfolioRiskAnalyzer = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [assetRisks, setAssetRisks] = useState<AssetRisk[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<any[]>([]);
  const [varHistory, setVarHistory] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock risk data
    const mockRiskMetrics: RiskMetric[] = [
      { name: 'Portfolio VaR (1 day)', value: 2.3, status: 'medium', threshold: 3.0 },
      { name: 'Sharpe Ratio', value: 1.85, status: 'high', threshold: 1.5 },
      { name: 'Maximum Drawdown', value: 8.5, status: 'low', threshold: 15.0 },
      { name: 'Beta', value: 1.2, status: 'medium', threshold: 1.5 },
      { name: 'Volatility (30d)', value: 18.3, status: 'medium', threshold: 25.0 },
      { name: 'Concentration Risk', value: 32.1, status: 'medium', threshold: 40.0 }
    ];

    const mockAssetRisks: AssetRisk[] = [
      { symbol: 'BTC', allocation: 35.5, volatility: 45.2, correlation: 1.0, var: 3.2, beta: 1.8 },
      { symbol: 'ETH', allocation: 28.3, volatility: 52.1, correlation: 0.85, var: 2.9, beta: 1.6 },
      { symbol: 'BNB', allocation: 15.2, volatility: 38.7, correlation: 0.72, var: 1.8, beta: 1.3 },
      { symbol: 'ADA', allocation: 12.1, volatility: 55.3, correlation: 0.68, var: 2.1, beta: 1.4 },
      { symbol: 'SOL', allocation: 8.9, volatility: 62.4, correlation: 0.71, var: 2.4, beta: 1.7 }
    ];

    const mockVarHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      var1d: 1.5 + Math.random() * 2,
      var5d: 3.2 + Math.random() * 3,
      var10d: 4.8 + Math.random() * 4
    }));

    setRiskMetrics(mockRiskMetrics);
    setAssetRisks(mockAssetRisks);
    setVarHistory(mockVarHistory);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Portfolio Risk Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive risk assessment and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">Asset Risk</TabsTrigger>
              <TabsTrigger value="correlation">Correlation</TabsTrigger>
              <TabsTrigger value="var">VaR Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {riskMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}%</div>
                      <Progress 
                        value={(metric.value / metric.threshold) * 100} 
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Threshold: {metric.threshold}%
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">High concentration in top 2 assets (63.8%)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Portfolio beta above market average (1.2)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetRisks}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="allocation"
                          >
                            {assetRisks.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volatility by Asset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assetRisks}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="symbol" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}%`, 'Volatility']} />
                          <Bar dataKey="volatility" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Individual Asset Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Asset</th>
                          <th className="text-right p-2">Allocation</th>
                          <th className="text-right p-2">Volatility</th>
                          <th className="text-right p-2">Beta</th>
                          <th className="text-right p-2">VaR</th>
                          <th className="text-right p-2">Correlation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetRisks.map((asset, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{asset.symbol}</td>
                            <td className="p-2 text-right">{asset.allocation}%</td>
                            <td className="p-2 text-right">{asset.volatility}%</td>
                            <td className="p-2 text-right">{asset.beta}</td>
                            <td className="p-2 text-right">{asset.var}%</td>
                            <td className="p-2 text-right">{(asset.correlation * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asset Correlation Matrix</CardTitle>
                  <CardDescription>
                    Correlation between different assets in your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Advanced correlation analysis coming soon...</p>
                    <p className="text-sm mt-2">Will show heat map of asset correlations</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="var" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Value at Risk (VaR) Trends</CardTitle>
                  <CardDescription>
                    Historical VaR analysis for different time horizons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={varHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="var1d" stroke="#22c55e" strokeWidth={2} name="1 Day VaR" />
                        <Line type="monotone" dataKey="var5d" stroke="#3b82f6" strokeWidth={2} name="5 Day VaR" />
                        <Line type="monotone" dataKey="var10d" stroke="#ef4444" strokeWidth={2} name="10 Day VaR" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioRiskAnalyzer;
