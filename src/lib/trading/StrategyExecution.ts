import { BaseStrategy, MarketData, StrategySignal } from '@/types/strategy';
import { StrategyExecutionConfig } from './TradingEngine';

export class StrategyExecution {
  public executionId: string;
  public name: string;
  public symbol: string;
  public status: 'running' | 'paused' | 'stopped' = 'running';
  public pnl: number = 0;
  public totalTrades: number = 0;
  public winRate: number = 0;
  public lastSignal: string = 'Initializing...';
  public startTime: number;
  public config: StrategyExecutionConfig;
  
  private dataBuffer: MarketData[] = [];
  private strategy: BaseStrategy;

  constructor(executionId: string, strategy: BaseStrategy, config: StrategyExecutionConfig) {
    this.executionId = executionId;
    this.name = config.strategyName;
    this.symbol = config.symbol;
    this.config = config;
    this.strategy = strategy;
    this.startTime = Date.now();
  }

  addMarketData(data: MarketData): void {
    this.dataBuffer.push(data);
    
    // Keep only last 100 data points
    if (this.dataBuffer.length > 100) {
      this.dataBuffer.shift();
    }
  }

  hasEnoughData(): boolean {
    return this.dataBuffer.length >= 50;
  }

  getDataBuffer(): MarketData[] {
    return this.dataBuffer;
  }

  calculateStrategy() {
    if (!this.hasEnoughData()) return null;
    return this.strategy.calculate(this.dataBuffer);
  }

  updateMetrics(pnl: number, totalTrades: number, winRate: number, lastSignal: string): void {
    this.pnl = pnl;
    this.totalTrades = totalTrades;
    this.winRate = winRate;
    this.lastSignal = lastSignal;
  }

  stop(): void {
    this.status = 'stopped';
  }
}
