
import { StrategyConfig, StrategyResult, MarketData } from '@/types/strategy';
import { BacktestEngine } from './BacktestEngine';
import { ParameterOptimizer, OptimizationConfig } from './ParameterOptimizer';

export interface WalkForwardConfig {
  strategy: StrategyConfig;
  optimizationWindow: number; // days
  testingWindow: number; // days
  stepSize: number; // days
  reoptimizationFrequency: number; // how often to reoptimize
  parameters?: Record<string, {
    min: number;
    max: number;
    step: number;
    type: 'integer' | 'float';
  }>;
}

export interface WalkForwardResult {
  periods: Array<{
    optimizationStart: Date;
    optimizationEnd: Date;
    testingStart: Date;
    testingEnd: Date;
    optimizedParameters: Record<string, number>;
    inSampleResult: StrategyResult;
    outOfSampleResult: StrategyResult;
    degradation: number; // Performance degradation from in-sample to out-of-sample
  }>;
  aggregateResults: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    avgDegradation: number;
    consistency: number; // How consistent the strategy performs across periods
  };
  robustnessMetrics: {
    parameterStability: Record<string, number>; // How stable each parameter is across periods
    performanceConsistency: number;
    worstPeriodDrawdown: number;
    bestPeriodReturn: number;
  };
}

export class WalkForwardEngine {
  private backtestEngine: BacktestEngine;
  private parameterOptimizer: ParameterOptimizer;

  constructor() {
    this.backtestEngine = new BacktestEngine();
    this.parameterOptimizer = new ParameterOptimizer();
  }

  async runWalkForwardAnalysis(
    config: WalkForwardConfig,
    marketData: MarketData[]
  ): Promise<WalkForwardResult> {
    console.log('🚶 Starting Walk-Forward Analysis...');
    
    const periods = this.generateWalkForwardPeriods(config, marketData);
    const results: WalkForwardResult['periods'] = [];
    
    let lastOptimizedParameters: Record<string, number> = {};

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      console.log(`Processing period ${i + 1}/${periods.length}`);

      // Should we reoptimize parameters?
      const shouldReoptimize = i === 0 || (i % config.reoptimizationFrequency === 0);
      let optimizedParameters = lastOptimizedParameters;

      if (shouldReoptimize && config.parameters) {
        // Get optimization data
        const optimizationData = this.getDataForPeriod(
          marketData,
          period.optimizationStart,
          period.optimizationEnd
        );

        // Run parameter optimization
        const optimizationConfig: OptimizationConfig = {
          strategy: config.strategy,
          parameters: config.parameters,
          optimizationMetric: 'sharpe',
          maxIterations: 20, // Reduced for walk-forward
          populationSize: 20,
          crossoverRate: 0.8,
          mutationRate: 0.1,
          eliteRatio: 0.2
        };

        try {
          const optimizationResult = await this.parameterOptimizer.optimizeParameters(
            optimizationConfig,
            optimizationData
          );
          optimizedParameters = optimizationResult.bestParameters;
          lastOptimizedParameters = optimizedParameters;
        } catch (error) {
          console.warn('Optimization failed, using previous parameters:', error);
        }
      }

      // Run in-sample backtest (optimization period)
      const inSampleData = this.getDataForPeriod(
        marketData,
        period.optimizationStart,
        period.optimizationEnd
      );

      const inSampleResult = await this.runBacktestForPeriod(
        config.strategy,
        optimizedParameters,
        inSampleData,
        'in-sample'
      );

      // Run out-of-sample backtest (testing period)
      const outOfSampleData = this.getDataForPeriod(
        marketData,
        period.testingStart,
        period.testingEnd
      );

      const outOfSampleResult = await this.runBacktestForPeriod(
        config.strategy,
        optimizedParameters,
        outOfSampleData,
        'out-of-sample'
      );

      // Calculate performance degradation
      const degradation = this.calculateDegradation(inSampleResult, outOfSampleResult);

      results.push({
        optimizationStart: period.optimizationStart,
        optimizationEnd: period.optimizationEnd,
        testingStart: period.testingStart,
        testingEnd: period.testingEnd,
        optimizedParameters,
        inSampleResult,
        outOfSampleResult,
        degradation
      });

      console.log(`Period ${i + 1} completed - Degradation: ${(degradation * 100).toFixed(2)}%`);
    }

    // Calculate aggregate results
    const aggregateResults = this.calculateAggregateResults(results);
    const robustnessMetrics = this.calculateRobustnessMetrics(results);

    console.log('✅ Walk-Forward Analysis completed');

