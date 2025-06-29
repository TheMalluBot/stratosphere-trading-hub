import {
  Order,
  OrderRequest,
  OrderFill,
  RiskCheck,
  ComplianceFlag
} from '@/types/orders.types';

interface RiskLimit {
  id: string;
  name: string;
  type: 'POSITION_SIZE' | 'DAILY_LOSS' | 'LEVERAGE' | 'CONCENTRATION' | 'ORDER_VALUE' | 'ORDER_RATE';
  limit: number;
  warningThreshold: number;
  account?: string;
  symbol?: string;
  strategy?: string;
  timeframe?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'INTRADAY';
  enabled: boolean;
}

interface RiskMetrics {
  account: string;
  symbol?: string;
  currentExposure: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  openPositions: number;
  totalOrderValue: number;
  leverage: number;
  concentration: number;
  orderRate: number;
  lastUpdate: number;
}

/**
 * Advanced Risk Validation System
 * Performs comprehensive risk checks at order level and portfolio level
 */
export class RiskValidator {
  private riskLimits: Map<string, RiskLimit> = new Map();
  private riskMetrics: Map<string, RiskMetrics> = new Map();
  private riskHistory: Map<string, RiskCheck[]> = new Map();
  
  constructor() {
    this.initializeDefaultLimits();
    this.startRiskMonitoring();
  }
  
  private initializeDefaultLimits(): void {
    const defaultLimits: RiskLimit[] = [
      {
        id: 'MAX_POSITION_SIZE',
        name: 'Maximum Position Size',
        type: 'POSITION_SIZE',
        limit: 1000000,
        warningThreshold: 800000,
        timeframe: 'DAILY',
        enabled: true
      },
      {
        id: 'DAILY_LOSS_LIMIT',
        name: 'Daily Loss Limit',
        type: 'DAILY_LOSS',
        limit: -50000,
        warningThreshold: -40000,
        timeframe: 'DAILY',
        enabled: true
      },
      {
        id: 'MAX_LEVERAGE',
        name: 'Maximum Leverage',
        type: 'LEVERAGE',
        limit: 10,
        warningThreshold: 8,
        enabled: true
      },
      {
        id: 'MAX_ORDER_VALUE',
        name: 'Maximum Order Value',
        type: 'ORDER_VALUE',
        limit: 100000,
        warningThreshold: 80000,
        enabled: true
      },
      {
        id: 'ORDER_RATE_LIMIT',
        name: 'Order Rate Limit',
        type: 'ORDER_RATE',
        limit: 100, // orders per minute
        warningThreshold: 80,
        timeframe: 'INTRADAY',
        enabled: true
      },
      {
        id: 'CONCENTRATION_LIMIT',
        name: 'Single Symbol Concentration',
        type: 'CONCENTRATION',
        limit: 0.3, // 30% of portfolio
        warningThreshold: 0.25,
        enabled: true
      }
    ];
    
    defaultLimits.forEach(limit => {
      this.riskLimits.set(limit.id, limit);
    });
  }
  
  /**
   * Validate order before submission (Pre-trade risk checks)
   */
  public async validateOrder(order: Order, request: OrderRequest): Promise<RiskCheck[]> {
    const checks: RiskCheck[] = [];
    const account = order.account;
    
    // Get or create risk metrics for account
    const metrics = this.getRiskMetrics(account);
    
    // Position size check
    const positionSizeCheck = await this.checkPositionSize(order, request, metrics);
    if (positionSizeCheck) checks.push(positionSizeCheck);
    
    // Order value check
    const orderValueCheck = await this.checkOrderValue(order, request);
    if (orderValueCheck) checks.push(orderValueCheck);
    
    // Daily loss limit check
    const dailyLossCheck = await this.checkDailyLoss(order, request, metrics);
    if (dailyLossCheck) checks.push(dailyLossCheck);
    
    // Leverage check
    const leverageCheck = await this.checkLeverage(order, request, metrics);
    if (leverageCheck) checks.push(leverageCheck);
    
    // Concentration check
    const concentrationCheck = await this.checkConcentration(order, request, metrics);
    if (concentrationCheck) checks.push(concentrationCheck);
    
    // Order rate check
    const rateCheck = await this.checkOrderRate(order, request, account);
    if (rateCheck) checks.push(rateCheck);
    
    // Fat finger check
    const fatFingerCheck = await this.checkFatFinger(order, request);
    if (fatFingerCheck) checks.push(fatFingerCheck);
    
    // Market hours check
    const marketHoursCheck = await this.checkMarketHours(order, request);
    if (marketHoursCheck) checks.push(marketHoursCheck);
    
    // Store risk checks
    this.storeRiskChecks(order.orderId, checks);
    
    return checks;
  }
  
