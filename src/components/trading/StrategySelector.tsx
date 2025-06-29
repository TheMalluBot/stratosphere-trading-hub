
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bot, Upload, Download, Settings, Play, Pause, Square, TrendingUp } from "lucide-react";
import { useAlgoTrading } from "@/hooks/useAlgoTrading";
import { strategies } from "@/components/backtesting/StrategySelector";

interface StrategyExecutionConfig {
  strategyId: string;
  strategyName: string;
  symbol: string;
  capital: number;
  riskPercent: number;
  paperMode: boolean;
  parameters?: Record<string, any>;
}

interface StrategySelectorProps {
  symbol: string;
  onStrategySelect?: (strategy: any) => void;
}

export const StrategySelector = ({ symbol, onStrategySelect }: StrategySelectorProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [capital, setCapital] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [paperMode, setPaperMode] = useState(true);
  const [customParameters, setCustomParameters] = useState<Record<string, any>>({});
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const { 
    activeStrategies, 
    metrics, 
    riskMetrics,
    startStrategy, 
    stopStrategy, 
    pauseStrategy,
    getAvailableStrategies
  } = useAlgoTrading();

  const handleStartStrategy = async () => {
    if (!selectedStrategy) {
      toast.error("Please select a strategy first");
      return;
    }

    const strategy = strategies.find(s => s.value === selectedStrategy);
    if (!strategy) {
      toast.error("Strategy not found");
      return;
    }

    const config: StrategyExecutionConfig = {
      strategyId: selectedStrategy,
      strategyName: strategy.label,
      symbol,
      capital: parseFloat(capital),
      riskPercent: parseFloat(riskPercent),
      paperMode,
      parameters: customParameters
    };

    try {
      await startStrategy(config);
      setIsConfigDialogOpen(false);
      toast.success(`Strategy "${strategy.label}" started successfully`);
    } catch (error) {
      toast.error(`Failed to start strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStopStrategy = async (executionId: string) => {
    try {
      await stopStrategy(executionId);
    } catch (error) {
      toast.error(`Failed to stop strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "elite": return "bg-gradient-to-r from-purple-600 to-blue-600 text-white";
      case "premium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "technical": return "bg-blue-500 text-white";
      case "risk": return "bg-red-500 text-white";
      case "volume": return "bg-green-500 text-white";
      case "custom": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "elite": return "ELITE";
      case "premium": return "PREMIUM";
      case "technical": return "TECHNICAL";
      case "risk": return "RISK";
      case "volume": return "VOLUME";
      case "custom": return "CUSTOM";
      default: return "STRATEGY";
    }
  };

  const exportStrategy = (strategy: any) => {
    const exportData = {
      ...strategy,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${strategy.value}-strategy.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Strategy "${strategy.label}" exported successfully`);
  };

  const importStrategy = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        // Here you would add the imported strategy to your strategy list
        toast.success(`Strategy "${imported.label}" imported successfully`);
      } catch (error) {
        toast.error("Failed to import strategy - invalid file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Management Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Advanced Strategy Management
          </CardTitle>
          <CardDescription>
            Select and configure algorithmic trading strategies for {symbol}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="library" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">Strategy Library</TabsTrigger>
              <TabsTrigger value="active">Active Strategies</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Start Strategy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Configure Strategy Execution</DialogTitle>
                      <DialogDescription>
                        Set up parameters for your selected strategy
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Strategy</Label>
                        <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a strategy" />
                          </SelectTrigger>
                          <SelectContent className="max-h-96">
                            {strategies.map((strategy) => (
                              <SelectItem key={strategy.value} value={strategy.value}>
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <div className="font-medium">{strategy.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {strategy.description}
                                    </div>
                                  </div>
                                  <Badge className={`ml-2 text-xs ${getCategoryColor(strategy.category)}`}>
                                    {getCategoryLabel(strategy.category)}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Capital ($)</Label>
                          <Input
                            type="number"
                            value={capital}
                            onChange={(e) => setCapital(e.target.value)}
                            placeholder="10000"
                          />
                        </div>
                        <div>
                          <Label>Risk Percentage (%)</Label>
                          <Input
                            type="number"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(e.target.value)}
                            placeholder="2"
                            max="10"
                            min="0.1"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="paperMode"
                          checked={paperMode}
                          onChange={(e) => setPaperMode(e.target.checked)}
                        />
                        <Label htmlFor="paperMode">Paper Trading Mode (Recommended)</Label>
                      </div>

                      <Button onClick={handleStartStrategy} className="w-full">
                        Start Strategy Execution
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <input
                  type="file"
                  accept=".json"
                  onChange={importStrategy}
                  style={{ display: 'none' }}
                  id="import-strategy"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-strategy')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {/* Elite Strategies */}
                  <div className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-2 rounded">
                    🏆 ELITE QUANTITATIVE STRATEGIES
                  </div>
                  {strategies.filter(s => s.category === "elite").map((strategy) => (
                    <Card key={strategy.value} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{strategy.label}</div>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getCategoryColor(strategy.category)}`}>
                              {getCategoryLabel(strategy.category)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportStrategy(strategy)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {strategy.description}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStrategy(strategy.value);
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          Configure & Start
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Premium Strategies */}
                  <div className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-2 rounded">
                    ⭐ PREMIUM STRATEGIES
                  </div>
                  {strategies.filter(s => s.category === "premium").map((strategy) => (
                    <Card key={strategy.value} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{strategy.label}</div>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getCategoryColor(strategy.category)}`}>
                              {getCategoryLabel(strategy.category)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportStrategy(strategy)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {strategy.description}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStrategy(strategy.value);
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          Configure & Start
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Standard Strategies */}
                  <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    📊 STANDARD STRATEGIES
                  </div>
                  {strategies.filter(s => !["elite", "premium"].includes(s.category)).map((strategy) => (
                    <Card key={strategy.value} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{strategy.label}</div>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getCategoryColor(strategy.category)}`}>
                              {getCategoryLabel(strategy.category)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportStrategy(strategy)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {strategy.description}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStrategy(strategy.value);
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          Configure & Start
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeStrategies.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Strategies</h3>
                    <p className="text-muted-foreground">
                      Start a strategy from the library to see it here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeStrategies.map((execution) => (
                    <Card key={execution.executionId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold">{execution.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {execution.symbol} • {execution.status}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseStrategy(execution.executionId)}
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStopStrategy(execution.executionId)}
                            >
                              <Square className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">P&L</div>
                            <div className={`font-medium ${execution.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${execution.pnl.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Trades</div>
                            <div className="font-medium">{execution.totalTrades}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Win Rate</div>
                            <div className="font-medium">{execution.winRate.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last Signal: {execution.lastSignal}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${metrics.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{metrics.totalTrades}</div>
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{metrics.averageWinRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Avg Win Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{metrics.activeStrategies}</div>
                    <div className="text-sm text-muted-foreground">Active Strategies</div>
                  </CardContent>
                </Card>
              </div>

              {riskMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Capital</div>
                        <div className="text-xl font-semibold">${riskMetrics.totalCapital.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total VAR</div>
                        <div className="text-xl font-semibold">${riskMetrics.totalVAR.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Sharpe</div>
                        <div className="text-xl font-semibold">{riskMetrics.averageSharpe.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                        <div className="text-xl font-semibold">{riskMetrics.maxDrawdown.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Active Positions</div>
                        <div className="text-xl font-semibold">{riskMetrics.activePositions}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Risk Utilization</div>
                        <div className="text-xl font-semibold">{(riskMetrics.riskUtilization * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
