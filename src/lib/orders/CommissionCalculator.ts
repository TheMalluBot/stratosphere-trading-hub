import {
  CommissionStructure,
  CommissionTier,
  CommissionCalculation,
  CommissionBreakdown,
  OrderFill
} from '@/types/orders.types';

interface VolumeTracker {
  account: string;
  venue: string;
  monthlyVolume: number;
  monthlyTrades: number;
  currentTier: number;
  lastUpdate: number;
  resetDate: number;
}

/**
 * Advanced Commission Calculator
 * Handles complex fee structures, tiers, rebates, and regulatory fees
 */
export class CommissionCalculator {
  private commissionStructures: Map<string, CommissionStructure> = new Map();
  private volumeTrackers: Map<string, VolumeTracker> = new Map();
  private feeHistory: Map<string, CommissionCalculation[]> = new Map();
  
  constructor() {
    this.initializeCommissionStructures();
    this.startMonthlyReset();
  }
  
  private initializeCommissionStructures(): void {
    // MEXC Commission Structure
    const mexcStructure: CommissionStructure = {
      venue: 'MEXC',
      assetClass: 'CRYPTO',
      tiers: [
        { volumeThreshold: 0, rate: 0.002, rebateRate: 0 },
        { volumeThreshold: 100000, rate: 0.0018, rebateRate: 0.0001 },
        { volumeThreshold: 500000, rate: 0.0016, rebateRate: 0.0002 },
        { volumeThreshold: 1000000, rate: 0.0014, rebateRate: 0.0003 },
        { volumeThreshold: 5000000, rate: 0.0012, rebateRate: 0.0004 },
        { volumeThreshold: 10000000, rate: 0.001, rebateRate: 0.0005 }
      ],
      makerFee: 0.002,
      takerFee: 0.002,
      regulatoryFee: 0,
      clearingFee: 0,
      makerRebate: 0,
      liquidityRebate: 0,
      minimumCommission: 0.01,
      maximumCommission: 1000,
      currency: 'USDT',
      effectiveFrom: Date.now(),
      effectiveTo: undefined
    };
    
    // Binance Commission Structure
    const binanceStructure: CommissionStructure = {
      venue: 'BINANCE',
      assetClass: 'CRYPTO',
      tiers: [
        { volumeThreshold: 0, rate: 0.001, rebateRate: 0 },
        { volumeThreshold: 50000, rate: 0.0009, rebateRate: 0.0001 },
        { volumeThreshold: 200000, rate: 0.0008, rebateRate: 0.0002 },
        { volumeThreshold: 500000, rate: 0.0007, rebateRate: 0.0003 },
        { volumeThreshold: 1000000, rate: 0.0006, rebateRate: 0.0004 },
        { volumeThreshold: 2000000, rate: 0.0005, rebateRate: 0.0005 }
      ],
      makerFee: 0.001,
      takerFee: 0.001,
      regulatoryFee: 0,
      clearingFee: 0,
      makerRebate: 0,
      liquidityRebate: 0,
      minimumCommission: 0.01,
      maximumCommission: 1000,
      currency: 'USDT',
      effectiveFrom: Date.now(),
      effectiveTo: undefined
    };
    
    // Interactive Brokers Structure (for traditional assets)
    const ibStructure: CommissionStructure = {
      venue: 'INTERACTIVE_BROKERS',
      assetClass: 'EQUITY',
      tiers: [
        { volumeThreshold: 0, rate: 0.005, flatFee: 1.0, rebateRate: 0 },
        { volumeThreshold: 300000, rate: 0.003, flatFee: 1.0, rebateRate: 0.001 },
        { volumeThreshold: 3000000, rate: 0.002, flatFee: 1.0, rebateRate: 0.002 },
        { volumeThreshold: 20000000, rate: 0.0015, flatFee: 1.0, rebateRate: 0.003 },
        { volumeThreshold: 100000000, rate: 0.001, flatFee: 1.0, rebateRate: 0.004 }
      ],
      makerFee: 0.0035,
      takerFee: 0.0035,
      regulatoryFee: 0.000119, // SEC fee
      clearingFee: 0.00002, // NSCC fee
      makerRebate: 0.0015,
      liquidityRebate: 0.002,
      minimumCommission: 1.0,
      maximumCommission: 0.01, // 1% of trade value
      currency: 'USD',
      effectiveFrom: Date.now(),
      effectiveTo: undefined
    };
    
    this.commissionStructures.set('MEXC', mexcStructure);
    this.commissionStructures.set('BINANCE', binanceStructure);
    this.commissionStructures.set('INTERACTIVE_BROKERS', ibStructure);
  }
  
