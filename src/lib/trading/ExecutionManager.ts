
import { StrategySignal } from '@/types/strategy';
import { StrategyExecutionConfig } from './TradingEngine';

export interface Trade {
  id: string;
  signal: StrategySignal;
  executedPrice: number;
  quantity: number;
  timestamp: number;
  profit?: number;
}

export class ExecutionManager {
  private trades: Map<string, Trade[]> = new Map();

  executeSignal(executionId: string, signal: StrategySignal, config: StrategyExecutionConfig): Trade {
    // Simulate trade execution for paper trading
    const trade: Trade = {
      id: `${executionId}_${Date.now()}`,
      signal,
      executedPrice: signal.price + (Math.random() - 0.5) * 0.1, // Add small slippage
      quantity: this.calculateQuantity(signal, config),
      timestamp: Date.now(),
      profit: (Math.random() - 0.4) * config.capital * 0.02 // Slight positive bias for demo
    };

    // Store trade
    const executionTrades = this.trades.get(executionId) || [];
    executionTrades.push(trade);
    this.trades.set(executionId, executionTrades);

    return trade;
  }

  getTrades(executionId: string): Trade[] {
    return this.trades.get(executionId) || [];
  }

  calculatePnL(executionId: string): number {
    const trades = this.getTrades(executionId);
    return trades.reduce((total, trade) => total + (trade.profit || 0), 0);
  }

  calculateWinRate(executionId: string): number {
    const trades = this.getTrades(executionId);
    if (trades.length === 0) return 0;
    
    const wins = trades.filter(trade => (trade.profit || 0) > 0).length;
    return wins / trades.length;
  }

  private calculateQuantity(signal: StrategySignal, config: StrategyExecutionConfig): number {
    const positionSize = config.capital * config.riskPercent * signal.strength;
    return Math.floor(positionSize / signal.price);
  }

  cleanup(executionId: string): void {
    this.trades.delete(executionId);
  }
}
