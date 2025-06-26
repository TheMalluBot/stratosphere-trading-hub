import { StrategyResult, StrategySignal, MarketData } from '@/types/strategy';
import { FinancialMetrics } from './FinancialMetrics';

export interface MonteCarloConfig {
  numSimulations: number;
  confidenceLevel: number;
  bootstrapMethod: 'parametric' | 'non_parametric' | 'block_bootstrap';
  blockSize?: number;
  randomSeed?: number;
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
  valueAtRisk: Record<number, number>;
  cvar: Record<number, number>;
  probabilityOfLoss: number;
  expectedShortfall: number;
  confidenceBounds: {
    lower: number;
    upper: number;
  };
}

export class MonteCarloEngine {
  private config: MonteCarloConfig;
  private randomGenerator: () => number;

  constructor(config: Partial<MonteCarloConfig> = {}) {
    this.config = {
      numSimulations: config.numSimulations || 1000,
      confidenceLevel: config.confidenceLevel || 0.95,
      bootstrapMethod: config.bootstrapMethod || 'non_parametric',
      blockSize: config.blockSize || 10,
      randomSeed: config.randomSeed
    };

    // Initialize random number generator with optional seed for reproducibility
    this.randomGenerator = this.createRandomGenerator(this.config.randomSeed);
  }

  private createRandomGenerator(seed?: number): () => number {
    if (seed !== undefined) {
      // Simple seeded PRNG for reproducible results
      let currentSeed = seed;
      return () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
    }
    return Math.random;
  }

  async runSimulation(
    originalResult: StrategyResult,
    marketData: MarketData[]
  ): Promise<MonteCarloResults> {
    if (!originalResult.signals || originalResult.signals.length === 0) {
      throw new Error('No signals found in strategy result');
    }

    if (!marketData || marketData.length === 0) {
      throw new Error('No market data provided');
    }

    console.log(`Starting Monte Carlo simulation with ${this.config.numSimulations} runs`);
    
    const simulations = await this.generateSimulations(originalResult, marketData);
    const results = this.analyzeSimulations(simulations);
    
    console.log('Monte Carlo simulation completed');
    return results;
  }

  private async generateSimulations(
    originalResult: StrategyResult,
    marketData: MarketData[]
  ): Promise<Array<{ returns: number[]; performance: any }>> {
    const originalReturns = this.extractReturns(originalResult.signals, marketData);
    
    if (originalReturns.length === 0) {
      throw new Error('No returns could be extracted from signals');
    }

    const simulations = [];
    const batchSize = 100;
    
    for (let batch = 0; batch < Math.ceil(this.config.numSimulations / batchSize); batch++) {
      const batchSimulations = [];
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, this.config.numSimulations);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const simulatedReturns = await this.simulateReturns(originalReturns);
        const performance = this.calculateSimulationPerformance(simulatedReturns);
        
        batchSimulations.push({
          returns: simulatedReturns,
          performance
        });
      }
      
      simulations.push(...batchSimulations);
      
      // Yield control to prevent blocking UI
      if (batch % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
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
    if (returns.length === 0) return [];
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const std = Math.sqrt(variance);

    const simulatedReturns = [];
    for (let i = 0; i < returns.length; i++) {
      // Box-Muller transform for normal distribution
      const u1 = this.randomGenerator();
      const u2 = this.randomGenerator();
      
      // Ensure u1 is not zero to avoid log(0)
      const validU1 = Math.max(u1, 1e-10);
      const z = Math.sqrt(-2 * Math.log(validU1)) * Math.cos(2 * Math.PI * u2);
      
      simulatedReturns.push(mean + std * z);
    }

    return simulatedReturns;
  }

  private nonParametricBootstrap(returns: number[]): number[] {
    const simulatedReturns = [];
    for (let i = 0; i < returns.length; i++) {
      const randomIndex = Math.floor(this.randomGenerator() * returns.length);
      simulatedReturns.push(returns[randomIndex]);
    }
    return simulatedReturns;
  }

  private blockBootstrap(returns: number[]): number[] {
    const blockSize = Math.min(this.config.blockSize || 10, returns.length);
    const simulatedReturns = [];
    
    while (simulatedReturns.length < returns.length) {
      const maxStartIndex = Math.max(0, returns.length - blockSize);
      const startIndex = Math.floor(this.randomGenerator() * (maxStartIndex + 1));
      const block = returns.slice(startIndex, startIndex + blockSize);
      simulatedReturns.push(...block);
    }

    return simulatedReturns.slice(0, returns.length);
  }

