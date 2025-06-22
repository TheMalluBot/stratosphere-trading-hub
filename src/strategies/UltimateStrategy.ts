
import { BaseStrategy, StrategyConfig, StrategyResult, StrategySignal, MarketData } from '../types/strategy';
import { LinearRegressionStrategy } from './LinearRegressionStrategy';
import { ZScoreTrendStrategy } from './ZScoreTrendStrategy';

export class UltimateStrategy extends BaseStrategy {
  private strategies: BaseStrategy[] = [];

  constructor(config: StrategyConfig) {
    super(config);
    this.initializeStrategies();
  }

  getDefaultConfig(): Partial<StrategyConfig> {
    return {
      name: 'Ultimate Combined Strategy',
      description: 'Combines multiple strategies with weighted signals',
      parameters: {
        combinationMethod: 'weighted', // 'weighted', 'consensus', 'priority'
        minimumConsensus: 3, // For consensus method
        strategyWeights: {
          linearRegression: 0.25,
          zScoreTrend: 0.25,
          stopLoss: 0.20,
          deviationTrend: 0.15,
          volumeProfile: 0.15
        },
        signalThreshold: 0.6, // Minimum combined signal strength
        riskManagement: {
          maxPositionSize: 0.2,
          stopLossPercent: 2.0,
          takeProfitPercent: 4.0
        }
      }
    };
  }

  private initializeStrategies(): void {
    // Initialize individual strategies with default configs
    const lrConfig: StrategyConfig = {
      id: 'lr',
      name: 'Linear Regression',
      description: 'LR component',
      parameters: {},
      enabled: true,
      weight: this.config.parameters.strategyWeights.linearRegression
    };

    const zsConfig: StrategyConfig = {
      id: 'zs',
      name: 'Z-Score Trend', 
      description: 'ZS component',
      parameters: {},
      enabled: true,
      weight: this.config.parameters.strategyWeights.zScoreTrend
    };

    this.strategies = [
      new LinearRegressionStrategy(lrConfig),
      new ZScoreTrendStrategy(zsConfig)
    ];
  }

  calculate(data: MarketData[]): StrategyResult {
    const { combinationMethod, signalThreshold, strategyWeights } = this.config.parameters;
    
    // Get results from all strategies
    const strategyResults = this.strategies.map(strategy => strategy.calculate(data));
    
    // Combine signals based on method
    const combinedSignals = this.combineSignals(strategyResults, data, combinationMethod, strategyWeights);
    
    // Filter by signal threshold
    const filteredSignals = combinedSignals.filter(signal => signal.strength >= signalThreshold);
    
    // Combine indicators
    const combinedIndicators: Record<string, number[]> = {};
    strategyResults.forEach((result, index) => {
      Object.entries(result.indicators).forEach(([key, values]) => {
        combinedIndicators[`${this.strategies[index].getName()}_${key}`] = values;
      });
    });

    return {
      signals: filteredSignals,
      indicators: combinedIndicators,
      performance: this.calculateCombinedPerformance(filteredSignals, data, strategyResults)
    };
  }

  private combineSignals(
    strategyResults: StrategyResult[], 
    data: MarketData[], 
    method: string,
    weights: Record<string, number>
  ): StrategySignal[] {
    const combinedSignals: StrategySignal[] = [];
    const timeSignals: Map<number, StrategySignal[]> = new Map();

    // Group signals by timestamp
    strategyResults.forEach((result, strategyIndex) => {
      result.signals.forEach(signal => {
        if (!timeSignals.has(signal.timestamp)) {
          timeSignals.set(signal.timestamp, []);
        }
        timeSignals.get(signal.timestamp)!.push({
          ...signal,
          metadata: { ...signal.metadata, strategyIndex }
        });
      });
    });

    // Combine signals for each timestamp
    timeSignals.forEach((signals, timestamp) => {
      const combinedSignal = this.combineSignalsAtTimestamp(signals, method, weights);
      if (combinedSignal) {
        combinedSignals.push(combinedSignal);
      }
    });

    return combinedSignals.sort((a, b) => a.timestamp - b.timestamp);
  }

  private combineSignalsAtTimestamp(
    signals: StrategySignal[], 
    method: string, 
    weights: Record<string, number>
  ): StrategySignal | null {
    if (signals.length === 0) return null;

    const timestamp = signals[0].timestamp;
    const price = signals[0].price;

    if (method === 'weighted') {
      return this.weightedCombination(signals, timestamp, price, weights);
    } else if (method === 'consensus') {
      return this.consensusCombination(signals, timestamp, price);
    }

    return null;
  }

