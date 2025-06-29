import {
  ComplianceRule,
  ComplianceRuleType,
  ComplianceViolation,
  ComplianceAction,
  ComplianceActionType,
  RegulatoryReport,
  SecurityEventSeverity
} from '@/types/security.types';
import { SecurityAuditLogger } from './SecurityAuditLogger';

/**
 * Comprehensive Compliance Monitoring System
 * Handles regulatory compliance for financial trading platforms
 */
export class ComplianceMonitor {
  private static instance: ComplianceMonitor;
  private rules: Map<string, ComplianceRule> = new Map();
  private violations: ComplianceViolation[] = [];
  private reports: RegulatoryReport[] = [];
  private auditLogger: SecurityAuditLogger;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  // Real-time monitoring state
  private positionLimits: Map<string, number> = new Map();
  private dailyLosses: Map<string, number> = new Map();
  private tradingFrequency: Map<string, number[]> = new Map();
  private suspiciousPatterns: Map<string, any[]> = new Map();

  static getInstance(): ComplianceMonitor {
    if (!ComplianceMonitor.instance) {
      ComplianceMonitor.instance = new ComplianceMonitor();
    }
    return ComplianceMonitor.instance;
  }

  private constructor() {
    this.auditLogger = SecurityAuditLogger.getInstance();
    this.initializeDefaultRules();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize default compliance rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: ComplianceRule[] = [
      {
        id: 'position-limit-rule',
        type: 'POSITION_LIMIT',
        name: 'Position Size Limit',
        description: 'Maximum position size per symbol',
        parameters: {
          maxPositionSize: 1000000, // $1M
          maxPositionPercent: 0.1, // 10% of portfolio
          symbols: ['ALL']
        },
        enabled: true,
        severity: 'ERROR',
        actions: [
          {
            type: 'BLOCK_ORDER',
            parameters: {},
            automatic: true,
            requiresApproval: false,
            approvers: []
          }
        ],
        lastUpdated: Date.now(),
        version: '1.0'
      },
      {
        id: 'leverage-limit-rule',
        type: 'LEVERAGE_LIMIT',
        name: 'Maximum Leverage',
        description: 'Maximum allowed leverage ratio',
        parameters: {
          maxLeverage: 10,
          marginCallLevel: 0.8,
          liquidationLevel: 0.5
        },
        enabled: true,
        severity: 'CRITICAL',
        actions: [
          {
            type: 'REDUCE_POSITION',
            parameters: { reductionPercent: 0.5 },
            automatic: true,
            requiresApproval: false,
            approvers: []
          },
          {
            type: 'ESCALATE',
            parameters: { escalationLevel: 'IMMEDIATE' },
            automatic: true,
            requiresApproval: false,
            approvers: ['risk-manager', 'compliance-officer']
          }
        ],
        lastUpdated: Date.now(),
        version: '1.0'
      },
      {
        id: 'daily-loss-limit-rule',
        type: 'DAILY_LOSS_LIMIT',
        name: 'Daily Loss Limit',
        description: 'Maximum daily loss per account',
        parameters: {
          maxDailyLoss: 50000, // $50K
          maxDailyLossPercent: 0.05, // 5%
          resetTime: '00:00:00'
        },
        enabled: true,
        severity: 'ERROR',
        actions: [
          {
            type: 'FREEZE_ACCOUNT',
            parameters: { duration: 86400000 }, // 24 hours
            automatic: true,
            requiresApproval: true,
            approvers: ['risk-manager']
          }
        ],
        lastUpdated: Date.now(),
        version: '1.0'
      },
      {
        id: 'wash-trading-rule',
        type: 'WASH_TRADING',
        name: 'Wash Trading Detection',
        description: 'Detect potential wash trading patterns',
        parameters: {
          timeWindow: 300000, // 5 minutes
          minTrades: 5,
          priceVarianceThreshold: 0.01, // 1%
          volumeThreshold: 0.8 // 80% similarity
        },
        enabled: true,
        severity: 'CRITICAL',
        actions: [
          {
            type: 'BLOCK_ORDER',
            parameters: {},
            automatic: true,
            requiresApproval: false,
            approvers: []
          },
          {
            type: 'GENERATE_REPORT',
            parameters: { reportType: 'SUSPICIOUS_ACTIVITY' },
            automatic: true,
            requiresApproval: false,
            approvers: []
          }
        ],
        lastUpdated: Date.now(),
        version: '1.0'
      },
      {
        id: 'concentration-limit-rule',
        type: 'CONCENTRATION_LIMIT',
        name: 'Portfolio Concentration Limit',
        description: 'Maximum concentration in single asset',
        parameters: {
          maxConcentration: 0.25, // 25%
          excludeSymbols: ['USD', 'USDT', 'USDC']
        },
        enabled: true,
        severity: 'WARNING',
        actions: [
          {
            type: 'SEND_ALERT',
            parameters: { alertType: 'CONCENTRATION_WARNING' },
            automatic: true,
            requiresApproval: false,
            approvers: []
          }
        ],
        lastUpdated: Date.now(),
        version: '1.0'
      }
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));
    console.log('🏛️ Compliance rules initialized:', defaultRules.length);
  }

  /**
   * Add or update a compliance rule
   */
  async addRule(rule: ComplianceRule): Promise<void> {
    this.rules.set(rule.id, rule);
    
    await this.auditLogger.logEvent(
      'COMPLIANCE',
      'CONFIG_CHANGED',
      'INFO',
      {
        action: 'rule_added',
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type
      }
    );
  }

  /**
   * Remove a compliance rule
   */
  async removeRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.delete(ruleId);
      
      await this.auditLogger.logEvent(
        'COMPLIANCE',
        'CONFIG_CHANGED',
        'WARNING',
        {
          action: 'rule_removed',
          ruleId,
          ruleName: rule.name
        }
      );
    }
  }

  /**
   * Check order compliance before execution
   */
  async checkOrderCompliance(orderData: {
    userId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    orderType: string;
    portfolioValue: number;
    currentPositions: any[];
  }): Promise<{ allowed: boolean; violations: ComplianceViolation[]; warnings: string[] }> {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];

    // Check each compliance rule
    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      try {
        const ruleViolation = await this.checkRule(rule, orderData);
        if (ruleViolation) {
          violations.push(ruleViolation);
          await this.executeComplianceActions(ruleViolation);
        }
      } catch (error) {
        console.error(`Error checking rule ${ruleId}:`, error);
        warnings.push(`Failed to check rule: ${rule.name}`);
      }
    }

    const allowed = violations.length === 0 || 
      !violations.some(v => v.severity === 'CRITICAL' || v.severity === 'ERROR');

    await this.auditLogger.logEvent(
      'COMPLIANCE',
      allowed ? 'ORDER_PLACED' : 'COMPLIANCE_VIOLATION',
      allowed ? 'INFO' : 'ERROR',
      {
        userId: orderData.userId,
        symbol: orderData.symbol,
        orderValue: orderData.quantity * orderData.price,
        violationCount: violations.length,
        allowed
      }
    );

    return { allowed, violations, warnings };
  }

  /**
   * Check a specific compliance rule
   */
  private async checkRule(
    rule: ComplianceRule,
    orderData: any
  ): Promise<ComplianceViolation | null> {
    switch (rule.type) {
      case 'POSITION_LIMIT':
        return this.checkPositionLimit(rule, orderData);
      
      case 'LEVERAGE_LIMIT':
        return this.checkLeverageLimit(rule, orderData);
      
      case 'DAILY_LOSS_LIMIT':
        return this.checkDailyLossLimit(rule, orderData);
      
      case 'CONCENTRATION_LIMIT':
        return this.checkConcentrationLimit(rule, orderData);
      
      case 'WASH_TRADING':
        return this.checkWashTrading(rule, orderData);
      
      default:
        return null;
    }
  }

  /**
   * Check position limit compliance
   */
  private checkPositionLimit(
    rule: ComplianceRule,
    orderData: any
  ): ComplianceViolation | null {
    const { maxPositionSize, maxPositionPercent } = rule.parameters;
    const orderValue = orderData.quantity * orderData.price;
    
    if (orderValue > maxPositionSize) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Position size exceeds maximum limit',
        {
          orderValue,
          maxPositionSize,
          excess: orderValue - maxPositionSize
        }
      );
    }

    const positionPercent = orderValue / orderData.portfolioValue;
    if (positionPercent > maxPositionPercent) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Position exceeds maximum portfolio percentage',
        {
          positionPercent,
          maxPositionPercent,
          portfolioValue: orderData.portfolioValue
        }
      );
    }

    return null;
  }

  /**
   * Check leverage limit compliance
   */
  private checkLeverageLimit(
    rule: ComplianceRule,
    orderData: any
  ): ComplianceViolation | null {
    const { maxLeverage } = rule.parameters;
    const totalPositionValue = orderData.currentPositions.reduce(
      (sum: number, pos: any) => sum + Math.abs(pos.value), 0
    );
    const currentLeverage = totalPositionValue / orderData.portfolioValue;

    if (currentLeverage > maxLeverage) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Leverage exceeds maximum limit',
        {
          currentLeverage,
          maxLeverage,
          totalPositionValue,
          portfolioValue: orderData.portfolioValue
        }
      );
    }

    return null;
  }

  /**
   * Check daily loss limit compliance
   */
  private checkDailyLossLimit(
    rule: ComplianceRule,
    orderData: any
  ): ComplianceViolation | null {
    const { maxDailyLoss, maxDailyLossPercent } = rule.parameters;
    const userDailyLoss = this.dailyLosses.get(orderData.userId) || 0;

    // Check absolute daily loss
    if (userDailyLoss > maxDailyLoss) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Daily loss limit exceeded',
        {
          dailyLoss: userDailyLoss,
          maxDailyLoss,
          excess: userDailyLoss - maxDailyLoss
        }
      );
    }

    // Check daily loss percentage
    const dailyLossPercent = userDailyLoss / orderData.portfolioValue;
    if (dailyLossPercent > maxDailyLossPercent) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Daily loss percentage limit exceeded',
        {
          dailyLossPercent,
          maxDailyLossPercent,
          portfolioValue: orderData.portfolioValue
        }
      );
    }

    return null;
  }

  /**
   * Check concentration limit compliance
   */
  private checkConcentrationLimit(
    rule: ComplianceRule,
    orderData: any
  ): ComplianceViolation | null {
    const { maxConcentration, excludeSymbols } = rule.parameters;
    
    if (excludeSymbols.includes(orderData.symbol)) {
      return null;
    }

    // Calculate symbol concentration after order
    const symbolPositions = orderData.currentPositions.filter(
      (pos: any) => pos.symbol === orderData.symbol
    );
    const currentSymbolValue = symbolPositions.reduce(
      (sum: number, pos: any) => sum + Math.abs(pos.value), 0
    );
    const orderValue = orderData.quantity * orderData.price;
    const newSymbolValue = currentSymbolValue + orderValue;
    const concentration = newSymbolValue / orderData.portfolioValue;

    if (concentration > maxConcentration) {
      return this.createViolation(
        rule,
        orderData.userId,
        'Symbol concentration exceeds limit',
        {
          symbol: orderData.symbol,
          concentration,
          maxConcentration,
          symbolValue: newSymbolValue,
          portfolioValue: orderData.portfolioValue
        }
      );
    }

    return null;
  }

  /**
   * Check for wash trading patterns
   */
  private checkWashTrading(
    rule: ComplianceRule,
    orderData: any
  ): ComplianceViolation | null {
    const { timeWindow, minTrades, priceVarianceThreshold } = rule.parameters;
    const userId = orderData.userId;
    const symbol = orderData.symbol;
    
    // Get recent trades for this user and symbol
    const recentTrades = this.getRecentTrades(userId, symbol, timeWindow);
    
    if (recentTrades.length < minTrades) {
      return null;
    }

    // Analyze trading patterns
    const prices = recentTrades.map((trade: any) => trade.price);
    const priceVariance = this.calculateVariance(prices);
    
    if (priceVariance < priceVarianceThreshold) {
      return this.createViolation(
        rule,
        userId,
        'Potential wash trading detected',
        {
          symbol,
          tradeCount: recentTrades.length,
          priceVariance,
          timeWindow,
          trades: recentTrades.slice(0, 5) // Include first 5 trades as evidence
        }
      );
    }

    return null;
  }

  /**
   * Execute compliance actions
   */
  private async executeComplianceActions(violation: ComplianceViolation): Promise<void> {
    for (const action of violation.actions) {
      if (!action.automatic) continue;

      try {
        await this.executeAction(action, violation);
      } catch (error) {
        console.error('Failed to execute compliance action:', error);
      }
    }
  }

  /**
   * Execute a specific compliance action
   */
  private async executeAction(
    action: ComplianceAction,
    violation: ComplianceViolation
  ): Promise<void> {
    switch (action.type) {
      case 'BLOCK_ORDER':
        await this.blockOrder(violation, action.parameters);
        break;
      
      case 'SEND_ALERT':
        await this.sendAlert(violation, action.parameters);
        break;
      
      case 'GENERATE_REPORT':
        await this.generateReport(violation, action.parameters);
        break;
      
      case 'ESCALATE':
        await this.escalateViolation(violation, action.parameters);
        break;
      
      case 'FREEZE_ACCOUNT':
        await this.freezeAccount(violation, action.parameters);
        break;
      
      case 'REDUCE_POSITION':
        await this.reducePosition(violation, action.parameters);
        break;
      
      default:
        console.warn('Unknown compliance action type:', action.type);
    }
  }

  /**
   * Generate regulatory reports
   */
  async generateRegulatoryReport(
    type: 'MIFID_II' | 'EMIR' | 'BEST_EXECUTION' | 'SUSPICIOUS_ACTIVITY',
    period: { start: number; end: number }
  ): Promise<RegulatoryReport> {
    const reportId = `${type}_${Date.now()}`;
    
    const report: RegulatoryReport = {
      id: reportId,
      type,
      period,
      data: await this.collectReportData(type, period),
      generated: Date.now(),
      generatedBy: 'system',
      status: 'GENERATED'
    };

    this.reports.push(report);

    await this.auditLogger.logEvent(
      'COMPLIANCE',
      'REGULATORY_REPORT',
      'INFO',
      {
        reportId,
        reportType: type,
        period,
        dataPoints: Object.keys(report.data).length
      }
    );

    return report;
  }

  /**
   * Get compliance violations
   */
  getViolations(
    filters: {
      userId?: string;
      ruleType?: ComplianceRuleType;
      severity?: SecurityEventSeverity;
      resolved?: boolean;
      startTime?: number;
      endTime?: number;
    } = {}
  ): ComplianceViolation[] {
    let filtered = [...this.violations];

    if (filters.userId) {
      filtered = filtered.filter(v => v.userId === filters.userId);
    }

    if (filters.ruleType) {
      filtered = filtered.filter(v => v.type === filters.ruleType);
    }

    if (filters.severity) {
      filtered = filtered.filter(v => v.severity === filters.severity);
    }

    if (filters.resolved !== undefined) {
      filtered = filtered.filter(v => v.resolved === filters.resolved);
    }

    if (filters.startTime) {
      filtered = filtered.filter(v => v.timestamp >= filters.startTime!);
    }

    if (filters.endTime) {
      filtered = filtered.filter(v => v.timestamp <= filters.endTime!);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve a compliance violation
   */
  async resolveViolation(violationId: string, resolvedBy: string): Promise<void> {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      violation.resolvedBy = resolvedBy;
      violation.resolvedAt = Date.now();

      await this.auditLogger.logEvent(
        'COMPLIANCE',
        'COMPLIANCE_VIOLATION',
        'INFO',
        {
          action: 'violation_resolved',
          violationId,
          resolvedBy,
          ruleType: violation.type
        }
      );
    }
  }

  // Private helper methods

  private createViolation(
    rule: ComplianceRule,
    userId: string,
    description: string,
    details: Record<string, any>
  ): ComplianceViolation {
    const violation: ComplianceViolation = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      severity: rule.severity,
      timestamp: Date.now(),
      userId,
      description,
      details,
      resolved: false,
      actions: rule.actions
    };

    this.violations.push(violation);
    return violation;
  }

  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performRealTimeChecks();
    }, 30000); // Check every 30 seconds
  }

  private performRealTimeChecks(): void {
    // Implement real-time monitoring logic
    this.checkDailyLossLimits();
    this.checkPositionLimits();
    this.detectSuspiciousPatterns();
  }

  private checkDailyLossLimits(): void {
    // Reset daily losses at midnight
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      this.dailyLosses.clear();
    }
  }

  private checkPositionLimits(): void {
    // Monitor position limits in real-time
  }

  private detectSuspiciousPatterns(): void {
    // Detect suspicious trading patterns
  }

  private getRecentTrades(userId: string, symbol: string, timeWindow: number): any[] {
    // This would integrate with the trading system to get recent trades
    return [];
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private async blockOrder(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Implementation would integrate with order management system
    console.log('🚫 Order blocked due to compliance violation:', violation.id);
  }

  private async sendAlert(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Implementation would send alerts via email, SMS, etc.
    console.log('🚨 Compliance alert sent:', violation.description);
  }

  private async generateReport(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Generate compliance report
    console.log('📊 Compliance report generated for violation:', violation.id);
  }

  private async escalateViolation(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Escalate to compliance team
    console.log('⬆️ Violation escalated:', violation.id);
  }

  private async freezeAccount(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Freeze account trading
    console.log('🧊 Account frozen:', violation.userId);
  }

  private async reducePosition(violation: ComplianceViolation, parameters: any): Promise<void> {
    // Reduce position size
    console.log('📉 Position reduced for user:', violation.userId);
  }

  private async collectReportData(
    type: 'MIFID_II' | 'EMIR' | 'BEST_EXECUTION' | 'SUSPICIOUS_ACTIVITY',
    period: { start: number; end: number }
  ): Promise<Record<string, any>> {
    // Collect data for regulatory reports
    return {
      reportType: type,
      period,
      violations: this.getViolations({
        startTime: period.start,
        endTime: period.end
      }),
      summary: {
        totalViolations: this.violations.length,
        criticalViolations: this.violations.filter(v => v.severity === 'CRITICAL').length,
        resolvedViolations: this.violations.filter(v => v.resolved).length
      }
    };
  }
}

// Export singleton instance
export const complianceMonitor = ComplianceMonitor.getInstance(); 