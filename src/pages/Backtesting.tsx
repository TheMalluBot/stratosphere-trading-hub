
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Zap, TrendingUp, Brain, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyConfiguration } from "@/components/backtesting/StrategyConfiguration";
import { BacktestResults } from "@/components/backtesting/BacktestResults";
import { StrategyDetails } from "@/components/backtesting/StrategyDetails";
import { EnhancedBacktestEngine, EnhancedBacktestConfig } from "@/lib/backtesting/EnhancedBacktestEngine";
import { BacktestProgress } from "@/lib/backtesting/BacktestEngine";

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("ultimate-combined");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("1D");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [progress, setProgress] = useState<BacktestProgress | null>(null);
  
  // Enhanced features toggles
  const [enableOptimization, setEnableOptimization] = useState(false);
  const [enableWalkForward, setEnableWalkForward] = useState(false);
  const [enableMonteCarlo, setEnableMonteCarlo] = useState(true);
  const [enableAdvancedAnalytics, setEnableAdvancedAnalytics] = useState(true);
  
  const engineRef = useRef<EnhancedBacktestEngine | null>(null);

  useEffect(() => {
    engineRef.current = new EnhancedBacktestEngine();
    engineRef.current.setProgressCallback(setProgress);

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  const runBacktest = async () => {
    if (!symbol || !initialCapital) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!engineRef.current) {
      toast.error("Enhanced backtest engine not initialized");
      return;
    }

    setIsRunning(true);
    setProgress(null);
    toast.loading("Initializing professional backtesting engine...");

    try {
      const config: EnhancedBacktestConfig = {
        symbol,
        timeframe,
        startDate,
        endDate,
        initialCapital: parseInt(initialCapital),
        strategies: [{
          id: selectedStrategy,
          name: selectedStrategy,
          description: `Professional strategy: ${selectedStrategy}`,
          parameters: {},
          enabled: true
        }],
        
        // Enhanced features
        enableOptimization,
        optimizationConfig: enableOptimization ? {
          parameters: {
            'period': { min: 10, max: 50, step: 5, type: 'integer' },
            'threshold': { min: 0.5, max: 3.0, step: 0.1, type: 'float' },
            'riskLevel': { min: 0.01, max: 0.05, step: 0.005, type: 'float' }
          },
          metric: 'sharpe',
          maxIterations: 30,
          populationSize: 25
        } : undefined,

        enableWalkForward,
        walkForwardConfig: enableWalkForward ? {
          optimizationWindow: 180, // 6 months
          testingWindow: 60, // 2 months
          stepSize: 30, // 1 month
          reoptimizationFrequency: 3 // Every 3 periods
        } : undefined,

        enableMonteCarlo,
        monteCarloConfig: enableMonteCarlo ? {
          numSimulations: 1000,
          confidenceLevel: 0.95,
          bootstrapMethod: 'non_parametric'
        } : undefined,

        enableAdvancedAnalytics,
        transactionCosts: {
          commission: 0.1, // 0.1% commission
          spread: 0.05, // 0.05% spread
          slippage: 0.02 // 0.02% slippage
        }
      };

      const results = await engineRef.current.runEnhancedBacktest(config);
      
      if (results && results.basicResults.length > 0) {
        const result = results.basicResults[0];
        setBacktestResults({
          ...result.performance,
          signals: result.signals.length,
          indicators: Object.keys(result.indicators).length,
          strategy: selectedStrategy,
          period: `${startDate} to ${endDate}`,
          totalBars: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
          strategiesUsed: 1,
          
          // Enhanced results
          enhanced: {
            optimization: results.optimizationResults,
            walkForward: results.walkForwardResults,
            monteCarlo: results.monteCarloResults,
            analysis: results.comprehensiveAnalysis
          },
          
          // Professional metrics
          professional: enableAdvancedAnalytics ? {
            calmarRatio: result.performance.calmarRatio || 0,
            sortinoRatio: result.performance.sortinoRatio || 0,
            informationRatio: result.performance.informationRatio || 0,
            profitFactor: result.performance.profitFactor || 0,
            ulcerIndex: result.performance.ulcerIndex || 0,
            var95: result.performance.var95 || 0,
            cvar95: result.performance.cvar95 || 0
          } : null
        });
        
        const recommendation = results.comprehensiveAnalysis.recommendation;
        const reasons = results.comprehensiveAnalysis.reasons.join(', ');
        
        if (recommendation === 'DEPLOY') {
          toast.success(`✅ Strategy APPROVED for deployment! ${reasons}`);
        } else if (recommendation === 'OPTIMIZE') {
          toast.info(`⚡ Strategy needs optimization: ${reasons}`);
        } else {
          toast.error(`❌ Strategy REJECTED: ${reasons}`);
        }
      }
      
    } catch (error) {
      console.error("Enhanced backtest error:", error);
      toast.error("Professional backtest failed. Please try again.");
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const resetParameters = () => {
    setSelectedStrategy("ultimate-combined");
    setSymbol("RELIANCE");
    setTimeframe("1D");
    setStartDate("2023-01-01");
    setEndDate("2024-01-01");
    setInitialCapital("100000");
    setBacktestResults(null);
    setProgress(null);
    setEnableOptimization(false);
    setEnableWalkForward(false);
    setEnableMonteCarlo(true);
    setEnableAdvancedAnalytics(true);
    toast.success("Parameters reset to professional defaults");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            Professional Strategy Backtesting
          </h1>
          <p className="text-muted-foreground">
            Enterprise-grade backtesting with parameter optimization and robustness analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetParameters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={runBacktest} disabled={isRunning} className="bg-gradient-to-r from-purple-600 to-blue-600">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Professional Backtest
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Professional Features Panel */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Professional Features
          </CardTitle>
          <CardDescription>Advanced backtesting capabilities for institutional-grade analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="optimization" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="walkforward">Walk-Forward</TabsTrigger>
              <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="optimization" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Parameter Optimization</Label>
                  <p className="text-sm text-muted-foreground">Genetic algorithm for optimal parameter discovery</p>
                </div>
                <Switch checked={enableOptimization} onCheckedChange={setEnableOptimization} />
              </div>
              {enableOptimization && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm">🧬 Genetic Algorithm Configuration:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Population Size: 25 individuals</li>
                    <li>• Generations: 30 iterations</li>
                    <li>• Optimization Metric: Sharpe Ratio</li>
                    <li>• Parameters: Period, Threshold, Risk Level</li>
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="walkforward" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Walk-Forward Analysis</Label>
                  <p className="text-sm text-muted-foreground">Out-of-sample validation and robustness testing</p>
                </div>
                <Switch checked={enableWalkForward} onCheckedChange={setEnableWalkForward} />
              </div>
              {enableWalkForward && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">🚶 Walk-Forward Configuration:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Optimization Window: 6 months</li>
                    <li>• Testing Window: 2 months</li>
                    <li>• Step Size: 1 month</li>
                    <li>• Reoptimization: Every 3 periods</li>
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="montecarlo" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Monte Carlo Simulation</Label>
                  <p className="text-sm text-muted-foreground">Risk assessment through statistical simulation</p>
                </div>
                <Switch checked={enableMonteCarlo} onCheckedChange={setEnableMonteCarlo} />
              </div>
              {enableMonteCarlo && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm">🎲 Monte Carlo Configuration:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Simulations: 1,000 runs</li>
                    <li>• Confidence Level: 95%</li>
                    <li>• Bootstrap Method: Non-parametric</li>
                    <li>• Risk Metrics: VaR, CVaR, Expected Shortfall</li>
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Advanced Analytics</Label>
                  <p className="text-sm text-muted-foreground">Comprehensive performance attribution and risk analysis</p>
                </div>
                <Switch checked={enableAdvancedAnalytics} onCheckedChange={setEnableAdvancedAnalytics} />
              </div>
              {enableAdvancedAnalytics && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm">📊 Analytics Configuration:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Transaction Costs: 0.1% commission, 0.05% spread</li>
                    <li>• Slippage Modeling: 0.02% impact</li>
                    <li>• Risk Metrics: Calmar, Sortino, Information Ratio</li>
                    <li>• Performance Attribution: Factor analysis</li>
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Professional Backtest Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Phase: {progress.phase}</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <Progress value={progress.progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">{progress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <StrategyConfiguration
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            symbol={symbol}
            setSymbol={setSymbol}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            initialCapital={initialCapital}
            setInitialCapital={setInitialCapital}
            onReset={resetParameters}
          />
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <BacktestResults
            backtestResults={backtestResults}
            symbol={symbol}
            selectedStrategy={selectedStrategy}
          />
        </div>
      </div>

      {/* Strategy Details */}
      <StrategyDetails selectedStrategy={selectedStrategy} />
    </div>
  );
};

export default Backtesting;
