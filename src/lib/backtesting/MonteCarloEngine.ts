
import { StrategyResult, StrategySignal, MarketData } from '@/types/strategy';

export interface MonteCarloConfig {
  numSimulations: number;
  confidenceLevel: number;
  bootstrapMethod: 'parametric' | 'non_parametric' | 'block_bootstrap';
  blockSize?: number;
}

export interface MonteCarloResults {
  returns: {
    mean: number;
    median: number;
    std: number;
    skewness: number;
    kurtosis: number;
    percentiles: Record<number, number>;
  };
  maxDrawdown: {
    mean: number;
    worstCase: number;
    percentiles: Record<number, number>;
  };
  sharpeRatio: {
    mean: number;
    std: number;
    percentiles: Record<number, number>;
  };
  var: Record<number, number>;
  cvar: Record<number, number>;
  probabilityOfLoss: number;
  expectedShortfall: number;
}

export class MonteCarloEngine {
  private config: MonteCarloConfig;

  constructor(config: Partial<MonteCarloConfig> = {}) {
    this.config = {
      numSimulations: config.numSimulations || 1000,
      confidenceLevel: config.confidenceLevel || 0.95,
      bootstrapMethod: config.bootstrapMethod || 'non_parametric',
      blockSize: config.blockSize || 10
    };
  }

  async runSimulation(
    originalResult: StrategyResult,
    marketData: MarketData[]
  ): Promise<MonteCarloResults> {
    const simulations = await this.generateSimulations(originalResult, marketData);
    return this.analyzeSimulations(simulations);
  }

  private async generateSimulations(
    originalResult: StrategyResult,
    marketData: MarketData[]
  ): Promise<Array<{ returns: number[]; maxDrawdown: number; sharpeRatio: number }>> {
    const simulations = [];
    const originalReturns = this.extractReturns(originalResult.signals, marketData);

    for (let i = 0; i < this.config.numSimulations; i++) {
      const simulatedReturns = await this.simulateReturns(originalReturns);
      const performance = this.calculatePerformanceMetrics(simulatedReturns);
      
      simulations.push({
        returns: simulatedReturns,
        maxDrawdown: performance.maxDrawdown,
        sharpeRatio: performance.sharpeRatio
      });
    }

    return simulations;
  }

  private async simulateReturns(originalReturns: number[]): Promise<number[]> {
    switch (this.config.bootstrapMethod) {
      case 'parametric':
        return this.parametricBootstrap(originalReturns);
      case 'non_parametric':
        return this.nonParametricBootstrap(originalReturns);
      case 'block_bootstrap':
        return this.blockBootstrap(originalReturns);
      default:
        return this.nonParametricBootstrap(originalReturns);
    }
  }

  private parametricBootstrap(returns: number[]): number[] {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const std = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    );

    const simulatedReturns = [];
    for (let i = 0; i < returns.length; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      simulatedReturns.push(mean + std * z);
    }

