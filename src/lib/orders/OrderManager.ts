import { EventEmitter } from 'events';
import {
  Order,
  OrderRequest,
  OrderStatus,
  OrderFill,
  OrderEvent,
  OrderError,
  OrderModification,
  OrderManagerConfig,
  RiskCheck,
  ComplianceFlag,
  OrderPerformanceMetrics,
  OrderNotification
} from '@/types/orders.types';
import { SmartRouter } from './SmartRouter';
import { RiskValidator } from './RiskValidator';
import { CommissionCalculator } from './CommissionCalculator';
import { FillManager } from './FillManager';
import { ExchangeConnector } from './ExchangeConnector';

/**
 * Advanced Order Management System
 * Handles order lifecycle, routing, risk management, and execution tracking
 */
export class OrderManager extends EventEmitter {
  private static instance: OrderManager;
  
  // Core components
  private smartRouter: SmartRouter;
  private riskValidator: RiskValidator;
  private commissionCalculator: CommissionCalculator;
  private fillManager: FillManager;
  private exchangeConnector: ExchangeConnector;
  
  // Order storage and tracking
  private orders: Map<string, Order> = new Map();
  private ordersBySymbol: Map<string, Set<string>> = new Map();
  private ordersByAccount: Map<string, Set<string>> = new Map();
  private orderHistory: Order[] = [];
  
  // Performance tracking
  private performanceMetrics: OrderPerformanceMetrics;
  private metricsStartTime: number = Date.now();
  
  // Configuration
  private config: OrderManagerConfig;
  
  // Sequence tracking
  private sequenceNumber: number = 0;
  private orderIdCounter: number = 0;
  
  // Rate limiting
  private orderRateLimiter: Map<string, number[]> = new Map();
  
  constructor(config: OrderManagerConfig) {
    super();
    this.config = config;
    this.initializeComponents();
    this.initializePerformanceTracking();
    this.startPerformanceCollection();
  }
  
  public static getInstance(config?: OrderManagerConfig): OrderManager {
    if (!OrderManager.instance) {
      if (!config) {
        throw new Error('OrderManager configuration required for first initialization');
      }
      OrderManager.instance = new OrderManager(config);
    }
    return OrderManager.instance;
  }
  
  private initializeComponents(): void {
    this.smartRouter = new SmartRouter();
    this.riskValidator = new RiskValidator();
    this.commissionCalculator = new CommissionCalculator();
    this.fillManager = new FillManager();
    this.exchangeConnector = new ExchangeConnector();
    
    // Set up event listeners
    this.fillManager.on('fill', this.handleFill.bind(this));
    this.exchangeConnector.on('executionReport', this.handleExecutionReport.bind(this));
    this.exchangeConnector.on('error', this.handleExchangeError.bind(this));
  }
  
  private initializePerformanceTracking(): void {
    this.performanceMetrics = {
      validationLatency: 0,
      routingLatency: 0,
      submissionLatency: 0,
      acknowledgmentLatency: 0,
      firstFillLatency: 0,
      completionLatency: 0,
      ordersPerSecond: 0,
      fillsPerSecond: 0,
      modificationsPerSecond: 0,
      cancellationsPerSecond: 0,
      fillRate: 0,
      rejectionRate: 0,
      slippageStdDev: 0,
      priceImprovementRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      databaseLatency: 0,
      errorRate: 0,
      timeoutRate: 0,
      retryRate: 0,
      timestamp: Date.now(),
      measurementPeriod: this.config.metricsCollectionInterval
    };
  }
  
  /**
   * Create a new order with comprehensive validation and routing
   */
  public async createOrder(orderRequest: OrderRequest): Promise<Order> {
    const startTime = performance.now();
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(orderRequest.account || 'default')) {
        throw new Error('Order rate limit exceeded');
      }
      
      // Generate order ID
      const orderId = this.generateOrderId();
      const clientOrderId = orderRequest.clientOrderId || orderId;
      
