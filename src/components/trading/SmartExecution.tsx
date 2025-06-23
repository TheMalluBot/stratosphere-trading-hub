
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Target, Clock, TrendingUp, Activity, Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";

interface ExecutionSlice {
  id: string;
  size: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'executed' | 'cancelled';
  slippage: number;
}

interface ExecutionStrategy {
  name: string;
  description: string;
  timeframe: string;
  slices: number;
  algorithm: 'twap' | 'vwap' | 'pov' | 'implementation';
}

const SmartExecution = () => {
  const [activeExecution, setActiveExecution] = useState<ExecutionStrategy | null>(null);
  const [executionSlices, setExecutionSlices] = useState<ExecutionSlice[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [executionProgress, setExecutionProgress] = useState(0);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const executionStrategies: ExecutionStrategy[] = [
    {
      name: 'TWAP',
      description: 'Time Weighted Average Price - Execute over time',
      timeframe: '30 minutes',
      slices: 10,
      algorithm: 'twap'
    },
    {
      name: 'VWAP',
      description: 'Volume Weighted Average Price - Follow market volume',
      timeframe: '1 hour',
      slices: 15,
      algorithm: 'vwap'
    },
    {
      name: 'POV',
      description: 'Percentage of Volume - Maintain market share',
      timeframe: '45 minutes',
      slices: 12,
      algorithm: 'pov'
    },
    {
      name: 'Implementation Shortfall',
      description: 'Minimize market impact and timing risk',
      timeframe: '20 minutes',
      slices: 8,
      algorithm: 'implementation'
    }
  ];

  useEffect(() => {
    // Generate mock performance data
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
      executed: Math.random() * 100,
      benchmark: Math.random() * 100,
      slippage: (Math.random() - 0.5) * 0.5
    }));
    setPerformanceData(mockData);
  }, []);

  const startExecution = (strategy: ExecutionStrategy) => {
    setActiveExecution(strategy);
    setExecutionStatus('running');
    setExecutionProgress(0);
    
    // Generate execution slices
    const slices: ExecutionSlice[] = Array.from({ length: strategy.slices }, (_, i) => ({
      id: `slice-${i + 1}`,
      size: 100 / strategy.slices,
      price: 45000 + Math.random() * 1000,
      timestamp: Date.now() + i * 60000,
      status: 'pending',
      slippage: (Math.random() - 0.5) * 0.2
    }));
    
    setExecutionSlices(slices);
    toast.success(`Started ${strategy.name} execution`);
    
    // Simulate execution progress
    const interval = setInterval(() => {
      setExecutionProgress(prev => {
        const newProgress = prev + (100 / strategy.slices);
        if (newProgress >= 100) {
          clearInterval(interval);
          setExecutionStatus('completed');
          toast.success('Execution completed successfully');
          return 100;
        }
        return newProgress;
      });
    }, 2000);
  };

  const pauseExecution = () => {
    setExecutionStatus('paused');
    toast.info('Execution paused');
  };

  const resumeExecution = () => {
    setExecutionStatus('running');
    toast.info('Execution resumed');
  };

  const stopExecution = () => {
    setExecutionStatus('idle');
    setExecutionProgress(0);
    setActiveExecution(null);
    setExecutionSlices([]);
    toast.info('Execution stopped');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Smart Execution Engine
          </CardTitle>
          <CardDescription>
            Intelligent order execution with minimal market impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strategies" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {executionStrategies.map((strategy, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{strategy.algorithm.toUpperCase()}</Badge>
                        <span className="text-sm text-muted-foreground">{strategy.timeframe}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{strategy.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Slices: {strategy.slices}</span>
                        <Button
                          size="sm"
                          onClick={() => startExecution(strategy)}
                          disabled={executionStatus === 'running'}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-4">
              {activeExecution ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{activeExecution.name} Execution</CardTitle>
                          <CardDescription>{activeExecution.description}</CardDescription>
                        </div>
                        <Badge 
                          variant={executionStatus === 'running' ? 'default' : 
                                  executionStatus === 'completed' ? 'secondary' : 'outline'}
                        >
                          {executionStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Execution Progress</span>
                            <span className="text-sm">{executionProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={executionProgress} className="w-full" />
                        </div>

                        <div className="flex gap-2">
                          {executionStatus === 'running' ? (
                            <Button size="sm" onClick={pauseExecution}>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                          ) : executionStatus === 'paused' ? (
                            <Button size="sm" onClick={resumeExecution}>
                              <Play className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                          ) : null}
                          
                          <Button size="sm" variant="outline" onClick={stopExecution}>
                            <Square className="w-4 h-4 mr-1" />
                            Stop
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Execution Slices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {executionSlices.slice(0, 5).map((slice, index) => (
                          <div key={slice.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={slice.status === 'executed' ? 'default' : 
                                        slice.status === 'pending' ? 'outline' : 'secondary'}
                                className="w-16"
                              >
                                {slice.status}
                              </Badge>
                              <span className="text-sm">Slice {index + 1}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{slice.size.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">
                                ${slice.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {executionSlices.length > 5 && (
                          <div className="text-center text-sm text-muted-foreground">
                            ... and {executionSlices.length - 5} more slices
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Execution</h3>
                    <p className="text-muted-foreground">
                      Select an execution strategy to begin smart order execution
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution Performance</CardTitle>
                  <CardDescription>
                    Real-time analysis of execution quality vs benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="executed" stroke="#22c55e" strokeWidth={2} name="Executed Price" />
                        <Line type="monotone" dataKey="benchmark" stroke="#3b82f6" strokeWidth={2} name="Benchmark" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">-0.12%</div>
                      <div className="text-sm text-muted-foreground">Avg Slippage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">98.3%</div>
                      <div className="text-sm text-muted-foreground">Fill Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">2.8bp</div>
                      <div className="text-sm text-muted-foreground">Market Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">A+</div>
                      <div className="text-sm text-muted-foreground">Execution Score</div>
                    </div>
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

export default SmartExecution;
