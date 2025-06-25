
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cpu, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Timer,
  Activity,
  Gauge
} from "lucide-react";
import { toast } from "sonner";
import { taskScheduler } from "@/lib/performance/ComputationalTaskScheduler";
import { gpuComputeService } from "@/lib/performance/GPUComputeService";
import { advancedWasmEngine } from "@/lib/performance/AdvancedWebAssemblyEngine";

interface HighPerformanceAnalyticsProps {
  symbol: string;
  prices: number[];
  volumes: number[];
}

const HighPerformanceAnalytics = ({ symbol = "BTCUSDT", prices = [], volumes = [] }: HighPerformanceAnalyticsProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [gpuCapabilities, setGpuCapabilities] = useState<any>(null);

  // Generate sample data if not provided
  const samplePrices = prices.length > 0 ? prices : Array.from({ length: 100 }, (_, i) => 45000 + Math.sin(i * 0.1) * 1000 + Math.random() * 500);
  const sampleVolumes = volumes.length > 0 ? volumes : Array.from({ length: 100 }, () => Math.random() * 1000 + 100);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await Promise.all([
          advancedWasmEngine.initialize(),
          gpuComputeService.initialize()
        ]);
        
        setGpuCapabilities(gpuComputeService.getCapabilities());
        toast.success("High-Performance Analytics initialized!");
      } catch (error) {
        console.error("Failed to initialize services:", error);
        toast.error("Some performance features may not be available");
      }
    };

    initializeServices();

    // Update queue status periodically
    const statusInterval = setInterval(() => {
      setQueueStatus(taskScheduler.getQueueStatus());
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  const runAdvancedAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Schedule multiple computational tasks
      const tasks = [
        taskScheduler.scheduleMarketAnalysis(samplePrices, sampleVolumes, 'high'),
        taskScheduler.scheduleMonteCarloSimulation(1000, { volatility: 0.2, drift: 0.05 }, 'medium'),
        taskScheduler.schedulePortfolioOptimization(
          [{ symbol, weight: 1.0 }],
          [samplePrices.slice(1).map((price, i) => (price - samplePrices[i]) / samplePrices[i])],
          0.02
        )
      ];

      toast.success(`Scheduled ${tasks.length} computational tasks`);

      // Wait for all tasks to complete
      const results = await Promise.all(
        tasks.map(async (taskId) => {
          // Poll for completion
          let task = taskScheduler.getTask(taskId);
          while (task && task.status !== 'completed' && task.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 500));
            task = taskScheduler.getTask(taskId);
          }
          
          if (task?.status === 'completed') {
            return taskScheduler.getTaskResult(taskId);
          } else {
            throw new Error(`Task ${taskId} failed`);
          }
        })
      );

      setAnalysisResults({
        marketAnalysis: results[0]?.result,
        monteCarloResults: results[1]?.result,
        portfolioOptimization: results[2]?.result,
        timestamp: Date.now()
      });

      // Get performance metrics
      setPerformanceMetrics({
        wasmMetrics: advancedWasmEngine.getPerformanceMetrics(),
        gpuQueueLength: gpuComputeService.getQueueLength(),
        tasksCompleted: results.length
      });

      toast.success("Advanced analysis completed!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runGPUBenchmark = async () => {
    if (!gpuComputeService.isSupported()) {
      toast.warning("GPU compute not available");
      return;
    }

    try {
      const startTime = performance.now();
      
      const result = await gpuComputeService.submitTask({
        id: 'benchmark',
        type: 'matrix-multiply',
        data: {
          a: Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => Math.random())),
          b: Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => Math.random()))
        },
        priority: 'high'
      });

      const duration = performance.now() - startTime;
      toast.success(`GPU benchmark completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      toast.error("GPU benchmark failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            High-Performance Analytics
            <Badge variant="outline" className="ml-2">
              {symbol}
            </Badge>
          </CardTitle>
          <CardDescription>
            Advanced computational analysis using WebAssembly, GPU acceleration, and parallel processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={runAdvancedAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Timer className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Run Advanced Analysis
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={runGPUBenchmark}
              className="flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              GPU Benchmark
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebAssembly</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advancedWasmEngine.isInitialized() ? "Ready" : "Loading"}
            </div>
            <Badge variant={advancedWasmEngine.isInitialized() ? "default" : "secondary"}>
              {advancedWasmEngine.isInitialized() ? "Initialized" : "Pending"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPU Compute</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gpuCapabilities?.supported ? "Available" : "N/A"}
            </div>
            <Badge variant={gpuCapabilities?.supported ? "default" : "secondary"}>
              {gpuCapabilities?.supported ? "WebGPU" : "CPU Only"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Queue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStatus?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {queueStatus?.running || 0} running, {queueStatus?.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.tasksCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Computational analysis completed at {new Date(analysisResults.timestamp).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="market">Market Analysis</TabsTrigger>
                <TabsTrigger value="simulation">Monte Carlo</TabsTrigger>
                <TabsTrigger value="optimization">Portfolio</TabsTrigger>
              </TabsList>
              
              <TabsContent value="market" className="space-y-4">
                {analysisResults.marketAnalysis && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Technical Indicators</h4>
                      <div className="text-sm space-y-1">
                        <div>RSI: {analysisResults.marketAnalysis.rsi?.slice(-1)[0]?.toFixed(2) || 'N/A'}</div>
                        <div>Trend Strength: {analysisResults.marketAnalysis.trendStrength?.toFixed(2) || 'N/A'}</div>
                        <div>Volatility Score: {analysisResults.marketAnalysis.volatilityScore?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Market Structure</h4>
                      <div className="text-sm">
                        <Badge variant="outline">
                          {analysisResults.marketAnalysis.marketStructure || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="simulation" className="space-y-4">
                {analysisResults.monteCarloResults && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Expected Returns</h4>
                      <div className="text-2xl font-bold">
                        {(analysisResults.monteCarloResults.mean * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Risk (Std Dev)</h4>
                      <div className="text-2xl font-bold">
                        {(analysisResults.monteCarloResults.std * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">95th Percentile</h4>
                      <div className="text-2xl font-bold">
                        {(analysisResults.monteCarloResults.percentiles?.p95 * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="optimization" className="space-y-4">
                {analysisResults.portfolioOptimization && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Expected Return</h4>
                      <div className="text-2xl font-bold">
                        {(analysisResults.portfolioOptimization.expectedReturn * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Expected Risk</h4>
                      <div className="text-2xl font-bold">
                        {(analysisResults.portfolioOptimization.expectedRisk * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sharpe Ratio</h4>
                      <div className="text-2xl font-bold">
                        {analysisResults.portfolioOptimization.sharpeRatio?.toFixed(3) || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">WebAssembly Performance</h4>
                {Object.entries(performanceMetrics.wasmMetrics || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span>{key}:</span>
                    <span>{value.toFixed(2)}ms</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">System Status</h4>
                <div className="flex justify-between text-sm">
                  <span>GPU Queue:</span>
                  <span>{performanceMetrics.gpuQueueLength} tasks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed:</span>
                  <span>{performanceMetrics.tasksCompleted} tasks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HighPerformanceAnalytics;
