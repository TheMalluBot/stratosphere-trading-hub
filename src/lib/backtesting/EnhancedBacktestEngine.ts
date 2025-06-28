
import { BacktestEngine, BacktestConfig, BacktestProgress } from './BacktestEngine';
import { ParameterOptimizer, OptimizationConfig } from './ParameterOptimizer';
import { WalkForwardEngine, WalkForwardConfig } from './WalkForwardEngine';
import { MonteCarloEngine, MonteCarloConfig } from './MonteCarloEngine';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';
import { StrategyResult, MarketData } from '@/types/strategy';

export interface EnhancedBacktestConfig extends BacktestConfig {
  // Parameter Optimization
  enableOptimization?: boolean;
  optimizationConfig?: {
    parameters: Record<string, {
      min: number;
      max: number;
      step: number;
      type: 'integer' | 'float';
    }>;
    metric: 'sharpe' | 'return' | 'calmar' | 'sortino';
    maxIterations: number;
    populationSize: number;
  };

  // Walk-Forward Analysis
  enableWalkForward?: boolean;
  walkForwardConfig?: {
    optimizationWindow: number;
    testingWindow: number;
    stepSize: number;
    reoptimizationFrequency: number;
  };

  // Monte Carlo Simulation
  enableMonteCarlo?: boolean;
  monteCarloConfig?: {
    numSimulations: number;
    confidenceLevel: number;
    bootstrapMethod: 'parametric' | 'non_parametric' | 'block_bootstrap';
  };

  // Advanced Analytics
  enableAdvancedAnalytics?: boolean;
  transactionCosts?: {
    commission: number; // per trade
    spread: number; // percentage
    slippage: number; // percentage
  };
}

export interface EnhancedBacktestResult {
  basicResults: StrategyResult[];
  optimizationResults?: {
    bestParameters: Record<string, number>;
    convergenceHistory: number[];
    executionTime: number;
  };
  walkForwardResults?: {
    periods: any[];
    aggregateResults: any;
    robustnessMetrics: any;
  };
  monteCarloResults?: {
    returns: any;
    maxDrawdown: any;
    sharpeRatio: any;
    valueAtRisk: any;
    probabilityOfLoss: number;
  };
  comprehensiveAnalysis: {
    robustness: number; // 0-1 score
    overfitting: number; // 0-1 score (higher = more overfitted)
    consistency: number; // 0-1 score
    riskAdjustedReturn: number;
    recommendation: 'DEPLOY' | 'OPTIMIZE' | 'REJECT';
    reasons: string[];
  };
}

