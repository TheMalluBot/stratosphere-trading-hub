import { EventEmitter } from 'events';
import {
  Order,
  OrderRequest,
  OrderFill,
  ExecutionType,
  OrderStatus
} from '@/types/orders.types';

interface ExchangeConfig {
  name: string;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  wsUrl: string;
  testnet: boolean;
  rateLimits: {
    orders: number;
    requests: number;
    weight: number;
  };
  features: {
    orderTypes: string[];
    timeInForce: string[];
    marginTrading: boolean;
    futuresTrading: boolean;
    optionsTrading: boolean;
  };
}

interface ExchangeConnection {
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  lastHeartbeat: number;
  orderCount: number;
  requestCount: number;
  errorCount: number;
  config: ExchangeConfig;
}

interface VenueOrderResponse {
  venueOrderId: string;
  status: OrderStatus;
  timestamp: number;
  message?: string;
}

interface ExecutionReport {
  orderId: string;
  venueOrderId: string;
  venue: string;
  executionType: ExecutionType;
  orderStatus: OrderStatus;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  executedQuantity: number;
  averagePrice: number;
  lastExecutedPrice?: number;
  lastExecutedQuantity?: number;
  commission: number;
  commissionAsset: string;
  timestamp: number;
  transactionTime: number;
  rejectReason?: string;
}

/**
 * Exchange Connector System
 * Handles connections and order routing to multiple exchanges
 */
export class ExchangeConnector extends EventEmitter {
  private connections: Map<string, ExchangeConnection> = new Map();
  private exchangeConfigs: Map<string, ExchangeConfig> = new Map();
  private orderMapping: Map<string, string> = new Map(); // venueOrderId -> orderId
  private rateLimiters: Map<string, number[]> = new Map();
  
  constructor() {
    super();
    this.initializeExchangeConfigs();
    this.startConnectionMonitoring();
  }
  
  private initializeExchangeConfigs(): void {
    // MEXC Configuration
    const mexcConfig: ExchangeConfig = {
      name: 'MEXC',
      apiKey: process.env.MEXC_API_KEY || '',
      secretKey: process.env.MEXC_SECRET_KEY || '',
      baseUrl: 'https://api.mexc.com',
      wsUrl: 'wss://wbs.mexc.com/ws',
      testnet: process.env.NODE_ENV !== 'production',
      rateLimits: {
        orders: 100, // per minute
        requests: 1200, // per minute
        weight: 6000 // per minute
      },
      features: {
        orderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT'],
        timeInForce: ['GTC', 'IOC', 'FOK'],
        marginTrading: true,
        futuresTrading: true,
        optionsTrading: false
      }
    };
    
    // Binance Configuration
    const binanceConfig: ExchangeConfig = {
      name: 'BINANCE',
      apiKey: process.env.BINANCE_API_KEY || '',
      secretKey: process.env.BINANCE_SECRET_KEY || '',
      baseUrl: 'https://api.binance.com',
      wsUrl: 'wss://stream.binance.com:9443/ws',
      testnet: process.env.NODE_ENV !== 'production',
      rateLimits: {
        orders: 100,
        requests: 1200,
        weight: 6000
      },
      features: {
        orderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT', 'TRAILING_STOP'],
        timeInForce: ['GTC', 'IOC', 'FOK', 'GTX'],
        marginTrading: true,
        futuresTrading: true,
        optionsTrading: false
      }
    };
    
    // Interactive Brokers Configuration
    const ibConfig: ExchangeConfig = {
      name: 'INTERACTIVE_BROKERS',
      apiKey: process.env.IB_API_KEY || '',
      secretKey: process.env.IB_SECRET_KEY || '',
      baseUrl: 'https://api.ibkr.com',
      wsUrl: 'wss://api.ibkr.com/ws',
      testnet: process.env.NODE_ENV !== 'production',
      rateLimits: {
        orders: 50,
        requests: 600,
        weight: 3000
      },
      features: {
        orderTypes: ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAIL', 'TRAIL_LIMIT'],
        timeInForce: ['DAY', 'GTC', 'IOC', 'FOK', 'GTD'],
        marginTrading: true,
        futuresTrading: true,
        optionsTrading: true
      }
    };
    
    this.exchangeConfigs.set('MEXC', mexcConfig);
    this.exchangeConfigs.set('BINANCE', binanceConfig);
    this.exchangeConfigs.set('INTERACTIVE_BROKERS', ibConfig);
    
    // Initialize connections
    this.exchangeConfigs.forEach((config, name) => {
      this.connections.set(name, {
        name,
        status: 'DISCONNECTED',
        lastHeartbeat: 0,
        orderCount: 0,
        requestCount: 0,
        errorCount: 0,
        config
      });
    });
  }
  