  /**
   * Validate fill during execution (Real-time risk checks)
   */
  public async validateFill(order: Order, fill: OrderFill): Promise<RiskCheck[]> {
    const checks: RiskCheck[] = [];
    const account = order.account;
    
    // Update risk metrics with fill
    this.updateRiskMetricsWithFill(account, order, fill);
    const metrics = this.getRiskMetrics(account);
    
    // Real-time P&L check
    const pnlCheck = await this.checkRealTimePnL(order, fill, metrics);
    if (pnlCheck) checks.push(pnlCheck);
    
    // Position limit breach check
    const positionBreachCheck = await this.checkPositionBreach(order, fill, metrics);
    if (positionBreachCheck) checks.push(positionBreachCheck);
    
    // Leverage breach check
    const leverageBreachCheck = await this.checkLeverageBreach(order, fill, metrics);
    if (leverageBreachCheck) checks.push(leverageBreachCheck);
    
    return checks;
  }
  
  private async checkPositionSize(order: Order, request: OrderRequest, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('MAX_POSITION_SIZE');
    if (!limit || !limit.enabled) return null;
    
    const orderValue = (request.price || 0) * request.quantity;
    const newExposure = metrics.currentExposure + orderValue;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Position size within limits';
    
    if (newExposure > limit.limit) {
      status = 'FAILED';
      message = `Position size would exceed limit of ${limit.limit}`;
    } else if (newExposure > limit.warningThreshold) {
      status = 'WARNING';
      message = `Position size approaching limit (${((newExposure / limit.limit) * 100).toFixed(1)}%)`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'MAX_POSITION_SIZE',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: orderValue,
      leverageImpact: 0,
      concentrationRisk: 0,
      liquidityRisk: 0,
      limit: limit.limit,
      currentValue: newExposure,
      utilizationPercentage: (newExposure / limit.limit) * 100
    };
  }
  
  private async checkOrderValue(order: Order, request: OrderRequest): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('MAX_ORDER_VALUE');
    if (!limit || !limit.enabled) return null;
    
    const orderValue = (request.price || 0) * request.quantity;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Order value within limits';
    
