
import { MarketData, StrategyResult } from '@/types/strategy';

// Import strategies for worker processing
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { StopLossTakeProfitStrategy } from '@/strategies/StopLossTakeProfitStrategy';
import { DeviationTrendStrategy } from '@/strategies/DeviationTrendStrategy';
import { VolumeProfileStrategy } from '@/strategies/VolumeProfileStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';

interface WorkerMessage {
  id: string;
  type: 'CALCULATE_STRATEGY' | 'BACKTEST_STRATEGY';
  payload: {
    strategyId: string;
    data: MarketData[];
    config?: any;
  };
}

interface WorkerResponse {
  id: string;
  type: 'SUCCESS' | 'ERROR';
  payload: StrategyResult | { error: string };
}

class StrategyWorker {
  private strategies: Map<string, any> = new Map();

  constructor() {
    this.initializeStrategies();
    this.setupMessageHandler();
  }

  private initializeStrategies() {
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

  private setupMessageHandler() {
    self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      const { id, type, payload } = event.data;

      try {
        switch (type) {
          case 'CALCULATE_STRATEGY':
            this.calculateStrategy(id, payload);
            break;
          case 'BACKTEST_STRATEGY':
            this.backtestStrategy(id, payload);
            break;
          default:
            this.sendError(id, `Unknown message type: ${type}`);
        }
      } catch (error) {
        this.sendError(id, error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  private calculateStrategy(id: string, payload: { strategyId: string; data: MarketData[] }) {
    const strategy = this.strategies.get(payload.strategyId);
    
    if (!strategy) {
      this.sendError(id, `Strategy not found: ${payload.strategyId}`);
      return;
    }

    const result = strategy.calculate(payload.data);
    this.sendSuccess(id, result);
  }

  private backtestStrategy(id: string, payload: { strategyId: string; data: MarketData[]; config?: any }) {
    const strategy = this.strategies.get(payload.strategyId);
    
    if (!strategy) {
      this.sendError(id, `Strategy not found: ${payload.strategyId}`);
      return;
    }

    // Perform backtesting calculations
    const result = strategy.calculate(payload.data);
    
    // Add backtesting metrics
    const backtestResult = {
      ...result,
      backtesting: {
        totalTrades: result.signals.length,
        winRate: this.calculateWinRate(result.signals, payload.data),
        maxDrawdown: this.calculateMaxDrawdown(result.signals, payload.data),
        sharpeRatio: this.calculateSharpeRatio(result.signals, payload.data),
        returns: this.calculateReturns(result.signals, payload.data),
      }
    };

    this.sendSuccess(id, backtestResult);
  }

  private calculateWinRate(signals: any[], data: MarketData[]): number {
    // Simplified win rate calculation
    let wins = 0;
    let total = 0;

    for (let i = 0; i < signals.length - 1; i++) {
      if (signals[i].type === 'BUY' && signals[i + 1].type === 'SELL') {
        total++;
        if (signals[i + 1].price > signals[i].price) {
          wins++;
        }
      }
    }

    return total > 0 ? (wins / total) * 100 : 0;
  }

  private calculateMaxDrawdown(signals: any[], data: MarketData[]): number {
    // Simplified drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let portfolio = 100000; // Starting capital

    signals.forEach((signal, index) => {
      if (signal.type === 'BUY') {
        // Simulate buy
      } else if (signal.type === 'SELL') {
        // Simulate sell and calculate portfolio value
      }
      
      if (portfolio > peak) {
        peak = portfolio;
      }
      
      const drawdown = (peak - portfolio) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown * 100;
  }

  private calculateSharpeRatio(signals: any[], data: MarketData[]): number {
    // Simplified Sharpe ratio calculation
    return Math.random() * 2; // Placeholder
  }

  private calculateReturns(signals: any[], data: MarketData[]): number[] {
    // Simplified returns calculation
    return data.map(() => Math.random() * 10 - 5); // Placeholder
  }

  private sendSuccess(id: string, payload: StrategyResult) {
    const response: WorkerResponse = {
      id,
      type: 'SUCCESS',
      payload
    };
    self.postMessage(response);
  }

  private sendError(id: string, error: string) {
    const response: WorkerResponse = {
      id,
      type: 'ERROR',
      payload: { error }
    };
    self.postMessage(response);
  }
}

// Initialize worker
new StrategyWorker();
