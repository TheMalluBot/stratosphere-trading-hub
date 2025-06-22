
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
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Plus,
  BarChart3,
  Zap,
  Target,
  AlertTriangle
} from "lucide-react";

const AlgoTrading = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [capital, setCapital] = useState("50000");
  const [riskPercent, setRiskPercent] = useState("2");
  
  const availableStrategies = [
    {
      id: "linear-regression",
      name: "Linear Regression Oscillator",
      description: "ChartPrime mean reversion strategy",
      status: "active",
      performance: "+12.5%",
      trades: 45,
      winRate: "68%"
    },
    {
      id: "z-score-trend", 
      name: "Rolling Z-Score Trend",
      description: "QuantAlgo momentum strategy",
      status: "paused",
      performance: "+8.3%",
      trades: 32,
      winRate: "71%"
    },
    {
      id: "stop-loss-tp",
      name: "Stop Loss & Take Profit",
      description: "Risk management with SMA crossovers",
      status: "active",
      performance: "+15.1%",
      trades: 28,
      winRate: "79%"
    },
    {
      id: "deviation-trend",
      name: "Deviation Trend Profile", 
      description: "BigBeluga trend deviation analysis",
      status: "inactive",
      performance: "+6.7%",
      trades: 18,
      winRate: "61%"
    },
    {
      id: "volume-profile",
      name: "Multi-Layer Volume Profile",
      description: "BigBeluga POC and value area analysis",
      status: "active", 
      performance: "+9.8%",
      trades: 25,
      winRate: "64%"
    },
    {
      id: "ultimate-combined",
      name: "🚀 Ultimate Combined Strategy",
      description: "AI-powered combination of all strategies",
      status: "active",
      performance: "+18.9%",
      trades: 52,
      winRate: "73%"
    }
  ];

  const [runningStrategies, setRunningStrategies] = useState([
    {
      id: "ultimate-combined",
      symbol: "RELIANCE",
      status: "running",
      pnl: 2450.75,
      trades: 3,
      lastSignal: "BUY at ₹2,456.75"
    },
    {
      id: "stop-loss-tp", 
      symbol: "TCS",
      status: "running",
      pnl: 1890.25,
      trades: 2,
      lastSignal: "HOLD"
    }
  ]);

  const startStrategy = () => {
    if (!selectedStrategy) {
      toast.error("Please select a strategy first");
      return;
    }
    setIsRunning(true);
    toast.success(`Started ${availableStrategies.find(s => s.id === selectedStrategy)?.name} algorithm`);
  };

  const stopStrategy = () => {
    setIsRunning(false);
    toast.success("Algorithm stopped");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Algorithmic Trading</h1>
          <p className="text-muted-foreground">
            Automated strategy execution with real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Bot className="w-3 h-3 mr-1" />
            {runningStrategies.length} Active
          </Badge>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </div>
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
                        <div className="flex items-center justify-between w-full">
                          <span>{strategy.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {strategy.performance}
                          </Badge>
                        </div>
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
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-Restart</Label>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <Label>Paper Mode</Label>
                <Switch defaultChecked />
              </div>

              {selectedStrategy && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium">
                    {availableStrategies.find(s => s.id === selectedStrategy)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Win Rate: {availableStrategies.find(s => s.id === selectedStrategy)?.winRate} • 
                    Trades: {availableStrategies.find(s => s.id === selectedStrategy)?.trades}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button 
                  onClick={startStrategy}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button 
                  onClick={stopStrategy}
                  disabled={!isRunning}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Library and Running Strategies */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="running" className="space-y-4">
            <TabsList>
              <TabsTrigger value="running">Running Strategies</TabsTrigger>
              <TabsTrigger value="library">Strategy Library</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="running">
              <Card>
                <CardHeader>
                  <CardTitle>Active Algorithms</CardTitle>
                  <CardDescription>Currently running strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {runningStrategies.map((strategy, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-semibold">
                              {availableStrategies.find(s => s.id === strategy.id)?.name}
                            </span>
                            <Badge variant="outline">{strategy.symbol}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">P&L</div>
                            <div className={`font-semibold ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Trades</div>
                            <div className="font-semibold">{strategy.trades}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Signal</div>
                            <div className="font-semibold text-blue-400">{strategy.lastSignal}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                            <Badge 
                              variant={strategy.status === 'active' ? 'default' : 
                                     strategy.status === 'paused' ? 'secondary' : 'outline'}
                            >
                              {strategy.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Deploy</Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Performance</div>
                            <div className="font-semibold text-green-400">{strategy.performance}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Trades</div>
                            <div className="font-semibold">{strategy.trades}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Win Rate</div>
                            <div className="font-semibold">{strategy.winRate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Performance</CardTitle>
                  <CardDescription>Real-time strategy analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Total P&L</div>
                      <div className="text-2xl font-bold text-green-400">+₹4,341</div>
                      <div className="text-xs text-muted-foreground">+2.1% today</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Active Algorithms</div>
                      <div className="text-2xl font-bold">{runningStrategies.length}</div>
                      <div className="text-xs text-muted-foreground">2 symbols</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-2xl font-bold text-blue-400">73%</div>
                      <div className="text-xs text-muted-foreground">Last 30 days</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Avg Trade</div>
                      <div className="text-2xl font-bold">₹867</div>
                      <div className="text-xs text-muted-foreground">Per execution</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-semibold">Risk Alert</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      Consider reducing position size on RELIANCE - high volatility detected
                    </p>
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