  /**
   * Calculate commission for an order fill
   */
  public calculateCommission(
    fill: OrderFill,
    account: string,
    liquidityFlag: 'MAKER' | 'TAKER' = 'TAKER'
  ): CommissionCalculation {
    const structure = this.commissionStructures.get(fill.venue);
    if (!structure) {
      throw new Error(`No commission structure found for venue: ${fill.venue}`);
    }
    
    const volumeTracker = this.getVolumeTracker(account, fill.venue);
    const notionalValue = fill.price * fill.quantity;
    
    // Determine current tier
    const currentTier = this.getCurrentTier(structure, volumeTracker.monthlyVolume);
    
    // Calculate base commission
    const baseCommission = this.calculateBaseCommission(
      structure,
      currentTier,
      notionalValue,
      liquidityFlag
    );
    
    // Calculate rebates
    const rebates = this.calculateRebates(
      structure,
      currentTier,
      notionalValue,
      liquidityFlag
    );
    
    // Calculate regulatory fees
    const regulatoryFees = this.calculateRegulatoryFees(structure, notionalValue);
    
    // Calculate clearing fees
    const clearingFees = this.calculateClearingFees(structure, notionalValue);
    
    // Apply minimum and maximum limits
    const totalCommission = Math.max(
      structure.minimumCommission,
      Math.min(
        structure.maximumCommission,
        baseCommission + regulatoryFees + clearingFees - rebates
      )
    );
    
    const netCommission = totalCommission - rebates;
    
    // Create breakdown
    const breakdown: CommissionBreakdown[] = [
      {
        type: 'BASE_COMMISSION',
        description: `${liquidityFlag} fee at tier ${currentTier.volumeThreshold}`,
        amount: baseCommission,
        currency: structure.currency,
        rate: currentTier.rate,
        basis: notionalValue
      }
    ];
    
    if (rebates > 0) {
      breakdown.push({
        type: 'REBATE',
        description: 'Volume rebate',
        amount: -rebates,
        currency: structure.currency,
        rate: currentTier.rebateRate,
        basis: notionalValue
      });
    }
    
    if (regulatoryFees > 0) {
      breakdown.push({
        type: 'REGULATORY_FEE',
        description: 'Regulatory fees',
        amount: regulatoryFees,
        currency: structure.currency,
        rate: structure.regulatoryFee,
        basis: notionalValue
      });
    }
    
    if (clearingFees > 0) {
      breakdown.push({
        type: 'CLEARING_FEE',
        description: 'Clearing fees',
        amount: clearingFees,
        currency: structure.currency,
        rate: structure.clearingFee,
        basis: notionalValue
      });
    }
    
    const calculation: CommissionCalculation = {
      orderId: fill.orderId,
      venue: fill.venue,
      notionalValue,
      commissionRate: currentTier.rate,
      baseCommission,
      volumeDiscount: 0, // Could be calculated based on tier progression
      rebates,
      regulatoryFees,
      clearingFees,
      totalCommission,
      netCommission,
      breakdown
    };
    
    // Update volume tracker
    this.updateVolumeTracker(account, fill.venue, notionalValue);
    
    // Store calculation
    this.storeFeeCalculation(account, calculation);
    
    return calculation;
  }
  
  private getCurrentTier(structure: CommissionStructure, monthlyVolume: number): CommissionTier {
    const sortedTiers = [...structure.tiers].sort((a, b) => b.volumeThreshold - a.volumeThreshold);
    
    for (const tier of sortedTiers) {
      if (monthlyVolume >= tier.volumeThreshold) {
        return tier;
      }
    }
    
    return structure.tiers[0]; // Default to first tier
  }
  