  /**
   * Submit order to exchange
   */
  public async submitOrder(order: Order & { venue: string }): Promise<VenueOrderResponse> {
    const venue = order.venue;
    const connection = this.connections.get(venue);
    
    if (!connection) {
      throw new Error(`Unknown venue: ${venue}`);
    }
    
    if (connection.status !== 'CONNECTED') {
      throw new Error(`Venue ${venue} is not connected`);
    }
    
    // Check rate limits
    if (!this.checkRateLimit(venue, 'orders')) {
      throw new Error(`Order rate limit exceeded for ${venue}`);
    }
    
    try {
      // Convert internal order format to venue-specific format
      const venueOrder = this.convertToVenueOrder(order, connection.config);
      
      // Submit to venue (mock implementation)
      const response = await this.submitToVenue(venue, venueOrder);
      
      // Store order mapping
      this.orderMapping.set(response.venueOrderId, order.orderId);
      
      // Update connection stats
      connection.orderCount++;
      connection.requestCount++;
      
      // Emit submission event
      this.emit('orderSubmitted', {
        orderId: order.orderId,
        venueOrderId: response.venueOrderId,
        venue,
        timestamp: response.timestamp
      });
      
      return response;
      
    } catch (error) {
      connection.errorCount++;
      this.emit('submitError', {
        orderId: order.orderId,
        venue,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  /**
   * Cancel order on exchange
   */
  public async cancelOrder(venueOrderId: string, venue: string): Promise<boolean> {
    const connection = this.connections.get(venue);
    
    if (!connection) {
      throw new Error(`Unknown venue: ${venue}`);
    }
    
    if (connection.status !== 'CONNECTED') {
      throw new Error(`Venue ${venue} is not connected`);
    }
    
    // Check rate limits
    if (!this.checkRateLimit(venue, 'requests')) {
      throw new Error(`Request rate limit exceeded for ${venue}`);
    }
    
    try {
      // Cancel on venue (mock implementation)
      const success = await this.cancelOnVenue(venue, venueOrderId);
      
      connection.requestCount++;
      
      if (success) {
        const orderId = this.orderMapping.get(venueOrderId);
        this.emit('orderCancelled', {
          orderId,
          venueOrderId,
          venue,
          timestamp: Date.now()
        });
      }
      
      return success;
      
    } catch (error) {
      connection.errorCount++;
      this.emit('cancelError', {
        venueOrderId,
        venue,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  /**
   * Modify order on exchange
   */
  public async modifyOrder(
    venueOrderId: string,
    venue: string,
    modifications: Partial<OrderRequest>
  ): Promise<boolean> {
    const connection = this.connections.get(venue);
    
    if (!connection) {
      throw new Error(`Unknown venue: ${venue}`);
    }
    
    if (connection.status !== 'CONNECTED') {
      throw new Error(`Venue ${venue} is not connected`);
    }
    
    // Check if venue supports order modification
    const config = connection.config;
    if (!this.supportsModification(config, modifications)) {
      throw new Error(`Venue ${venue} does not support requested modifications`);
    }
    
    try {
      // Modify on venue (mock implementation)
      const success = await this.modifyOnVenue(venue, venueOrderId, modifications);
      
      connection.requestCount++;
      
      if (success) {
        const orderId = this.orderMapping.get(venueOrderId);
        this.emit('orderModified', {
          orderId,
          venueOrderId,
          venue,
          modifications,
          timestamp: Date.now()
        });
      }
      
      return success;
      
    } catch (error) {
      connection.errorCount++;
      this.emit('modifyError', {
        venueOrderId,
        venue,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  /**
   * Process execution report from exchange
   */
  public processExecutionReport(report: ExecutionReport): void {
    try {
      // Validate execution report
      this.validateExecutionReport(report);
      
      // Get internal order ID
      const orderId = this.orderMapping.get(report.venueOrderId);
      if (!orderId) {
        console.warn(`Received execution report for unknown order: ${report.venueOrderId}`);
        return;
      }
      
      // Create order fill if this is a trade execution
      if (report.executionType === 'TRADE' && report.lastExecutedQuantity && report.lastExecutedPrice) {
        const fill: OrderFill = {
          fillId: `${report.venueOrderId}_${report.transactionTime}`,
          orderId,
          venue: report.venue,
          symbol: report.symbol,
          price: report.lastExecutedPrice,
          quantity: report.lastExecutedQuantity,
          side: report.side,
          timestamp: report.transactionTime,
          commission: report.commission,
          fees: 0, // Would be calculated based on venue
          commissionAsset: report.commissionAsset,
          tradeId: `${report.venue}_${report.transactionTime}`
        };
        
        this.emit('fill', fill);
      }
      
      // Emit execution report
      this.emit('executionReport', {
        ...report,
        orderId
      });
      
    } catch (error) {
      this.emit('executionReportError', {
        report,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  private convertToVenueOrder(order: Order, config: ExchangeConfig): any {
    // Convert internal order format to venue-specific format
    // This would contain venue-specific logic for each exchange
    
    const venueOrder: any = {
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.originalQuantity,
      timeInForce: order.timeInForce
    };
    
    if (order.price) {
      venueOrder.price = order.price;
    }
    
    if (order.stopPrice) {
      venueOrder.stopPrice = order.stopPrice;
    }
    
    // Add venue-specific parameters
    switch (config.name) {
      case 'MEXC':
        venueOrder.newClientOrderId = order.clientOrderId;
        break;
      case 'BINANCE':
        venueOrder.newClientOrderId = order.clientOrderId;
        venueOrder.recvWindow = 5000;
        break;
      case 'INTERACTIVE_BROKERS':
        venueOrder.clientId = order.clientOrderId;
        break;
    }
    
    return venueOrder;
  }
  
  private async submitToVenue(venue: string, venueOrder: any): Promise<VenueOrderResponse> {
    // Mock implementation - in production, this would make actual API calls
    const venueOrderId = `${venue}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error(`Venue ${venue} rejected order: Insufficient balance`);
    }
    
    return {
      venueOrderId,
      status: 'SUBMITTED',
      timestamp: Date.now()
    };
  }
  
  private async cancelOnVenue(venue: string, venueOrderId: string): Promise<boolean> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`Failed to cancel order ${venueOrderId} on ${venue}`);
    }
    
    return true;
  }
  
  private async modifyOnVenue(
    venue: string,
    venueOrderId: string,
    modifications: Partial<OrderRequest>
  ): Promise<boolean> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error(`Failed to modify order ${venueOrderId} on ${venue}`);
    }
    
    return true;
  }
  
  private supportsModification(config: ExchangeConfig, modifications: Partial<OrderRequest>): boolean {
    // Check if venue supports the requested modifications
    // This would contain venue-specific logic
    
    // Most venues support price and quantity modifications
    if (modifications.price !== undefined || modifications.quantity !== undefined) {
      return true;
    }
    
    // Check time in force modifications
    if (modifications.timeInForce && !config.features.timeInForce.includes(modifications.timeInForce)) {
      return false;
    }
    
    return true;
  }
  
  private validateExecutionReport(report: ExecutionReport): void {
    if (!report.venueOrderId || !report.venue) {
      throw new Error('Execution report missing required fields');
    }
    
    if (!report.symbol || !report.side) {
      throw new Error('Execution report missing symbol or side');
    }
    
    if (report.quantity <= 0) {
      throw new Error('Execution report quantity must be positive');
    }
  }
  
  private checkRateLimit(venue: string, type: 'orders' | 'requests'): boolean {
    const config = this.exchangeConfigs.get(venue);
    if (!config) return false;
    
    const key = `${venue}_${type}`;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, []);
    }
    
    const timestamps = this.rateLimiters.get(key)!;
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    this.rateLimiters.set(key, validTimestamps);
    
    // Check limit
    const limit = type === 'orders' ? config.rateLimits.orders : config.rateLimits.requests;
    if (validTimestamps.length >= limit) {
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    return true;
  }
  
  private startConnectionMonitoring(): void {
    // Monitor connections every 30 seconds
    setInterval(() => {
      this.monitorConnections();
    }, 30000);
    
    // Simulate execution reports for testing
    if (process.env.NODE_ENV === 'development') {
      this.startMockExecutionReports();
    }
  }
  
  private monitorConnections(): void {
    for (const [venue, connection] of this.connections.entries()) {
      // Check connection health
      const timeSinceHeartbeat = Date.now() - connection.lastHeartbeat;
      
      if (timeSinceHeartbeat > 60000 && connection.status === 'CONNECTED') {
        // Connection timeout
        connection.status = 'ERROR';
        this.emit('connectionLost', { venue, timestamp: Date.now() });
      }
      
      // Attempt reconnection if needed
      if (connection.status === 'DISCONNECTED' || connection.status === 'ERROR') {
        this.attemptReconnection(venue);
      }
    }
  }
  
  private async attemptReconnection(venue: string): Promise<void> {
    const connection = this.connections.get(venue);
    if (!connection) return;
    
    if (connection.status === 'CONNECTING') return; // Already attempting
    
    connection.status = 'CONNECTING';
    
    try {
      // Mock connection attempt
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate connection success/failure
      if (Math.random() < 0.8) { // 80% success rate
        connection.status = 'CONNECTED';
        connection.lastHeartbeat = Date.now();
        this.emit('connectionEstablished', { venue, timestamp: Date.now() });
      } else {
        connection.status = 'ERROR';
        this.emit('connectionFailed', { venue, timestamp: Date.now() });
      }
      
    } catch (error) {
      connection.status = 'ERROR';
      this.emit('connectionError', {
        venue,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }
  
  private startMockExecutionReports(): void {
    // Generate mock execution reports for testing
    setInterval(() => {
      if (this.orderMapping.size > 0 && Math.random() < 0.1) { // 10% chance every interval
        const entries = Array.from(this.orderMapping.entries());
        const [venueOrderId, orderId] = entries[Math.floor(Math.random() * entries.length)];
        
        const venues = Array.from(this.connections.keys());
        const venue = venues[Math.floor(Math.random() * venues.length)];
        
        const report: ExecutionReport = {
          orderId,
          venueOrderId,
          venue,
          executionType: 'TRADE',
          orderStatus: 'PARTIALLY_FILLED',
          symbol: 'BTCUSDT',
          side: Math.random() < 0.5 ? 'BUY' : 'SELL',
          quantity: 100,
          price: 50000 + Math.random() * 10000,
          executedQuantity: 50,
          averagePrice: 51000,
          lastExecutedPrice: 51000,
          lastExecutedQuantity: 25,
          commission: 0.1,
          commissionAsset: 'USDT',
          timestamp: Date.now(),
          transactionTime: Date.now()
        };
        
        this.processExecutionReport(report);
      }
    }, 5000); // Every 5 seconds
  }
  
  /**
   * Get connection status for all venues
   */
  public getConnectionStatus(): Record<string, ExchangeConnection> {
    const status: Record<string, ExchangeConnection> = {};
    this.connections.forEach((connection, venue) => {
      status[venue] = { ...connection };
    });
    return status;
  }
  
  /**
   * Get connection status for specific venue
   */
  public getVenueStatus(venue: string): ExchangeConnection | undefined {
    return this.connections.get(venue);
  }
  
  /**
   * Force reconnection to venue
   */
  public async reconnectVenue(venue: string): Promise<void> {
    const connection = this.connections.get(venue);
    if (connection) {
      connection.status = 'DISCONNECTED';
      await this.attemptReconnection(venue);
    }
  }
  
  /**
   * Get rate limit status
   */
  public getRateLimitStatus(venue: string): {
    orders: { used: number; limit: number; remaining: number };
    requests: { used: number; limit: number; remaining: number };
  } | undefined {
    const config = this.exchangeConfigs.get(venue);
    if (!config) return undefined;
    
    const now = Date.now();
    const windowStart = now - 60000;
    
    const orderKey = `${venue}_orders`;
    const requestKey = `${venue}_requests`;
    
    const orderTimestamps = (this.rateLimiters.get(orderKey) || []).filter(ts => ts > windowStart);
    const requestTimestamps = (this.rateLimiters.get(requestKey) || []).filter(ts => ts > windowStart);
    
    return {
      orders: {
        used: orderTimestamps.length,
        limit: config.rateLimits.orders,
        remaining: config.rateLimits.orders - orderTimestamps.length
      },
      requests: {
        used: requestTimestamps.length,
        limit: config.rateLimits.requests,
        remaining: config.rateLimits.requests - requestTimestamps.length
      }
    };
  }
  
  /**
   * Add new exchange configuration
   */
  public addExchange(config: ExchangeConfig): void {
    this.exchangeConfigs.set(config.name, config);
    this.connections.set(config.name, {
      name: config.name,
      status: 'DISCONNECTED',
      lastHeartbeat: 0,
      orderCount: 0,
      requestCount: 0,
      errorCount: 0,
      config
    });
  }
  
  /**
   * Remove exchange
   */
  public removeExchange(venue: string): void {
    this.exchangeConfigs.delete(venue);
    this.connections.delete(venue);
    
    // Clean up rate limiters
    this.rateLimiters.delete(`${venue}_orders`);
    this.rateLimiters.delete(`${venue}_requests`);
  }
  
  /**
   * Get exchange capabilities
   */
  public getExchangeCapabilities(venue: string): ExchangeConfig['features'] | undefined {
    const config = this.exchangeConfigs.get(venue);
    return config?.features;
  }
  
  /**
   * Get performance statistics
   */
  public getPerformanceStats(): Record<string, {
    orderCount: number;
    requestCount: number;
    errorCount: number;
    errorRate: number;
    avgResponseTime: number;
  }> {
    const stats: Record<string, any> = {};
    
    this.connections.forEach((connection, venue) => {
      const errorRate = connection.requestCount > 0 ? connection.errorCount / connection.requestCount : 0;
      
      stats[venue] = {
        orderCount: connection.orderCount,
        requestCount: connection.requestCount,
        errorCount: connection.errorCount,
        errorRate,
        avgResponseTime: 100 + Math.random() * 50 // Mock response time
      };
    });
    
    return stats;
  }
} 