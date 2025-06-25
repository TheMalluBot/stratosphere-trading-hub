import { orderManager } from '@/services/orderManager';
import { enhancedDataService } from '@/services/enhancedDataService';

export interface SmartOrderConfig {
  symbol: string;
  quantity: number;
  side: 'buy' | 'sell';
  strategy: 'twap' | 'vwap' | 'implementation-shortfall' | 'arrival-price';
  timeWindow: number; // minutes
  maxSlippage: number; // percentage
  minFillSize: number;
  aggressiveness: 'passive' | 'neutral' | 'aggressive';
}

export interface OrderSlice {
  id: string;
  quantity: number;
  price: number;
  timestamp: number;
  filled: boolean;
  fillPrice?: number;
  fillTime?: number;
}

export interface SmartOrderStatus {
  orderId: string;
  config: SmartOrderConfig;
  slices: OrderSlice[];
  totalFilled: number;
  avgFillPrice: number;
  slippage: number;
  status: 'active' | 'completed' | 'cancelled' | 'failed';
  startTime: number;
  endTime?: number;
}

export class SmartOrderRouter {
  private activeOrders = new Map<string, SmartOrderStatus>();
  private marketData = new Map<string, any[]>();
  private executionTimers = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.subscribeToMarketData();
  }

  private subscribeToMarketData(): void {
    // Subscribe to real-time market data for smart routing decisions
    enhancedDataService.subscribe('all', (priceUpdate) => {
      const symbol = priceUpdate.symbol;
      if (!this.marketData.has(symbol)) {
        this.marketData.set(symbol, []);
      }
      
      const data = this.marketData.get(symbol)!;
      data.push({
        timestamp: priceUpdate.timestamp,
        price: priceUpdate.price,
        volume: priceUpdate.volume,
        change: priceUpdate.change
      });
      
      // Keep only last 1000 data points
      if (data.length > 1000) {
        this.marketData.set(symbol, data.slice(-1000));
      }
    });
  }

  async executeSmartOrder(config: SmartOrderConfig): Promise<string> {
    const orderId = `smart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎯 Starting smart order execution: ${orderId}`, config);
    
    const smartOrder: SmartOrderStatus = {
      orderId,
      config,
      slices: [],
      totalFilled: 0,
      avgFillPrice: 0,
      slippage: 0,
      status: 'active',
      startTime: Date.now()
    };
    
    this.activeOrders.set(orderId, smartOrder);
    
    // Generate execution plan based on strategy
    const executionPlan = this.generateExecutionPlan(config);
    smartOrder.slices = executionPlan;
    
    // Start execution
    this.startExecution(orderId);
    
    return orderId;
  }

  private generateExecutionPlan(config: SmartOrderConfig): OrderSlice[] {
    const slices: OrderSlice[] = [];
    const totalQuantity = config.quantity;
    const timeWindow = config.timeWindow * 60 * 1000; // Convert to milliseconds
    
    let sliceCount: number;
    let quantities: number[];
    
    switch (config.strategy) {
      case 'twap': // Time Weighted Average Price
        sliceCount = Math.max(5, Math.min(20, Math.floor(config.timeWindow / 2)));
        quantities = this.generateTWAPSlices(totalQuantity, sliceCount);
        break;
        
      case 'vwap': // Volume Weighted Average Price
        sliceCount = Math.max(5, Math.min(15, Math.floor(config.timeWindow / 3)));
        quantities = this.generateVWAPSlices(totalQuantity, sliceCount, config.symbol);
        break;
        
      case 'implementation-shortfall':
        sliceCount = Math.max(3, Math.min(12, Math.floor(config.timeWindow / 5)));
        quantities = this.generateImplementationShortfallSlices(totalQuantity, sliceCount, config);
        break;
        
      case 'arrival-price':
        sliceCount = Math.max(8, Math.min(25, Math.floor(config.timeWindow / 1.5)));
        quantities = this.generateArrivalPriceSlices(totalQuantity, sliceCount, config);
        break;
        
      default:
        sliceCount = 10;
        quantities = new Array(sliceCount).fill(totalQuantity / sliceCount);
    }
    
    const timeInterval = timeWindow / sliceCount;
    const startTime = Date.now();
    
    for (let i = 0; i < sliceCount; i++) {
      slices.push({
        id: `slice_${i + 1}`,
        quantity: quantities[i],
        price: 0, // Will be determined at execution time
        timestamp: startTime + (i * timeInterval),
        filled: false
      });
    }
    
    return slices;
  }

  private generateTWAPSlices(totalQuantity: number, sliceCount: number): number[] {
    // Equal distribution with slight randomization to avoid detection
    const baseSize = totalQuantity / sliceCount;
    return Array.from({ length: sliceCount }, () => {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      return Math.max(0.01, baseSize * (1 + variation));
    });
  }

  private generateVWAPSlices(totalQuantity: number, sliceCount: number, symbol: string): number[] {
    // Generate slices based on historical volume patterns
    const marketData = this.marketData.get(symbol) || [];
    
    if (marketData.length < 20) {
      return this.generateTWAPSlices(totalQuantity, sliceCount);
    }
    
    // Calculate volume distribution weights
    const volumeWeights = marketData.slice(-20).map(d => d.volume || 1);
    const totalVolume = volumeWeights.reduce((sum, vol) => sum + vol, 0);
    const normalizedWeights = volumeWeights.map(vol => vol / totalVolume);
    
    // Distribute quantity based on volume weights
    const quantities: number[] = [];
    let remainingQuantity = totalQuantity;
    
    for (let i = 0; i < sliceCount - 1; i++) {
      const weight = normalizedWeights[i % normalizedWeights.length];
      const sliceQuantity = Math.min(remainingQuantity * 0.8, totalQuantity * weight * sliceCount);
      quantities.push(Math.max(0.01, sliceQuantity));
      remainingQuantity -= sliceQuantity;
    }
    
    // Add remaining quantity to last slice
    quantities.push(Math.max(0.01, remainingQuantity));
    
    return quantities;
  }

  private generateImplementationShortfallSlices(totalQuantity: number, sliceCount: number, config: SmartOrderConfig): number[] {
    // Front-loaded execution to minimize implementation shortfall
    const quantities: number[] = [];
    let remainingQuantity = totalQuantity;
    
    const aggressivenessMultiplier = config.aggressiveness === 'aggressive' ? 1.5 : 
                                   config.aggressiveness === 'passive' ? 0.7 : 1.0;
    
    for (let i = 0; i < sliceCount; i++) {
      // Exponentially decreasing slice sizes
      const weight = Math.exp(-i * 0.3) * aggressivenessMultiplier;
      const maxSliceSize = remainingQuantity * 0.4;
      const sliceQuantity = Math.min(maxSliceSize, totalQuantity * weight / sliceCount);
      
      quantities.push(Math.max(0.01, sliceQuantity));
      remainingQuantity -= sliceQuantity;
    }
    
    // Distribute any remaining quantity
    if (remainingQuantity > 0) {
      const perSlice = remainingQuantity / sliceCount;
      quantities.forEach((_, i) => quantities[i] += perSlice);
    }
    
    return quantities;
  }

  private generateArrivalPriceSlices(totalQuantity: number, sliceCount: number, config: SmartOrderConfig): number[] {
    // Balanced approach targeting arrival price
    const quantities: number[] = [];
    const baseSize = totalQuantity / sliceCount;
    
    for (let i = 0; i < sliceCount; i++) {
      // U-shaped distribution: larger slices at beginning and end
      const position = i / (sliceCount - 1);
      const uShapeWeight = 1 + 0.5 * (Math.pow(position - 0.5, 2) * 4);
      
      const aggressivenessAdjustment = config.aggressiveness === 'aggressive' ? 1.2 : 
                                     config.aggressiveness === 'passive' ? 0.8 : 1.0;
      
      quantities.push(baseSize * uShapeWeight * aggressivenessAdjustment);
    }
    
    // Normalize to ensure total equals target quantity
    const totalGenerated = quantities.reduce((sum, qty) => sum + qty, 0);
    return quantities.map(qty => (qty / totalGenerated) * totalQuantity);
  }

  private startExecution(orderId: string): void {
    const smartOrder = this.activeOrders.get(orderId);
    if (!smartOrder) return;
    
    const executeNextSlice = async () => {
      const nextSlice = smartOrder.slices.find(slice => !slice.filled && slice.timestamp <= Date.now());
      
      if (!nextSlice) {
        // Check if all slices are complete
        const allFilled = smartOrder.slices.every(slice => slice.filled);
        if (allFilled) {
          this.completeSmartOrder(orderId);
        } else {
          // Schedule next check
          this.scheduleNextExecution(orderId, 1000);
        }
        return;
      }
      
      try {
        // Calculate optimal price for this slice
        const optimalPrice = await this.calculateOptimalPrice(smartOrder.config, nextSlice);
        nextSlice.price = optimalPrice;
        
        // Execute the slice
        const order = await orderManager.placeOrder({
          symbol: smartOrder.config.symbol,
          side: smartOrder.config.side,
          type: 'limit',
          quantity: nextSlice.quantity,
          price: optimalPrice
        });
        
        // Mark slice as filled (simplified for demo)
        setTimeout(() => {
          nextSlice.filled = true;
          nextSlice.fillPrice = optimalPrice * (1 + (Math.random() - 0.5) * 0.001); // Simulate small slippage
          nextSlice.fillTime = Date.now();
          
          this.updateSmartOrderStatus(orderId);
          
          console.log(`✅ Slice ${nextSlice.id} filled: ${nextSlice.quantity} @ ${nextSlice.fillPrice}`);
        }, Math.random() * 2000 + 1000); // 1-3 second fill simulation
        
      } catch (error) {
        console.error(`❌ Failed to execute slice ${nextSlice.id}:`, error);
      }
      
      // Schedule next execution
      this.scheduleNextExecution(orderId, 500);
    };
    
    executeNextSlice();
  }

  private async calculateOptimalPrice(config: SmartOrderConfig, slice: OrderSlice): Promise<number> {
    const marketData = this.marketData.get(config.symbol);
    const currentPrice = marketData && marketData.length > 0 ? 
                        marketData[marketData.length - 1].price : 45000;
    
    // Calculate bid-ask spread estimate
    const spreadEstimate = currentPrice * 0.0001; // 0.01% spread
    
    let targetPrice = currentPrice;
    
    switch (config.aggressiveness) {
      case 'passive':
        // Price at or better than current bid/ask
        targetPrice = config.side === 'buy' ? 
                     currentPrice - spreadEstimate : 
                     currentPrice + spreadEstimate;
        break;
        
      case 'aggressive':
        // Price to ensure quick fill
        targetPrice = config.side === 'buy' ? 
                     currentPrice + spreadEstimate : 
                     currentPrice - spreadEstimate;
        break;
        
      case 'neutral':
        // Mid-market price
        targetPrice = currentPrice;
        break;
    }
    
    // Apply maximum slippage constraint
    const maxSlippageAmount = currentPrice * (config.maxSlippage / 100);
    if (config.side === 'buy') {
      targetPrice = Math.min(targetPrice, currentPrice + maxSlippageAmount);
    } else {
      targetPrice = Math.max(targetPrice, currentPrice - maxSlippageAmount);
    }
    
    return Number(targetPrice.toFixed(2));
  }

  private updateSmartOrderStatus(orderId: string): void {
    const smartOrder = this.activeOrders.get(orderId);
    if (!smartOrder) return;
    
    const filledSlices = smartOrder.slices.filter(slice => slice.filled);
    const totalFilled = filledSlices.reduce((sum, slice) => sum + slice.quantity, 0);
    
    if (filledSlices.length > 0) {
      const totalValue = filledSlices.reduce((sum, slice) => sum + (slice.quantity * (slice.fillPrice || 0)), 0);
      smartOrder.avgFillPrice = totalValue / totalFilled;
      
      // Calculate slippage
      const marketData = this.marketData.get(smartOrder.config.symbol);
      const referencePrice = marketData && marketData.length > 0 ? 
                            marketData[0].price : smartOrder.avgFillPrice;
      smartOrder.slippage = Math.abs((smartOrder.avgFillPrice - referencePrice) / referencePrice) * 100;
    }
    
    smartOrder.totalFilled = totalFilled;
  }

  private scheduleNextExecution(orderId: string, delay: number): void {
    const existingTimer = this.executionTimers.get(orderId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(() => {
      this.startExecution(orderId);
    }, delay);
    
    this.executionTimers.set(orderId, timer);
  }

  private completeSmartOrder(orderId: string): void {
    const smartOrder = this.activeOrders.get(orderId);
    if (!smartOrder) return;
    
    smartOrder.status = 'completed';
    smartOrder.endTime = Date.now();
    
    const executionTime = (smartOrder.endTime - smartOrder.startTime) / 1000 / 60; // minutes
    
    console.log(`🎉 Smart order completed: ${orderId}`);
    console.log(`   Total filled: ${smartOrder.totalFilled}/${smartOrder.config.quantity}`);
    console.log(`   Avg price: ${smartOrder.avgFillPrice}`);
    console.log(`   Slippage: ${smartOrder.slippage.toFixed(3)}%`);
    console.log(`   Execution time: ${executionTime.toFixed(1)} minutes`);
    
    // Clean up timer
    const timer = this.executionTimers.get(orderId);
    if (timer) {
      clearTimeout(timer);
      this.executionTimers.delete(orderId);
    }
  }

  async cancelSmartOrder(orderId: string): Promise<boolean> {
    const smartOrder = this.activeOrders.get(orderId);
    if (!smartOrder || smartOrder.status !== 'active') {
      return false;
    }
    
    smartOrder.status = 'cancelled';
    smartOrder.endTime = Date.now();
    
    // Clean up timer
    const timer = this.executionTimers.get(orderId);
    if (timer) {
      clearTimeout(timer);
      this.executionTimers.delete(orderId);
    }
    
    console.log(`❌ Smart order cancelled: ${orderId}`);
    return true;
  }

  getSmartOrderStatus(orderId: string): SmartOrderStatus | null {
    return this.activeOrders.get(orderId) || null;
  }

  getAllActiveOrders(): SmartOrderStatus[] {
    return Array.from(this.activeOrders.values()).filter(order => order.status === 'active');
  }

  getCompletedOrders(): SmartOrderStatus[] {
    return Array.from(this.activeOrders.values()).filter(order => order.status === 'completed');
  }

  getPerformanceStats(): {
    totalOrders: number;
    completedOrders: number;
    avgSlippage: number;
    avgExecutionTime: number;
    successRate: number;
  } {
    const allOrders = Array.from(this.activeOrders.values());
    const completedOrders = allOrders.filter(order => order.status === 'completed');
    
    const avgSlippage = completedOrders.length > 0 ? 
      completedOrders.reduce((sum, order) => sum + order.slippage, 0) / completedOrders.length : 0;
    
    const avgExecutionTime = completedOrders.length > 0 ?
      completedOrders.reduce((sum, order) => sum + ((order.endTime || Date.now()) - order.startTime), 0) / 
      completedOrders.length / 1000 / 60 : 0; // in minutes
    
    return {
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      avgSlippage,
      avgExecutionTime,
      successRate: allOrders.length > 0 ? (completedOrders.length / allOrders.length) * 100 : 0
    };
  }
}

export const smartOrderRouter = new SmartOrderRouter();
