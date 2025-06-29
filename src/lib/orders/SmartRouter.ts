import {
  Order,
  OrderRequest,
  RoutingDecision,
  VenueAllocation,
  VenueAnalytics,
  VenueType
} from '@/types/orders.types';

interface RoutingAlgorithm {
  name: string;
  route(order: Order, request: OrderRequest, venues: VenueAnalytics[]): Promise<RoutingDecision>;
}

/**
 * Smart Order Routing System
 * Implements intelligent routing algorithms for optimal execution
 */
export class SmartRouter {
  private venueAnalytics: Map<string, VenueAnalytics> = new Map();
  private routingAlgorithms: Map<string, RoutingAlgorithm> = new Map();
  private defaultAlgorithm: string = 'BEST_EXECUTION';
  
  constructor() {
    this.initializeAlgorithms();
    this.loadVenueAnalytics();
  }
  
  private initializeAlgorithms(): void {
    // Best Execution Algorithm
    this.routingAlgorithms.set('BEST_EXECUTION', {
      name: 'Best Execution',
      route: this.bestExecutionRoute.bind(this)
    });
    
    // Liquidity Seeking Algorithm
    this.routingAlgorithms.set('LIQUIDITY_SEEKING', {
      name: 'Liquidity Seeking',
      route: this.liquiditySeekingRoute.bind(this)
    });
    
    // Cost Minimization Algorithm
    this.routingAlgorithms.set('COST_MINIMIZATION', {
      name: 'Cost Minimization',
      route: this.costMinimizationRoute.bind(this)
    });
    
    // Latency Optimization Algorithm
    this.routingAlgorithms.set('LATENCY_OPTIMIZATION', {
      name: 'Latency Optimization',
      route: this.latencyOptimizationRoute.bind(this)
    });
    
    // Market Impact Minimization
    this.routingAlgorithms.set('IMPACT_MINIMIZATION', {
      name: 'Market Impact Minimization',
      route: this.impactMinimizationRoute.bind(this)
    });
    
    // Dark Pool First
    this.routingAlgorithms.set('DARK_POOL_FIRST', {
      name: 'Dark Pool First',
      route: this.darkPoolFirstRoute.bind(this)
    });
  }
  
  private async loadVenueAnalytics(): Promise<void> {
    // Mock venue data - in production, this would come from real-time analytics
    const mockVenues: VenueAnalytics[] = [
      {
        venue: 'MEXC',
        availableLiquidity: 1000000,
        averageSpread: 0.001,
        marketDepth: 500000,
        hiddenLiquidity: 200000,
        fillRate: 0.95,
        averageFillTime: 150,
        priceImprovement: 0.0002,
        rejectionRate: 0.02,
        commission: 0.001,
        fees: 0.0005,
        rebates: 0.0001,
        effectiveCost: 0.0014,
        executionQuality: 0.92,
        reliabilityScore: 0.98,
        latency: 45,
        volume24h: 50000000,
        trades24h: 25000,
        lastUpdate: Date.now()
      },
      {
        venue: 'BINANCE',
        availableLiquidity: 2000000,
        averageSpread: 0.0008,
        marketDepth: 800000,
        hiddenLiquidity: 300000,
        fillRate: 0.97,
        averageFillTime: 120,
        priceImprovement: 0.0003,
        rejectionRate: 0.015,
        commission: 0.001,
        fees: 0.0004,
        rebates: 0.0002,
        effectiveCost: 0.0012,
        executionQuality: 0.95,
        reliabilityScore: 0.99,
        latency: 35,
        volume24h: 80000000,
        trades24h: 40000,
        lastUpdate: Date.now()
      },
      {
        venue: 'DARK_POOL_1',
        availableLiquidity: 500000,
        averageSpread: 0,
        marketDepth: 500000,
        hiddenLiquidity: 500000,
        fillRate: 0.85,
        averageFillTime: 300,
        priceImprovement: 0.0005,
        rejectionRate: 0.1,
        commission: 0.0008,
        fees: 0.0003,
        rebates: 0.0003,
        effectiveCost: 0.0008,
        executionQuality: 0.88,
        reliabilityScore: 0.95,
        latency: 80,
        volume24h: 15000000,
        trades24h: 5000,
        lastUpdate: Date.now()
      }
    ];
    
    mockVenues.forEach(venue => {
      this.venueAnalytics.set(venue.venue, venue);
    });
  }
  
