import { 
  Position, 
  Order, 
  MarketData, 
  Portfolio,
  Balance,
  TradingError 
} from '@/types/trading.types';

/**
 * Professional Position Calculator
 * Handles P&L calculations, margin requirements, and position analytics
 */
export class PositionCalculator {
  private static instance: PositionCalculator;
  private positions: Map<string, Position> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private commissionRates: Map<string, number> = new Map();
  
  // Configuration
  private readonly DEFAULT_COMMISSION_RATE = 0.001; // 0.1%
  private readonly FUNDING_RATE_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours

  static getInstance(): PositionCalculator {
    if (!PositionCalculator.instance) {
      PositionCalculator.instance = new PositionCalculator();
    }
    return PositionCalculator.instance;
  }

  private constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Set default commission rates
    this.commissionRates.set('SPOT', 0.001);
    this.commissionRates.set('FUTURES', 0.0004);
    this.commissionRates.set('MARGIN', 0.001);
    
    console.log('📊 Position Calculator initialized');
  }

  /**
   * Update market data for position calculations
   */
  updateMarketData(symbol: string, data: MarketData): void {
    this.marketData.set(symbol, data);
    
    // Update position P&L if position exists
    const position = this.positions.get(symbol);
    if (position) {
      this.updatePositionPnL(position, data.price);
    }
  }

  /**
   * Create or update position from order fill
   */
  updatePositionFromOrder(order: Order, fillPrice: number, fillQuantity: number): Position {
    const existingPosition = this.positions.get(order.symbol);
    
    if (!existingPosition) {
      // Create new position
      const position = this.createNewPosition(order, fillPrice, fillQuantity);
      this.positions.set(order.symbol, position);
      return position;
    } else {
      // Update existing position
      return this.updateExistingPosition(existingPosition, order, fillPrice, fillQuantity);
    }
  }

  /**
   * Calculate unrealized P&L for a position
   */
  calculateUnrealizedPnL(position: Position, currentPrice?: number): number {
    const markPrice = currentPrice || this.getMarkPrice(position.symbol);
    if (!markPrice) return 0;

    const priceDiff = position.side === 'LONG' 
      ? markPrice - position.entryPrice
      : position.entryPrice - markPrice;
    
    return priceDiff * position.size;
  }

  /**
   * Calculate realized P&L from order execution
   */
  calculateRealizedPnL(
    position: Position, 
    exitPrice: number, 
    exitQuantity: number
  ): number {
    const priceDiff = position.side === 'LONG'
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice;
    
    return priceDiff * exitQuantity;
  }

  /**
   * Calculate position value
   */
  calculatePositionValue(position: Position, currentPrice?: number): number {
    const markPrice = currentPrice || this.getMarkPrice(position.symbol);
    return markPrice ? markPrice * position.size : 0;
  }

  /**
   * Calculate required margin for position
   */
  calculateRequiredMargin(
    symbol: string,
    size: number,
    price: number,
    leverage: number = 1
  ): number {
    const positionValue = price * size;
    const baseMargin = positionValue / leverage;
    
    // Add additional margin requirements based on volatility, liquidity, etc.
    const volatilityMultiplier = this.getVolatilityMultiplier(symbol);
    const liquidityMultiplier = this.getLiquidityMultiplier(symbol);
    
    return baseMargin * volatilityMultiplier * liquidityMultiplier;
  }

  /**
   * Calculate maintenance margin
   */
  calculateMaintenanceMargin(position: Position): number {
    const positionValue = this.calculatePositionValue(position);
    const baseMaintenanceRate = 0.005; // 0.5% base rate
    
    // Adjust based on position size and market conditions
    const sizeMultiplier = this.getSizeMultiplier(position.size);
    const volatilityMultiplier = this.getVolatilityMultiplier(position.symbol);
    
    return positionValue * baseMaintenanceRate * sizeMultiplier * volatilityMultiplier;
  }

  /**
   * Calculate liquidation price
   */
  calculateLiquidationPrice(position: Position): number {
    const maintenanceMargin = this.calculateMaintenanceMargin(position);
    const positionValue = this.calculatePositionValue(position);
    
    if (position.side === 'LONG') {
      // Long liquidation: entry price - (margin - maintenance margin) / size
      return position.entryPrice - (position.margin - maintenanceMargin) / position.size;
    } else {
      // Short liquidation: entry price + (margin - maintenance margin) / size
      return position.entryPrice + (position.margin - maintenanceMargin) / position.size;
    }
  }

  /**
   * Calculate break-even price including fees
   */
  calculateBreakEvenPrice(position: Position): number {
    const commissionRate = this.getCommissionRate(position.symbol);
    const totalCommission = position.entryPrice * position.size * commissionRate * 2; // Entry + Exit
    const commissionPerUnit = totalCommission / position.size;
    
    if (position.side === 'LONG') {
      return position.entryPrice + commissionPerUnit;
    } else {
      return position.entryPrice - commissionPerUnit;
    }
  }

  /**
   * Calculate position percentage return
   */
  calculatePositionReturn(position: Position, currentPrice?: number): number {
    const markPrice = currentPrice || this.getMarkPrice(position.symbol);
    if (!markPrice) return 0;

    const unrealizedPnL = this.calculateUnrealizedPnL(position, markPrice);
    const positionValue = position.entryPrice * position.size;
    
    return (unrealizedPnL / positionValue) * 100;
  }

  /**
   * Calculate portfolio metrics
   */
  calculatePortfolioMetrics(positions: Position[]): {
    totalValue: number;
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    totalMargin: number;
    marginUtilization: number;
    largestPosition: number;
    positionCount: number;
    longPositions: number;
    shortPositions: number;
  } {
    let totalValue = 0;
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;
    let totalMargin = 0;
    let largestPosition = 0;
    let longPositions = 0;
    let shortPositions = 0;

    positions.forEach(position => {
      const positionValue = this.calculatePositionValue(position);
      const unrealizedPnL = this.calculateUnrealizedPnL(position);
      
      totalValue += positionValue;
      totalUnrealizedPnL += unrealizedPnL;
      totalRealizedPnL += position.realizedPnl;
      totalMargin += position.margin;
      
      if (positionValue > largestPosition) {
        largestPosition = positionValue;
      }
      
      if (position.side === 'LONG') {
        longPositions++;
      } else {
        shortPositions++;
      }
    });

    return {
      totalValue,
      totalUnrealizedPnL,
      totalRealizedPnL,
      totalMargin,
      marginUtilization: totalValue > 0 ? (totalMargin / totalValue) * 100 : 0,
      largestPosition,
      positionCount: positions.length,
      longPositions,
      shortPositions
    };
  }

  /**
   * Calculate position sizing based on risk parameters
   */
  calculateOptimalPositionSize(
    symbol: string,
    entryPrice: number,
    stopLossPrice: number,
    riskAmount: number,
    maxPositionValue?: number
  ): {
    quantity: number;
    positionValue: number;
    riskPercentage: number;
    stopLossDistance: number;
  } {
    const stopLossDistance = Math.abs(entryPrice - stopLossPrice);
    const maxQuantityByRisk = riskAmount / stopLossDistance;
    
    let quantity = maxQuantityByRisk;
    
    // Apply position value limit if specified
    if (maxPositionValue) {
      const maxQuantityByValue = maxPositionValue / entryPrice;
      quantity = Math.min(quantity, maxQuantityByValue);
    }
    
    const positionValue = quantity * entryPrice;
    const actualRisk = quantity * stopLossDistance;
    const riskPercentage = positionValue > 0 ? (actualRisk / positionValue) * 100 : 0;

    return {
      quantity,
      positionValue,
      riskPercentage,
      stopLossDistance
    };
  }

  /**
   * Calculate correlation between positions
   */
  calculatePositionCorrelation(symbol1: string, symbol2: string): number {
    // Simplified correlation calculation
    // In practice, this would use historical price data
    const position1 = this.positions.get(symbol1);
    const position2 = this.positions.get(symbol2);
    
    if (!position1 || !position2) return 0;
    
    // Return mock correlation for demonstration
    // Real implementation would calculate based on price movements
    return 0.5;
  }

  /**
   * Get position by symbol
   */
  getPosition(symbol: string): Position | undefined {
    return this.positions.get(symbol);
  }

  /**
   * Get all positions
   */
  getAllPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  /**
   * Get positions by side
   */
  getPositionsBySide(side: 'LONG' | 'SHORT'): Position[] {
    return Array.from(this.positions.values())
      .filter(position => position.side === side);
  }

  /**
   * Close position
   */
  closePosition(symbol: string, exitPrice: number): Position | null {
    const position = this.positions.get(symbol);
    if (!position) return null;

    // Calculate final realized P&L
    const realizedPnL = this.calculateRealizedPnL(position, exitPrice, position.size);
    position.realizedPnl += realizedPnL;
    position.size = 0;
    position.unrealizedPnl = 0;

    // Remove from active positions
    this.positions.delete(symbol);
    
    return position;
  }

  // Private helper methods

  private createNewPosition(order: Order, fillPrice: number, fillQuantity: number): Position {
    const side = order.side === 'BUY' ? 'LONG' : 'SHORT';
    const commission = this.calculateCommission(order.symbol, fillPrice, fillQuantity);
    
    return {
      symbol: order.symbol,
      side,
      size: fillQuantity,
      entryPrice: fillPrice,
      markPrice: fillPrice,
      unrealizedPnl: 0,
      realizedPnl: -commission, // Commission is realized cost
      percentage: 0,
      leverage: 1, // Default leverage
      margin: fillPrice * fillQuantity, // For spot trading
      maintenanceMargin: 0,
      marginRatio: 0,
      liquidationPrice: 0,
      breakEvenPrice: this.calculateBreakEvenPriceFromEntry(fillPrice, fillQuantity, commission, side),
      timestamp: Date.now(),
      duration: 0
    };
  }

  private updateExistingPosition(
    position: Position, 
    order: Order, 
    fillPrice: number, 
    fillQuantity: number
  ): Position {
    const orderSide = order.side === 'BUY' ? 'LONG' : 'SHORT';
    const commission = this.calculateCommission(order.symbol, fillPrice, fillQuantity);
    
    if (position.side === orderSide) {
      // Adding to position
      const totalValue = (position.entryPrice * position.size) + (fillPrice * fillQuantity);
      const totalSize = position.size + fillQuantity;
      
      position.entryPrice = totalValue / totalSize;
      position.size = totalSize;
      position.margin += fillPrice * fillQuantity;
      position.realizedPnl -= commission;
    } else {
      // Reducing or reversing position
      if (fillQuantity >= position.size) {
        // Position reversal or closure
        const realizedPnL = this.calculateRealizedPnL(position, fillPrice, position.size);
        position.realizedPnl += realizedPnL - commission;
        
        if (fillQuantity > position.size) {
          // Reverse position
          const remainingQuantity = fillQuantity - position.size;
          position.side = orderSide;
          position.size = remainingQuantity;
          position.entryPrice = fillPrice;
          position.margin = fillPrice * remainingQuantity;
        } else {
          // Close position
          position.size = 0;
          position.unrealizedPnl = 0;
        }
      } else {
        // Partial reduction
        const realizedPnL = this.calculateRealizedPnL(position, fillPrice, fillQuantity);
        position.realizedPnl += realizedPnL - commission;
        position.size -= fillQuantity;
        position.margin -= (position.margin / position.size) * fillQuantity;
      }
    }
    
    // Update break-even price
    if (position.size > 0) {
      position.breakEvenPrice = this.calculateBreakEvenPrice(position);
    }
    
    return position;
  }

  private updatePositionPnL(position: Position, currentPrice: number): void {
    position.markPrice = currentPrice;
    position.unrealizedPnl = this.calculateUnrealizedPnL(position, currentPrice);
    position.percentage = this.calculatePositionReturn(position, currentPrice);
    position.duration = Date.now() - position.timestamp;
    
    // Update margin ratio
    const maintenanceMargin = this.calculateMaintenanceMargin(position);
    position.maintenanceMargin = maintenanceMargin;
    position.marginRatio = position.margin > 0 ? maintenanceMargin / position.margin : 0;
    
    // Update liquidation price
    position.liquidationPrice = this.calculateLiquidationPrice(position);
  }

  private calculateCommission(symbol: string, price: number, quantity: number): number {
    const rate = this.getCommissionRate(symbol);
    return price * quantity * rate;
  }

  private calculateBreakEvenPriceFromEntry(
    entryPrice: number, 
    quantity: number, 
    commission: number, 
    side: 'LONG' | 'SHORT'
  ): number {
    const commissionPerUnit = commission / quantity;
    
    if (side === 'LONG') {
      return entryPrice + commissionPerUnit;
    } else {
      return entryPrice - commissionPerUnit;
    }
  }

  private getMarkPrice(symbol: string): number {
    const marketData = this.marketData.get(symbol);
    return marketData ? marketData.price : 0;
  }

  private getCommissionRate(symbol: string): number {
    // Determine commission rate based on symbol type
    if (symbol.includes('PERP') || symbol.includes('FUTURES')) {
      return this.commissionRates.get('FUTURES') || this.DEFAULT_COMMISSION_RATE;
    }
    return this.commissionRates.get('SPOT') || this.DEFAULT_COMMISSION_RATE;
  }

  private getVolatilityMultiplier(symbol: string): number {
    // Calculate volatility multiplier based on historical data
    // For now, return a default value
    return 1.0;
  }

  private getLiquidityMultiplier(symbol: string): number {
    // Calculate liquidity multiplier based on order book depth
    // For now, return a default value
    return 1.0;
  }

  private getSizeMultiplier(size: number): number {
    // Increase margin requirements for larger positions
    if (size > 1000000) return 1.5;
    if (size > 100000) return 1.2;
    return 1.0;
  }

  /**
   * Set commission rate for asset type
   */
  setCommissionRate(assetType: string, rate: number): void {
    this.commissionRates.set(assetType, rate);
  }

  /**
   * Clear all positions (for testing or reset)
   */
  clearPositions(): void {
    this.positions.clear();
  }

  /**
   * Get position statistics
   */
  getPositionStatistics(): {
    totalPositions: number;
    longPositions: number;
    shortPositions: number;
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    bestPerformer: { symbol: string; pnl: number } | null;
    worstPerformer: { symbol: string; pnl: number } | null;
  } {
    const positions = this.getAllPositions();
    const longPositions = positions.filter(p => p.side === 'LONG').length;
    const shortPositions = positions.filter(p => p.side === 'SHORT').length;
    
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;
    let bestPerformer: { symbol: string; pnl: number } | null = null;
    let worstPerformer: { symbol: string; pnl: number } | null = null;

    positions.forEach(position => {
      totalUnrealizedPnL += position.unrealizedPnl;
      totalRealizedPnL += position.realizedPnl;
      
      const totalPnL = position.unrealizedPnl + position.realizedPnl;
      
      if (!bestPerformer || totalPnL > bestPerformer.pnl) {
        bestPerformer = { symbol: position.symbol, pnl: totalPnL };
      }
      
      if (!worstPerformer || totalPnL < worstPerformer.pnl) {
        worstPerformer = { symbol: position.symbol, pnl: totalPnL };
      }
    });

    return {
      totalPositions: positions.length,
      longPositions,
      shortPositions,
      totalUnrealizedPnL,
      totalRealizedPnL,
      bestPerformer,
      worstPerformer
    };
  }
} 