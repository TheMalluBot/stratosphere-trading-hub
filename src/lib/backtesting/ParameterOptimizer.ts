
import { StrategyConfig, StrategyResult, MarketData } from '@/types/strategy';
import { BacktestEngine } from './BacktestEngine';

export interface OptimizationConfig {
  strategy: StrategyConfig;
  parameters: Record<string, {
    min: number;
    max: number;
    step: number;
    type: 'integer' | 'float';
  }>;
  optimizationMetric: 'sharpe' | 'return' | 'calmar' | 'sortino';
  maxIterations: number;
  populationSize: number;
  crossoverRate: number;
  mutationRate: number;
  eliteRatio: number;
}

export interface OptimizationResult {
  bestParameters: Record<string, number>;
  bestScore: number;
  convergenceHistory: number[];
  populationHistory: Array<{
    parameters: Record<string, number>;
    score: number;
  }>;
  executionTime: number;
}

export class ParameterOptimizer {
  private backtestEngine: BacktestEngine;

  constructor() {
    this.backtestEngine = new BacktestEngine();
  }

  async optimizeParameters(
    config: OptimizationConfig,
    marketData: MarketData[]
  ): Promise<OptimizationResult> {
    console.log('🧬 Starting genetic algorithm optimization...');
    const startTime = Date.now();

    // Initialize population
    let population = this.initializePopulation(config);
    const convergenceHistory: number[] = [];
    const populationHistory: Array<{ parameters: Record<string, number>; score: number }> = [];

    let bestIndividual = { parameters: {}, score: -Infinity };

    for (let generation = 0; generation < config.maxIterations; generation++) {
      // Evaluate population
      const evaluatedPopulation = await this.evaluatePopulation(
        population,
        config,
        marketData
      );

      // Sort by fitness
      evaluatedPopulation.sort((a, b) => b.score - a.score);

      // Track best individual
      if (evaluatedPopulation[0].score > bestIndividual.score) {
        bestIndividual = { ...evaluatedPopulation[0] };
      }

      convergenceHistory.push(bestIndividual.score);
      populationHistory.push(...evaluatedPopulation.slice(0, 5)); // Top 5 each generation

      console.log(`Generation ${generation + 1}: Best Score = ${bestIndividual.score.toFixed(4)}`);

      // Check convergence
      if (this.hasConverged(convergenceHistory, 10)) {
        console.log('🎯 Optimization converged early');
        break;
      }

      // Create next generation
      population = this.createNextGeneration(evaluatedPopulation, config);
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ Optimization completed in ${executionTime}ms`);

    return {
      bestParameters: bestIndividual.parameters,
      bestScore: bestIndividual.score,
      convergenceHistory,
      populationHistory,
      executionTime
    };
  }

  private initializePopulation(config: OptimizationConfig): Record<string, number>[] {
    const population: Record<string, number>[] = [];

    for (let i = 0; i < config.populationSize; i++) {
      const individual: Record<string, number> = {};

      for (const [param, bounds] of Object.entries(config.parameters)) {
        if (bounds.type === 'integer') {
          individual[param] = Math.floor(
            Math.random() * (bounds.max - bounds.min + 1) + bounds.min
          );
        } else {
          individual[param] = Math.random() * (bounds.max - bounds.min) + bounds.min;
        }
      }

      population.push(individual);
    }

    return population;
  }

  private async evaluatePopulation(
    population: Record<string, number>[],
    config: OptimizationConfig,
    marketData: MarketData[]
  ): Promise<Array<{ parameters: Record<string, number>; score: number }>> {
    const results = [];

    // Evaluate in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < population.length; i += batchSize) {
      const batch = population.slice(i, i + batchSize);
      const batchPromises = batch.map(individual => 
        this.evaluateIndividual(individual, config, marketData)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  private async evaluateIndividual(
    parameters: Record<string, number>,
    config: OptimizationConfig,
    marketData: MarketData[]
  ): Promise<{ parameters: Record<string, number>; score: number }> {
    try {
      // Create strategy config with optimized parameters
      const strategyConfig: StrategyConfig = {
        ...config.strategy,
        parameters: { ...config.strategy.parameters, ...parameters }
      };

      // Run backtest
      const backtestConfig = {
        symbol: 'OPTIMIZATION',
        timeframe: '1h',
        startDate: new Date(marketData[0].timestamp).toISOString().split('T')[0],
        endDate: new Date(marketData[marketData.length - 1].timestamp).toISOString().split('T')[0],
        initialCapital: 100000,
        strategies: [strategyConfig]
      };

      // Use a simplified evaluation for optimization speed
      const results = await this.backtestEngine.runBacktest(backtestConfig);
      
      if (results.length === 0) {
        return { parameters, score: -Infinity };
      }

      const result = results[0];
      let score = 0;

      switch (config.optimizationMetric) {
        case 'sharpe':
          score = result.performance.sharpeRatio || 0;
          break;
        case 'return':
          score = result.performance.totalReturn || 0;
          break;
        case 'calmar':
          score = result.performance.calmarRatio || 0;
          break;
        case 'sortino':
          score = result.performance.sortinoRatio || 0;
          break;
        default:
          score = result.performance.sharpeRatio || 0;
      }

      // Penalize strategies with too few trades or high drawdown
      const totalTrades = result.signals.length;
      const maxDrawdown = Math.abs(result.performance.maxDrawdown || 0);

      if (totalTrades < 10) score *= 0.5; // Penalize low activity
      if (maxDrawdown > 0.3) score *= 0.3; // Penalize high drawdown

      return { parameters, score: isFinite(score) ? score : -Infinity };
    } catch (error) {
      console.error('Error evaluating individual:', error);
      return { parameters, score: -Infinity };
    }
  }

  private createNextGeneration(
    evaluatedPopulation: Array<{ parameters: Record<string, number>; score: number }>,
    config: OptimizationConfig
  ): Record<string, number>[] {
    const nextGeneration: Record<string, number>[] = [];
    const eliteCount = Math.floor(config.populationSize * config.eliteRatio);

    // Elite selection
    for (let i = 0; i < eliteCount; i++) {
      nextGeneration.push({ ...evaluatedPopulation[i].parameters });
    }

    // Generate offspring
    while (nextGeneration.length < config.populationSize) {
      const parent1 = this.tournamentSelection(evaluatedPopulation);
      const parent2 = this.tournamentSelection(evaluatedPopulation);

      const [child1, child2] = this.crossover(parent1.parameters, parent2.parameters, config);

      nextGeneration.push(this.mutate(child1, config));
      if (nextGeneration.length < config.populationSize) {
        nextGeneration.push(this.mutate(child2, config));
      }
    }

    return nextGeneration;
  }

  private tournamentSelection(
    population: Array<{ parameters: Record<string, number>; score: number }>
  ): { parameters: Record<string, number>; score: number } {
    const tournamentSize = 3;
    const tournament = [];

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }

    tournament.sort((a, b) => b.score - a.score);
    return tournament[0];
  }

  private crossover(
    parent1: Record<string, number>,
    parent2: Record<string, number>,
    config: OptimizationConfig
  ): [Record<string, number>, Record<string, number>] {
    const child1: Record<string, number> = {};
    const child2: Record<string, number> = {};

    for (const param in parent1) {
      if (Math.random() < config.crossoverRate) {
        child1[param] = parent2[param];
        child2[param] = parent1[param];
      } else {
        child1[param] = parent1[param];
        child2[param] = parent2[param];
      }
    }

    return [child1, child2];
  }

  private mutate(
    individual: Record<string, number>,
    config: OptimizationConfig
  ): Record<string, number> {
    const mutated = { ...individual };

    for (const [param, bounds] of Object.entries(config.parameters)) {
      if (Math.random() < config.mutationRate) {
        if (bounds.type === 'integer') {
          mutated[param] = Math.floor(
            Math.random() * (bounds.max - bounds.min + 1) + bounds.min
          );
        } else {
          // Gaussian mutation
          const sigma = (bounds.max - bounds.min) * 0.1;
          let newValue = mutated[param] + this.gaussianRandom() * sigma;
          newValue = Math.max(bounds.min, Math.min(bounds.max, newValue));
          mutated[param] = newValue;
        }
      }
    }

    return mutated;
  }

  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private hasConverged(history: number[], windowSize: number): boolean {
    if (history.length < windowSize) return false;

    const recentHistory = history.slice(-windowSize);
    const variance = this.calculateVariance(recentHistory);
    
    return variance < 0.001; // Convergence threshold
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}
