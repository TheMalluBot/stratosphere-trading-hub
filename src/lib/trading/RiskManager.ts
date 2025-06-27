
import { StrategyExecutionConfig } from './TradingEngine';

export interface RiskValidation {
  approved: boolean;
  reason?: string;
  recommendedPositionSize?: number;
}

export class RiskManager {
  private maxRiskPercent = 0.1; // 10% max risk
  private maxCapital = 1000000; // 10 lakh max capital

  validateRisk(config: StrategyExecutionConfig): RiskValidation {
    // Basic risk checks
    if (config.capital <= 0) {
      return { approved: false, reason: 'Capital must be positive' };
    }

    if (config.capital > this.maxCapital) {
      return { approved: false, reason: `Capital cannot exceed ₹${this.maxCapital.toLocaleString()}` };
    }

    if (config.riskPercent > this.maxRiskPercent) {
      return { approved: false, reason: `Risk percentage cannot exceed ${this.maxRiskPercent * 100}%` };
    }

    // For now, only allow paper trading
    if (!config.paperMode) {
      return { approved: false, reason: 'Real trading not yet enabled - paper mode only' };
    }

    return { approved: true };
  }

  calculatePositionSize(config: StrategyExecutionConfig, signalStrength: number): number {
    const maxPositionSize = config.capital * config.riskPercent;
    return maxPositionSize * signalStrength;
  }
}
