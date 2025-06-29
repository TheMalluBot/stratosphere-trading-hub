import { EventEmitter } from 'events';
import {
  Order,
  OrderFill,
  OrderStatus
} from '@/types/orders.types';

interface FillAggregation {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  totalQuantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  averagePrice: number;
  totalValue: number;
  totalCommission: number;
  totalFees: number;
  fillCount: number;
  firstFillTime: number;
  lastFillTime: number;
  fills: OrderFill[];
  venues: Set<string>;
  isComplete: boolean;
}

interface FillStatistics {
  venue: string;
  symbol: string;
  fillCount: number;
  totalVolume: number;
  averageFillSize: number;
  averageFillTime: number;
  fillRate: number;
  priceImprovement: number;
  lastUpdate: number;
}

/**
 * Advanced Fill Management System
 * Handles order fill processing, aggregation, and analytics
 */
export class FillManager extends EventEmitter {
  private fillAggregations: Map<string, FillAggregation> = new Map();
  private fillHistory: OrderFill[] = [];
  private fillStatistics: Map<string, FillStatistics> = new Map();
  private partialFillTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Configuration
  private maxFillHistorySize: number = 10000;
  private partialFillTimeout: number = 300000; // 5 minutes
  private enableFillAggregation: boolean = true;
  
  constructor() {
    super();
    this.startPeriodicCleanup();
  }
  
