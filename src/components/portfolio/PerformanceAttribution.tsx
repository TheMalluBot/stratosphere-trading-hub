
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface AttributionData {
  category: string;
  allocation: number;
  selection: number;
  interaction: number;
  total: number;
}

const sectorAttribution: AttributionData[] = [
  { category: 'Technology', allocation: 2.1, selection: 1.8, interaction: 0.3, total: 4.2 },
  { category: 'Healthcare', allocation: -0.5, selection: 2.3, interaction: -0.1, total: 1.7 },
  { category: 'Financial', allocation: 1.2, selection: -0.8, interaction: 0.2, total: 0.6 },
  { category: 'Consumer', allocation: -0.3, selection: 1.1, interaction: 0.1, total: 0.9 },
  { category: 'Energy', allocation: 0.8, selection: -1.2, interaction: -0.2, total: -0.6 },
  { category: 'Industrials', allocation: 0.4, selection: 0.7, interaction: 0.1, total: 1.2 }
];

const strategyAttribution = [
  { name: 'Momentum Strategy', contribution: 3.8, weight: 25, sharpe: 1.45 },
  { name: 'Value Strategy', contribution: 2.1, weight: 20, sharpe: 1.12 },
  { name: 'Growth Strategy', contribution: 4.2, weight: 30, sharpe: 1.67 },
  { name: 'Quality Strategy', contribution: 1.9, weight: 15, sharpe: 1.23 },
  { name: 'Low Vol Strategy', contribution: 0.8, weight: 10, sharpe: 0.89 }
];

const timeSeriesAttribution = [
  { period: 'Q1 2024', allocation: 1.2, selection: 2.1, total: 3.3 },
  { period: 'Q2 2024', allocation: -0.8, selection: 1.9, total: 1.1 },
  { period: 'Q3 2024', allocation: 2.3, selection: 0.7, total: 3.0 },
  { period: 'Q4 2024', allocation: 1.1, selection: 1.8, total: 2.9 }
];

export function PerformanceAttribution() {
  const [selectedTab, setSelectedTab] = useState("sector");

  const totalAttribution = sectorAttribution.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      {/* Attribution Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalAttribution.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs. benchmark excess return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{sectorAttribution.reduce((sum, item) => sum + item.allocation, 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Allocation effect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Stock Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{sectorAttribution.reduce((sum, item) => sum + item.selection, 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Selection effect
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Attribution Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Performance Attribution Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of portfolio performance drivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sector">Sector Attribution</TabsTrigger>
              <TabsTrigger value="strategy">Strategy Attribution</TabsTrigger>
              <TabsTrigger value="timeline">Time Series</TabsTrigger>
            </TabsList>

            <TabsContent value="sector" className="space-y-4">
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorAttribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="allocation" fill="#3b82f6" name="Allocation Effect" />
                    <Bar dataKey="selection" fill="#10b981" name="Selection Effect" />
                    <Bar dataKey="interaction" fill="#f59e0b" name="Interaction Effect" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {sectorAttribution.map((sector) => (
                  <div key={sector.category} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{sector.category}</h4>
                      <Badge variant={sector.total >= 0 ? "default" : "destructive"}>
                        {sector.total >= 0 ? '+' : ''}{sector.total.toFixed(2)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">Allocation</div>
                        <div className={`font-medium ${sector.allocation >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {sector.allocation >= 0 ? '+' : ''}{sector.allocation.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Selection</div>
                        <div className={`font-medium ${sector.selection >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sector.selection >= 0 ? '+' : ''}{sector.selection.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Interaction</div>
                        <div className={`font-medium ${sector.interaction >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {sector.interaction >= 0 ? '+' : ''}{sector.interaction.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="space-y-3">
                {strategyAttribution.map((strategy) => (
                  <div key={strategy.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{strategy.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {strategy.weight}% portfolio weight
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{strategy.contribution.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sharpe: {strategy.sharpe}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Contribution to return</span>
                        <span>{strategy.contribution.toFixed(2)}%</span>
                      </div>
                      <Progress value={(strategy.contribution / 5) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesAttribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="allocation" fill="#3b82f6" name="Allocation" />
                    <Bar dataKey="selection" fill="#10b981" name="Selection" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {timeSeriesAttribution.map((period) => (
                  <div key={period.period} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{period.period}</h4>
                      <Badge variant="default">
                        +{period.total.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Allocation:</span>
                        <span className={period.allocation >= 0 ? 'text-blue-600' : 'text-red-600'}>
                          {period.allocation >= 0 ? '+' : ''}{period.allocation.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selection:</span>
                        <span className={period.selection >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {period.selection >= 0 ? '+' : ''}{period.selection.toFixed(2)}%
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