    if (orderValue > limit.limit) {
      status = 'FAILED';
      message = `Order value ${orderValue} exceeds limit of ${limit.limit}`;
    } else if (orderValue > limit.warningThreshold) {
      status = 'WARNING';
      message = `Large order value: ${orderValue}`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'MAX_ORDER_VALUE',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: orderValue,
      leverageImpact: 0,
      concentrationRisk: 0,
      liquidityRisk: 0,
      limit: limit.limit,
      currentValue: orderValue,
      utilizationPercentage: (orderValue / limit.limit) * 100
    };
  }
  
  private async checkDailyLoss(order: Order, request: OrderRequest, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('DAILY_LOSS_LIMIT');
    if (!limit || !limit.enabled) return null;
    
    const currentDailyPnL = metrics.dailyPnL;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Daily P&L within limits';
    
    if (currentDailyPnL < limit.limit) {
      status = 'FAILED';
      message = `Daily loss limit breached: ${currentDailyPnL}`;
    } else if (currentDailyPnL < limit.warningThreshold) {
      status = 'WARNING';
      message = `Approaching daily loss limit: ${currentDailyPnL}`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'DAILY_LOSS_LIMIT',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: 0,
      leverageImpact: 0,
      concentrationRisk: 0,
      liquidityRisk: 0,
      limit: Math.abs(limit.limit),
      currentValue: Math.abs(currentDailyPnL),
      utilizationPercentage: (Math.abs(currentDailyPnL) / Math.abs(limit.limit)) * 100
    };
  }
  
  private async checkLeverage(order: Order, request: OrderRequest, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('MAX_LEVERAGE');
    if (!limit || !limit.enabled) return null;
    
    const currentLeverage = metrics.leverage;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Leverage within limits';
    
    if (currentLeverage > limit.limit) {
      status = 'FAILED';
      message = `Leverage ${currentLeverage.toFixed(2)}x exceeds limit of ${limit.limit}x`;
    } else if (currentLeverage > limit.warningThreshold) {
      status = 'WARNING';
      message = `High leverage: ${currentLeverage.toFixed(2)}x`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'MAX_LEVERAGE',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: 0,
      leverageImpact: 0,
      concentrationRisk: 0,
      liquidityRisk: 0,
      limit: limit.limit,
      currentValue: currentLeverage,
      utilizationPercentage: (currentLeverage / limit.limit) * 100
    };
  }
  
  private async checkConcentration(order: Order, request: OrderRequest, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('CONCENTRATION_LIMIT');
    if (!limit || !limit.enabled) return null;
    
    const concentration = metrics.concentration;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Concentration within limits';
    
    if (concentration > limit.limit) {
      status = 'FAILED';
      message = `Symbol concentration ${(concentration * 100).toFixed(1)}% exceeds limit of ${(limit.limit * 100).toFixed(1)}%`;
    } else if (concentration > limit.warningThreshold) {
      status = 'WARNING';
      message = `High concentration in ${order.symbol}: ${(concentration * 100).toFixed(1)}%`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'CONCENTRATION_LIMIT',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: 0,
      leverageImpact: 0,
      concentrationRisk: concentration,
      liquidityRisk: 0,
      limit: limit.limit,
      currentValue: concentration,
      utilizationPercentage: (concentration / limit.limit) * 100
    };
  }
  
  private async checkOrderRate(order: Order, request: OrderRequest, account: string): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('ORDER_RATE_LIMIT');
    if (!limit || !limit.enabled) return null;
    
    // Count orders in last minute
    const oneMinuteAgo = Date.now() - 60000;
    const recentChecks = this.riskHistory.get(account) || [];
    const recentOrderCount = recentChecks.filter(check => 
      check.timestamp > oneMinuteAgo && check.rule === 'ORDER_RATE_LIMIT'
    ).length;
    
    let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    let message = 'Order rate within limits';
    
    if (recentOrderCount >= limit.limit) {
      status = 'FAILED';
      message = `Order rate limit exceeded: ${recentOrderCount} orders in last minute`;
    } else if (recentOrderCount >= limit.warningThreshold) {
      status = 'WARNING';
      message = `High order rate: ${recentOrderCount} orders in last minute`;
    }
    
    return {
      id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'PRE_TRADE',
      rule: 'ORDER_RATE_LIMIT',
      status,
      message,
      timestamp: Date.now(),
      exposureChange: 0,
      leverageImpact: 0,
      concentrationRisk: 0,
      liquidityRisk: 0,
      limit: limit.limit,
      currentValue: recentOrderCount,
      utilizationPercentage: (recentOrderCount / limit.limit) * 100
    };
  }
  
  private async checkFatFinger(order: Order, request: OrderRequest): Promise<RiskCheck | null> {
    // Fat finger detection based on price and size anomalies
    const orderValue = (request.price || 0) * request.quantity;
    
    // Check for unusually large order values (> $1M)
    if (orderValue > 1000000) {
      return {
        id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'PRE_TRADE',
        rule: 'FAT_FINGER_CHECK',
        status: 'WARNING',
        message: `Unusually large order value: $${orderValue.toLocaleString()}`,
        timestamp: Date.now(),
        exposureChange: orderValue,
        leverageImpact: 0,
        concentrationRisk: 0,
        liquidityRisk: 0
      };
    }
    
    // Check for price anomalies (would need market data in production)
    // This is a simplified check
    if (request.price && request.type === 'LIMIT') {
      const priceDeviation = Math.abs(request.price - 100) / 100; // Mock current price of 100
      if (priceDeviation > 0.1) { // 10% deviation
        return {
          id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'PRE_TRADE',
          rule: 'FAT_FINGER_CHECK',
          status: 'WARNING',
          message: `Price significantly different from market: ${request.price}`,
          timestamp: Date.now(),
          exposureChange: 0,
          leverageImpact: 0,
          concentrationRisk: 0,
          liquidityRisk: 0
        };
      }
    }
    
    return null;
  }
  
  private async checkMarketHours(order: Order, request: OrderRequest): Promise<RiskCheck | null> {
    // Check if market is open (simplified check)
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Assume crypto markets are 24/7, but warn for traditional market hours
    if (order.symbol.includes('USD') && (hour < 6 || hour > 22)) {
      return {
        id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'PRE_TRADE',
        rule: 'MARKET_HOURS_CHECK',
        status: 'WARNING',
        message: 'Trading outside normal market hours',
        timestamp: Date.now(),
        exposureChange: 0,
        leverageImpact: 0,
        concentrationRisk: 0,
        liquidityRisk: 0.1 // Higher liquidity risk outside market hours
      };
    }
    
    return null;
  }
  
  private async checkRealTimePnL(order: Order, fill: OrderFill, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('DAILY_LOSS_LIMIT');
    if (!limit || !limit.enabled) return null;
    
    if (metrics.dailyPnL < limit.limit) {
      return {
        id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'REAL_TIME',
        rule: 'DAILY_LOSS_LIMIT',
        status: 'FAILED',
        message: `Daily loss limit breached during execution: ${metrics.dailyPnL}`,
        timestamp: Date.now(),
        exposureChange: 0,
        leverageImpact: 0,
        concentrationRisk: 0,
        liquidityRisk: 0,
        limit: Math.abs(limit.limit),
        currentValue: Math.abs(metrics.dailyPnL),
        utilizationPercentage: (Math.abs(metrics.dailyPnL) / Math.abs(limit.limit)) * 100
      };
    }
    
    return null;
  }
  
  private async checkPositionBreach(order: Order, fill: OrderFill, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('MAX_POSITION_SIZE');
    if (!limit || !limit.enabled) return null;
    
    if (metrics.currentExposure > limit.limit) {
      return {
        id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'REAL_TIME',
        rule: 'MAX_POSITION_SIZE',
        status: 'FAILED',
        message: `Position size limit breached during execution: ${metrics.currentExposure}`,
        timestamp: Date.now(),
        exposureChange: fill.price * fill.quantity,
        leverageImpact: 0,
        concentrationRisk: 0,
        liquidityRisk: 0,
        limit: limit.limit,
        currentValue: metrics.currentExposure,
        utilizationPercentage: (metrics.currentExposure / limit.limit) * 100
      };
    }
    
    return null;
  }
  
  private async checkLeverageBreach(order: Order, fill: OrderFill, metrics: RiskMetrics): Promise<RiskCheck | null> {
    const limit = this.riskLimits.get('MAX_LEVERAGE');
    if (!limit || !limit.enabled) return null;
    
    if (metrics.leverage > limit.limit) {
      return {
        id: `RISK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'REAL_TIME',
        rule: 'MAX_LEVERAGE',
        status: 'FAILED',
        message: `Leverage limit breached during execution: ${metrics.leverage.toFixed(2)}x`,
        timestamp: Date.now(),
        exposureChange: 0,
        leverageImpact: metrics.leverage - limit.limit,
        concentrationRisk: 0,
        liquidityRisk: 0,
        limit: limit.limit,
        currentValue: metrics.leverage,
        utilizationPercentage: (metrics.leverage / limit.limit) * 100
      };
    }
    
    return null;
  }
  
  private getRiskMetrics(account: string): RiskMetrics {
    if (!this.riskMetrics.has(account)) {
      this.riskMetrics.set(account, {
        account,
        currentExposure: 0,
        dailyPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0,
        openPositions: 0,
        totalOrderValue: 0,
        leverage: 1,
        concentration: 0,
        orderRate: 0,
        lastUpdate: Date.now()
      });
    }
    return this.riskMetrics.get(account)!;
  }
  
  private updateRiskMetricsWithFill(account: string, order: Order, fill: OrderFill): void {
    const metrics = this.getRiskMetrics(account);
    
    // Update exposure
    const fillValue = fill.price * fill.quantity;
    metrics.currentExposure += order.side === 'BUY' ? fillValue : -fillValue;
    
    // Update P&L (simplified calculation)
    const pnl = order.side === 'BUY' ? 
      (fill.price - (order.price || fill.price)) * fill.quantity :
      ((order.price || fill.price) - fill.price) * fill.quantity;
    
    metrics.dailyPnL += pnl;
    metrics.weeklyPnL += pnl;
    metrics.monthlyPnL += pnl;
    
    metrics.lastUpdate = Date.now();
  }
  
  private storeRiskChecks(orderId: string, checks: RiskCheck[]): void {
    if (!this.riskHistory.has(orderId)) {
      this.riskHistory.set(orderId, []);
    }
    this.riskHistory.get(orderId)!.push(...checks);
  }
  
  private startRiskMonitoring(): void {
    // Start periodic risk monitoring
    setInterval(() => {
      this.performPeriodicRiskChecks();
    }, 30000); // Every 30 seconds
  }
  
  private performPeriodicRiskChecks(): void {
    // Perform periodic risk checks across all accounts
    for (const [account, metrics] of this.riskMetrics.entries()) {
      // Check for limit breaches
      this.checkAllLimits(account, metrics);
    }
  }
  
  private checkAllLimits(account: string, metrics: RiskMetrics): void {
    // Check all risk limits for the account
    for (const [limitId, limit] of this.riskLimits.entries()) {
      if (!limit.enabled) continue;
      
      // Perform appropriate check based on limit type
      switch (limit.type) {
        case 'DAILY_LOSS':
          if (metrics.dailyPnL < limit.limit) {
            this.triggerRiskBreach(account, limit, metrics.dailyPnL);
          }
          break;
        case 'POSITION_SIZE':
          if (metrics.currentExposure > limit.limit) {
            this.triggerRiskBreach(account, limit, metrics.currentExposure);
          }
          break;
        case 'LEVERAGE':
          if (metrics.leverage > limit.limit) {
            this.triggerRiskBreach(account, limit, metrics.leverage);
          }
          break;
      }
    }
  }
  
  private triggerRiskBreach(account: string, limit: RiskLimit, currentValue: number): void {
    console.warn(`Risk breach detected for ${account}: ${limit.name} - Current: ${currentValue}, Limit: ${limit.limit}`);
    // In production, this would trigger alerts, notifications, and potentially automatic actions
  }
  
  /**
   * Public API methods
   */
  
  public addRiskLimit(limit: RiskLimit): void {
    this.riskLimits.set(limit.id, limit);
  }
  
  public updateRiskLimit(limitId: string, updates: Partial<RiskLimit>): void {
    const existing = this.riskLimits.get(limitId);
    if (existing) {
      this.riskLimits.set(limitId, { ...existing, ...updates });
    }
  }
  
  public removeRiskLimit(limitId: string): void {
    this.riskLimits.delete(limitId);
  }
  
  public getRiskLimits(): RiskLimit[] {
    return Array.from(this.riskLimits.values());
  }
  
  public getRiskMetricsForAccount(account: string): RiskMetrics {
    return this.getRiskMetrics(account);
  }
  
  public getRiskHistory(orderId: string): RiskCheck[] {
    return this.riskHistory.get(orderId) || [];
  }
} 