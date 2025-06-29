/**
 * Risk management utilities for trading applications
 */

import { Position } from '../../services/portfolioManager';

// Risk calculation types
export interface RiskParameters {
  stopLossPrice?: number;
  takeProfitPrice?: number;
  maxLossPercentage?: number;
  maxPositionSizePercentage?: number;
  maxDrawdownPercentage?: number;
}

export interface RiskMetrics {
  riskRewardRatio: number;
  potentialProfit: number;
  potentialLoss: number;
  positionSizeRecommendation: number;
  maxPositionSize: number;
  riskScore: number; // 1-100 scale, higher means more risky
}

export interface AccountRiskMetrics {
  portfolioVolatility: number;
  valueAtRisk: number; // 95% confidence VaR
  maxDrawdown: number;
  sharpeRatio: number;
  diversificationScore: number; // 0-100 scale, higher means more diversified
  overallRiskScore: number; // 1-100 scale, higher means more risky
}

/**
 * Calculate risk metrics for a potential trade
 * 
 * @param symbol - Trading symbol
 * @param entryPrice - Entry price for the trade
 * @param quantity - Quantity to trade
 * @param accountValue - Total account value
 * @param riskParams - Risk parameters for the trade
 * @returns Risk metrics for the trade
 */
export const calculateTradeRisk = (
  symbol: string,
  entryPrice: number,
  quantity: number,
  accountValue: number,
  riskParams: RiskParameters
): RiskMetrics => {
  // Default risk parameters if not provided
  const {
    stopLossPrice = entryPrice * 0.95, // Default 5% stop loss
    takeProfitPrice = entryPrice * 1.15, // Default 15% take profit
    maxLossPercentage = 2, // Default max 2% loss per trade
    maxPositionSizePercentage = 10, // Default max 10% of account in one position
    maxDrawdownPercentage = 20, // Default max 20% drawdown
  } = riskParams;

  // Calculate potential profit and loss
  const tradeValue = entryPrice * quantity;
  const potentialProfit = (takeProfitPrice - entryPrice) * quantity;
  const potentialLoss = (entryPrice - stopLossPrice) * quantity;
  
  // Calculate risk-reward ratio
  const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;
  
  // Calculate position size recommendation based on risk parameters
  const maxLossAmount = (accountValue * maxLossPercentage) / 100;
  const priceRiskPerUnit = entryPrice - stopLossPrice;
  const recommendedQuantity = priceRiskPerUnit > 0 ? maxLossAmount / priceRiskPerUnit : 0;
  
  // Calculate maximum position size based on account percentage
  const maxPositionSize = (accountValue * maxPositionSizePercentage) / 100;
  
  // Calculate risk score (1-100)
  const positionSizeRisk = Math.min(100, (tradeValue / accountValue) * 100 * 5); // 5x multiplier
  const riskRewardRisk = Math.min(100, riskRewardRatio < 1 ? 100 : 100 / riskRewardRatio);
  const volatilityRisk = 50; // Placeholder - would use historical volatility data
  
  const riskScore = Math.min(
    100,
    (positionSizeRisk * 0.4) + (riskRewardRisk * 0.4) + (volatilityRisk * 0.2)
  );
  
  return {
    riskRewardRatio,
    potentialProfit,
    potentialLoss,
    positionSizeRecommendation: recommendedQuantity,
    maxPositionSize,
    riskScore
  };
};

/**
 * Calculate portfolio-wide risk metrics
 * 
 * @param positions - Current portfolio positions
 * @param accountValue - Total account value
 * @returns Account risk metrics
 */
