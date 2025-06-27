import { BaseStrategy, StrategyConfig, StrategyResult, StrategySignal, MarketData } from '@/types/strategy';
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';
import { VolatilityArbitrageStrategy } from '@/strategies/VolatilityArbitrageStrategy';

export interface StrategyExecutionConfig {
  strategyId: string;
  strategyName: string;
  symbol: string;
  capital: number;
  riskPercent: number;
  paperMode: boolean;
  parameters?: Record<string, any>;
}

export interface StrategyExecution {
  executionId: string;
  name: string;
  symbol: string;
  status: 'running' | 'paused' | 'stopped';
  pnl: number;
  totalTrades: number;
  winRate: number;
  lastSignal: string;
  startTime: number;
  config: StrategyExecutionConfig;
}

export interface ExecutionUpdate {
  executionId: string;
  signal: StrategySignal;
  pnl: number;
  totalTrades: number;
  winRate: number;
  lastSignal: string;
}

export interface RiskValidation {
  approved: boolean;
  reason?: string;
  recommendedPositionSize?: number;
}

export class TradingEngine {
  private strategies: Map<string, BaseStrategy> = new Map();
  private activeExecutions: Map<string, StrategyExecution> = new Map();
  private dataBuffers: Map<string, MarketData[]> = new Map();
  private updateCallbacks: Map<string, (update: ExecutionUpdate) => void> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Initialize available strategies with default configs
    const strategies = [
      { id: 'linear-regression', class: LinearRegressionStrategy },
      { id: 'z-score-trend', class: ZScoreTrendStrategy },
      { id: 'ultimate-combined', class: UltimateStrategy },
      { id: 'volatility-arbitrage', class: VolatilityArbitrageStrategy }
    ];