  private calculateBaseCommission(
    structure: CommissionStructure,
    tier: CommissionTier,
    notionalValue: number,
    liquidityFlag: 'MAKER' | 'TAKER'
  ): number {
    let commission = 0;
    
    // Use tier rate or maker/taker rates
    if (liquidityFlag === 'MAKER' && structure.makerFee > 0) {
      commission = notionalValue * structure.makerFee;
    } else if (liquidityFlag === 'TAKER' && structure.takerFee > 0) {
      commission = notionalValue * structure.takerFee;
    } else {
      commission = notionalValue * tier.rate;
    }
    
    // Add flat fee if applicable
    if (tier.flatFee) {
      commission += tier.flatFee;
    }
    
    return commission;
  }
  
  private calculateRebates(
    structure: CommissionStructure,
    tier: CommissionTier,
    notionalValue: number,
    liquidityFlag: 'MAKER' | 'TAKER'
  ): number {
    let rebates = 0;
    
    // Tier-based rebates
    if (tier.rebateRate && tier.rebateRate > 0) {
      rebates += notionalValue * tier.rebateRate;
    }
    
    // Maker rebates
    if (liquidityFlag === 'MAKER' && structure.makerRebate > 0) {
      rebates += notionalValue * structure.makerRebate;
    }
    
    // Liquidity rebates
    if (structure.liquidityRebate > 0) {
      rebates += notionalValue * structure.liquidityRebate;
    }
    
    return rebates;
  }
  
  private calculateRegulatoryFees(structure: CommissionStructure, notionalValue: number): number {
    return notionalValue * structure.regulatoryFee;
  }
  
  private calculateClearingFees(structure: CommissionStructure, notionalValue: number): number {
    return notionalValue * structure.clearingFee;
  }
  
  private getVolumeTracker(account: string, venue: string): VolumeTracker {
    const key = `${account}_${venue}`;
    
    if (!this.volumeTrackers.has(key)) {
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
      
      this.volumeTrackers.set(key, {
        account,
        venue,
        monthlyVolume: 0,
        monthlyTrades: 0,
        currentTier: 0,
        lastUpdate: Date.now(),
        resetDate
      });
    }
    
    return this.volumeTrackers.get(key)!;
  }
  
  private updateVolumeTracker(account: string, venue: string, tradeValue: number): void {
    const tracker = this.getVolumeTracker(account, venue);
    
    tracker.monthlyVolume += tradeValue;
    tracker.monthlyTrades += 1;
    tracker.lastUpdate = Date.now();
    
    // Update current tier
    const structure = this.commissionStructures.get(venue);
    if (structure) {
      const tier = this.getCurrentTier(structure, tracker.monthlyVolume);
      tracker.currentTier = tier.volumeThreshold;
    }
  }
  
  private storeFeeCalculation(account: string, calculation: CommissionCalculation): void {
    if (!this.feeHistory.has(account)) {
      this.feeHistory.set(account, []);
    }
    
    this.feeHistory.get(account)!.push(calculation);
    
    // Keep only last 1000 calculations per account
    const history = this.feeHistory.get(account)!;
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }
  
  private startMonthlyReset(): void {
    // Check for monthly reset every hour
    setInterval(() => {
      this.checkMonthlyReset();
    }, 3600000); // 1 hour
  }
  
