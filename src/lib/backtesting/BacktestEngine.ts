
import { MarketData, StrategyConfig, StrategyResult } from '@/types/strategy';
import { WorkerPool } from './WorkerPool';
import { DataManager } from './DataManager';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';

export interface BacktestConfig {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  strategies: StrategyConfig[];
  enableMonteCarlo?: boolean;
  monteCarloRuns?: number;
  enableWalkForward?: boolean;
}

export interface BacktestProgress {
  phase: 'loading' | 'processing' | 'analyzing' | 'complete';
  progress: number;
  message: string;
  strategyProgress?: Record<string, number>;
}

export class BacktestEngine {
  private workerPool: WorkerPool;
  private dataManager: DataManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  private progressCallback?: (progress: BacktestProgress) => void;

  constructor() {
    this.workerPool = new WorkerPool();
    this.dataManager = new DataManager();
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  setProgressCallback(callback: (progress: BacktestProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: BacktestProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async runBacktest(config: BacktestConfig): Promise<StrategyResult[]> {
    try {
      // Phase 1: Load and prepare data
      this.updateProgress({
        phase: 'loading',
        progress: 0,
        message: 'Loading market data...'
      });

      const marketData = await this.dataManager.loadMarketData(
        config.symbol,
        config.startDate,
        config.endDate,
        config.timeframe
      );

      this.updateProgress({
        phase: 'loading',
        progress: 50,
        message: 'Preprocessing data...'
      });

      const processedData = await this.dataManager.preprocessData(marketData);

      // Phase 2: Run strategies in parallel
      this.updateProgress({
        phase: 'processing',
        progress: 0,
        message: 'Running strategies...',
        strategyProgress: {}
      });

      const results = await this.runStrategiesParallel(config.strategies, processedData);

      // Phase 3: Advanced analytics
      if (config.enableMonteCarlo) {
        this.updateProgress({
          phase: 'analyzing',
          progress: 0,
          message: 'Running Monte Carlo simulations...'
        });

        await this.runMonteCarloAnalysis(results, config.monteCarloRuns || 1000);
      }

      if (config.enableWalkForward) {
        this.updateProgress({
          phase: 'analyzing',
          progress: 50,
          message: 'Performing walk-forward analysis...'
        });

        await this.runWalkForwardAnalysis(config.strategies, processedData);
      }

      // Phase 4: Final performance analysis
      this.updateProgress({
        phase: 'analyzing',
        progress: 80,
        message: 'Calculating performance metrics...'
      });

      const enhancedResults = await this.performanceAnalyzer.enhanceResults(results, processedData);

      this.updateProgress({
        phase: 'complete',
        progress: 100,
        message: 'Backtest completed successfully!'
      });

      return enhancedResults;

    } catch (error) {
      console.error('Backtest failed:', error);
      throw error;
    }
  }

  private async runStrategiesParallel(
    strategies: StrategyConfig[],
    data: MarketData[]
  ): Promise<StrategyResult[]> {
    const tasks = strategies.map((strategy, index) => ({
      id: `strategy_${index}`,
      type: 'strategy' as const,
      data: { strategy, marketData: data }
    }));

    const results = await this.workerPool.executeTasks(tasks, (progress) => {
      this.updateProgress({
        phase: 'processing',
        progress: progress.overall,
        message: `Processing strategies... ${Math.round(progress.overall)}%`,
        strategyProgress: progress.individual
      });
    });

    return results.map(result => result.data);
  }

  private async runMonteCarloAnalysis(
    results: StrategyResult[],
    runs: number
  ): Promise<void> {
    const tasks = [{
      id: 'monte_carlo',
      type: 'monte_carlo' as const,
      data: { results, runs }
    }];

    await this.workerPool.executeTasks(tasks, (progress) => {
      this.updateProgress({
        phase: 'analyzing',
        progress: progress.overall * 0.5,
        message: `Monte Carlo simulation: ${Math.round(progress.overall)}%`
      });
    });
  }

  private async runWalkForwardAnalysis(
    strategies: StrategyConfig[],
    data: MarketData[]
  ): Promise<void> {
    const tasks = [{
      id: 'walk_forward',
      type: 'walk_forward' as const,
      data: { strategies, marketData: data }
    }];

    await this.workerPool.executeTasks(tasks, (progress) => {
      this.updateProgress({
        phase: 'analyzing',
        progress: 50 + (progress.overall * 0.3),
        message: `Walk-forward analysis: ${Math.round(progress.overall)}%`
      });
    });
  }

  dispose() {
    this.workerPool.terminate();
  }
}
