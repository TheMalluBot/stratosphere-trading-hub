
import { BaseStrategy, StrategySignal, MarketData } from '@/types/strategy';
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';
import { VolatilityArbitrageStrategy } from '@/strategies/VolatilityArbitrageStrategy';

import { RiskManager } from './RiskManager';
import { DataSimulator } from './DataSimulator';
import { ExecutionManager } from './ExecutionManager';
import { StrategyExecution } from './StrategyExecution';

export interface StrategyExecutionConfig {
  strategyId: string;
  strategyName: string;
  symbol: string;
  capital: number;
  riskPercent: number;
  paperMode: boolean;
  parameters?: Record<string, any>;
}

export interface ExecutionUpdate {
  executionId: string;
  signal: StrategySignal;
  pnl: number;
  totalTrades: number;
  winRate: number;
  lastSignal: string;
}

export class TradingEngine {
  private strategies: Map<string, BaseStrategy> = new Map();
  private activeExecutions: Map<string, StrategyExecution> = new Map();
  private updateCallbacks: Map<string, (update: ExecutionUpdate) => void> = new Map();

  private riskManager: RiskManager;
  private dataSimulator: DataSimulator;
  private executionManager: ExecutionManager;

  constructor() {
    this.riskManager = new RiskManager();
    this.dataSimulator = new DataSimulator();
    this.executionManager = new ExecutionManager();
    this.initializeStrategies();
  }

  private initializeStrategies() {
    const strategies = [
      { id: 'linear-regression', class: LinearRegressionStrategy },
      { id: 'z-score-trend', class: ZScoreTrendStrategy },
      { id: 'ultimate-combined', class: UltimateStrategy },
      { id: 'volatility-arbitrage', class: VolatilityArbitrageStrategy }
    ];

    strategies.forEach(({ id, class: StrategyClass }) => {
      const strategy = new StrategyClass({
        id,
        name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${id} strategy`,
        parameters: this.getDefaultParameters(id),
        enabled: true
      });
      this.strategies.set(id, strategy);
    });
  }

  private getDefaultParameters(strategyId: string): Record<string, any> {
    const defaultParams: Record<string, Record<string, any>> = {
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

    // Risk validation
    const riskValidation = this.riskManager.validateRisk(config);
    if (!riskValidation.approved) {
      throw new Error(`Risk validation failed: ${riskValidation.reason}`);
    }

    const executionId = `${config.strategyId}_${Date.now()}`;
    const execution = new StrategyExecution(executionId, strategy, config);
    
    this.activeExecutions.set(executionId, execution);

    // Start data simulation for paper trading
    if (config.paperMode) {
      this.dataSimulator.startSimulation(config.symbol, (data) => {
        this.processMarketData(executionId, data);
      });
    }

    console.log(`Strategy ${config.strategyName} started with ID: ${executionId}`);
    return executionId;
  }

  private processMarketData(executionId: string, marketData: MarketData) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || execution.status !== 'running') return;

    execution.addMarketData(marketData);

    if (execution.hasEnoughData()) {
      const result = execution.calculateStrategy();
      if (result) {
        this.processStrategyResult(executionId, result, marketData);
      }
    }
  }

  private processStrategyResult(executionId: string, result: any, currentData: MarketData) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    // Check for new signals (signals with current timestamp)
    const newSignals = result.signals.filter((signal: StrategySignal) => 
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

    // Execute the signal
    const trade = this.executionManager.executeSignal(executionId, signal, execution.config);
    
    // Update execution metrics
    const pnl = this.executionManager.calculatePnL(executionId);
    const totalTrades = this.executionManager.getTrades(executionId).length;
    const winRate = this.executionManager.calculateWinRate(executionId);
    const lastSignal = `${signal.type} at ₹${signal.price.toFixed(2)}`;

    execution.updateMetrics(pnl, totalTrades, winRate, lastSignal);

    // Notify callback if registered
    const callback = this.updateCallbacks.get(executionId);
    if (callback) {
      callback({
        executionId,
        signal,
        pnl,
        totalTrades,
        winRate,
        lastSignal
      });
    }

    console.log(`Signal processed for ${executionId}: ${signal.type} at ${signal.price}`);
  }

  async stopStrategy(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.stop();
    this.dataSimulator.stopSimulation(execution.symbol);
    this.executionManager.cleanup(executionId);
    this.updateCallbacks.delete(executionId);
    this.activeExecutions.delete(executionId);

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
