import { BaseStrategy, StrategySignal, MarketData } from '@/types/strategy';
import { LinearRegressionStrategy } from '@/strategies/LinearRegressionStrategy';
import { ZScoreTrendStrategy } from '@/strategies/ZScoreTrendStrategy';
import { UltimateStrategy } from '@/strategies/UltimateStrategy';
import { VolatilityArbitrageStrategy } from '@/strategies/VolatilityArbitrageStrategy';

import { RiskManager } from './RiskManager';
import { RealTimeDataService, RealTimeDataConfig } from '@/services/realTimeDataService';
import { EnhancedExecutionManager } from './EnhancedExecutionManager';
import { StrategyExecution } from './StrategyExecution';
import { HistoricalDataManager } from '@/lib/data/HistoricalDataManager';
import { EliteRiskManager } from '@/lib/risk/EliteRiskManager';

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
  private eliteRiskManager: EliteRiskManager;
  private dataService: RealTimeDataService;
  private executionManager: EnhancedExecutionManager;
  private historicalDataManager: HistoricalDataManager;

  constructor() {
    this.riskManager = new RiskManager();
    this.eliteRiskManager = new EliteRiskManager();
    this.executionManager = new EnhancedExecutionManager();
    this.historicalDataManager = new HistoricalDataManager();
    
    // Initialize real-time data service
    const dataConfig: RealTimeDataConfig = {
      refreshInterval: 2000, // 2 seconds
      symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK'],
      enableWebSocket: true
    };
    this.dataService = new RealTimeDataService(dataConfig);
    
    this.initializeStrategies();
    this.connectDataService();
  }

  private async connectDataService(): Promise<void> {
    try {
      await this.dataService.connect();
      console.log('✅ Real-time data service connected');
    } catch (error) {
      console.error('❌ Failed to connect data service:', error);
    }
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

    // Enhanced risk validation with elite risk manager
    const riskValidation = this.riskManager.validateRisk(config);
    if (!riskValidation.approved) {
      throw new Error(`Risk validation failed: ${riskValidation.reason}`);
    }

    const executionId = `${config.strategyId}_${Date.now()}`;
    
    // Load historical data for strategy initialization
    await this.loadHistoricalData(config.symbol, executionId);
    
    const execution = new StrategyExecution(executionId, strategy, config);
    this.activeExecutions.set(executionId, execution);

    // Subscribe to real-time data
    const unsubscribe = this.dataService.subscribeToRealTime(config.symbol, (data) => {
      this.processMarketData(executionId, data);
    });

    // Store unsubscribe function for cleanup
    execution.setDataUnsubscriber(unsubscribe);

    console.log(`🚀 Strategy ${config.strategyName} started with ID: ${executionId}`);
    return executionId;
  }

  private async loadHistoricalData(symbol: string, executionId: string): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days
      
      // Try to get from cache first
      let historicalData = await this.historicalDataManager.getHistoricalData(
        symbol, '1h', startDate, endDate
      );

      // If no cached data, fetch from service
      if (historicalData.length === 0) {
        console.log(`📊 Loading historical data for ${symbol}...`);
        historicalData = await this.dataService.getHistoricalData(symbol, '1h', startDate, endDate);
        
        // Cache the data
        await this.historicalDataManager.storeHistoricalData(symbol, '1h', historicalData);
      }

      // Initialize strategy with historical data
      const execution = this.activeExecutions.get(executionId);
      if (execution) {
        historicalData.forEach(data => execution.addMarketData(data));
        console.log(`📈 Loaded ${historicalData.length} historical data points for ${symbol}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load historical data for ${symbol}:`, error);
    }
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
      Math.abs(signal.timestamp - currentData.timestamp) < 10000 // Within 10 seconds
    );

    if (newSignals.length > 0) {
      // Use elite risk manager for optimal position sizing
      const portfolioValue = execution.config.capital;
      const optimalPositions = this.eliteRiskManager.calculateOptimalPositionSizes(
        newSignals,
        portfolioValue
      );

      // Process each optimized signal
      for (const position of optimalPositions) {
        this.processOptimizedSignal(executionId, position);
      }
    }
  }

  private processOptimizedSignal(executionId: string, position: any) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    // Update signal with optimized position size
    const optimizedSignal = {
      ...position.signal,
      metadata: {
        ...position.signal.metadata,
        optimalPositionSize: position.positionSize,
        riskContribution: position.riskContribution,
        kellyFraction: position.kellyFraction
      }
    };

    // Execute the optimized signal
    const { order, trade } = this.executionManager.executeSignal(executionId, optimizedSignal, execution.config);
    
    console.log(`📋 Optimized Order: ${order.id} - ${order.side} ${order.quantity} ${order.symbol} (Risk: ${(position.riskContribution * 100).toFixed(2)}%)`);
    
    if (trade) {
      console.log(`✅ Trade executed: ${trade.id} - P&L: ₹${trade.profit?.toFixed(2) || '0.00'}`);
    }

    // Update execution metrics with risk-adjusted data
    this.updateExecutionMetrics(executionId, optimizedSignal, position);
  }

  private updateExecutionMetrics(executionId: string, signal: StrategySignal, position: any) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    const pnl = this.executionManager.calculatePnL(executionId);
    const totalTrades = this.executionManager.getTrades(executionId).length;
    const winRate = this.executionManager.calculateWinRate(executionId);
    const lastSignal = `${signal.type} at ₹${signal.price.toFixed(2)} (${(signal.strength * 100).toFixed(1)}% | Risk: ${(position.riskContribution * 100).toFixed(2)}%)`;

    execution.updateMetrics(pnl, totalTrades, winRate, lastSignal);

    // Calculate portfolio-level risk metrics
    const portfolioVAR = this.calculatePortfolioVAR(executionId);
    const sharpeRatio = this.calculateSharpeRatio(executionId);

    // Notify callback with enhanced metrics
    const callback = this.updateCallbacks.get(executionId);
    if (callback) {
      callback({
        executionId,
        signal,
        pnl,
        totalTrades,
        winRate,
        lastSignal,
        portfolioVAR,
        sharpeRatio
      } as any);
    }
  }

  private calculatePortfolioVAR(executionId: string): number {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return 0;

    const trades = this.executionManager.getTrades(executionId);
    const returns = trades.map(trade => (trade.profit || 0) / execution.config.capital);
    
    if (returns.length < 10) return 0; // Need minimum data points
    
    // Calculate 95% VAR
    returns.sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    return Math.abs(returns[varIndex] || 0);
  }

  private calculateSharpeRatio(executionId: string): number {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return 0;

    const trades = this.executionManager.getTrades(executionId);
    const returns = trades.map(trade => (trade.profit || 0) / execution.config.capital);
    
    return this.eliteRiskManager.calculateSharpeRatio(returns);
  }

  async stopStrategy(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.stop();
    this.executionManager.cleanup(executionId);
    this.updateCallbacks.delete(executionId);
    this.activeExecutions.delete(executionId);

    console.log(`🛑 Strategy ${executionId} stopped`);
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
      description: `${strategy.getName()} - Advanced algorithmic trading strategy with real data integration`
    }));
  }

  async getEngineStatus() {
    const dataConnected = this.dataService.getConnectionStatus();
    const activeCount = this.getActiveExecutions().length;
    
    return {
      dataService: dataConnected,
      activeStrategies: activeCount,
      totalStrategies: this.strategies.size,
      timestamp: Date.now()
    };
  }

  async getRiskMetrics(): Promise<any> {
    const activeExecutions = this.getActiveExecutions();
    const totalCapital = activeExecutions.reduce((sum, exec) => sum + exec.config.capital, 0);
    
    const riskMetrics = {
      totalCapital,
      totalVAR: 0,
      averageSharpe: 0,
      maxDrawdown: 0,
      activePositions: activeExecutions.length,
      riskUtilization: 0
    };

    // Calculate aggregate risk metrics
    for (const execution of activeExecutions) {
      const var95 = this.calculatePortfolioVAR(execution.executionId);
      const sharpe = this.calculateSharpeRatio(execution.executionId);
      
      riskMetrics.totalVAR += var95 * execution.config.capital;
      riskMetrics.averageSharpe += sharpe;
    }

    if (activeExecutions.length > 0) {
      riskMetrics.averageSharpe /= activeExecutions.length;
      riskMetrics.riskUtilization = riskMetrics.totalVAR / totalCapital;
    }

    return riskMetrics;
  }

  async cleanup(): Promise<void> {
    // Stop all active strategies
    const activeIds = Array.from(this.activeExecutions.keys());
    for (const id of activeIds) {
      await this.stopStrategy(id);
    }

    // Disconnect data service
    this.dataService.disconnect();
    
    console.log('🧹 Trading engine cleanup completed');
  }
}