  private checkMonthlyReset(): void {
    const now = Date.now();
    
    for (const [key, tracker] of this.volumeTrackers.entries()) {
      if (now >= tracker.resetDate) {
        // Reset monthly volume
        tracker.monthlyVolume = 0;
        tracker.monthlyTrades = 0;
        tracker.currentTier = 0;
        
        // Set next reset date
        const nextMonth = new Date(tracker.resetDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        tracker.resetDate = nextMonth.getTime();
      }
    }
  }
  
  /**
   * Get fee estimate for a potential trade
   */
  public estimateCommission(
    venue: string,
    account: string,
    notionalValue: number,
    liquidityFlag: 'MAKER' | 'TAKER' = 'TAKER'
  ): number {
    const structure = this.commissionStructures.get(venue);
    if (!structure) {
      throw new Error(`No commission structure found for venue: ${venue}`);
    }
    
    const volumeTracker = this.getVolumeTracker(account, venue);
    const currentTier = this.getCurrentTier(structure, volumeTracker.monthlyVolume);
    
    const baseCommission = this.calculateBaseCommission(
      structure,
      currentTier,
      notionalValue,
      liquidityFlag
    );
    
    const rebates = this.calculateRebates(
      structure,
      currentTier,
      notionalValue,
      liquidityFlag
    );
    
    const regulatoryFees = this.calculateRegulatoryFees(structure, notionalValue);
    const clearingFees = this.calculateClearingFees(structure, notionalValue);
    
    return Math.max(
      structure.minimumCommission,
      Math.min(
        structure.maximumCommission,
        baseCommission + regulatoryFees + clearingFees - rebates
      )
    );
  }
  
  /**
   * Get monthly statistics for an account
   */
  public getMonthlyStats(account: string, venue?: string): any {
    const stats: any = {};
    
    for (const [key, tracker] of this.volumeTrackers.entries()) {
      if (tracker.account === account && (!venue || tracker.venue === venue)) {
        stats[tracker.venue] = {
          monthlyVolume: tracker.monthlyVolume,
          monthlyTrades: tracker.monthlyTrades,
          currentTier: tracker.currentTier,
          nextTierThreshold: this.getNextTierThreshold(tracker.venue, tracker.monthlyVolume),
          volumeToNextTier: this.getVolumeToNextTier(tracker.venue, tracker.monthlyVolume)
        };
      }
    }
    
    return stats;
  }
  
  private getNextTierThreshold(venue: string, currentVolume: number): number {
    const structure = this.commissionStructures.get(venue);
    if (!structure) return 0;
    
    const sortedTiers = [...structure.tiers].sort((a, b) => a.volumeThreshold - b.volumeThreshold);
    
    for (const tier of sortedTiers) {
      if (currentVolume < tier.volumeThreshold) {
        return tier.volumeThreshold;
      }
    }
    
    return 0; // Already at highest tier
  }
  
  private getVolumeToNextTier(venue: string, currentVolume: number): number {
    const nextTier = this.getNextTierThreshold(venue, currentVolume);
    return nextTier > 0 ? nextTier - currentVolume : 0;
  }
  
  /**
   * Get fee history for an account
   */
  public getFeeHistory(account: string, days?: number): CommissionCalculation[] {
    const history = this.feeHistory.get(account) || [];
    
    if (!days) return history;
    
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history.filter(calc => {
      // Note: We'd need to add timestamp to CommissionCalculation type in production
      return true; // For now, return all
    });
  }
  
  /**
   * Add or update commission structure
   */
  public setCommissionStructure(structure: CommissionStructure): void {
    this.commissionStructures.set(structure.venue, structure);
  }
  
  /**
   * Get commission structure for a venue
   */
  public getCommissionStructure(venue: string): CommissionStructure | undefined {
    return this.commissionStructures.get(venue);
  }
  
  /**
   * Calculate total fees for a period
   */
  public calculatePeriodFees(
    account: string,
    startDate: number,
    endDate: number,
    venue?: string
  ): {
    totalCommissions: number;
    totalRebates: number;
    netFees: number;
    tradeCount: number;
    averageCommission: number;
    breakdown: Record<string, number>;
  } {
    const history = this.feeHistory.get(account) || [];
    
    const filteredHistory = history.filter(calc => {
      // In production, we'd filter by date and venue
      return !venue || calc.venue === venue;
    });
    
    const totalCommissions = filteredHistory.reduce((sum, calc) => sum + calc.totalCommission, 0);
    const totalRebates = filteredHistory.reduce((sum, calc) => sum + calc.rebates, 0);
    const netFees = totalCommissions - totalRebates;
    const tradeCount = filteredHistory.length;
    const averageCommission = tradeCount > 0 ? totalCommissions / tradeCount : 0;
    
    const breakdown: Record<string, number> = {};
    filteredHistory.forEach(calc => {
      if (!breakdown[calc.venue]) {
        breakdown[calc.venue] = 0;
      }
      breakdown[calc.venue] += calc.netCommission;
    });
    
    return {
      totalCommissions,
      totalRebates,
      netFees,
      tradeCount,
      averageCommission,
      breakdown
    };
  }
} 