export class EnhancedBacktestEngine extends BacktestEngine {
  private parameterOptimizer: ParameterOptimizer;
  private walkForwardEngine: WalkForwardEngine;
  private monteCarloEngine: MonteCarloEngine;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor() {
    super();
    this.parameterOptimizer = new ParameterOptimizer();
    this.walkForwardEngine = new WalkForwardEngine();
    this.monteCarloEngine = new MonteCarloEngine();
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  async runEnhancedBacktest(config: EnhancedBacktestConfig): Promise<EnhancedBacktestResult> {
    console.log('🚀 Starting Enhanced Backtesting Engine...');
    
    this.updateProgress({
      phase: 'loading',
      progress: 0,
      message: 'Initializing enhanced backtest...'
    });

    try {
      // Phase 1: Load and prepare data
      const marketData = await this.loadMarketData(config);
      
      this.updateProgress({
        phase: 'processing',
        progress: 10,
        message: 'Running basic backtest...'
      });

      // Phase 2: Run basic backtest
      const basicResults = await super.runBacktest(config);

      let optimizationResults;
      let walkForwardResults;
      let monteCarloResults;

      // Phase 3: Parameter Optimization (if enabled)
      if (config.enableOptimization && config.optimizationConfig) {
        this.updateProgress({
          phase: 'processing',
          progress: 30,
          message: 'Optimizing strategy parameters...'
        });

        optimizationResults = await this.runParameterOptimization(
          config,
          marketData
        );
      }

      // Phase 4: Walk-Forward Analysis (if enabled)
      if (config.enableWalkForward && config.walkForwardConfig) {
        this.updateProgress({
          phase: 'analyzing',
          progress: 50,
          message: 'Running walk-forward analysis...'
        });

        walkForwardResults = await this.runWalkForwardAnalysis(
          config,
          marketData
        );
      }

      // Phase 5: Monte Carlo Simulation (if enabled)
      if (config.enableMonteCarlo && basicResults.length > 0) {
        this.updateProgress({
          phase: 'analyzing',
          progress: 70,
          message: 'Running Monte Carlo simulation...'
        });

        monteCarloResults = await this.runMonteCarloSimulation(
          basicResults[0],
          marketData,
          config.monteCarloConfig
        );
      }

      // Phase 6: Comprehensive Analysis
      this.updateProgress({
        phase: 'analyzing',
        progress: 90,
        message: 'Generating comprehensive analysis...'
      });

      const comprehensiveAnalysis = this.generateComprehensiveAnalysis({
        basicResults,
        optimizationResults,
        walkForwardResults,
        monteCarloResults
      });

      // Phase 7: Enhanced Performance Metrics
      const enhancedResults = await this.performanceAnalyzer.enhanceResults(
        basicResults,
        marketData
      );

      this.updateProgress({
        phase: 'complete',
        progress: 100,
        message: 'Enhanced backtest completed!'
      });

      return {
        basicResults: enhancedResults,
        optimizationResults,
        walkForwardResults,
        monteCarloResults,
        comprehensiveAnalysis
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Enhanced backtest failed';
      
      this.updateProgress({
        phase: 'error',
        progress: 0,
        message: 'Enhanced backtest failed',
        error: errorMessage
      });

      throw error;
    }
  }

  private async runParameterOptimization(
    config: EnhancedBacktestConfig,
    marketData: MarketData[]
  ) {
    if (!config.optimizationConfig || !config.strategies[0]) {
      return undefined;
    }

    const optimizationConfig: OptimizationConfig = {
      strategy: config.strategies[0],
      parameters: config.optimizationConfig.parameters,
      optimizationMetric: config.optimizationConfig.metric,
      maxIterations: config.optimizationConfig.maxIterations,
      populationSize: config.optimizationConfig.populationSize,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      eliteRatio: 0.2
    };

    return await this.parameterOptimizer.optimizeParameters(
      optimizationConfig,
      marketData
    );
  }

  private async runWalkForwardAnalysis(
    config: EnhancedBacktestConfig,
    marketData: MarketData[]
  ) {
    if (!config.walkForwardConfig || !config.strategies[0]) {
      return undefined;
    }

    const walkForwardConfig: WalkForwardConfig = {
      strategy: config.strategies[0],
      optimizationWindow: config.walkForwardConfig.optimizationWindow,
      testingWindow: config.walkForwardConfig.testingWindow,
      stepSize: config.walkForwardConfig.stepSize,
      reoptimizationFrequency: config.walkForwardConfig.reoptimizationFrequency,
      parameters: config.optimizationConfig?.parameters
    };

    return await this.walkForwardEngine.runWalkForwardAnalysis(
      walkForwardConfig,
      marketData
    );
  }

  private async runMonteCarloSimulation(
    result: StrategyResult,
    marketData: MarketData[],
    config?: EnhancedBacktestConfig['monteCarloConfig']
  ) {
    const monteCarloConfig: MonteCarloConfig = {
      numSimulations: config?.numSimulations || 1000,
      confidenceLevel: config?.confidenceLevel || 0.95,
      bootstrapMethod: config?.bootstrapMethod || 'non_parametric'
    };

    return await this.monteCarloEngine.runSimulation(result, marketData);
  }

  private generateComprehensiveAnalysis(results: {
    basicResults: StrategyResult[];
    optimizationResults?: any;
    walkForwardResults?: any;
    monteCarloResults?: any;
  }) {
    const basicResult = results.basicResults[0];
    if (!basicResult) {
      return {
        robustness: 0,
        overfitting: 1,
        consistency: 0,
        riskAdjustedReturn: 0,
        recommendation: 'REJECT' as const,
        reasons: ['No valid backtest results']
      };
    }

    // Calculate robustness score
    let robustness = 0.5; // Base score
    
    if (results.walkForwardResults) {
      const wfResults = results.walkForwardResults;
      robustness += wfResults.aggregateResults.consistency * 0.3;
      robustness += (1 - wfResults.aggregateResults.avgDegradation) * 0.2;
    }

    if (results.monteCarloResults) {
      const mcResults = results.monteCarloResults;
      robustness += (1 - mcResults.probabilityOfLoss) * 0.2;
    }

    robustness = Math.min(1, Math.max(0, robustness));

    // Calculate overfitting score
    let overfitting = 0;
    
    if (results.walkForwardResults) {
      overfitting = Math.max(0, results.walkForwardResults.aggregateResults.avgDegradation);
    }

    // Calculate consistency
    let consistency = 0.5;
    
    if (results.walkForwardResults) {
      consistency = results.walkForwardResults.aggregateResults.consistency;
    }

    // Risk-adjusted return
    const riskAdjustedReturn = basicResult.performance.sharpeRatio || 0;

    // Generate recommendation
    let recommendation: 'DEPLOY' | 'OPTIMIZE' | 'REJECT';
    const reasons: string[] = [];

    if (riskAdjustedReturn > 1.5 && robustness > 0.7 && overfitting < 0.3) {
      recommendation = 'DEPLOY';
      reasons.push('Strong risk-adjusted returns');
      reasons.push('High robustness across different market conditions');
      reasons.push('Low overfitting risk');
    } else if (riskAdjustedReturn > 0.5 && robustness > 0.4) {
      recommendation = 'OPTIMIZE';
      reasons.push('Moderate performance with optimization potential');
      if (overfitting > 0.5) reasons.push('Consider reducing strategy complexity');
      if (robustness < 0.5) reasons.push('Improve strategy robustness');
    } else {
      recommendation = 'REJECT';
      if (riskAdjustedReturn <= 0.5) reasons.push('Poor risk-adjusted returns');
      if (robustness <= 0.4) reasons.push('Low robustness across market conditions');
      if (overfitting > 0.7) reasons.push('High overfitting risk detected');
    }

    return {
      robustness,
      overfitting,
      consistency,
      riskAdjustedReturn,
      recommendation,
      reasons
    };
  }

  // Expose method for updating progress
  protected updateProgress(progress: BacktestProgress) {
    super['updateProgress'](progress);
  }

  // Expose method for loading market data
  protected async loadMarketData(config: BacktestConfig): Promise<MarketData[]> {
    return super['loadMarketData'](config);
  }
}
