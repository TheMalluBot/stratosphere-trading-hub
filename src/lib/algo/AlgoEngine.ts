
import { MarketData, StrategyResult, StrategySignal } from '@/types/strategy';
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { StopLossTakeProfitStrategy } from '@/strategies/StopLossTakeProfitStrategy';
import { DeviationTrendStrategy } from '@/strategies/DeviationTrendStrategy';
import { VolumeProfileStrategy } from '@/strategies/VolumeProfileStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';

export interface AlgoConfig {
  strategyId: string;
  symbol: string;
  capital: number;
  riskPercent: number;
  paperMode: boolean;
  autoRestart: boolean;
}

export interface AlgoPosition {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: number;
}

export interface AlgoPerformance {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  lastSignal: string;
  isRunning: boolean;
}

export class AlgoEngine {
  private strategies: Map<string, any> = new Map();
  private runningAlgos: Map<string, AlgoConfig> = new Map();
  private positions: Map<string, AlgoPosition> = new Map();
  private performance: Map<string, AlgoPerformance> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Initialize all available strategies
    const defaultConfig = {
      id: 'default',
      name: 'Default',
      description: 'Default configuration',
      parameters: {},
      enabled: true
    };

    this.strategies.set('linear-regression', new LinearRegressionStrategy(defaultConfig));
    this.strategies.set('z-score-trend', new ZScoreTrendStrategy(defaultConfig));
    this.strategies.set('stop-loss-tp', new StopLossTakeProfitStrategy(defaultConfig));
    this.strategies.set('deviation-trend', new DeviationTrendStrategy(defaultConfig));
    this.strategies.set('volume-profile', new VolumeProfileStrategy(defaultConfig));
    this.strategies.set('ultimate-combined', new UltimateStrategy(defaultConfig));
  }

  startAlgorithm(config: AlgoConfig): boolean {
    const strategy = this.strategies.get(config.strategyId);
    if (!strategy) {
      console.error(`Strategy ${config.strategyId} not found`);
      return false;
    }

    const algoId = `${config.strategyId}-${config.symbol}`;
    this.runningAlgos.set(algoId, config);
    
    this.performance.set(algoId, {
      totalPnl: 0,
      totalTrades: 0,
      winRate: 0,
      lastSignal: 'STARTED',
      isRunning: true
    });

    console.log(`Started algorithm: ${algoId}`);
    return true;
  }

  stopAlgorithm(algoId: string): boolean {
    if (!this.runningAlgos.has(algoId)) {
      return false;
    }

    this.runningAlgos.delete(algoId);
    
    const perf = this.performance.get(algoId);
    if (perf) {
      perf.isRunning = false;
      perf.lastSignal = 'STOPPED';
    }

    // Close any open positions
    this.positions.delete(algoId);

    console.log(`Stopped algorithm: ${algoId}`);
    return true;
  }

  processMarketData(symbol: string, data: MarketData[]): StrategySignal[] {
    const signals: StrategySignal[] = [];

    // Process data for all running algorithms of this symbol
    for (const [algoId, config] of this.runningAlgos.entries()) {
      if (config.symbol === symbol) {
        const strategy = this.strategies.get(config.strategyId);
        if (strategy) {
          try {
            const result: StrategyResult = strategy.calculate(data);
            const latestSignals = result.signals.slice(-1); // Get latest signal

            for (const signal of latestSignals) {
              const processedSignal = this.processSignal(algoId, signal, config);
              if (processedSignal) {
                signals.push(processedSignal);
              }
            }
          } catch (error) {
            console.error(`Error processing strategy ${config.strategyId}:`, error);
          }
        }
      }
    }

    return signals;
  }

  private processSignal(algoId: string, signal: StrategySignal, config: AlgoConfig): StrategySignal | null {
    const currentPosition = this.positions.get(algoId);
    const performance = this.performance.get(algoId);

    if (!performance) return null;

    // Calculate position size based on risk management
    const positionSize = this.calculatePositionSize(config.capital, config.riskPercent, signal.price);

    // Process the signal based on current position
    if (signal.type === 'BUY' && !currentPosition) {
      // Open long position
      this.positions.set(algoId, {
        symbol: config.symbol,
        side: 'long',
        quantity: positionSize,
        entryPrice: signal.price,
        currentPrice: signal.price,
        pnl: 0,
        timestamp: signal.timestamp
      });

      performance.lastSignal = `BUY at ₹${signal.price.toFixed(2)}`;
      performance.totalTrades++;

    } else if (signal.type === 'SELL' && currentPosition && currentPosition.side === 'long') {
      // Close long position
      const pnl = (signal.price - currentPosition.entryPrice) * currentPosition.quantity;
      performance.totalPnl += pnl;
      
      if (pnl > 0) {
        performance.winRate = ((performance.winRate * (performance.totalTrades - 1)) + 100) / performance.totalTrades;
      } else {
        performance.winRate = (performance.winRate * (performance.totalTrades - 1)) / performance.totalTrades;
      }

      performance.lastSignal = `SELL at ₹${signal.price.toFixed(2)} (P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)})`;
      this.positions.delete(algoId);

    } else if (signal.type === 'SELL' && !currentPosition) {
      // Open short position (if supported)
      this.positions.set(algoId, {
        symbol: config.symbol,
        side: 'short',
        quantity: positionSize,
        entryPrice: signal.price,
        currentPrice: signal.price,
        pnl: 0,
        timestamp: signal.timestamp
      });

      performance.lastSignal = `SHORT at ₹${signal.price.toFixed(2)}`;
      performance.totalTrades++;
    }

    // Update current price for existing positions
    if (currentPosition) {
      currentPosition.currentPrice = signal.price;
      if (currentPosition.side === 'long') {
        currentPosition.pnl = (signal.price - currentPosition.entryPrice) * currentPosition.quantity;
      } else {
        currentPosition.pnl = (currentPosition.entryPrice - signal.price) * currentPosition.quantity;
      }
    }

    return {
      ...signal,
      metadata: {
        ...signal.metadata,
        algoId,
        positionSize,
        paperMode: config.paperMode
      }
    };
  }

  private calculatePositionSize(capital: number, riskPercent: number, price: number): number {
    const riskAmount = capital * (riskPercent / 100);
    return Math.floor(riskAmount / price);
  }

  getRunningAlgorithms(): Array<{ id: string; config: AlgoConfig; performance: AlgoPerformance; position?: AlgoPosition }> {
    const result = [];
    
    for (const [algoId, config] of this.runningAlgos.entries()) {
      const performance = this.performance.get(algoId);
      const position = this.positions.get(algoId);
      
      if (performance) {
        result.push({
          id: algoId,
          config,
          performance,
          position
        });
      }
    }
    
    return result;
  }

  getPerformanceStats(): { totalPnl: number; activeAlgos: number; winRate: number } {
    let totalPnl = 0;
    let totalTrades = 0;
    let totalWins = 0;
    
    for (const performance of this.performance.values()) {
      if (performance.isRunning) {
        totalPnl += performance.totalPnl;
        totalTrades += performance.totalTrades;
        totalWins += (performance.winRate / 100) * performance.totalTrades;
      }
    }
    
    return {
      totalPnl,
      activeAlgos: this.runningAlgos.size,
      winRate: totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0
    };
  }
}

// Global algorithm engine instance
export const algoEngine = new AlgoEngine();