    return simulatedReturns;
  }

  private nonParametricBootstrap(returns: number[]): number[] {
    const simulatedReturns = [];
    for (let i = 0; i < returns.length; i++) {
      const randomIndex = Math.floor(Math.random() * returns.length);
      simulatedReturns.push(returns[randomIndex]);
    }
    return simulatedReturns;
  }

  private blockBootstrap(returns: number[]): number[] {
    const blockSize = this.config.blockSize || 10;
    const simulatedReturns = [];
    
    while (simulatedReturns.length < returns.length) {
      const startIndex = Math.floor(Math.random() * (returns.length - blockSize + 1));
      const block = returns.slice(startIndex, startIndex + blockSize);
      simulatedReturns.push(...block);
    }

    return simulatedReturns.slice(0, returns.length);
  }

  private extractReturns(signals: StrategySignal[], marketData: MarketData[]): number[] {
    const returns = [];
    let position = 0;
    let entryPrice = 0;

    for (const signal of signals) {
      if (position === 0) {
        position = signal.type === 'BUY' ? 1 : -1;
        entryPrice = signal.price;
      } else if ((position > 0 && signal.type === 'SELL') || (position < 0 && signal.type === 'BUY')) {
        const returnPct = position > 0 
          ? (signal.price - entryPrice) / entryPrice
          : (entryPrice - signal.price) / entryPrice;
        
        returns.push(returnPct);
        position = 0;
      }
    }

    return returns;
  }

  private calculatePerformanceMetrics(returns: number[]): { maxDrawdown: number; sharpeRatio: number } {
    if (returns.length === 0) return { maxDrawdown: 0, sharpeRatio: 0 };

    // Calculate cumulative returns and max drawdown
    const cumulativeReturns = [1];
    let peak = 1;
    let maxDrawdown = 0;

    for (const ret of returns) {
      const newValue = cumulativeReturns[cumulativeReturns.length - 1] * (1 + ret);
      cumulativeReturns.push(newValue);

      if (newValue > peak) {
        peak = newValue;
      }

      const drawdown = (peak - newValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate Sharpe ratio
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );

    const sharpeRatio = volatility > 0 ? (avgReturn / volatility) * Math.sqrt(252) : 0;

    return { maxDrawdown, sharpeRatio };
  }

  private analyzeSimulations(simulations: Array<{ returns: number[]; maxDrawdown: number; sharpeRatio: number }>): MonteCarloResults {
    const allReturns = simulations.flatMap(sim => sim.returns);
    const totalReturns = simulations.map(sim => sim.returns.reduce((sum, r) => sum + r, 0));
    const maxDrawdowns = simulations.map(sim => sim.maxDrawdown);
    const sharpeRatios = simulations.map(sim => sim.sharpeRatio);

    // Calculate statistics
    const returns = {
      mean: this.calculateMean(totalReturns),
      median: this.calculatePercentile(totalReturns, 50),
      std: this.calculateStandardDeviation(totalReturns),
      skewness: this.calculateSkewness(totalReturns),
      kurtosis: this.calculateKurtosis(totalReturns),
      percentiles: this.calculateMultiplePercentiles(totalReturns, [5, 10, 25, 75, 90, 95])
    };

    const maxDrawdown = {
      mean: this.calculateMean(maxDrawdowns),
      worstCase: Math.max(...maxDrawdowns),
      percentiles: this.calculateMultiplePercentiles(maxDrawdowns, [5, 10, 25, 75, 90, 95])
    };

    const sharpeRatio = {
      mean: this.calculateMean(sharpeRatios),
      std: this.calculateStandardDeviation(sharpeRatios),
      percentiles: this.calculateMultiplePercentiles(sharpeRatios, [5, 10, 25, 75, 90, 95])
    };

    const var = this.calculateMultiplePercentiles(totalReturns, [1, 5, 10]);
    const cvar = this.calculateConditionalVaR(totalReturns, [1, 5, 10]);

    const probabilityOfLoss = totalReturns.filter(r => r < 0).length / totalReturns.length;
    const expectedShortfall = this.calculateExpectedShortfall(totalReturns, 0.05);

    return {
      returns,
      maxDrawdown,
      sharpeRatio,
      var,
      cvar,
      probabilityOfLoss,
      expectedShortfall
    };
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  private calculateMultiplePercentiles(values: number[], percentiles: number[]): Record<number, number> {
    const result: Record<number, number> = {};
    for (const p of percentiles) {
      result[p] = this.calculatePercentile(values, p);
    }
    return result;
  }

  private calculateSkewness(values: number[]): number {
    const mean = this.calculateMean(values);
    const std = this.calculateStandardDeviation(values);
    
    if (std === 0) return 0;
    
    const skewness = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / std, 3);
    }, 0) / values.length;
    
    return skewness;
  }

  private calculateKurtosis(values: number[]): number {
    const mean = this.calculateMean(values);
    const std = this.calculateStandardDeviation(values);
    
    if (std === 0) return 0;
    
    const kurtosis = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / std, 4);
    }, 0) / values.length;
    
    return kurtosis - 3; // Excess kurtosis
  }

  private calculateConditionalVaR(values: number[], confidenceLevels: number[]): Record<number, number> {
    const result: Record<number, number> = {};
    
    for (const level of confidenceLevels) {
      const var = this.calculatePercentile(values, level);
      const tailValues = values.filter(v => v <= var);
      result[level] = tailValues.length > 0 ? this.calculateMean(tailValues) : var;
    }
    
    return result;
  }

  private calculateExpectedShortfall(values: number[], confidenceLevel: number): number {
    const var = this.calculatePercentile(values, confidenceLevel * 100);
    const tailValues = values.filter(v => v <= var);
    return tailValues.length > 0 ? -this.calculateMean(tailValues) : 0;
  }
}
