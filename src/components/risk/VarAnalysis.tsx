
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, BarChart3, Calculator, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

interface VarData {
  date: string;
  var95: number;
  var99: number;
  actualPnL: number;
  expectedShortfall: number;
}

const historicalVarData: VarData[] = [
  { date: '2024-01-01', var95: -2.1, var99: -3.2, actualPnL: -1.8, expectedShortfall: -4.1 },
  { date: '2024-01-02', var95: -2.3, var99: -3.5, actualPnL: -2.8, expectedShortfall: -4.3 },
  { date: '2024-01-03', var95: -1.9, var99: -2.9, actualPnL: -1.2, expectedShortfall: -3.8 },
  { date: '2024-01-04', var95: -2.5, var99: -3.8, actualPnL: -3.1, expectedShortfall: -4.5 },
  { date: '2024-01-05', var95: -2.2, var99: -3.3, actualPnL: -1.9, expectedShortfall: -4.0 },
  { date: '2024-01-06', var95: -2.0, var99: -3.1, actualPnL: -1.5, expectedShortfall: -3.9 },
  { date: '2024-01-07', var95: -2.4, var99: -3.6, actualPnL: -2.7, expectedShortfall: -4.2 }
];

const componentVarData = [
  { component: 'Equity Portfolio', var95: -1.8, var99: -2.7, contribution: 65, sharpe: 1.2 },
  { component: 'Fixed Income', var95: -0.3, var99: -0.5, contribution: 20, sharpe: 0.8 },
  { component: 'Commodities', var95: -0.4, var99: -0.6, contribution: 10, sharpe: 0.9 },
  { component: 'Currency', var95: -0.2, var99: -0.3, contribution: 5, sharpe: 0.6 }
];

const scenarioData = [
  { scenario: 'Market Crash (-20%)', var: -8.5, probability: 1, impact: 'Severe' },
  { scenario: 'Interest Rate Spike (+2%)', var: -3.2, probability: 15, impact: 'Moderate' },
  { scenario: 'Sector Rotation', var: -1.8, probability: 25, impact: 'Low' },
  { scenario: 'Currency Devaluation', var: -2.1, probability: 10, impact: 'Moderate' },
  { scenario: 'Geopolitical Crisis', var: -4.3, probability: 5, impact: 'High' }
];

export function VarAnalysis() {
  const [timeHorizon, setTimeHorizon] = useState("1");
  const [confidenceLevel, setConfidenceLevel] = useState("95");
  const [methodology, setMethodology] = useState("historical");

  const currentVar95 = -2.2;
  const currentVar99 = -3.3;
  const portfolioValue = 1250000;
  const var95Amount = Math.abs(currentVar95 * portfolioValue / 100);
  const var99Amount = Math.abs(currentVar99 * portfolioValue / 100);

  const backtestResults = {
    violations95: 3,
    violations99: 1,
    totalDays: 252,
    kupiecTest: 'Pass',
    christoffersenTest: 'Pass'
  };

  return (
    <div className="space-y-6">
      {/* VaR Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              VaR (95%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currentVar95.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${var95Amount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              VaR (99%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {currentVar99.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${var99Amount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Expected Shortfall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              -4.0%
            </div>
            <p className="text-xs text-muted-foreground">
              Conditional VaR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              97.2%
            </div>
            <p className="text-xs text-muted-foreground">
              Backtest success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VaR Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            VaR Configuration
          </CardTitle>
          <CardDescription>
            Configure Value at Risk calculation parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Horizon</label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="10">10 Days</SelectItem>
                  <SelectItem value="21">1 Month</SelectItem>
                  <SelectItem value="252">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Level</label>
              <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                  <SelectItem value="99.9">99.9%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Methodology</label>
              <Select value={methodology} onValueChange={setMethodology}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical Simulation</SelectItem>
                  <SelectItem value="parametric">Parametric</SelectItem>
                  <SelectItem value="montecarlo">Monte Carlo</SelectItem>
                  <SelectItem value="garch">GARCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed VaR Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Value at Risk Analysis</CardTitle>
          <CardDescription>
            Detailed VaR metrics and historical performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="historical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="historical">Historical VaR</TabsTrigger>
              <TabsTrigger value="components">Component VaR</TabsTrigger>
              <TabsTrigger value="scenarios">Stress Scenarios</TabsTrigger>
              <TabsTrigger value="backtest">Backtesting</TabsTrigger>
            </TabsList>

            <TabsContent value="historical" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalVarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="var95" stroke="#ef4444" strokeWidth={2} name="VaR 95%" />
                    <Line type="monotone" dataKey="var99" stroke="#dc2626" strokeWidth={2} name="VaR 99%" />
                    <Line type="monotone" dataKey="actualPnL" stroke="#10b981" strokeWidth={2} name="Actual P&L" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <div className="space-y-3">
                {componentVarData.map((component) => (
                  <div key={component.component} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{component.component}</h4>
                        <p className="text-sm text-muted-foreground">
                          {component.contribution}% portfolio weight
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {component.var95.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sharpe: {component.sharpe}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">VaR 95%</div>
                        <div className="font-medium text-red-600">
                          {component.var95.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">VaR 99%</div>
                        <div className="font-medium text-red-700">
                          {component.var99.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress value={component.contribution} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <div className="space-y-3">
                {scenarioData.map((scenario) => (
                  <div key={scenario.scenario} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{scenario.scenario}</h4>
                      <Badge variant={
                        scenario.impact === 'Severe' ? 'destructive' :
                        scenario.impact === 'High' ? 'destructive' :
                        scenario.impact === 'Moderate' ? 'secondary' : 'default'
                      }>
                        {scenario.impact} Impact
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">Potential Loss</div>
                        <div className="font-medium text-red-600">
                          {scenario.var.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Probability</div>
                        <div className="font-medium">
                          {scenario.probability}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Loss</div>
                        <div className="font-medium">
                          ${Math.abs(scenario.var * scenario.probability * portfolioValue / 10000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="backtest" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Backtesting Results</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">VaR 95% Violations</span>
                        <span className="font-medium">{backtestResults.violations95} / {backtestResults.totalDays}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected: {Math.round(backtestResults.totalDays * 0.05)} violations
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">VaR 99% Violations</span>
                        <span className="font-medium">{backtestResults.violations99} / {backtestResults.totalDays}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected: {Math.round(backtestResults.totalDays * 0.01)} violations
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Statistical Tests</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Kupiec Test</span>
                        <Badge variant="default">{backtestResults.kupiecTest}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Tests violation frequency
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Christoffersen Test</span>
                        <Badge variant="default">{backtestResults.christoffersenTest}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Tests violation clustering
                      </div>
                    </div>
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