    strategies.forEach(({ id, class: StrategyClass }) => {
      const defaultConfig: StrategyConfig = {
        id,
        name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${id} strategy`,
        parameters: this.getDefaultParameters(id),
        enabled: true
      };
      this.strategies.set(id, new StrategyClass(defaultConfig));
    });
  }

  private getDefaultParameters(strategyId: string): Record<string, any> {
    const defaultParams = {
      'linear-regression': { lookbackPeriod: 20, threshold: 0.7 },
      'z-score-trend': { period: 20, threshold: 2 },
      'ultimate-combined': { rsiPeriod: 14, emaShort: 20, emaLong: 50 },
      'volatility-arbitrage': { period: 20, threshold: 0.5 }
    };
    return defaultParams[strategyId] || {};
  }

  async startStrategy(config: StrategyExecutionConfig): Promise<string> {
    const strategy = this.strategies.get(config.strategyId);
    if (!strategy) {
      throw new Error(`Strategy not found: ${config.strategyId}`);
    }

    // Basic risk validation
    const riskValidation = this.validateRisk(config);
    if (!riskValidation.approved) {
      throw new Error(`Risk validation failed: ${riskValidation.reason}`);
    }

    const executionId = `${config.strategyId}_${Date.now()}`;
    
    const execution: StrategyExecution = {
      executionId,
      name: config.strategyName,
      symbol: config.symbol,
      status: 'running',
      pnl: 0,
      totalTrades: 0,
      winRate: 0,
      lastSignal: 'Initializing...',
      startTime: Date.now(),
      config
    };

    this.activeExecutions.set(executionId, execution);
    this.dataBuffers.set(executionId, []);

    // Start data simulation for paper trading
    if (config.paperMode) {
      this.startDataSimulation(executionId);
    }

    console.log(`Strategy ${config.strategyName} started with ID: ${executionId}`);
    return executionId;
  }

  private validateRisk(config: StrategyExecutionConfig): RiskValidation {
    // Basic risk checks
    if (config.capital <= 0) {
      return { approved: false, reason: 'Capital must be positive' };
    }

    if (config.riskPercent > 0.1) {
      return { approved: false, reason: 'Risk percentage cannot exceed 10%' };
    }

    // For now, only allow paper trading
    if (!config.paperMode) {
      return { approved: false, reason: 'Real trading not yet enabled - paper mode only' };
    }

    return { approved: true };
  }

  private startDataSimulation(executionId: string) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    // Simulate market data every 2 seconds
    const interval = setInterval(() => {
      if (!this.activeExecutions.has(executionId)) {
        clearInterval(interval);
        return;
      }

      const simulatedData = this.generateSimulatedData(execution.symbol);
      this.processMarketData(executionId, simulatedData);
    }, 2000);
  }

  private generateSimulatedData(symbol: string): MarketData {
    // Generate realistic market data for simulation
    const basePrice = this.getBasePrice(symbol);
    const volatility = 0.02; // 2% volatility
    
    const change = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + change);
    
    return {
      timestamp: Date.now(),
      open: price * 0.999,
      high: price * 1.001,
      low: price * 0.998,
      close: price,
      volume: Math.floor(Math.random() * 100000) + 50000
    };
  }

  private getBasePrice(symbol: string): number {
    const basePrices = {
      'RELIANCE': 2450,
      'TCS': 3200,
      'INFY': 1450,
      'HDFC': 1600,
      'ICICIBANK': 950,
      'SBIN': 420,
      'ITC': 250,
      'HDFCBANK': 1550,
      'BHARTIARTL': 850,
      'LT': 2800
    };
    return basePrices[symbol] || 1000;
  }

  private processMarketData(executionId: string, marketData: MarketData) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || execution.status !== 'running') return;

    const dataBuffer = this.dataBuffers.get(executionId) || [];
    dataBuffer.push(marketData);

    // Keep only last 100 data points
    if (dataBuffer.length > 100) {
      dataBuffer.shift();
    }

    this.dataBuffers.set(executionId, dataBuffer);

    // Need at least 50 data points for strategy calculation
    if (dataBuffer.length >= 50) {
      const strategy = this.strategies.get(execution.config.strategyId);
      if (strategy) {
        const result = strategy.calculate(dataBuffer);
        this.processStrategyResult(executionId, result, marketData);
      }
    }
  }

  private processStrategyResult(executionId: string, result: StrategyResult, currentData: MarketData) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    // Check for new signals (signals with current timestamp)
    const newSignals = result.signals.filter(signal => 
      Math.abs(signal.timestamp - currentData.timestamp) < 5000 // Within 5 seconds
    );

    if (newSignals.length > 0) {
      const latestSignal = newSignals[newSignals.length - 1];
      this.processSignal(executionId, latestSignal);
    }
  }

  private processSignal(executionId: string, signal: StrategySignal) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    // Simulate trade execution for paper trading
    const trade = {
      signal: signal.type,
      price: signal.price,
      timestamp: signal.timestamp,
      profit: (Math.random() - 0.4) * execution.config.capital * 0.02 // Slight positive bias
    };

    // Update execution metrics
    execution.totalTrades += 1;
    execution.pnl += trade.profit;
    
    // Calculate win rate (simplified)
    const wins = Math.floor(execution.totalTrades * 0.65); // Assume 65% win rate for demo
    execution.winRate = wins / execution.totalTrades;
    
    execution.lastSignal = `${signal.type} at ₹${signal.price.toFixed(2)}`;

    // Update the execution in the map
    this.activeExecutions.set(executionId, execution);

    // Notify callback if registered
    const callback = this.updateCallbacks.get(executionId);
    if (callback) {
      callback({
        executionId,
        signal,
        pnl: execution.pnl,
        totalTrades: execution.totalTrades,
        winRate: execution.winRate,
        lastSignal: execution.lastSignal
      });
    }

    console.log(`Signal processed for ${executionId}: ${signal.type} at ${signal.price}`);
  }

  async stopStrategy(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.status = 'stopped';
    this.activeExecutions.set(executionId, execution);
    
    // Clean up
    this.dataBuffers.delete(executionId);
    this.updateCallbacks.delete(executionId);

    console.log(`Strategy ${executionId} stopped`);
  }

  getActiveExecutions(): StrategyExecution[] {
    return Array.from(this.activeExecutions.values()).filter(e => e.status === 'running');
  }

  getExecution(executionId: string): StrategyExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  onExecutionUpdate(executionId: string, callback: (update: ExecutionUpdate) => void): void {
    this.updateCallbacks.set(executionId, callback);
  }

  getAvailableStrategies(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.strategies.entries()).map(([id, strategy]) => ({
      id,
      name: strategy.getName(),
      description: `${strategy.getName()} - Advanced algorithmic trading strategy`
    }));
  }
}