  /**
   * Process a new order fill
   */
  public processFill(fill: OrderFill): void {
    try {
      // Validate fill
      this.validateFill(fill);
      
      // Store fill in history
      this.storeFill(fill);
      
      // Update fill aggregation
      this.updateFillAggregation(fill);
      
      // Update statistics
      this.updateFillStatistics(fill);
      
      // Handle partial fill timeout
      this.handlePartialFillTimeout(fill);
      
      // Emit fill event
      this.emit('fill', fill);
      
      // Check if order is complete
      const aggregation = this.fillAggregations.get(fill.orderId);
      if (aggregation?.isComplete) {
        this.emit('orderComplete', {
          orderId: fill.orderId,
          aggregation
        });
        
        // Clean up partial fill timeout
        this.clearPartialFillTimeout(fill.orderId);
      }
      
    } catch (error) {
      this.emit('fillError', {
        fill,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  private validateFill(fill: OrderFill): void {
    if (!fill.fillId || !fill.orderId) {
      throw new Error('Fill must have fillId and orderId');
    }
    
    if (!fill.venue) {
      throw new Error('Fill must specify venue');
    }
    
    if (fill.quantity <= 0) {
      throw new Error('Fill quantity must be positive');
    }
    
    if (fill.price <= 0) {
      throw new Error('Fill price must be positive');
    }
    
    if (!['BUY', 'SELL'].includes(fill.side)) {
      throw new Error('Fill side must be BUY or SELL');
    }
    
    // Check for duplicate fills
    const existingFill = this.fillHistory.find(f => f.fillId === fill.fillId);
    if (existingFill) {
      throw new Error(`Duplicate fill detected: ${fill.fillId}`);
    }
  }
  
  private storeFill(fill: OrderFill): void {
    this.fillHistory.push(fill);
    
    // Maintain history size limit
    if (this.fillHistory.length > this.maxFillHistorySize) {
      this.fillHistory.splice(0, this.fillHistory.length - this.maxFillHistorySize);
    }
  }
  
  private updateFillAggregation(fill: OrderFill): void {
    if (!this.enableFillAggregation) return;
    
    let aggregation = this.fillAggregations.get(fill.orderId);
    
    if (!aggregation) {
      // Create new aggregation
      aggregation = {
        orderId: fill.orderId,
        symbol: fill.symbol || 'UNKNOWN',
        side: fill.side,
        totalQuantity: 0, // Will be set when we have order info
        filledQuantity: 0,
        remainingQuantity: 0,
        averagePrice: 0,
        totalValue: 0,
        totalCommission: 0,
        totalFees: 0,
        fillCount: 0,
        firstFillTime: fill.timestamp,
        lastFillTime: fill.timestamp,
        fills: [],
        venues: new Set(),
        isComplete: false
      };
      
      this.fillAggregations.set(fill.orderId, aggregation);
    }
    
    // Update aggregation with new fill
    aggregation.fills.push(fill);
    aggregation.fillCount++;
    aggregation.filledQuantity += fill.quantity;
    aggregation.totalValue += fill.price * fill.quantity;
    aggregation.totalCommission += fill.commission;
    aggregation.totalFees += fill.fees;
    aggregation.lastFillTime = fill.timestamp;
    aggregation.venues.add(fill.venue);
    
    // Calculate weighted average price
    aggregation.averagePrice = aggregation.totalValue / aggregation.filledQuantity;
    
    // Update remaining quantity (if we know total quantity)
    if (aggregation.totalQuantity > 0) {
      aggregation.remainingQuantity = aggregation.totalQuantity - aggregation.filledQuantity;
      aggregation.isComplete = aggregation.remainingQuantity <= 0;
    }
  }
  
  private updateFillStatistics(fill: OrderFill): void {
    const key = `${fill.venue}_${fill.symbol || 'UNKNOWN'}`;
    let stats = this.fillStatistics.get(key);
    
    if (!stats) {
      stats = {
        venue: fill.venue,
        symbol: fill.symbol || 'UNKNOWN',
        fillCount: 0,
        totalVolume: 0,
        averageFillSize: 0,
        averageFillTime: 0,
        fillRate: 0,
        priceImprovement: 0,
        lastUpdate: Date.now()
      };
      
      this.fillStatistics.set(key, stats);
    }
    
    // Update statistics
    stats.fillCount++;
    stats.totalVolume += fill.price * fill.quantity;
    stats.averageFillSize = stats.totalVolume / stats.fillCount;
    stats.lastUpdate = Date.now();
    
    // Calculate price improvement if available
    if (fill.priceImprovement) {
      const totalImprovement = (stats.priceImprovement * (stats.fillCount - 1)) + fill.priceImprovement;
      stats.priceImprovement = totalImprovement / stats.fillCount;
    }
  }
  
  private handlePartialFillTimeout(fill: OrderFill): void {
    const aggregation = this.fillAggregations.get(fill.orderId);
    if (!aggregation || aggregation.isComplete) return;
    
    // Clear existing timeout
    this.clearPartialFillTimeout(fill.orderId);
    
    // Set new timeout for partial fill
    const timeout = setTimeout(() => {
      this.emit('partialFillTimeout', {
        orderId: fill.orderId,
        aggregation: this.fillAggregations.get(fill.orderId)
      });
    }, this.partialFillTimeout);
    
    this.partialFillTimeouts.set(fill.orderId, timeout);
  }
  
  private clearPartialFillTimeout(orderId: string): void {
    const timeout = this.partialFillTimeouts.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      this.partialFillTimeouts.delete(orderId);
    }
  }
  
  /**
   * Set the total quantity for an order (when order is created)
   */
  public setOrderQuantity(orderId: string, totalQuantity: number): void {
    const aggregation = this.fillAggregations.get(orderId);
    if (aggregation) {
      aggregation.totalQuantity = totalQuantity;
      aggregation.remainingQuantity = totalQuantity - aggregation.filledQuantity;
      aggregation.isComplete = aggregation.remainingQuantity <= 0;
    }
  }
  
  /**
   * Get fill aggregation for an order
   */
  public getFillAggregation(orderId: string): FillAggregation | undefined {
    return this.fillAggregations.get(orderId);
  }
  
  /**
   * Get all fills for an order
   */
  public getOrderFills(orderId: string): OrderFill[] {
    return this.fillHistory.filter(fill => fill.orderId === orderId);
  }
  
  /**
   * Get fills by venue
   */
  public getFillsByVenue(venue: string, limit?: number): OrderFill[] {
    const fills = this.fillHistory.filter(fill => fill.venue === venue);
    return limit ? fills.slice(-limit) : fills;
  }
  
  /**
   * Get fills by symbol
   */
  public getFillsBySymbol(symbol: string, limit?: number): OrderFill[] {
    const fills = this.fillHistory.filter(fill => fill.symbol === symbol);
    return limit ? fills.slice(-limit) : fills;
  }
  
  /**
   * Get fill statistics for venue/symbol combination
   */
  public getFillStatistics(venue?: string, symbol?: string): FillStatistics[] {
    const stats = Array.from(this.fillStatistics.values());
    
    return stats.filter(stat => {
      if (venue && stat.venue !== venue) return false;
      if (symbol && stat.symbol !== symbol) return false;
      return true;
    });
  }
  
  /**
   * Calculate fill rate for a venue
   */
  public calculateFillRate(venue: string, timeWindow?: number): number {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    
    const recentFills = this.fillHistory.filter(fill => 
      fill.venue === venue && fill.timestamp > windowStart
    );
    
    if (recentFills.length === 0) return 0;
    
    // Group fills by order
    const orderFills = new Map<string, OrderFill[]>();
    recentFills.forEach(fill => {
      if (!orderFills.has(fill.orderId)) {
        orderFills.set(fill.orderId, []);
      }
      orderFills.get(fill.orderId)!.push(fill);
    });
    
    // Calculate fill rate based on complete vs partial fills
    let completeOrders = 0;
    let totalOrders = orderFills.size;
    
    for (const [orderId, fills] of orderFills.entries()) {
      const aggregation = this.fillAggregations.get(orderId);
      if (aggregation?.isComplete) {
        completeOrders++;
      }
    }
    
    return totalOrders > 0 ? completeOrders / totalOrders : 0;
  }
  
  /**
   * Calculate average fill time for a venue
   */
  public calculateAverageFillTime(venue: string, timeWindow?: number): number {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    
    const recentAggregations = Array.from(this.fillAggregations.values()).filter(agg =>
      agg.venues.has(venue) && agg.lastFillTime > windowStart && agg.isComplete
    );
    
    if (recentAggregations.length === 0) return 0;
    
    const totalFillTime = recentAggregations.reduce((sum, agg) => 
      sum + (agg.lastFillTime - agg.firstFillTime), 0
    );
    
    return totalFillTime / recentAggregations.length;
  }
  
  /**
   * Get fill performance metrics
   */
  public getFillPerformanceMetrics(venue?: string, timeWindow?: number): {
    totalFills: number;
    totalVolume: number;
    averageFillSize: number;
    fillRate: number;
    averageFillTime: number;
    priceImprovement: number;
    venueBreakdown: Record<string, number>;
    symbolBreakdown: Record<string, number>;
  } {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    
    let fills = this.fillHistory.filter(fill => fill.timestamp > windowStart);
    if (venue) {
      fills = fills.filter(fill => fill.venue === venue);
    }
    
    const totalFills = fills.length;
    const totalVolume = fills.reduce((sum, fill) => sum + (fill.price * fill.quantity), 0);
    const averageFillSize = totalFills > 0 ? totalVolume / totalFills : 0;
    
    // Calculate price improvement
    const fillsWithImprovement = fills.filter(fill => fill.priceImprovement !== undefined);
    const avgPriceImprovement = fillsWithImprovement.length > 0 
      ? fillsWithImprovement.reduce((sum, fill) => sum + (fill.priceImprovement || 0), 0) / fillsWithImprovement.length
      : 0;
    
    // Venue breakdown
    const venueBreakdown: Record<string, number> = {};
    fills.forEach(fill => {
      venueBreakdown[fill.venue] = (venueBreakdown[fill.venue] || 0) + 1;
    });
    
    // Symbol breakdown
    const symbolBreakdown: Record<string, number> = {};
    fills.forEach(fill => {
      const symbol = fill.symbol || 'UNKNOWN';
      symbolBreakdown[symbol] = (symbolBreakdown[symbol] || 0) + 1;
    });
    
    return {
      totalFills,
      totalVolume,
      averageFillSize,
      fillRate: venue ? this.calculateFillRate(venue, timeWindow) : 0,
      averageFillTime: venue ? this.calculateAverageFillTime(venue, timeWindow) : 0,
      priceImprovement: avgPriceImprovement,
      venueBreakdown,
      symbolBreakdown
    };
  }
  
  /**
   * Handle order cancellation - mark aggregation as complete
   */
  public handleOrderCancellation(orderId: string): void {
    const aggregation = this.fillAggregations.get(orderId);
    if (aggregation) {
      aggregation.isComplete = true;
      this.clearPartialFillTimeout(orderId);
      
      this.emit('orderCancelled', {
        orderId,
        aggregation
      });
    }
  }
  
  /**
   * Handle order expiration
   */
  public handleOrderExpiration(orderId: string): void {
    const aggregation = this.fillAggregations.get(orderId);
    if (aggregation) {
      aggregation.isComplete = true;
      this.clearPartialFillTimeout(orderId);
      
      this.emit('orderExpired', {
        orderId,
        aggregation
      });
    }
  }
  
  /**
   * Get incomplete orders (orders with partial fills)
   */
  public getIncompleteOrders(): FillAggregation[] {
    return Array.from(this.fillAggregations.values()).filter(agg => 
      !agg.isComplete && agg.fillCount > 0
    );
  }
  
  /**
   * Get orders with no fills (may indicate routing issues)
   */
  public getUnfilledOrders(minAge: number = 60000): string[] {
    const cutoffTime = Date.now() - minAge;
    const unfilledOrders: string[] = [];
    
    for (const [orderId, aggregation] of this.fillAggregations.entries()) {
      if (aggregation.fillCount === 0 && aggregation.firstFillTime < cutoffTime) {
        unfilledOrders.push(orderId);
      }
    }
    
    return unfilledOrders;
  }
  
  /**
   * Clean up old aggregations and fills
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Every hour
  }
  
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean up old aggregations
    for (const [orderId, aggregation] of this.fillAggregations.entries()) {
      if (aggregation.isComplete && aggregation.lastFillTime < cutoffTime) {
        this.fillAggregations.delete(orderId);
        this.clearPartialFillTimeout(orderId);
      }
    }
    
    // Clean up old statistics
    for (const [key, stats] of this.fillStatistics.entries()) {
      if (stats.lastUpdate < cutoffTime) {
        this.fillStatistics.delete(key);
      }
    }
  }
  
  /**
   * Export fill data for analysis
   */
  public exportFillData(
    startDate?: number,
    endDate?: number,
    venue?: string,
    symbol?: string
  ): OrderFill[] {
    let fills = [...this.fillHistory];
    
    if (startDate) {
      fills = fills.filter(fill => fill.timestamp >= startDate);
    }
    
    if (endDate) {
      fills = fills.filter(fill => fill.timestamp <= endDate);
    }
    
    if (venue) {
      fills = fills.filter(fill => fill.venue === venue);
    }
    
    if (symbol) {
      fills = fills.filter(fill => fill.symbol === symbol);
    }
    
    return fills;
  }
  
  /**
   * Get fill summary for reporting
   */
  public getFillSummary(timeWindow?: number): {
    totalFills: number;
    totalVolume: number;
    totalCommissions: number;
    totalFees: number;
    uniqueOrders: number;
    completeOrders: number;
    partialOrders: number;
    averageOrderSize: number;
    averageCommissionRate: number;
    topVenues: Array<{ venue: string; fills: number; volume: number }>;
    topSymbols: Array<{ symbol: string; fills: number; volume: number }>;
  } {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const fills = this.fillHistory.filter(fill => fill.timestamp > windowStart);
    
    const totalFills = fills.length;
    const totalVolume = fills.reduce((sum, fill) => sum + (fill.price * fill.quantity), 0);
    const totalCommissions = fills.reduce((sum, fill) => sum + fill.commission, 0);
    const totalFees = fills.reduce((sum, fill) => sum + fill.fees, 0);
    
    const uniqueOrders = new Set(fills.map(fill => fill.orderId)).size;
    
    // Count complete vs partial orders
    const recentAggregations = Array.from(this.fillAggregations.values()).filter(agg =>
      agg.lastFillTime > windowStart
    );
    
    const completeOrders = recentAggregations.filter(agg => agg.isComplete).length;
    const partialOrders = recentAggregations.filter(agg => !agg.isComplete && agg.fillCount > 0).length;
    
    const averageOrderSize = uniqueOrders > 0 ? totalVolume / uniqueOrders : 0;
    const averageCommissionRate = totalVolume > 0 ? totalCommissions / totalVolume : 0;
    
    // Top venues
    const venueStats = new Map<string, { fills: number; volume: number }>();
    fills.forEach(fill => {
      const stats = venueStats.get(fill.venue) || { fills: 0, volume: 0 };
      stats.fills++;
      stats.volume += fill.price * fill.quantity;
      venueStats.set(fill.venue, stats);
    });
    
    const topVenues = Array.from(venueStats.entries())
      .map(([venue, stats]) => ({ venue, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
    
    // Top symbols
    const symbolStats = new Map<string, { fills: number; volume: number }>();
    fills.forEach(fill => {
      const symbol = fill.symbol || 'UNKNOWN';
      const stats = symbolStats.get(symbol) || { fills: 0, volume: 0 };
      stats.fills++;
      stats.volume += fill.price * fill.quantity;
      symbolStats.set(symbol, stats);
    });
    
    const topSymbols = Array.from(symbolStats.entries())
      .map(([symbol, stats]) => ({ symbol, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
    
    return {
      totalFills,
      totalVolume,
      totalCommissions,
      totalFees,
      uniqueOrders,
      completeOrders,
      partialOrders,
      averageOrderSize,
      averageCommissionRate,
      topVenues,
      topSymbols
    };
  }
} 