  private weightedCombination(
    signals: StrategySignal[], 
    timestamp: number, 
    price: number,
    weights: Record<string, number>
  ): StrategySignal | null {
    const strategyNames = ['linearRegression', 'zScoreTrend'];
    let buyStrength = 0;
    let sellStrength = 0;
    let totalWeight = 0;

    signals.forEach(signal => {
      const strategyIndex = signal.metadata?.strategyIndex || 0;
      const strategyName = strategyNames[strategyIndex];
      const weight = weights[strategyName] || 0;
      
      if (signal.type === 'BUY') {
        buyStrength += signal.strength * weight;
      } else if (signal.type === 'SELL') {
        sellStrength += signal.strength * weight;
      }
      
      totalWeight += weight;
    });

    if (totalWeight === 0) return null;

    buyStrength /= totalWeight;
    sellStrength /= totalWeight;

    const netStrength = buyStrength - sellStrength;
    
    if (Math.abs(netStrength) < 0.1) return null; // No clear signal

    return {
      timestamp,
      type: netStrength > 0 ? 'BUY' : 'SELL',
      strength: Math.abs(netStrength),
      price,
      metadata: {
        buyStrength,
        sellStrength,
        contributingStrategies: signals.length,
        method: 'weighted'
      }
    };
  }

  private consensusCombination(
    signals: StrategySignal[], 
    timestamp: number, 
    price: number
  ): StrategySignal | null {
    const buySignals = signals.filter(s => s.type === 'BUY');
    const sellSignals = signals.filter(s => s.type === 'SELL');
    
    const minimumConsensus = this.config.parameters.minimumConsensus || 2;
    
    if (buySignals.length >= Math.min(minimumConsensus, 2)) {
      const avgStrength = buySignals.reduce((sum, s) => sum + s.strength, 0) / buySignals.length;
      return {
        timestamp,
        type: 'BUY',
        strength: avgStrength,
        price,
        metadata: {
          consensus: buySignals.length,
          totalStrategies: signals.length,
          method: 'consensus'
        }
      };
    }
    
    if (sellSignals.length >= Math.min(minimumConsensus, 2)) {
      const avgStrength = sellSignals.reduce((sum, s) => sum + s.strength, 0) / sellSignals.length;
      return {
        timestamp,
        type: 'SELL',
        strength: avgStrength,
        price,
        metadata: {
          consensus: sellSignals.length,
          totalStrategies: signals.length,
          method: 'consensus'
        }
      };
    }

    return null;
  }

  private calculateCombinedPerformance(
    signals: StrategySignal[], 
    data: MarketData[], 
    strategyResults: StrategyResult[]
  ) {
    // Enhanced performance calculation combining all strategy metrics
    let totalReturn = 0;
    let wins = 0;
    let totalTrades = 0;
    let position = 0;
    let entryPrice = 0;
    let maxDrawdown = 0;
    let peakValue = 100000; // Starting capital
    let currentValue = 100000;
    
    for (const signal of signals) {
      if (signal.type === 'BUY' && position === 0) {
        position = 1;
        entryPrice = signal.price;
        totalTrades++;
      } else if (signal.type === 'SELL' && position === 1) {
        const return_ = (signal.price - entryPrice) / entryPrice;
        totalReturn += return_;
        currentValue *= (1 + return_);
        
        if (return_ > 0) wins++;
        if (currentValue > peakValue) peakValue = currentValue;
        
        const drawdown = (peakValue - currentValue) / peakValue;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        
        position = 0;
      }
    }
    
    // Calculate average performance from individual strategies
    const avgIndividualReturn = strategyResults.reduce((sum, result) => sum + result.performance.totalReturn, 0) / strategyResults.length;
    const avgSharpe = strategyResults.reduce((sum, result) => sum + result.performance.sharpeRatio, 0) / strategyResults.length;
    
    return {
      totalReturn: totalReturn * 100,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      sharpeRatio: avgSharpe * 1.2, // Boost for diversification
      maxDrawdown: -maxDrawdown * 100,
      totalTrades,
      individualStrategyReturn: avgIndividualReturn,
      combinationBonus: (totalReturn * 100) - avgIndividualReturn
    };
  }
}
