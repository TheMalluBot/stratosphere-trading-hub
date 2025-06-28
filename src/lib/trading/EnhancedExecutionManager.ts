
import { StrategySignal } from '@/types/strategy';
import { StrategyExecutionConfig } from './TradingEngine';

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'PARTIAL' | 'REJECTED' | 'CANCELLED';
  executedQuantity: number;
  executedPrice: number;
  timestamp: number;
  fees: number;
}

export interface Trade {
  id: string;
  orderId: string;
  signal: StrategySignal;
  executedPrice: number;
  quantity: number;
  timestamp: number;
  fees: number;
  slippage: number;
  profit?: number;
}

export interface ExecutionStats {
  totalOrders: number;
  filledOrders: number;
  rejectedOrders: number;
  averageSlippage: number;
  averageFees: number;
  fillRate: number;
}

export class EnhancedExecutionManager {
  private orders: Map<string, Order[]> = new Map();
  private trades: Map<string, Trade[]> = new Map();
  private executionStats: Map<string, ExecutionStats> = new Map();

  executeSignal(
    executionId: string, 
    signal: StrategySignal, 
    config: StrategyExecutionConfig
  ): { order: Order; trade?: Trade } {
    const order = this.createOrder(executionId, signal, config);
    
    // Simulate order execution with realistic parameters
    const executionResult = this.simulateOrderExecution(order, signal);
    
    // Update order status
    order.status = executionResult.filled ? 'FILLED' : 'REJECTED';
    order.executedQuantity = executionResult.executedQuantity;
    order.executedPrice = executionResult.executedPrice;
    order.fees = executionResult.fees;

    // Store order
    if (!this.orders.has(executionId)) {
      this.orders.set(executionId, []);
    }
    this.orders.get(executionId)!.push(order);

    let trade: Trade | undefined;

    if (executionResult.filled) {
      trade = {
        id: `${executionId}_trade_${Date.now()}`,
        orderId: order.id,
        signal,
        executedPrice: executionResult.executedPrice,
        quantity: executionResult.executedQuantity,
        timestamp: Date.now(),
        fees: executionResult.fees,
        slippage: executionResult.slippage,
        profit: this.calculateProfit(executionId, signal, executionResult.executedPrice)
      };

      // Store trade
      if (!this.trades.has(executionId)) {
        this.trades.set(executionId, []);
      }
      this.trades.get(executionId)!.push(trade);
    }

    // Update execution statistics
    this.updateExecutionStats(executionId, order, executionResult);

    return { order, trade };
  }

  private createOrder(
    executionId: string,
    signal: StrategySignal,
    config: StrategyExecutionConfig
  ): Order {
    const quantity = this.calculateQuantity(signal, config);
    
    return {
      id: `${executionId}_order_${Date.now()}`,
      symbol: config.symbol,
      side: signal.type === 'BUY' ? 'BUY' : 'SELL',
      type: 'MARKET', // Default to market orders for now
      quantity,
      status: 'PENDING',
      executedQuantity: 0,
      executedPrice: 0,
      timestamp: Date.now(),
      fees: 0
    };
  }

  private simulateOrderExecution(order: Order, signal: StrategySignal) {
    // Simulate realistic order execution
    const basePrice = signal.price;
    
    // Calculate slippage based on order size and market conditions
    const slippagePercent = this.calculateSlippage(order.quantity, signal.strength);
    const slippage = basePrice * slippagePercent;
    
    // Apply slippage (negative for buys, positive for sells)
    const executedPrice = order.side === 'BUY' 
      ? basePrice + slippage 
      : basePrice - slippage;

    // Calculate fees (0.1% for simulation)
    const fees = executedPrice * order.quantity * 0.001;

    // Determine fill probability based on market conditions
    const fillProbability = this.calculateFillProbability(order, signal);
    const filled = Math.random() < fillProbability;

    return {
      filled,
      executedQuantity: filled ? order.quantity : 0,
      executedPrice: filled ? executedPrice : 0,
      slippage: Math.abs(slippage),
      fees: filled ? fees : 0
    };
  }

  private calculateSlippage(quantity: number, signalStrength: number): number {
    // Base slippage of 0.01% to 0.1% depending on order size and signal strength
    const baseSlippage = 0.0001;
    const quantityImpact = Math.min(quantity / 10000, 0.001); // Impact based on quantity
    const strengthImpact = (1 - signalStrength) * 0.0005; // Lower strength = higher slippage
    
    return baseSlippage + quantityImpact + strengthImpact;
  }

  private calculateFillProbability(order: Order, signal: StrategySignal): number {
    // Higher signal strength = higher fill probability
    // Market orders have higher fill probability than limit orders
    let baseProbability = order.type === 'MARKET' ? 0.95 : 0.80;
    
    // Adjust based on signal strength
    baseProbability *= (0.5 + signal.strength * 0.5);
    
    return Math.min(baseProbability, 0.98);
  }

  private calculateQuantity(signal: StrategySignal, config: StrategyExecutionConfig): number {
    const positionSize = config.capital * config.riskPercent * signal.strength;
    return Math.floor(positionSize / signal.price);
  }

  private calculateProfit(executionId: string, signal: StrategySignal, executedPrice: number): number {
    const trades = this.getTrades(executionId);
    
    if (trades.length === 0) return 0;

    // Simple P&L calculation for demonstration
    // In production, this would be more sophisticated
    const lastTrade = trades[trades.length - 1];
    
    if (signal.type === 'SELL' && lastTrade.signal.type === 'BUY') {
      return (executedPrice - lastTrade.executedPrice) * lastTrade.quantity;
    } else if (signal.type === 'BUY' && lastTrade.signal.type === 'SELL') {
      return (lastTrade.executedPrice - executedPrice) * lastTrade.quantity;
    }
    
    return 0;
  }

  private updateExecutionStats(executionId: string, order: Order, executionResult: any): void {
    let stats = this.executionStats.get(executionId);
    
    if (!stats) {
      stats = {
        totalOrders: 0,
        filledOrders: 0,
        rejectedOrders: 0,
        averageSlippage: 0,
        averageFees: 0,
        fillRate: 0
      };
    }

    stats.totalOrders++;
    
    if (executionResult.filled) {
      stats.filledOrders++;
      // Update running averages
      const n = stats.filledOrders;
      stats.averageSlippage = ((stats.averageSlippage * (n - 1)) + executionResult.slippage) / n;
      stats.averageFees = ((stats.averageFees * (n - 1)) + executionResult.fees) / n;
    } else {
      stats.rejectedOrders++;
    }

    stats.fillRate = stats.filledOrders / stats.totalOrders;
    
    this.executionStats.set(executionId, stats);
  }

  getOrders(executionId: string): Order[] {
    return this.orders.get(executionId) || [];
  }

  getTrades(executionId: string): Trade[] {
    return this.trades.get(executionId) || [];
  }

  getExecutionStats(executionId: string): ExecutionStats | null {
    return this.executionStats.get(executionId) || null;
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

  cleanup(executionId: string): void {
    this.orders.delete(executionId);
    this.trades.delete(executionId);
    this.executionStats.delete(executionId);
  }
}
