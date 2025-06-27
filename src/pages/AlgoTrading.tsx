
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAlgoTrading } from "@/hooks/useAlgoTrading";
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus,
  AlertTriangle,
  Shield,
  TrendingUp,
  Activity
} from "lucide-react";

const AlgoTrading = () => {
  const { 
    activeStrategies, 
    metrics, 
    startStrategy, 
    stopStrategy, 
    pauseStrategy, 
    getAvailableStrategies 
  } = useAlgoTrading();

  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [capital, setCapital] = useState("50000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [isStarting, setIsStarting] = useState(false);

  const availableStrategies = getAvailableStrategies();

  const indianStocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 
    'SBIN', 'ITC', 'HDFCBANK', 'BHARTIARTL', 'LT'
  ];

  const handleStartStrategy = async () => {
    if (!selectedStrategy) {
      toast.error("Please select a strategy first");
      return;
    }

    if (!selectedSymbol) {
      toast.error("Please select a symbol");
      return;
    }

    setIsStarting(true);
    try {
      const strategyName = availableStrategies.find(s => s.id === selectedStrategy)?.name || selectedStrategy;
      
      await startStrategy({
        strategyId: selectedStrategy,
        strategyName,
        symbol: selectedSymbol,
        capital: parseInt(capital),
        riskPercent: parseFloat(riskPercent) / 100,
        paperMode: true // Always paper mode for now
      });
    } catch (error) {
      console.error('Failed to start strategy:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopStrategy = async (executionId: string) => {
    try {
      await stopStrategy(executionId);
    } catch (error) {
      console.error('Failed to stop strategy:', error);
    }
  };

  const handlePauseStrategy = async (executionId: string) => {
    try {
      await pauseStrategy(executionId);
    } catch (error) {
      console.error('Failed to pause strategy:', error);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Algorithmic Trading</h1>
          <p className="text-muted-foreground">
            Advanced strategy execution with real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Bot className="w-3 h-3 mr-1" />
            {metrics.activeStrategies} Active
          </Badge>
          <Button variant="outline" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Custom Strategy
          </Button>
        </div>
      </div>

      {/* Paper Trading Warning */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-blue-500">PAPER TRADING MODE</span>
        </div>
        <p className="text-sm mt-2 text-blue-400">
          All strategies are running in simulation mode with realistic market data. 
          No real money is at risk. This is perfect for testing and learning algorithmic trading strategies.
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Strategy Control
              </CardTitle>
              <CardDescription>Configure and launch algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStrategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{strategy.name}</span>
                          <span className="text-xs text-muted-foreground">{strategy.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Symbol</Label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStocks.map((symbol) => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Capital (₹)</Label>
                  <Input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risk %</Label>
                  <Input
                    type="number"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    max="10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-Restart</Label>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <Label>Paper Mode</Label>
                <Switch checked disabled />
              </div>

              {selectedStrategy && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium">
                    {availableStrategies.find(s => s.id === selectedStrategy)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Symbol: {selectedSymbol} • Capital: ₹{parseInt(capital).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 pt-4">
                <Button 
                  onClick={handleStartStrategy}
                  disabled={isStarting || !selectedStrategy}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isStarting ? 'Starting...' : 'Start Strategy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Strategies and Performance */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="running" className="space-y-4">
            <TabsList>
              <TabsTrigger value="running">Active Strategies</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="library">Strategy Library</TabsTrigger>
            </TabsList>

            <TabsContent value="running">
              <Card>
                <CardHeader>
                  <CardTitle>Running Algorithms</CardTitle>
                  <CardDescription>Currently active strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeStrategies.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active strategies</p>
                      <p className="text-sm text-muted-foreground">Start a strategy to see real-time execution</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeStrategies.map((strategy) => (
                        <div key={strategy.executionId} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="font-semibold">{strategy.name}</span>
                              <Badge variant="outline">{strategy.symbol}</Badge>
                              <Badge variant="secondary">Paper</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePauseStrategy(strategy.executionId)}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleStopStrategy(strategy.executionId)}
                              >
                                <Square className="w-3 h-3 mr-1" />
                                Stop
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">P&L</div>
                              <div className={`font-semibold ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Trades</div>
                              <div className="font-semibold">{strategy.totalTrades}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Win Rate</div>
                              <div className="font-semibold">{(strategy.winRate * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Last Signal</div>
                              <div className="font-semibold text-blue-400 text-xs">{strategy.lastSignal}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Real-time trading metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Total P&L</div>
                      <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {metrics.totalPnL >= 0 ? '+' : ''}₹{metrics.totalPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Paper trading</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Active Strategies</div>
                      <div className="text-2xl font-bold">{metrics.activeStrategies}</div>
                      <div className="text-xs text-muted-foreground">Running now</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Avg Win Rate</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {(metrics.averageWinRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Across all strategies</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                      <div className="text-2xl font-bold">{metrics.totalTrades}</div>
                      <div className="text-xs text-muted-foreground">Executed</div>
                    </div>
                  </div>
                  
                  {metrics.activeStrategies === 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">Ready to Start</span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">
                        Start your first strategy to see real-time performance metrics and live trading data.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Library</CardTitle>
                  <CardDescription>Available algorithmic strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {availableStrategies.map((strategy) => (
                      <div key={strategy.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{strategy.name}</span>
                            <Badge variant="secondary">Available</Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedStrategy(strategy.id)}
                          >
                            Select
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                        
                        <div className="text-xs text-muted-foreground">
                          Strategy ID: {strategy.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AlgoTrading;