  /**
   * Route an order using the specified or default algorithm
   */
  public async routeOrder(order: Order, request: OrderRequest): Promise<RoutingDecision> {
    const algorithmName = this.selectAlgorithm(order, request);
    const algorithm = this.routingAlgorithms.get(algorithmName);
    
    if (!algorithm) {
      throw new Error(`Unknown routing algorithm: ${algorithmName}`);
    }
    
    // Get available venues for this symbol
    const availableVenues = this.getAvailableVenues(order.symbol, request);
    
    // Filter venues based on preferences
    const filteredVenues = this.filterVenues(availableVenues, request);
    
    if (filteredVenues.length === 0) {
      throw new Error('No available venues for order execution');
    }
    
    // Execute routing algorithm
    return await algorithm.route(order, request, filteredVenues);
  }
  
  private selectAlgorithm(order: Order, request: OrderRequest): string {
    // Algorithm selection logic based on order characteristics
    
    // For large orders, use impact minimization
    if (request.quantity > 10000) {
      return 'IMPACT_MINIMIZATION';
    }
    
    // For urgent orders, use latency optimization
    if (request.priority === 'URGENT' || request.timeInForce === 'IOC') {
      return 'LATENCY_OPTIMIZATION';
    }
    
    // For cost-sensitive orders, use cost minimization
    if (request.maxCommission && request.maxCommission < 0.001) {
      return 'COST_MINIMIZATION';
    }
    
    // For block orders, try dark pools first
    if (request.quantity > 50000) {
      return 'DARK_POOL_FIRST';
    }
    
    // Default to best execution
    return this.defaultAlgorithm;
  }
  
  private getAvailableVenues(symbol: string, request: OrderRequest): VenueAnalytics[] {
    // In production, this would check venue availability for specific symbols
    return Array.from(this.venueAnalytics.values()).filter(venue => {
      // Basic availability checks
      return venue.reliabilityScore > 0.9 && venue.lastUpdate > Date.now() - 300000; // 5 minutes
    });
  }
  
  private filterVenues(venues: VenueAnalytics[], request: OrderRequest): VenueAnalytics[] {
    let filtered = venues;
    
    // Apply preferred venues filter
    if (request.preferredVenues && request.preferredVenues.length > 0) {
      filtered = filtered.filter(venue => request.preferredVenues!.includes(venue.venue));
    }
    
    // Apply excluded venues filter
    if (request.excludedVenues && request.excludedVenues.length > 0) {
      filtered = filtered.filter(venue => !request.excludedVenues!.includes(venue.venue));
    }
    
    // Apply liquidity filter
    const requiredLiquidity = request.quantity * 1.2; // 20% buffer
    filtered = filtered.filter(venue => venue.availableLiquidity >= requiredLiquidity);
    
    return filtered;
  }
  
  /**
   * Best Execution Algorithm
   * Optimizes for overall execution quality considering price, speed, and reliability
   */
  private async bestExecutionRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Score venues based on multiple factors
    const scoredVenues = venues.map(venue => ({
      venue,
      score: this.calculateBestExecutionScore(venue, request)
    })).sort((a, b) => b.score - a.score);
    
    let remainingQuantity = request.quantity;
    
    for (const { venue, score } of scoredVenues) {
      if (remainingQuantity <= 0) break;
      
      // Allocate based on venue capacity and score
      const maxAllocation = Math.min(
        remainingQuantity,
        venue.availableLiquidity * 0.1, // Max 10% of available liquidity
        request.quantity * 0.5 // Max 50% to single venue
      );
      
      if (maxAllocation > 0) {
        const allocation = Math.min(maxAllocation, remainingQuantity);
        
        allocations.push({
          venue: venue.venue,
          percentage: (allocation / request.quantity) * 100,
          quantity: allocation,
          expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
          expectedCommission: venue.commission * allocation,
          liquidityScore: venue.availableLiquidity / 1000000,
          latencyScore: 1 / (venue.latency + 1),
          costScore: 1 / (venue.effectiveCost + 0.001)
        });
        
        remainingQuantity -= allocation;
      }
    }
    
