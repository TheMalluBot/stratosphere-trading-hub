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
  private dataUnsubscriber?: () => void;

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
    
    // Keep only last 200 data points to prevent memory issues
    if (this.dataBuffer.length > 200) {
      this.dataBuffer.shift();
    }
  }

  hasEnoughData(): boolean {
    // Require at least 50 data points for meaningful analysis
    return this.dataBuffer.length >= 50;
  }

  getDataBuffer(): MarketData[] {
    return [...this.dataBuffer]; // Return copy to prevent external modification
  }

  calculateStrategy() {
    if (!this.hasEnoughData()) return null;
    
    try {
      return this.strategy.calculate(this.dataBuffer);
    } catch (error) {
      console.error(`Strategy calculation error for ${this.executionId}:`, error);
      return null;
    }
  }

  updateMetrics(pnl: number, totalTrades: number, winRate: number, lastSignal: string): void {
    this.pnl = pnl;
    this.totalTrades = totalTrades;
    this.winRate = winRate;
    this.lastSignal = lastSignal;
  }

  setDataUnsubscriber(unsubscriber: () => void): void {
    this.dataUnsubscriber = unsubscriber;
  }

  stop(): void {
    this.status = 'stopped';
    
    // Unsubscribe from data updates
    if (this.dataUnsubscriber) {
      this.dataUnsubscriber();
    }
    
    console.log(`📊 Strategy execution ${this.executionId} stopped`);
  }

  getExecutionSummary() {
    const runtime = Date.now() - this.startTime;
    const runtimeMinutes = Math.floor(runtime / 60000);
    
    return {
      executionId: this.executionId,
      name: this.name,
      symbol: this.symbol,
      status: this.status,
      runtime: `${runtimeMinutes} minutes`,
      dataPoints: this.dataBuffer.length,
      pnl: this.pnl,
      totalTrades: this.totalTrades,
      winRate: this.winRate,
      lastSignal: this.lastSignal
    };
  }
}