    return {
      periods: results,
      aggregateResults,
      robustnessMetrics
    };
  }

  private generateWalkForwardPeriods(
    config: WalkForwardConfig,
    marketData: MarketData[]
  ): Array<{
    optimizationStart: Date;
    optimizationEnd: Date;
    testingStart: Date;
    testingEnd: Date;
  }> {
    const periods = [];
    const startTime = marketData[0].timestamp;
    const endTime = marketData[marketData.length - 1].timestamp;
    
    const optimizationWindowMs = config.optimizationWindow * 24 * 60 * 60 * 1000;
    const testingWindowMs = config.testingWindow * 24 * 60 * 60 * 1000;
    const stepSizeMs = config.stepSize * 24 * 60 * 60 * 1000;

    let currentStart = startTime;

    while (currentStart + optimizationWindowMs + testingWindowMs <= endTime) {
      const optimizationStart = new Date(currentStart);
      const optimizationEnd = new Date(currentStart + optimizationWindowMs);
      const testingStart = new Date(currentStart + optimizationWindowMs);
      const testingEnd = new Date(currentStart + optimizationWindowMs + testingWindowMs);

      periods.push({
        optimizationStart,
        optimizationEnd,
        testingStart,
        testingEnd
      });

      currentStart += stepSizeMs;
    }

    return periods;
  }

  private getDataForPeriod(
    marketData: MarketData[],
    startDate: Date,
    endDate: Date
  ): MarketData[] {
    return marketData.filter(
      data => data.timestamp >= startDate.getTime() && data.timestamp <= endDate.getTime()
    );
  }

  private async runBacktestForPeriod(
    strategy: StrategyConfig,
    parameters: Record<string, number>,
    data: MarketData[],
    phase: string
  ): Promise<StrategyResult> {
    const strategyConfig: StrategyConfig = {
      ...strategy,
      parameters: { ...strategy.parameters, ...parameters }
    };

    const backtestConfig = {
      symbol: `WF_${phase.toUpperCase()}`,
      timeframe: '1h',
      startDate: new Date(data[0].timestamp).toISOString().split('T')[0],
      endDate: new Date(data[data.length - 1].timestamp).toISOString().split('T')[0],
      initialCapital: 100000,
      strategies: [strategyConfig]
    };

    try {
      const results = await this.backtestEngine.runBacktest(backtestConfig);
      return results[0] || this.getEmptyResult();
    } catch (error) {
      console.error(`Backtest failed for ${phase}:`, error);
      return this.getEmptyResult();
    }
  }

  private getEmptyResult(): StrategyResult {
    return {
      signals: [],
      indicators: {},
      performance: {
        totalReturn: 0,
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalTrades: 0
      }
    };
  }

  private calculateDegradation(
    inSample: StrategyResult,
    outOfSample: StrategyResult
  ): number {
    const inSampleSharpe = inSample.performance.sharpeRatio || 0;
    const outOfSampleSharpe = outOfSample.performance.sharpeRatio || 0;

    if (inSampleSharpe === 0) return 0;

    return (inSampleSharpe - outOfSampleSharpe) / Math.abs(inSampleSharpe);
  }

  private calculateAggregateResults(
    periods: WalkForwardResult['periods']
  ): WalkForwardResult['aggregateResults'] {
    const outOfSampleResults = periods.map(p => p.outOfSampleResult);
    
    // Combine all out-of-sample periods
    const totalReturns = outOfSampleResults.map(r => r.performance.totalReturn || 0);
    const sharpeRatios = outOfSampleResults.map(r => r.performance.sharpeRatio || 0);
    const maxDrawdowns = outOfSampleResults.map(r => r.performance.maxDrawdown || 0);
    const winRates = outOfSampleResults.map(r => r.performance.winRate || 0);
    const totalTrades = outOfSampleResults.reduce((sum, r) => sum + (r.performance.totalTrades || 0), 0);
    const degradations = periods.map(p => p.degradation);

    const avgReturn = totalReturns.reduce((sum, ret) => sum + ret, 0) / totalReturns.length;
    const avgSharpe = sharpeRatios.filter(s => isFinite(s)).reduce((sum, s) => sum + s, 0) / 
                     Math.max(1, sharpeRatios.filter(s => isFinite(s)).length);
    const maxDrawdown = Math.max(...maxDrawdowns);
    const avgWinRate = winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length;
    const avgDegradation = degradations.reduce((sum, deg) => sum + deg, 0) / degradations.length;

    // Calculate consistency (lower standard deviation of returns = higher consistency)
    const returnStd = this.calculateStandardDeviation(totalReturns);
    const consistency = returnStd > 0 ? 1 / (1 + returnStd) : 1;

    return {
      totalReturn: avgReturn,
      sharpeRatio: avgSharpe,
      maxDrawdown,
      winRate: avgWinRate,
      totalTrades,
      avgDegradation,
      consistency
    };
  }

  private calculateRobustnessMetrics(
    periods: WalkForwardResult['periods']
  ): WalkForwardResult['robustnessMetrics'] {
    // Parameter stability - how much parameters vary across periods
    const parameterStability: Record<string, number> = {};
    const allParameters = periods.map(p => p.optimizedParameters);
    
    if (allParameters.length > 0) {
      const paramNames = Object.keys(allParameters[0]);
      
      for (const param of paramNames) {
        const values = allParameters.map(params => params[param]).filter(v => v !== undefined);
        if (values.length > 1) {
          const std = this.calculateStandardDeviation(values);
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          parameterStability[param] = mean !== 0 ? 1 / (1 + Math.abs(std / mean)) : 1;
        } else {
          parameterStability[param] = 1;
        }
      }
    }

    // Performance consistency
    const outOfSampleReturns = periods.map(p => p.outOfSampleResult.performance.totalReturn || 0);
    const returnStd = this.calculateStandardDeviation(outOfSampleReturns);
    const performanceConsistency = returnStd > 0 ? 1 / (1 + returnStd) : 1;

    // Worst and best period metrics
    const worstPeriodDrawdown = Math.max(
      ...periods.map(p => p.outOfSampleResult.performance.maxDrawdown || 0)
    );
    const bestPeriodReturn = Math.max(
      ...periods.map(p => p.outOfSampleResult.performance.totalReturn || 0)
    );

    return {
      parameterStability,
      performanceConsistency,
      worstPeriodDrawdown,
      bestPeriodReturn
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
    
    return Math.sqrt(variance);
  }
}
