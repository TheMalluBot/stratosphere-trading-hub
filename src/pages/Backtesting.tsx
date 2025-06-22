
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play, Pause, RotateCcw } from "lucide-react";
import { LinearRegressionStrategy } from "@/strategies/LinearRegressionStrategy";
import { ZScoreTrendStrategy } from "@/strategies/ZScoreTrendStrategy";
import { UltimateStrategy } from "@/strategies/UltimateStrategy";
import { StrategyConfig, MarketData } from "@/types/strategy";
import { StrategyConfiguration } from "@/components/backtesting/StrategyConfiguration";
import { BacktestResults } from "@/components/backtesting/BacktestResults";
import { StrategyDetails } from "@/components/backtesting/StrategyDetails";

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("ultimate-combined");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("1D");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  // Mock market data generator
  const generateMockData = (symbol: string, days: number): MarketData[] => {
    const data: MarketData[] = [];
    let price = 2500; // Starting price
    const startTime = new Date(startDate).getTime();
    
    for (let i = 0; i < days; i++) {
      const timestamp = startTime + (i * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({ timestamp, open, high, low, close, volume });
      price = close;
    }
    
    return data;
  };

  const runBacktest = async () => {
    if (!symbol || !initialCapital) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRunning(true);
    toast.loading("Running advanced backtest...");

    try {
      // Generate mock market data
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const marketData = generateMockData(symbol, days);
      
      // Create strategy instance based on selection
      let strategy;
      const baseConfig: StrategyConfig = {
        id: selectedStrategy,
        name: "",
        description: "",
        parameters: {},
        enabled: true
      };

      switch (selectedStrategy) {
        case "linear-regression":
          strategy = new LinearRegressionStrategy(baseConfig);
          break;
        case "z-score-trend":
          strategy = new ZScoreTrendStrategy(baseConfig);
          break;
        case "ultimate-combined":
          strategy = new UltimateStrategy(baseConfig);
          break;
        default:
          // For not-yet-implemented strategies, use mock results
          strategy = new LinearRegressionStrategy(baseConfig);
      }

      // Run the backtest
      const result = strategy.calculate(marketData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBacktestResults({
        ...result.performance,
        signals: result.signals.length,
        indicators: Object.keys(result.indicators).length,
        strategy: strategy.getName(),
        period: `${startDate} to ${endDate}`,
        totalBars: marketData.length
      });
      
      toast.success(`Backtest completed! Found ${result.signals.length} signals`);
      
    } catch (error) {
      console.error("Backtest error:", error);
      toast.error("Backtest failed. Please try again.");
    } finally {
      setIsRunning(false);
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
    toast.success("Parameters reset to defaults");
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Strategy Backtesting</h1>
          <p className="text-muted-foreground">
            Test individual strategies or the ultimate combined approach
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
                Run Backtest
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
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
