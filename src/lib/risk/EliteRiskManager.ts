
import { StrategySignal } from '@/types/strategy';

export interface RiskConfig {
  maxPortfolioVAR: number;
  maxSinglePositionRisk: number;
  kellyFraction: number;
  riskFreeRate: number;
  confidenceLevel: number;
}

export interface PositionSizing {
  signal: StrategySignal;
  positionSize: number;
  riskContribution: number;
  kellyFraction: number;
  varConstraint: number;
  riskParityWeight: number;
}

export class EliteRiskManager {
  private config: RiskConfig;
  private correlationMatrix: number[][];
  private volatilityEstimates: Map<string, number>;

  constructor(config: Partial<RiskConfig> = {}) {
    this.config = {
      maxPortfolioVAR: config.maxPortfolioVAR || 0.02, // 2% daily VAR
      maxSinglePositionRisk: config.maxSinglePositionRisk || 0.005, // 0.5%
      kellyFraction: config.kellyFraction || 0.25, // Max 25% Kelly
      riskFreeRate: config.riskFreeRate || 0.02, // 2% annual
      confidenceLevel: config.confidenceLevel || 0.95 // 95% confidence
    };
    
    this.correlationMatrix = [];
    this.volatilityEstimates = new Map();
  }

  calculateOptimalPositionSizes(
    signals: StrategySignal[],
    portfolioValue: number,
    marketData?: any[]
  ): PositionSizing[] {
    if (signals.length === 0) return [];

    // Step 1: Calculate individual Kelly fractions
    const kellyPositions = signals.map(signal => ({
      signal,
      kellyFraction: this.calculateKellyFraction(signal),
      volatility: this.estimateVolatility(signal)
    }));

    // Step 2: Apply VAR constraints
    const varConstrainedPositions = kellyPositions.map(pos => ({
      ...pos,
      varConstraint: this.calculateVARConstrainedSize(pos.kellyFraction, pos.volatility, portfolioValue)
    }));

    // Step 3: Apply risk parity adjustments
    const riskParityPositions = this.applyRiskParity(varConstrainedPositions, portfolioValue);

    // Step 4: Final portfolio optimization
    return this.optimizePortfolioRisk(riskParityPositions, portfolioValue);
  }

  private calculateKellyFraction(signal: StrategySignal): number {
    // Extract or estimate probabilities from signal metadata
    const winProbability = signal.strength; // Use signal strength as proxy for win probability
    const expectedReturn = signal.metadata?.expectedReturn || 0.02; // Default 2%
    const expectedLoss = 0.015; // Estimated average loss
    
    // Kelly fraction = (bp - q) / b
    // where b = odds received, p = win probability, q = loss probability
    const b = expectedReturn / expectedLoss;
    const p = winProbability;
    const q = 1 - p;
    
    const kellyFraction = (b * p - q) / b;
    
    // Apply safety constraints
    return Math.min(Math.max(kellyFraction, 0), this.config.kellyFraction);
  }

  private estimateVolatility(signal: StrategySignal): number {
    // Use cached volatility or estimate from signal metadata
    const symbolVol = this.volatilityEstimates.get(signal.metadata?.symbol || 'default');
    if (symbolVol) return symbolVol;
    
    // Default volatility estimates by signal type/strength
    const baseVolatility = 0.02; // 2% daily volatility
    const strengthAdjustment = (1 - signal.strength) * 0.01; // Higher strength = lower vol assumption
    
    return baseVolatility + strengthAdjustment;
  }

  private calculateVARConstrainedSize(
    kellyFraction: number,
    volatility: number,
    portfolioValue: number
  ): number {
    // Calculate position size based on Kelly fraction
    const kellyPositionValue = portfolioValue * kellyFraction;
    
    // Calculate position VAR at given confidence level
    const zScore = this.getZScore(this.config.confidenceLevel);
    const positionVAR = kellyPositionValue * volatility * zScore;
    
    // Ensure position VAR doesn't exceed single position limit
    const maxPositionValue = (this.config.maxSinglePositionRisk * portfolioValue) / (volatility * zScore);
    
    return Math.min(kellyPositionValue, maxPositionValue);
  }