  private extractReturns(signals: StrategySignal[], marketData: MarketData[]): number[] {
    const returns = [];
    let position = 0;
    let entryPrice = 0;

    try {
      for (const signal of signals) {
        if (position === 0) {
          // Enter position
          position = signal.type === 'BUY' ? 1 : -1;
          entryPrice = signal.price;
        } else if ((position > 0 && signal.type === 'SELL') || (position < 0 && signal.type === 'BUY')) {
          // Exit position
          const returnPct = position > 0 
            ? (signal.price - entryPrice) / entryPrice
            : (entryPrice - signal.price) / entryPrice;
          
          // Validate return
          if (isFinite(returnPct) && !isNaN(returnPct)) {
            returns.push(returnPct);
          }
          position = 0;
        }
      }
    } catch (error) {
      console.error('Error extracting returns:', error);
    }

    return returns.filter(r => Math.abs(r) < 1); // Filter out extreme returns (>100%)
  }

  private calculateSimulationPerformance(returns: number[]): any {
    if (returns.length === 0) {
      return {
        totalReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        volatility: 0
      };
    }

    // Calculate cumulative returns and drawdown
    const equityCurve = [1];
    let peak = 1;
    let maxDrawdown = 0;
    let wins = 0;

    for (const ret of returns) {
      const newValue = equityCurve[equityCurve.length - 1] * (1 + ret);
      equityCurve.push(newValue);

      if (newValue > peak) {
        peak = newValue;
      }

      const drawdown = (peak - newValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      if (ret > 0) wins++;
    }

    // Calculate performance metrics
    const totalReturn = equityCurve[equityCurve.length - 1] - 1;
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
    );

    const annualizedReturn = Math.pow(1 + totalReturn, 252 / returns.length) - 1;
    const annualizedVolatility = volatility * Math.sqrt(252);
    const sharpeRatio = annualizedVolatility > 0 ? 
      (annualizedReturn - 0.02) / annualizedVolatility : 0; // Assuming 2% risk-free rate

    return {
      totalReturn,
      maxDrawdown,
      sharpe Ratio,
      winRate: (wins / returns.length) * 100,
      volatility: annualizedVolatility,
      avgReturn: annualizedReturn
    };
  }

  private analyzeSimulations(simulations: Array<{ returns: number[]; performance: any }>): MonteCarloResults {
    const performances = simulations.map(sim => sim.performance);
    const allReturns = simulations.flatMap(sim => sim.returns);
    
    const totalReturns = performances.map(p => p.totalReturn);
    const maxDrawdowns = performances.map(p => p.maxDrawdown);
    const sharpeRatios = performances.map(p => p.sharpeRatio).filter(s => isFinite(s));

    // Calculate statistics using proper financial formulas
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
      mean: sharpeRatios.length > 0 ? this.calculateMean(sharpeRatios) : 0,
      std: sharpeRatios.length > 0 ? this.calculateStandardDeviation(sharpeRatios) : 0,
      percentiles: sharpeRatios.length > 0 ? 
        this.calculateMultiplePercentiles(sharpeRatios, [5, 10, 25, 75, 90, 95]) : {}
    };

    const valueAtRisk = this.calculateMultiplePercentiles(totalReturns, [1, 5, 10]);
    const cvar = this.calculateConditionalVaR(totalReturns, [1, 5, 10]);

    const probabilityOfLoss = totalReturns.filter(r => r < 0).length / totalReturns.length;
    const expectedShortfall = this.calculateExpectedShortfall(totalReturns, 0.05);

    // Calculate confidence bounds
    const confidenceLevel = this.config.confidenceLevel;
    const lowerBound = (1 - confidenceLevel) / 2;
    const upperBound = confidenceLevel + lowerBound;

    return {
      returns,
      maxDrawdown,
      sharpeRatio,
      valueAtRisk,
      cvar,
      probabilityOfLoss,
      expectedShortfall,
      confidenceBounds: {
        lower: this.calculatePercentile(totalReturns, lowerBound * 100),
        upper: this.calculatePercentile(totalReturns, upperBound * 100)
      }
    };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
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
    if (values.length < 3) return 0;
    
    const mean = this.calculateMean(values);
    const std = this.calculateStandardDeviation(values);
    
    if (std === 0) return 0;
    
    const skewness = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / std, 3);
    }, 0) / values.length;
    
    return skewness;
  }

  private calculateKurtosis(values: number[]): number {
    if (values.length < 4) return 0;
    
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
      const valueAtRisk = this.calculatePercentile(values, level);
      const tailValues = values.filter(v => v <= valueAtRisk);
      result[level] = tailValues.length > 0 ? this.calculateMean(tailValues) : valueAtRisk;
    }
    
    return result;
  }

  private calculateExpectedShortfall(values: number[], confidenceLevel: number): number {
    const valueAtRisk = this.calculatePercentile(values, confidenceLevel * 100);
    const tailValues = values.filter(v => v <= valueAtRisk);
    return tailValues.length > 0 ? -this.calculateMean(tailValues) : 0;
  }
}