export const calculatePortfolioRisk = (
  positions: Position[],
  accountValue: number
): AccountRiskMetrics => {
  // Calculate concentration in top positions
  const sortedPositions = [...positions].sort((a, b) => b.value - a.value);
  const topPositionsValue = sortedPositions.slice(0, 3).reduce((sum, pos) => sum + pos.value, 0);
  const topPositionsPercentage = (topPositionsValue / accountValue) * 100;
  
  // Calculate diversification score
  const uniqueAssets = new Set(positions.map(p => p.asset)).size;
  const diversificationScore = Math.min(
    100,
    (uniqueAssets / Math.max(1, positions.length)) * 50 + (100 - Math.min(100, topPositionsPercentage))
  ) / 2;
  
  // Placeholder for more sophisticated metrics that would use historical data
  const portfolioVolatility = 15; // Annualized volatility percentage
  const valueAtRisk = accountValue * 0.05; // Simple 5% VaR approximation
  const maxDrawdown = accountValue * 0.15; // Estimated from historical data
  const sharpeRatio = 1.2; // (Return - Risk Free Rate) / Volatility
  
  // Calculate overall risk score
  const concentrationRisk = Math.min(100, topPositionsPercentage * 2);
  const volatilityRisk = Math.min(100, portfolioVolatility * 3);
  const diversificationRisk = 100 - diversificationScore;
  
  const overallRiskScore = Math.min(
    100,
    (concentrationRisk * 0.4) + (volatilityRisk * 0.4) + (diversificationRisk * 0.2)
  );
  
  return {
    portfolioVolatility,
    valueAtRisk,
    maxDrawdown,
    sharpeRatio,
    diversificationScore,
    overallRiskScore
  };
};

/**
 * Calculate position sizing based on risk parameters
 * 
 * @param entryPrice - Entry price for the trade
 * @param stopLossPrice - Stop loss price
 * @param accountValue - Total account value
 * @param riskPercentage - Percentage of account to risk (1-100)
 * @returns Recommended position size
 */
export const calculatePositionSize = (
  entryPrice: number,
  stopLossPrice: number,
  accountValue: number,
  riskPercentage: number = 2
): number => {
  if (entryPrice <= stopLossPrice) {
    throw new Error('Stop loss price must be lower than entry price for long positions');
  }
  
  const riskAmount = (accountValue * riskPercentage) / 100;
  const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
  
  return riskAmount / riskPerUnit;
};

/**
 * Check if a trade meets risk management criteria
 * 
 * @param symbol - Trading symbol
 * @param entryPrice - Entry price for the trade
 * @param quantity - Quantity to trade
 * @param accountValue - Total account value
 * @param currentPositions - Current portfolio positions
 * @param riskParams - Risk parameters for the trade
 * @returns Object with validation result and reason if invalid
 */
export const validateTrade = (
  symbol: string,
  entryPrice: number,
  quantity: number,
  accountValue: number,
  currentPositions: Position[],
  riskParams: RiskParameters
): { valid: boolean; reason?: string } => {
  const tradeValue = entryPrice * quantity;
  
  // Check if trade exceeds maximum position size
  const maxPositionSize = (accountValue * (riskParams.maxPositionSizePercentage || 10)) / 100;
  if (tradeValue > maxPositionSize) {
    return {
      valid: false,
      reason: `Trade value (${tradeValue.toFixed(2)}) exceeds maximum position size (${maxPositionSize.toFixed(2)})`
    };
  }
  
  // Check if adding this position would exceed maximum concentration
  const existingPosition = currentPositions.find(p => p.symbol === symbol);
  const totalPositionValue = tradeValue + (existingPosition?.value || 0);
  if (totalPositionValue > maxPositionSize * 1.5) {
    return {
      valid: false,
      reason: `Total position in ${symbol} (${totalPositionValue.toFixed(2)}) would exceed concentration limits`
    };
  }
  
  // Check risk-reward ratio if stop loss and take profit are provided
  if (riskParams.stopLossPrice && riskParams.takeProfitPrice) {
    const potentialProfit = (riskParams.takeProfitPrice - entryPrice) * quantity;
    const potentialLoss = (entryPrice - riskParams.stopLossPrice) * quantity;
    const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;
    
    if (riskRewardRatio < 1.5) {
      return {
        valid: false,
        reason: `Risk-reward ratio (${riskRewardRatio.toFixed(2)}) is below minimum threshold of 1.5`
      };
    }
  }
  
  return { valid: true };
};