    return {
      algorithm: 'BEST_EXECUTION',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Optimized for best overall execution quality',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  /**
   * Liquidity Seeking Algorithm
   * Prioritizes venues with highest available liquidity
   */
  private async liquiditySeekingRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Sort by available liquidity
    const liquidityRanked = venues.sort((a, b) => b.availableLiquidity - a.availableLiquidity);
    
    let remainingQuantity = request.quantity;
    
    for (const venue of liquidityRanked) {
      if (remainingQuantity <= 0) break;
      
      const allocation = Math.min(
        remainingQuantity,
        venue.availableLiquidity * 0.2 // Max 20% of available liquidity
      );
      
      allocations.push({
        venue: venue.venue,
        percentage: (allocation / request.quantity) * 100,
        quantity: allocation,
        expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
        expectedCommission: venue.commission * allocation,
        liquidityScore: venue.availableLiquidity / 1000000,
        latencyScore: 1 / (venue.latency + 1),
        costScore: 1 / (venue.effectiveCost + 0.001)
      });
      
      remainingQuantity -= allocation;
    }
    
    return {
      algorithm: 'LIQUIDITY_SEEKING',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Prioritized venues with highest liquidity',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  /**
   * Cost Minimization Algorithm
   * Optimizes for lowest total execution costs
   */
  private async costMinimizationRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Sort by effective cost
    const costRanked = venues.sort((a, b) => a.effectiveCost - b.effectiveCost);
    
    let remainingQuantity = request.quantity;
    
    for (const venue of costRanked) {
      if (remainingQuantity <= 0) break;
      
      const allocation = Math.min(remainingQuantity, venue.availableLiquidity * 0.15);
      
      allocations.push({
        venue: venue.venue,
        percentage: (allocation / request.quantity) * 100,
        quantity: allocation,
        expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
        expectedCommission: venue.commission * allocation,
        liquidityScore: venue.availableLiquidity / 1000000,
        latencyScore: 1 / (venue.latency + 1),
        costScore: 1 / (venue.effectiveCost + 0.001)
      });
      
      remainingQuantity -= allocation;
    }
    
    return {
      algorithm: 'COST_MINIMIZATION',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Optimized for minimum execution costs',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  /**
   * Latency Optimization Algorithm
   * Prioritizes fastest execution venues
   */
  private async latencyOptimizationRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Sort by latency (ascending)
    const latencyRanked = venues.sort((a, b) => a.latency - b.latency);
    
    let remainingQuantity = request.quantity;
    
    for (const venue of latencyRanked) {
      if (remainingQuantity <= 0) break;
      
      const allocation = Math.min(remainingQuantity, venue.availableLiquidity * 0.3);
      
      allocations.push({
        venue: venue.venue,
        percentage: (allocation / request.quantity) * 100,
        quantity: allocation,
        expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
        expectedCommission: venue.commission * allocation,
        liquidityScore: venue.availableLiquidity / 1000000,
        latencyScore: 1 / (venue.latency + 1),
        costScore: 1 / (venue.effectiveCost + 0.001)
      });
      
      remainingQuantity -= allocation;
    }
    
    return {
      algorithm: 'LATENCY_OPTIMIZATION',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Optimized for fastest execution',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  /**
   * Market Impact Minimization Algorithm
   * Spreads large orders across venues to minimize market impact
   */
  private async impactMinimizationRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Calculate optimal allocation to minimize impact
    const totalLiquidity = venues.reduce((sum, v) => sum + v.availableLiquidity, 0);
    
    for (const venue of venues) {
      const liquidityWeight = venue.availableLiquidity / totalLiquidity;
      const baseAllocation = request.quantity * liquidityWeight;
      
      // Adjust for venue quality
      const qualityAdjustment = venue.executionQuality;
      const allocation = Math.min(
        baseAllocation * qualityAdjustment,
        venue.availableLiquidity * 0.05 // Max 5% of venue liquidity
      );
      
      if (allocation > 0) {
        allocations.push({
          venue: venue.venue,
          percentage: (allocation / request.quantity) * 100,
          quantity: allocation,
          expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
          expectedCommission: venue.commission * allocation,
          liquidityScore: venue.availableLiquidity / 1000000,
          latencyScore: 1 / (venue.latency + 1),
          costScore: 1 / (venue.effectiveCost + 0.001)
        });
      }
    }
    
    // Normalize allocations to match total quantity
    const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);
    if (totalAllocated > 0) {
      const scaleFactor = request.quantity / totalAllocated;
      allocations.forEach(allocation => {
        allocation.quantity *= scaleFactor;
        allocation.percentage = (allocation.quantity / request.quantity) * 100;
      });
    }
    
    return {
      algorithm: 'IMPACT_MINIMIZATION',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Distributed across venues to minimize market impact',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  /**
   * Dark Pool First Algorithm
   * Attempts to execute in dark pools before going to lit venues
   */
  private async darkPoolFirstRoute(
    order: Order, 
    request: OrderRequest, 
    venues: VenueAnalytics[]
  ): Promise<RoutingDecision> {
    const allocations: VenueAllocation[] = [];
    
    // Separate dark pools from lit venues
    const darkPools = venues.filter(v => v.venue.includes('DARK_POOL'));
    const litVenues = venues.filter(v => !v.venue.includes('DARK_POOL'));
    
    let remainingQuantity = request.quantity;
    
    // First, try dark pools
    for (const venue of darkPools.sort((a, b) => b.hiddenLiquidity - a.hiddenLiquidity)) {
      if (remainingQuantity <= 0) break;
      
      const allocation = Math.min(
        remainingQuantity,
        venue.hiddenLiquidity * 0.3
      );
      
      allocations.push({
        venue: venue.venue,
        percentage: (allocation / request.quantity) * 100,
        quantity: allocation,
        expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
        expectedCommission: venue.commission * allocation,
        liquidityScore: venue.availableLiquidity / 1000000,
        latencyScore: 1 / (venue.latency + 1),
        costScore: 1 / (venue.effectiveCost + 0.001)
      });
      
      remainingQuantity -= allocation;
    }
    
    // Then, use lit venues for remainder
    for (const venue of litVenues.sort((a, b) => b.executionQuality - a.executionQuality)) {
      if (remainingQuantity <= 0) break;
      
      const allocation = Math.min(remainingQuantity, venue.availableLiquidity * 0.2);
      
      allocations.push({
        venue: venue.venue,
        percentage: (allocation / request.quantity) * 100,
        quantity: allocation,
        expectedPrice: this.estimateExecutionPrice(venue, request, allocation),
        expectedCommission: venue.commission * allocation,
        liquidityScore: venue.availableLiquidity / 1000000,
        latencyScore: 1 / (venue.latency + 1),
        costScore: 1 / (venue.effectiveCost + 0.001)
      });
      
      remainingQuantity -= allocation;
    }
    
    return {
      algorithm: 'DARK_POOL_FIRST',
      timestamp: Date.now(),
      venues: allocations,
      reasoning: 'Prioritized dark pools to minimize market impact',
      expectedCost: allocations.reduce((sum, a) => sum + a.expectedCommission, 0),
      expectedImpact: this.calculateExpectedImpact(allocations, venues),
      confidence: this.calculateConfidence(allocations, venues)
    };
  }
  
  // Helper methods
  private calculateBestExecutionScore(venue: VenueAnalytics, request: OrderRequest): number {
    // Weighted scoring based on multiple factors
    const weights = {
      executionQuality: 0.3,
      fillRate: 0.25,
      costEfficiency: 0.2,
      reliability: 0.15,
      latency: 0.1
    };
    
    const costEfficiency = 1 / (venue.effectiveCost + 0.001);
    const latencyScore = 1 / (venue.latency + 1);
    
    return (
      venue.executionQuality * weights.executionQuality +
      venue.fillRate * weights.fillRate +
      costEfficiency * weights.costEfficiency +
      venue.reliabilityScore * weights.reliability +
      latencyScore * weights.latency
    );
  }
  
  private estimateExecutionPrice(venue: VenueAnalytics, request: OrderRequest, quantity: number): number {
    // Simple price estimation - in production, this would use real order book data
    const basePrice = request.price || 100; // Mock base price
    const impactFactor = quantity / venue.marketDepth;
    const impact = request.side === 'BUY' ? impactFactor : -impactFactor;
    
    return basePrice * (1 + impact * 0.001); // 0.1% impact per depth unit
  }
  
  private calculateExpectedImpact(allocations: VenueAllocation[], venues: VenueAnalytics[]): number {
    return allocations.reduce((totalImpact, allocation) => {
      const venue = venues.find(v => v.venue === allocation.venue);
      if (!venue) return totalImpact;
      
      const impactFactor = allocation.quantity / venue.marketDepth;
      return totalImpact + impactFactor * 0.001;
    }, 0);
  }
  
  private calculateConfidence(allocations: VenueAllocation[], venues: VenueAnalytics[]): number {
    if (allocations.length === 0) return 0;
    
    const avgReliability = allocations.reduce((sum, allocation) => {
      const venue = venues.find(v => v.venue === allocation.venue);
      return sum + (venue?.reliabilityScore || 0) * (allocation.percentage / 100);
    }, 0);
    
    return Math.min(avgReliability, 0.95); // Cap at 95%
  }
  
  /**
   * Update venue analytics with new data
   */
  public updateVenueAnalytics(venue: string, analytics: Partial<VenueAnalytics>): void {
    const existing = this.venueAnalytics.get(venue);
    if (existing) {
      this.venueAnalytics.set(venue, { ...existing, ...analytics, lastUpdate: Date.now() });
    }
  }
  
  /**
   * Get current venue analytics
   */
  public getVenueAnalytics(venue?: string): VenueAnalytics[] | VenueAnalytics | undefined {
    if (venue) {
      return this.venueAnalytics.get(venue);
    }
    return Array.from(this.venueAnalytics.values());
  }
} 