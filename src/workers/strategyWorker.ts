
import { MarketData, StrategyResult } from '@/types/strategy';

// Import all strategies including the new elite ones
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { StopLossTakeProfitStrategy } from '@/strategies/StopLossTakeProfitStrategy';
import { DeviationTrendStrategy } from '@/strategies/DeviationTrendStrategy';
import { VolumeProfileStrategy } from '@/strategies/VolumeProfileStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';
import { StatisticalArbitrageStrategy } from '@/strategies/StatisticalArbitrageStrategy';
import { CrossAssetArbitrageStrategy } from '@/strategies/CrossAssetArbitrageStrategy';
import { MLMomentumStrategy } from '@/strategies/MLMomentumStrategy';

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

    // Original strategies
    this.strategies.set('linear-regression', new LinearRegressionStrategy(defaultConfig));
    this.strategies.set('z-score-trend', new ZScoreTrendStrategy(defaultConfig));
    this.strategies.set('stop-loss-tp', new StopLossTakeProfitStrategy(defaultConfig));
    this.strategies.set('deviation-trend', new DeviationTrendStrategy(defaultConfig));
    this.strategies.set('volume-profile', new VolumeProfileStrategy(defaultConfig));
    this.strategies.set('ultimate-combined', new UltimateStrategy(defaultConfig));
    
    // Elite quantitative strategies
    this.strategies.set('statistical-arbitrage', new StatisticalArbitrageStrategy({
      ...defaultConfig,
      name: 'Statistical Arbitrage',
      description: 'Renaissance Technologies style mean reversion with Ornstein-Uhlenbeck process',
      parameters: {
        lookbackPeriod: 60,
        zScoreThreshold: 2.0,
        halfLifeThreshold: 30
      }
    }));
    
    this.strategies.set('cross-asset-arbitrage', new CrossAssetArbitrageStrategy({
      ...defaultConfig,
      name: 'Cross-Asset Arbitrage',
      description: 'Jane Street style ETF vs basket arbitrage with correlation analysis',
      parameters: {
        correlationThreshold: 0.8,
        divergenceThreshold: 2.5,
        volumeFilter: 1000000,
        lookbackPeriod: 50
      }
    }));
    
    this.strategies.set('ml-momentum', new MLMomentumStrategy({
      ...defaultConfig,
      name: 'ML Momentum',
      description: 'Two Sigma/Citadel style machine learning momentum with 15+ features',
      parameters: {
        featureWindow: 20,
        predictionHorizon: 5,
        confidenceThreshold: 0.6
      }
    }));
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

    try {
      const result = strategy.calculate(payload.data);
      this.sendSuccess(id, result);
    } catch (error) {
      this.sendError(id, `Strategy calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private backtestStrategy(id: string, payload: { strategyId: string; data: MarketData[]; config?: any }) {
    const strategy = this.strategies.get(payload.strategyId);
    
    if (!strategy) {
      this.sendError(id, `Strategy not found: ${payload.strategyId}`);
      return;
    }

    try {
      // Calculate strategy signals
      const result = strategy.calculate(payload.data);
      
      // Enhanced backtesting metrics for elite strategies
      const backtestResult = {
        ...result,
        backtesting: {
          totalTrades: result.signals.length,
          winRate: this.calculateWinRate(result.signals, payload.data),
          maxDrawdown: this.calculateMaxDrawdown(result.signals, payload.data),
          sharpeRatio: this.calculateSharpeRatio(result.signals, payload.data),
          calmarRatio: this.calculateCalmarRatio(result.signals, payload.data),
          sortinoRatio: this.calculateSortinoRatio(result.signals, payload.data),
          profitFactor: this.calculateProfitFactor(result.signals, payload.data),
          returns: this.calculateReturns(result.signals, payload.data),
          // Elite metrics
          informationRatio: this.calculateInformationRatio(result.signals, payload.data),
          ulcerIndex: this.calculateUlcerIndex(result.signals, payload.data),
          var95: this.calculateVAR(result.signals, payload.data, 0.95),
          cvar95: this.calculateCVAR(result.signals, payload.data, 0.95)
        }
      };

      this.sendSuccess(id, backtestResult);
    } catch (error) {
      this.sendError(id, `Backtest failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced performance calculation methods for elite strategies
  private calculateWinRate(signals: any[], data: MarketData[]): number {
    let wins = 0;
    let total = 0;

    for (let i = 0; i < signals.length - 1; i++) {
      if (signals[i].type === 'BUY' && signals[i + 1].type === 'SELL') {
        total++;
        if (signals[i + 1].price > signals[i].price) {
          wins++;
        }
      } else if (signals[i].type === 'SELL' && signals[i + 1].type === 'BUY') {
        total++;
        if (signals[i + 1].price < signals[i].price) {
          wins++;
        }
      }
    }

    return total > 0 ? (wins / total) * 100 : 0;
  }

  private calculateMaxDrawdown(signals: any[], data: MarketData[]): number {
    const equityCurve = this.calculateEquityCurve(signals, data);
    let peak = 0;
    let maxDrawdown = 0;

    for (const value of equityCurve) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown * 100;
  }

  private calculateSharpeRatio(signals: any[], data: MarketData[]): number {
    const returns = this.calculateReturns(signals, data);
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    
    return volatility > 0 ? (avgReturn / volatility) * Math.sqrt(252) : 0;
  }

  private calculateCalmarRatio(signals: any[], data: MarketData[]): number {
    const returns = this.calculateReturns(signals, data);
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);
    const maxDrawdown = this.calculateMaxDrawdown(signals, data) / 100;
    
    return maxDrawdown > 0 ? (totalReturn * 252) / maxDrawdown : 0;
  }

  private calculateSortinoRatio(signals: any[], data: MarketData[]): number {
    const returns = this.calculateReturns(signals, data);
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downSideReturns = returns.filter(r => r < 0);
    
    if (downSideReturns.length === 0) return avgReturn > 0 ? Infinity : 0;
    
    const downSideVolatility = Math.sqrt(
      downSideReturns.reduce((sum, r) => sum + r * r, 0) / downSideReturns.length
    );
    
    return downSideVolatility > 0 ? (avgReturn / downSideVolatility) * Math.sqrt(252) : 0;
  }

  private calculateProfitFactor(signals: any[], data: MarketData[]): number {
    const returns = this.calculateReturns(signals, data);
    const profits = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
    const losses = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
    
    return losses > 0 ? profits / losses : profits > 0 ? Infinity : 0;
  }

  private calculateInformationRatio(signals: any[], data: MarketData[]): number {
    const returns = this.calculateReturns(signals, data);
    const benchmarkReturns = this.calculateBenchmarkReturns(data);
    
    if (returns.length !== benchmarkReturns.length) return 0;
    
    const excessReturns = returns.map((r, i) => r - benchmarkReturns[i]);
    const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const trackingError = Math.sqrt(
      excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcessReturn, 2), 0) / excessReturns.length
    );
    
    return trackingError > 0 ? avgExcessReturn / trackingError : 0;
  }

  private calculateUlcerIndex(signals: any[], data: MarketData[]): number {
    const equityCurve = this.calculateEquityCurve(signals, data);
    let peak = equityCurve[0];
    let sumSquaredDrawdowns = 0;
    
    for (const value of equityCurve) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      sumSquaredDrawdowns += drawdown * drawdown;
    }
    
    return Math.sqrt(sumSquaredDrawdowns / equityCurve.length) * 100;
  }

  private calculateVAR(signals: any[], data: MarketData[], confidenceLevel: number): number {
    const returns = this.calculateReturns(signals, data);
    if (returns.length === 0) return 0;
    
    returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * returns.length);
    return Math.abs(returns[index] || 0) * 100;
  }

  private calculateCVAR(signals: any[], data: MarketData[], confidenceLevel: number): number {
    const returns = this.calculateReturns(signals, data);
    if (returns.length === 0) return 0;
    
    returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * returns.length);
    const tailReturns = returns.slice(0, index);
    
    if (tailReturns.length === 0) return 0;
    
    const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    return Math.abs(avgTailReturn) * 100;
  }

  private calculateReturns(signals: any[], data: MarketData[]): number[] {
    const returns = [];
    let position = 0;
    let entryPrice = 0;
    
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
        
        returns.push(returnPct);
        position = 0;
      }
    }
    
    return returns;
  }

  private calculateEquityCurve(signals: any[], data: MarketData[]): number[] {
    const curve = [100000]; // Starting capital
    const returns = this.calculateReturns(signals, data);
    
    for (const returnPct of returns) {
      const lastValue = curve[curve.length - 1];
      curve.push(lastValue * (1 + returnPct));
    }
    
    return curve;
  }

  private calculateBenchmarkReturns(data: MarketData[]): number[] {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i-1].close) / data[i-1].close);
    }
    return returns;
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