  private applyRiskParity(
    positions: Array<{ signal: StrategySignal; kellyFraction: number; volatility: number; varConstraint: number }>,
    portfolioValue: number
  ): Array<{ signal: StrategySignal; kellyFraction: number; volatility: number; varConstraint: number; riskParityWeight: number }> {
    
    // Calculate inverse volatility weights for risk parity
    const totalInverseVol = positions.reduce((sum, pos) => sum + (1 / pos.volatility), 0);
    
    return positions.map(pos => ({
      ...pos,
      riskParityWeight: (1 / pos.volatility) / totalInverseVol
    }));
  }

  private optimizePortfolioRisk(
    positions: Array<{ 
      signal: StrategySignal; 
      kellyFraction: number; 
      volatility: number; 
      varConstraint: number; 
      riskParityWeight: number 
    }>,
    portfolioValue: number
  ): PositionSizing[] {
    
    const result: PositionSizing[] = [];
    let totalRiskBudgetUsed = 0;
    
    // Sort positions by risk-adjusted expected return
    const sortedPositions = positions.sort((a, b) => {
      const returnA = (a.signal.metadata?.expectedReturn || 0.02) / a.volatility;
      const returnB = (b.signal.metadata?.expectedReturn || 0.02) / b.volatility;
      return returnB - returnA;
    });
    
    for (const pos of sortedPositions) {
      // Calculate final position size using multiple constraints
      const kellySize = portfolioValue * pos.kellyFraction;
      const varSize = pos.varConstraint;
      const riskParitySize = portfolioValue * pos.riskParityWeight * 0.5; // Scale down for diversification
      
      // Take the minimum of all constraints
      const positionSize = Math.min(kellySize, varSize, riskParitySize);
      
      // Calculate risk contribution
      const riskContribution = this.calculateRiskContribution(positionSize, pos.volatility, portfolioValue);
      
      // Check if adding this position exceeds portfolio VAR limit
      if (totalRiskBudgetUsed + riskContribution <= this.config.maxPortfolioVAR) {
        result.push({
          signal: pos.signal,
          positionSize,
          riskContribution,
          kellyFraction: pos.kellyFraction,
          varConstraint: pos.varConstraint,
          riskParityWeight: pos.riskParityWeight
        });
        
        totalRiskBudgetUsed += riskContribution;
      }
    }
    
    return result;
  }

  private calculateRiskContribution(
    positionSize: number,
    volatility: number,
    portfolioValue: number
  ): number {
    const positionWeight = positionSize / portfolioValue;
    return positionWeight * volatility;
  }

  private getZScore(confidenceLevel: number): number {
    // Approximate z-scores for common confidence levels
    const zScores: Record<string, number> = {
      '0.90': 1.28,
      '0.95': 1.645,
      '0.99': 2.326
    };
    
    const key = confidenceLevel.toFixed(2);
    return zScores[key] || 1.645; // Default to 95%
  }

  // Portfolio-level risk metrics
  calculatePortfolioVAR(positions: PositionSizing[], portfolioValue: number): number {
    const totalRisk = positions.reduce((sum, pos) => sum + pos.riskContribution, 0);
    return totalRisk * portfolioValue;
  }

  calculateSharpeRatio(returns: number[], riskFreeRate: number = this.config.riskFreeRate): number {
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatilityFromReturns(returns);
    
    return volatility > 0 ? (avgReturn - riskFreeRate / 252) / volatility : 0;
  }

  calculateMaxDrawdown(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = equityCurve[0];
    
    for (const value of equityCurve) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  private calculateVolatilityFromReturns(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized
  }

  // Update correlation matrix for multi-asset risk management
  updateCorrelationMatrix(correlations: number[][]): void {
    this.correlationMatrix = correlations;
  }

  // Update volatility estimates
  updateVolatilityEstimate(symbol: string, volatility: number): void {
    this.volatilityEstimates.set(symbol, volatility);
  }
}
