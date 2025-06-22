
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StrategyConfiguration } from "@/components/backtesting/StrategyConfiguration";
import { BacktestResults } from "@/components/backtesting/BacktestResults";
import { StrategyDetails } from "@/components/backtesting/StrategyDetails";
import { BacktestEngine, BacktestConfig, BacktestProgress } from "@/lib/backtesting/BacktestEngine";

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
  const [enableAdvanced, setEnableAdvanced] = useState(true);
  
  const engineRef = useRef<BacktestEngine | null>(null);

  useEffect(() => {
    engineRef.current = new BacktestEngine();
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
      toast.error("Backtest engine not initialized");
      return;
    }

    setIsRunning(true);
    setProgress(null);
    toast.loading("Initializing enhanced backtest engine...");

    try {
      const config: BacktestConfig = {
        symbol,
        timeframe,
        startDate,
        endDate,
        initialCapital: parseInt(initialCapital),
        strategies: [{
          id: selectedStrategy,
          name: selectedStrategy,
          description: `Selected strategy: ${selectedStrategy}`,
          parameters: {},
          enabled: true
        }],
        enableMonteCarlo: enableAdvanced,
        monteCarloRuns: 1000,
        enableWalkForward: enableAdvanced
      };

      const results = await engineRef.current.runBacktest(config);
      
      if (results && results.length > 0) {
        const result = results[0];
        setBacktestResults({
          ...result.performance,
          signals: result.signals.length,
          indicators: Object.keys(result.indicators).length,
          strategy: selectedStrategy,
          period: `${startDate} to ${endDate}`,
          totalBars: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
          strategiesUsed: 1,
          // Enhanced metrics
          advanced: enableAdvanced ? {
            calmarRatio: result.performance.calmarRatio || 0,
            sortinoRatio: result.performance.sortinoRatio || 0,
            informationRatio: result.performance.informationRatio || 0,
            profitFactor: result.performance.profitFactor || 0,
            ulcerIndex: result.performance.ulcerIndex || 0,
            var95: result.performance.var95 || 0,
            cvar95: result.performance.cvar95 || 0
          } : null
        });
        
        toast.success(`Enhanced backtest completed! Found ${result.signals.length} signals with advanced analytics`);
      }
      
    } catch (error) {
      console.error("Enhanced backtest error:", error);
      toast.error("Enhanced backtest failed. Please try again.");
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
    setEnableAdvanced(true);
    toast.success("Parameters reset to defaults");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Enhanced Strategy Backtesting
          </h1>
          <p className="text-muted-foreground">
            Multi-threaded, client-side backtesting with advanced analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetParameters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={runBacktest} disabled={isRunning}>
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Enhanced Backtest
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">
              {navigator.hardwareConcurrency || 4}
            </div>
            <p className="text-xs text-muted-foreground">CPU Cores Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              Multi-threaded
            </div>
            <p className="text-xs text-muted-foreground">Processing Mode</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">
              IndexedDB
            </div>
            <p className="text-xs text-muted-foreground">Data Caching</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">
              {enableAdvanced ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">Advanced Analytics</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Display */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Backtest Progress
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
            
            {progress.strategyProgress && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Strategy Progress:</h4>
                {Object.entries(progress.strategyProgress).map(([strategy, progress]) => (
                  <div key={strategy} className="flex justify-between text-xs">
                    <span>{strategy}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                ))}
              </div>
            )}
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

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Analytics</CardTitle>
              <CardDescription>Enhanced performance analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monte Carlo Simulation</p>
                  <p className="text-sm text-muted-foreground">1000 simulation runs</p>
                </div>
                <Badge variant={enableAdvanced ? "default" : "secondary"}>
                  {enableAdvanced ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Walk-Forward Analysis</p>
                  <p className="text-sm text-muted-foreground">Out-of-sample validation</p>
                </div>
                <Badge variant={enableAdvanced ? "default" : "secondary"}>
                  {enableAdvanced ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEnableAdvanced(!enableAdvanced)}
              >
                {enableAdvanced ? "Disable" : "Enable"} Advanced Analytics
              </Button>
            </CardContent>
          </Card>
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