      // Create order object
      const order: Order = {
        orderId,
        clientOrderId,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        type: orderRequest.type,
        status: 'PENDING_VALIDATION',
        originalQuantity: orderRequest.quantity,
        executedQuantity: 0,
        remainingQuantity: orderRequest.quantity,
        displayQuantity: orderRequest.displayQuantity,
        price: orderRequest.price,
        stopPrice: orderRequest.stopPrice,
        averagePrice: 0,
        timeInForce: orderRequest.timeInForce,
        createdAt: Date.now(),
        fills: [],
        totalCommission: 0,
        totalFees: 0,
        venues: [],
        riskChecks: [],
        complianceFlags: [],
        modifications: [],
        strategy: orderRequest.strategy,
        account: orderRequest.account || 'default',
        tags: orderRequest.tags || [],
        notes: orderRequest.notes
      };
      
      // Store order
      this.orders.set(orderId, order);
      this.addToIndexes(order);
      
      // Emit creation event
      this.emitOrderEvent(order, 'CREATED', { request: orderRequest });
      
      // Start async processing
      this.processOrderAsync(order, orderRequest, startTime);
      
      return order;
      
    } catch (error) {
      const processingTime = performance.now() - startTime;
      this.updatePerformanceMetrics('validation', processingTime);
      throw error;
    }
  }
  
  private async processOrderAsync(order: Order, request: OrderRequest, startTime: number): Promise<void> {
    try {
      // Step 1: Validation
      const validationStart = performance.now();
      await this.validateOrder(order, request);
      const validationTime = performance.now() - validationStart;
      this.updatePerformanceMetrics('validation', validationTime);
      
      order.status = 'VALIDATED';
      this.emitOrderEvent(order, 'CREATED', { validationTime });
      
      // Step 2: Risk checks
      if (this.config.enablePreTradeRisk) {
        const riskChecks = await this.riskValidator.validateOrder(order, request);
        order.riskChecks.push(...riskChecks);
        
        const failedChecks = riskChecks.filter(check => check.status === 'FAILED');
        if (failedChecks.length > 0) {
          order.status = 'REJECTED';
          this.emitOrderEvent(order, 'REJECTED', { reason: 'Risk check failed', failedChecks });
          return;
        }
      }
      
      // Step 3: Smart routing
      const routingStart = performance.now();
      const routingDecision = await this.smartRouter.routeOrder(order, request);
      const routingTime = performance.now() - routingStart;
      this.updatePerformanceMetrics('routing', routingTime);
      
      order.routingDecision = routingDecision;
      
      // Step 4: Submit to venues
      const submissionStart = performance.now();
      await this.submitToVenues(order, routingDecision);
      const submissionTime = performance.now() - submissionStart;
      this.updatePerformanceMetrics('submission', submissionTime);
      
      order.status = 'SUBMITTED';
      order.submittedAt = Date.now();
      this.emitOrderEvent(order, 'SUBMITTED', { routingDecision, submissionTime });
      
    } catch (error) {
      order.status = 'FAILED';
      this.handleOrderError(order, error as Error);
    }
  }
  
  private async validateOrder(order: Order, request: OrderRequest): Promise<void> {
    // Basic validation
    if (request.quantity <= 0) {
      throw new Error('Order quantity must be positive');
    }
    
    if (request.type === 'LIMIT' && !request.price) {
      throw new Error('Limit orders require a price');
    }
    
    if ((request.type === 'STOP_LOSS' || request.type === 'STOP_LOSS_LIMIT') && !request.stopPrice) {
      throw new Error('Stop orders require a stop price');
    }
    
    // Check order size limits
    if (request.quantity > this.config.maxOrderSize) {
      throw new Error(`Order size exceeds maximum of ${this.config.maxOrderSize}`);
    }
    
    // Check order value limits
    const orderValue = (request.price || 0) * request.quantity;
    if (orderValue > this.config.maxOrderValue) {
      throw new Error(`Order value exceeds maximum of ${this.config.maxOrderValue}`);
    }
    
    // Check open orders limit
    const accountOrders = this.getOrdersByAccount(order.account);
    const openOrders = accountOrders.filter(o => ['SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(o.status));
    if (openOrders.length >= this.config.maxOpenOrders) {
      throw new Error(`Maximum open orders limit of ${this.config.maxOpenOrders} exceeded`);
    }
  }
  
  private async submitToVenues(order: Order, routingDecision: any): Promise<void> {
    const venuePromises = routingDecision.venues.map(async (allocation: any) => {
      try {
        const venueOrder = await this.exchangeConnector.submitOrder({
          ...order,
          quantity: allocation.quantity,
          venue: allocation.venue
        });
        
        order.venues.push({
          venue: allocation.venue,
          venueType: 'EXCHANGE',
          quantity: allocation.quantity,
          executedQuantity: 0,
          status: 'SUBMITTED',
          submittedAt: Date.now(),
          venueOrderId: venueOrder.venueOrderId,
          routingReason: allocation.reasoning || 'Smart routing decision'
        });
        
      } catch (error) {
        this.handleVenueError(order, allocation.venue, error as Error);
      }
    });
    
    await Promise.allSettled(venuePromises);
  }
  
  /**
   * Cancel an order
   */
  public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    if (!['SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(order.status)) {
      throw new Error(`Cannot cancel order in status ${order.status}`);
    }
    
    try {
      order.status = 'PENDING_CANCEL';
      
      // Cancel on all venues
      const cancelPromises = order.venues.map(venue => 
        this.exchangeConnector.cancelOrder(venue.venueOrderId!, venue.venue)
      );
      
      const results = await Promise.allSettled(cancelPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      if (successful > 0) {
        order.status = 'CANCELED';
        this.emitOrderEvent(order, 'CANCELED', { reason, cancelledVenues: successful });
        return true;
      }
      
      return false;
      
    } catch (error) {
      this.handleOrderError(order, error as Error);
      return false;
    }
  }
  
  /**
   * Modify an existing order
   */
  public async modifyOrder(
    orderId: string, 
    modifications: Partial<OrderRequest>,
    reason: string
  ): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    if (!['SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(order.status)) {
      throw new Error(`Cannot modify order in status ${order.status}`);
    }
    
    try {
      // Create modification record
      const modification: OrderModification = {
        modificationId: this.generateModificationId(),
        orderId,
        timestamp: Date.now(),
        type: this.getModificationType(modifications),
        previousValue: this.extractPreviousValues(order, modifications),
        newValue: modifications,
        reason,
        requestedBy: 'system', // TODO: Get from context
        approved: true, // TODO: Implement approval workflow
        riskImpact: 0, // TODO: Calculate risk impact
        costImpact: 0, // TODO: Calculate cost impact
        executionImpact: 0 // TODO: Calculate execution impact
      };
      
      order.modifications.push(modification);
      
      // Apply modifications
      if (modifications.price !== undefined) {
        order.price = modifications.price;
      }
      if (modifications.quantity !== undefined) {
        order.originalQuantity = modifications.quantity;
        order.remainingQuantity = modifications.quantity - order.executedQuantity;
      }
      
      order.lastModifiedAt = Date.now();
      
      // Submit modifications to venues
      const modifyPromises = order.venues.map(venue => 
        this.exchangeConnector.modifyOrder(venue.venueOrderId!, venue.venue, modifications)
      );
      
      await Promise.allSettled(modifyPromises);
      
      this.emitOrderEvent(order, 'MODIFIED', { modification });
      return true;
      
    } catch (error) {
      this.handleOrderError(order, error as Error);
      return false;
    }
  }
  
  /**
   * Handle order fill from exchange
   */
  private handleFill(fill: OrderFill): void {
    const order = this.orders.get(fill.orderId);
    if (!order) {
      console.error(`Received fill for unknown order: ${fill.orderId}`);
      return;
    }
    
    // Add fill to order
    order.fills.push(fill);
    order.executedQuantity += fill.quantity;
    order.remainingQuantity = order.originalQuantity - order.executedQuantity;
    order.totalCommission += fill.commission;
    order.totalFees += fill.fees;
    
    // Calculate average price
    const totalValue = order.fills.reduce((sum, f) => sum + (f.price * f.quantity), 0);
    order.averagePrice = totalValue / order.executedQuantity;
    order.lastExecutedPrice = fill.price;
    
    // Update status
    if (order.remainingQuantity <= 0) {
      order.status = 'FILLED';
      this.emitOrderEvent(order, 'FILLED', { fill });
      
      // Calculate final metrics
      this.calculateOrderMetrics(order);
      
    } else {
      order.status = 'PARTIALLY_FILLED';
    }
    
    // Update venue information
    const venue = order.venues.find(v => v.venue === fill.venue);
    if (venue) {
      venue.executedQuantity += fill.quantity;
      venue.averagePrice = venue.executedQuantity > 0 ? 
        ((venue.averagePrice || 0) * (venue.executedQuantity - fill.quantity) + fill.price * fill.quantity) / venue.executedQuantity : 
        fill.price;
    }
    
    // Real-time risk monitoring
    if (this.config.enableRealTimeRisk) {
      this.performRealTimeRiskCheck(order, fill);
    }
    
    // Send notifications
    this.sendFillNotification(order, fill);
  }
  
  private calculateOrderMetrics(order: Order): void {
    if (order.fills.length === 0) return;
    
    // Calculate slippage (for market orders)
    if (order.type === 'MARKET' && order.price) {
      order.slippage = Math.abs(order.averagePrice - order.price) / order.price;
    }
    
    // Calculate fill latency
    if (order.submittedAt && order.fills.length > 0) {
      const firstFill = order.fills[0];
      order.fillLatency = firstFill.timestamp - order.submittedAt;
    }
  }
  
  private async performRealTimeRiskCheck(order: Order, fill: OrderFill): Promise<void> {
    try {
      const riskChecks = await this.riskValidator.validateFill(order, fill);
      order.riskChecks.push(...riskChecks);
      
      const criticalRisks = riskChecks.filter(check => 
        check.status === 'FAILED' && check.type === 'REAL_TIME'
      );
      
      if (criticalRisks.length > 0) {
        // Trigger risk management actions
        this.emit('riskBreach', { order, fill, risks: criticalRisks });
      }
    } catch (error) {
      console.error('Real-time risk check failed:', error);
    }
  }
  
  private sendFillNotification(order: Order, fill: OrderFill): void {
    const notification: OrderNotification = {
      notificationId: this.generateNotificationId(),
      orderId: order.orderId,
      type: 'FILL',
      priority: order.status === 'FILLED' ? 'HIGH' : 'NORMAL',
      message: `Order ${order.clientOrderId} ${order.status === 'FILLED' ? 'completely' : 'partially'} filled`,
      timestamp: Date.now(),
      channels: ['PUSH'], // TODO: Get from user preferences
      recipients: [order.account],
      deliveryStatus: {},
      deliveryAttempts: 0
    };
    
    this.emit('notification', notification);
  }
  
  /**
   * Get order by ID
   */
  public getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }
  
  /**
   * Get orders by symbol
   */
  public getOrdersBySymbol(symbol: string): Order[] {
    const orderIds = this.ordersBySymbol.get(symbol) || new Set();
    return Array.from(orderIds).map(id => this.orders.get(id)!).filter(Boolean);
  }
  
  /**
   * Get orders by account
   */
  public getOrdersByAccount(account: string): Order[] {
    const orderIds = this.ordersByAccount.get(account) || new Set();
    return Array.from(orderIds).map(id => this.orders.get(id)!).filter(Boolean);
  }
  
  /**
   * Get all active orders
   */
  public getActiveOrders(): Order[] {
    return Array.from(this.orders.values()).filter(order => 
      ['PENDING_VALIDATION', 'VALIDATED', 'SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(order.status)
    );
  }
  
  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): OrderPerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  // Private helper methods
  private generateOrderId(): string {
    return `ORD_${Date.now()}_${++this.orderIdCounter}`;
  }
  
  private generateModificationId(): string {
    return `MOD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateNotificationId(): string {
    return `NOT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private addToIndexes(order: Order): void {
    // Symbol index
    if (!this.ordersBySymbol.has(order.symbol)) {
      this.ordersBySymbol.set(order.symbol, new Set());
    }
    this.ordersBySymbol.get(order.symbol)!.add(order.orderId);
    
    // Account index
    if (!this.ordersByAccount.has(order.account)) {
      this.ordersByAccount.set(order.account, new Set());
    }
    this.ordersByAccount.get(order.account)!.add(order.orderId);
  }
  
  private checkRateLimit(account: string): boolean {
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window
    
    if (!this.orderRateLimiter.has(account)) {
      this.orderRateLimiter.set(account, []);
    }
    
    const timestamps = this.orderRateLimiter.get(account)!;
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    this.orderRateLimiter.set(account, validTimestamps);
    
    // Check if under limit
    if (validTimestamps.length >= this.config.maxOrdersPerSecond) {
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    return true;
  }
  
  private emitOrderEvent(order: Order, eventType: any, data: any): void {
    const event: OrderEvent = {
      eventId: `EVT_${Date.now()}_${++this.sequenceNumber}`,
      orderId: order.orderId,
      eventType,
      timestamp: Date.now(),
      data,
      source: 'OrderManager',
      sequenceNumber: this.sequenceNumber
    };
    
    this.emit('orderEvent', event);
    this.emit(eventType.toLowerCase(), { order, event });
  }
  
  private handleOrderError(order: Order, error: Error): void {
    const orderError: OrderError = {
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.orderId,
      errorCode: 'ORDER_PROCESSING_ERROR',
      errorType: 'EXECUTION',
      severity: 'HIGH',
      message: error.message,
      details: error,
      timestamp: Date.now(),
      component: 'OrderManager',
      symbol: order.symbol,
      isResolved: false,
      affectedOrders: [order.orderId]
    };
    
    this.emit('error', orderError);
  }
  
  private handleVenueError(order: Order, venue: string, error: Error): void {
    console.error(`Venue ${venue} error for order ${order.orderId}:`, error);
    
    // Update venue status
    const venueInfo = order.venues.find(v => v.venue === venue);
    if (venueInfo) {
      venueInfo.status = 'REJECTED';
    }
  }
  
  private handleExecutionReport(report: any): void {
    // Handle execution reports from exchanges
    const order = this.orders.get(report.orderId);
    if (order) {
      // Update order status based on execution report
      order.status = report.orderStatus;
      if (report.acknowledgedAt) {
        order.acknowledgedAt = report.acknowledgedAt;
      }
    }
  }
  
  private handleExchangeError(error: any): void {
    console.error('Exchange error:', error);
    this.emit('exchangeError', error);
  }
  
  private getModificationType(modifications: Partial<OrderRequest>): any {
    if (modifications.price !== undefined) return 'PRICE';
    if (modifications.quantity !== undefined) return 'QUANTITY';
    return 'OTHER';
  }
  
  private extractPreviousValues(order: Order, modifications: Partial<OrderRequest>): any {
    const previous: any = {};
    if (modifications.price !== undefined) previous.price = order.price;
    if (modifications.quantity !== undefined) previous.quantity = order.originalQuantity;
    return previous;
  }
  
  private updatePerformanceMetrics(type: string, latency: number): void {
    switch (type) {
      case 'validation':
        this.performanceMetrics.validationLatency = latency;
        break;
      case 'routing':
        this.performanceMetrics.routingLatency = latency;
        break;
      case 'submission':
        this.performanceMetrics.submissionLatency = latency;
        break;
    }
  }
  
  private startPerformanceCollection(): void {
    if (!this.config.enablePerformanceTracking) return;
    
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, this.config.metricsCollectionInterval);
  }
  
  private collectPerformanceMetrics(): void {
    const now = Date.now();
    const timePeriod = now - this.metricsStartTime;
    
    // Calculate throughput metrics
    const recentOrders = Array.from(this.orders.values()).filter(
      order => order.createdAt > this.metricsStartTime
    );
    
    this.performanceMetrics.ordersPerSecond = recentOrders.length / (timePeriod / 1000);
    
    // Calculate fill rate
    const filledOrders = recentOrders.filter(order => order.status === 'FILLED');
    this.performanceMetrics.fillRate = recentOrders.length > 0 ? filledOrders.length / recentOrders.length : 0;
    
    // Calculate rejection rate
    const rejectedOrders = recentOrders.filter(order => order.status === 'REJECTED');
    this.performanceMetrics.rejectionRate = recentOrders.length > 0 ? rejectedOrders.length / recentOrders.length : 0;
    
    this.performanceMetrics.timestamp = now;
    this.metricsStartTime = now;
    
    this.emit('performanceMetrics', this.performanceMetrics);
  }
} 