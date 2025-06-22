
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, TrendingDown, BarChart3, Play, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from "recharts";

interface StressScenario {
  name: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Extreme';
  probability: number;
  marketShock: number;
  sectorImpact: { [key: string]: number };
  portfolioImpact: number;
  timeToRecovery: number;
}

const predefinedScenarios: StressScenario[] = [
  {
    name: '2008 Financial Crisis',
    description: 'Global financial system collapse',
    category: 'Historical',
    severity: 'Extreme',
    probability: 2,
    marketShock: -45,
    sectorImpact: { 'Financial': -60, 'Technology': -35, 'Healthcare': -20, 'Energy': -40 },
    portfolioImpact: -38.5,
    timeToRecovery: 18
  },
  {
    name: 'COVID-19 Pandemic',
    description: 'Global pandemic and lockdowns',
    category: 'Historical',
    severity: 'High',
    probability: 5,
    marketShock: -35,
    sectorImpact: { 'Travel': -70, 'Technology': 15, 'Healthcare': 25, 'Energy': -45 },
    portfolioImpact: -22.3,
    timeToRecovery: 12
  },
  {
    name: 'Interest Rate Shock',
    description: 'Sudden 3% rate increase',
    category: 'Macroeconomic',
    severity: 'Medium',
    probability: 15,
    marketShock: -15,
    sectorImpact: { 'Financial': 5, 'Technology': -25, 'Utilities': -20, 'Real Estate': -30 },
    portfolioImpact: -12.8,
    timeToRecovery: 6
  },
  {
    name: 'Geopolitical Crisis',
    description: 'Major conflict or trade war',
    category: 'Geopolitical',
    severity: 'High',
    probability: 10,
    marketShock: -25,
    sectorImpact: { 'Defense': 20, 'Energy': -15, 'Technology': -30, 'Materials': -20 },
    portfolioImpact: -18.7,
    timeToRecovery: 9
  },
  {
    name: 'Cyber Attack',
    description: 'Major infrastructure cyber attack',
    category: 'Operational',
    severity: 'Medium',
    probability: 20,
    marketShock: -8,
    sectorImpact: { 'Technology': -40, 'Financial': -25, 'Utilities': -30, 'Healthcare': -15 },
    portfolioImpact: -15.2,
    timeToRecovery: 4
  }
];

const monteCarloResults = [
  { scenario: 'Best Case (5%)', portfolioValue: 1625000, change: 30.0 },
  { scenario: 'Good Case (25%)', portfolioValue: 1375000, change: 10.0 },
  { scenario: 'Base Case (50%)', portfolioValue: 1250000, change: 0.0 },
  { scenario: 'Poor Case (75%)', portfolioValue: 1125000, change: -10.0 },
  { scenario: 'Worst Case (95%)', portfolioValue: 875000, change: -30.0 }
];

const correlationMatrix = [
  { asset: 'Equities', equities: 1.0, bonds: -0.3, commodities: 0.4, currencies: 0.1 },
  { asset: 'Bonds', equities: -0.3, bonds: 1.0, commodities: -0.2, currencies: 0.2 },
  { asset: 'Commodities', equities: 0.4, bonds: -0.2, commodities: 1.0, currencies: 0.3 },
  { asset: 'Currencies', equities: 0.1, bonds: 0.2, commodities: 0.3, currencies: 1.0 }
];

