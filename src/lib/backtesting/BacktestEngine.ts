
import { MarketData, StrategyConfig, StrategyResult } from '@/types/strategy';
import { RobustWorkerManager, WorkerTask } from './RobustWorkerManager';
import { DatabaseSingleton } from './DatabaseSingleton';
import { FinancialMetrics } from './FinancialMetrics';

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
  phase: 'loading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  strategyProgress?: Record<string, number>;
  error?: string;
}

export class BacktestEngine {
  private workerManager: RobustWorkerManager;
  private database: DatabaseSingleton;
  private progressCallback?: (progress: BacktestProgress) => void;
  private isRunning = false;

  constructor() {
    this.workerManager = new RobustWorkerManager({
      maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 6),
      timeout: 60000, // 60 seconds
      fallbackToMainThread: true
    });
    this.database = DatabaseSingleton.getInstance();
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
    if (this.isRunning) {
      throw new Error('Backtest already running');
    }

    this.isRunning = true;

    try {
      // Phase 1: Load and validate data
      this.updateProgress({
        phase: 'loading',
        progress: 0,
        message: 'Loading market data...'
      });

      const marketData = await this.loadMarketData(config);
      
      if (marketData.length === 0) {
        throw new Error('No market data available for the specified period');
      }

      this.updateProgress({
        phase: 'loading',
        progress: 30,
        message: `Loaded ${marketData.length} data points`
      });

      // Validate data quality
      const validatedData = await this.validateAndCleanData(marketData);
      
      this.updateProgress({
        phase: 'loading',
        progress: 60,
        message: 'Data validation complete'
      });

      // Phase 2: Execute strategies
      this.updateProgress({
        phase: 'processing',
        progress: 0,
        message: 'Executing strategies...'
      });

      const results = await this.executeStrategies(config.strategies, validatedData);

      // Phase 3: Advanced analytics (if enabled)
      let enhancedResults = results;

      if (config.enableMonteCarlo || config.enableWalkForward) {
        this.updateProgress({
          phase: 'analyzing',
          progress: 0,
          message: 'Running advanced analytics...'
        });

        enhancedResults = await this.runAdvancedAnalytics(
          results, 
          validatedData, 
          config
        );
      }

      // Phase 4: Final enhancements
      this.updateProgress({
        phase: 'analyzing',
        progress: 80,
        message: 'Calculating financial metrics...'
      });

      const finalResults = this.enhanceWithFinancialMetrics(enhancedResults, validatedData);

      this.updateProgress({
        phase: 'complete',
        progress: 100,
        message: 'Backtest completed successfully!'
      });

      return finalResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress({
        phase: 'error',
        progress: 0,
        message: 'Backtest failed',
        error: errorMessage
      });

      console.error('Backtest failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async loadMarketData(config: BacktestConfig): Promise<MarketData[]> {
    try {
      return await this.database.loadMarketData(
        config.symbol,
        config.startDate,
        config.endDate,
        config.timeframe
      );
    } catch (error) {
      console.error('Failed to load market data:', error);
      throw new Error('Failed to load market data. Please check your parameters and try again.');
    }
  }

  private async validateAndCleanData(data: MarketData[]): Promise<MarketData[]> {
    const task: WorkerTask = {
      id: 'data_validation',
      type: 'data_processing',
      data: {
        operation: 'data_cleaning',
        data
      }
    };

    try {
      const results = await this.workerManager.executeTasks([task]);
      return results[0].data;
    } catch (error) {
      console.warn('Data validation failed, using original data:', error);
      return data;
    }
  }

  private async executeStrategies(
    strategies: StrategyConfig[],
    data: MarketData[]
  ): Promise<StrategyResult[]> {
    const tasks: WorkerTask[] = strategies.map((strategy, index) => ({
      id: `strategy_${strategy.id}_${index}`,
      type: 'strategy',
      data: { strategy, marketData: data },
      priority: 1
    }));

    return new Promise((resolve, reject) => {
      const results: StrategyResult[] = [];
      let completed = 0;

      this.workerManager.executeTasks(tasks, (progress) => {
        this.updateProgress({
          phase: 'processing',
          progress: progress.overall,
          message: `Processing strategies... ${Math.round(progress.overall)}%`,
          strategyProgress: progress.individual
        });
      }).then(taskResults => {
        const strategyResults = taskResults.map(result => result.data);
        resolve(strategyResults);
      }).catch(reject);
    });
  }

  private async runAdvancedAnalytics(
    results: StrategyResult[],
    data: MarketData[],
    config: BacktestConfig
  ): Promise<StrategyResult[]> {
    const tasks: WorkerTask[] = [];

    if (config.enableMonteCarlo) {
      tasks.push({
        id: 'monte_carlo',
        type: 'monte_carlo',
        data: {
          results,
          runs: config.monteCarloRuns || 1000
        },
        priority: 2
      });
    }

    if (config.enableWalkForward) {
      tasks.push({
        id: 'walk_forward',
        type: 'walk_forward',
        data: {
          strategies: config.strategies,
          marketData: data
        },
        priority: 2
      });
    }

    if (tasks.length === 0) {
      return results;
    }

    try {
      const analyticsResults = await this.workerManager.executeTasks(tasks, (progress) => {
        this.updateProgress({
          phase: 'analyzing',
          progress: progress.overall * 0.8, // Reserve 20% for final calculations
          message: `Advanced analytics: ${Math.round(progress.overall)}%`
        });
      });

      // Merge analytics results with strategy results
      const enhancedResults = results.map((result, index) => ({
        ...result,
        analytics: {
          monteCarlo: analyticsResults.find(r => r.id === 'monte_carlo')?.data,
          walkForward: analyticsResults.find(r => r.id === 'walk_forward')?.data
        }
      }));

      return enhancedResults;
    } catch (error) {
      console.warn('Advanced analytics failed, returning basic results:', error);
      return results;
    }
  }

  private enhanceWithFinancialMetrics(
    results: StrategyResult[],
    data: MarketData[]
  ): StrategyResult[] {
    return results.map(result => {
      try {
        const financialMetrics = FinancialMetrics.calculateAllMetrics(result.signals, data);
        
        return {
          ...result,
          performance: {
            ...result.performance,
            ...financialMetrics,
            // Ensure backward compatibility
            totalReturn: financialMetrics.totalReturn * 100,
            winRate: financialMetrics.winRate,
            sharpeRatio: financialMetrics.sharpeRatio,
            maxDrawdown: financialMetrics.maxDrawdown * 100,
            totalTrades: result.signals.length
          }
        };
      } catch (error) {
        console.error('Failed to calculate financial metrics for strategy:', error);
        return result;
      }
    });
  }

  async getEngineStats() {
    const workerStats = this.workerManager.getStats();
    const cacheStats = await this.database.getCacheStats();

    return {
      workers: workerStats,
      cache: cacheStats,
      isRunning: this.isRunning,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  async cleanup() {
    if (this.isRunning) {
      console.warn('Attempting to cleanup while backtest is running');
    }

    try {
      this.workerManager.terminate();
      await this.database.clearExpiredCache();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  dispose() {
    this.cleanup();
  }
}