export function StressTest() {
  const [selectedScenario, setSelectedScenario] = useState<string>("2008 Financial Crisis");
  const [customShock, setCustomShock] = useState("-20");
  const [isRunning, setIsRunning] = useState(false);
  const [testType, setTestType] = useState("predefined");

  const currentScenario = predefinedScenarios.find(s => s.name === selectedScenario);
  const portfolioValue = 1250000;

  const runStressTest = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  const radarData = [
    { metric: 'Market Risk', stress: 85, normal: 45 },
    { metric: 'Credit Risk', stress: 70, normal: 30 },
    { metric: 'Liquidity Risk', stress: 90, normal: 25 },
    { metric: 'Operational Risk', stress: 60, normal: 20 },
    { metric: 'Currency Risk', stress: 75, normal: 35 },
    { metric: 'Interest Rate Risk', stress: 80, normal: 40 }
  ];

  return (
    <div className="space-y-6">
      {/* Stress Test Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Worst Case Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -38.5%
            </div>
            <p className="text-xs text-muted-foreground">
              2008 Crisis scenario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Average Stress Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -21.5%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all scenarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recovery Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              12 months
            </div>
            <p className="text-xs text-muted-foreground">
              Average recovery period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stress Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              Medium
            </div>
            <p className="text-xs text-muted-foreground">
              Overall risk rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stress Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Stress Test Configuration
          </CardTitle>
          <CardDescription>
            Configure and run portfolio stress tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predefined">Predefined Scenarios</SelectItem>
                    <SelectItem value="custom">Custom Shock</SelectItem>
                    <SelectItem value="montecarlo">Monte Carlo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testType === "predefined" && (
                <div className="space-y-2">
                  <Label>Stress Scenario</Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedScenarios.map((scenario) => (
                        <SelectItem key={scenario.name} value={scenario.name}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {testType === "custom" && (
                <div className="space-y-2">
                  <Label>Market Shock (%)</Label>
                  <Input
                    type="number"
                    value={customShock}
                    onChange={(e) => setCustomShock(e.target.value)}
                    placeholder="-20"
                  />
                </div>
              )}
            </div>

            <Button onClick={runStressTest} disabled={isRunning} className="w-full">
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Running Stress Test...' : 'Run Stress Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stress Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Stress Test Results</CardTitle>
          <CardDescription>
            Detailed analysis of portfolio performance under stress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scenarios" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
              <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="correlation">Correlation</TabsTrigger>
              <TabsTrigger value="riskprofile">Risk Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="space-y-4">
              <div className="space-y-3">
                {predefinedScenarios.map((scenario) => (
                  <div key={scenario.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          scenario.severity === 'Extreme' ? 'destructive' :
                          scenario.severity === 'High' ? 'destructive' :
                          scenario.severity === 'Medium' ? 'secondary' : 'default'
                        }>
                          {scenario.severity}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {scenario.probability}% probability
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Market Impact</div>
                        <div className="font-medium text-red-600">
                          {scenario.marketShock}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Portfolio Impact</div>
                        <div className="font-medium text-red-600">
                          {scenario.portfolioImpact}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Value Loss</div>
                        <div className="font-medium">
                          ${Math.abs(scenario.portfolioImpact * portfolioValue / 100).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Recovery</div>
                        <div className="font-medium">
                          {scenario.timeToRecovery} months
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm text-muted-foreground mb-2">Sector Impact</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(scenario.sectorImpact).map(([sector, impact]) => (
                          <div key={sector} className="flex justify-between">
                            <span>{sector}</span>
                            <span className={impact >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {impact >= 0 ? '+' : ''}{impact}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="montecarlo" className="space-y-4">
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monteCarloResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="change" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {monteCarloResults.map((result) => (
                  <div key={result.scenario} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.scenario}</span>
                      <div className="text-right">
                        <div className={`font-bold ${result.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.change >= 0 ? '+' : ''}{result.change}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${result.portfolioValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Asset Class</th>
                      <th className="text-center p-2">Equities</th>
                      <th className="text-center p-2">Bonds</th>
                      <th className="text-center p-2">Commodities</th>
                      <th className="text-center p-2">Currencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.map((row) => (
                      <tr key={row.asset} className="border-b">
                        <td className="p-2 font-medium">{row.asset}</td>
                        <td className="text-center p-2">{row.equities.toFixed(2)}</td>
                        <td className="text-center p-2">{row.bonds.toFixed(2)}</td>
                        <td className="text-center p-2">{row.commodities.toFixed(2)}</td>
                        <td className="text-center p-2">{row.currencies.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="riskprofile" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Normal" dataKey="normal" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Radar name="Stress" dataKey="stress" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
