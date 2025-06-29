import { 
  Order, 
  OrderRequest, 
  OrderStatus, 
  OrderType,
  OrderSide,
  BracketOrder,
  ExecutionReport,
  BrokerAccount,
  TradingError,
  RiskLimits,
  Position
} from '@/types/trading.types';

/**
 * Professional Order Management System
 * Handles order creation, validation, execution, and tracking across multiple brokers
 */
export class OrderManager {
  private static instance: OrderManager;
  private orders: Map<string, Order> = new Map();
  private pendingOrders: Map<string, OrderRequest> = new Map();
  private executionReports: Map<string, ExecutionReport[]> = new Map();
  private brokerAccounts: Map<string, BrokerAccount> = new Map();
  private orderSequence: number = 1;
  private riskLimits: RiskLimits | null = null;
  
  // Event callbacks
  private onOrderUpdate?: (order: Order) => void;
  private onExecutionReport?: (report: ExecutionReport) => void;
  private onError?: (error: TradingError) => void;

  static getInstance(): OrderManager {
    if (!OrderManager.instance) {
      OrderManager.instance = new OrderManager();
    }
    return OrderManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Load persisted orders and state
    await this.loadPersistedState();
    console.log('📋 Order Manager initialized');
  }

  /**
   * Set event callbacks
   */
  setEventCallbacks(callbacks: {
    onOrderUpdate?: (order: Order) => void;
    onExecutionReport?: (report: ExecutionReport) => void;
    onError?: (error: TradingError) => void;
  }): void {
    this.onOrderUpdate = callbacks.onOrderUpdate;
    this.onExecutionReport = callbacks.onExecutionReport;
    this.onError = callbacks.onError;
  }

  /**
   * Set risk limits
   */
  setRiskLimits(limits: RiskLimits): void {
    this.riskLimits = limits;
  }

  /**
   * Add broker account
   */
  addBrokerAccount(account: BrokerAccount): void {
    this.brokerAccounts.set(account.id, account);
  }

  /**
   * Create a new order
   */
  async createOrder(
    orderRequest: OrderRequest,
    brokerId?: string
  ): Promise<string> {
    try {
      // Generate order ID
      const orderId = this.generateOrderId();
      
      // Validate order
      const validationResult = await this.validateOrder(orderRequest, brokerId);
      if (!validationResult.valid) {
        throw new Error(`Order validation failed: ${validationResult.reason}`);
      }

      // Create order object
      const order: Order = {
        orderId,
        clientOrderId: orderRequest.clientOrderId || orderId,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        type: orderRequest.type,
        quantity: orderRequest.quantity,
        price: orderRequest.price || 0,
        stopPrice: orderRequest.stopPrice,
        status: 'NEW',
        timeInForce: orderRequest.timeInForce || 'GTC',
        executedQty: 0,
        cummulativeQuoteQty: 0,
        avgPrice: 0,
        commission: 0,
        commissionAsset: '',
        time: Date.now(),
        updateTime: Date.now(),
        isWorking: true,
        origQty: orderRequest.quantity,
        fills: []
      };

      // Store order
      this.orders.set(orderId, order);
      this.pendingOrders.set(orderId, orderRequest);

      // Submit to broker
      if (brokerId) {
        await this.submitToBroker(orderId, orderRequest, brokerId);
      }

      // Emit order update
      this.onOrderUpdate?.(order);

      return orderId;
    } catch (error) {
      this.handleError('ORDER_CREATION_FAILED', error, orderRequest.symbol);
      throw error;
    }
  }

  /**
   * Create bracket order (entry + stop loss + take profit)
   */
  async createBracketOrder(
    bracketOrder: BracketOrder,
    brokerId?: string
  ): Promise<{
    entryOrderId: string;
    stopLossOrderId?: string;
    takeProfitOrderId?: string;
  }> {
    try {
      // Create entry order first
      const entryOrderId = await this.createOrder(bracketOrder.entryOrder, brokerId);
      
      const result = { entryOrderId } as any;

      // Create stop loss order if specified
      if (bracketOrder.stopLoss) {
        const stopLossOrderId = await this.createOrder(bracketOrder.stopLoss, brokerId);
        result.stopLossOrderId = stopLossOrderId;
        
        // Link orders
        this.linkOrders(entryOrderId, stopLossOrderId, 'STOP_LOSS');
      }

      // Create take profit order if specified
      if (bracketOrder.takeProfit) {
        const takeProfitOrderId = await this.createOrder(bracketOrder.takeProfit, brokerId);
        result.takeProfitOrderId = takeProfitOrderId;
        
        // Link orders
        this.linkOrders(entryOrderId, takeProfitOrderId, 'TAKE_PROFIT');
      }

      return result;
    } catch (error) {
      this.handleError('BRACKET_ORDER_FAILED', error, bracketOrder.entryOrder.symbol);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, brokerId?: string): Promise<void> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status === 'FILLED' || order.status === 'CANCELED') {
        throw new Error(`Cannot cancel order in ${order.status} status`);
      }

      // Update order status
      order.status = 'PENDING_CANCEL';
      order.updateTime = Date.now();
      this.orders.set(orderId, order);

      // Submit cancellation to broker
      if (brokerId) {
        await this.cancelOrderOnBroker(orderId, brokerId);
      } else {
        // Mark as canceled locally
        order.status = 'CANCELED';
        order.updateTime = Date.now();
        this.orders.set(orderId, order);
      }

      this.onOrderUpdate?.(order);
    } catch (error) {
      const order = this.orders.get(orderId);
      this.handleError('ORDER_CANCELLATION_FAILED', error, order?.symbol);
      throw error;
    }
  }

  /**
   * Modify an existing order
   */
  async modifyOrder(
    orderId: string,
    modifications: Partial<OrderRequest>,
    brokerId?: string
  ): Promise<void> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status !== 'NEW' && order.status !== 'PARTIALLY_FILLED') {
        throw new Error(`Cannot modify order in ${order.status} status`);
      }

      // Apply modifications
      if (modifications.quantity !== undefined) {
        order.quantity = modifications.quantity;
      }
      if (modifications.price !== undefined) {
        order.price = modifications.price;
      }
      if (modifications.stopPrice !== undefined) {
        order.stopPrice = modifications.stopPrice;
      }

      order.updateTime = Date.now();
      this.orders.set(orderId, order);

      // Submit modification to broker
      if (brokerId) {
        await this.modifyOrderOnBroker(orderId, modifications, brokerId);
      }

      this.onOrderUpdate?.(order);
    } catch (error) {
      const orderForError = this.orders.get(orderId);
      this.handleError('ORDER_MODIFICATION_FAILED', error, orderForError?.symbol);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get all orders
   */
  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  /**
   * Get orders by symbol
   */
  getOrdersBySymbol(symbol: string): Order[] {
    return Array.from(this.orders.values())
      .filter(order => order.symbol === symbol);
  }

  /**
   * Get active orders
   */
  getActiveOrders(): Order[] {
    return Array.from(this.orders.values())
      .filter(order => order.status === 'NEW' || order.status === 'PARTIALLY_FILLED');
  }

  /**
   * Get order history
   */
  getOrderHistory(limit: number = 100): Order[] {
    return Array.from(this.orders.values())
      .sort((a, b) => b.updateTime - a.updateTime)
      .slice(0, limit);
  }

  /**
   * Process execution report from broker
   */
  async processExecutionReport(report: ExecutionReport): Promise<void> {
    try {
      const order = this.orders.get(report.orderId);
      if (!order) {
        console.warn(`Received execution report for unknown order: ${report.orderId}`);
        return;
      }

      // Update order based on execution report
      order.status = report.orderStatus;
      order.executedQty = report.cumulativeFilledQuantity;
      order.avgPrice = report.averagePrice;
      order.commission += report.commission;
      order.commissionAsset = report.commissionAsset;
      order.updateTime = report.transactionTime;

      // Add fill if this is a trade execution
      if (report.executionType === 'TRADE' && report.lastExecutedQuantity) {
        order.fills.push({
          price: report.lastExecutedPrice || 0,
          qty: report.lastExecutedQuantity,
          commission: report.commission,
          commissionAsset: report.commissionAsset,
          tradeId: Date.now() // Would be actual trade ID from broker
        });
      }

      // Update cumulative quote quantity
      if (report.lastExecutedPrice && report.lastExecutedQuantity) {
        order.cummulativeQuoteQty += report.lastExecutedPrice * report.lastExecutedQuantity;
      }

      // Mark as not working if filled or canceled
      if (order.status === 'FILLED' || order.status === 'CANCELED' || order.status === 'REJECTED') {
        order.isWorking = false;
      }

      this.orders.set(order.orderId, order);

      // Store execution report
      const reports = this.executionReports.get(report.orderId) || [];
      reports.push(report);
      this.executionReports.set(report.orderId, reports);

      // Handle linked orders (for bracket orders)
      await this.handleLinkedOrders(order);

      // Emit events
      this.onOrderUpdate?.(order);
      this.onExecutionReport?.(report);

    } catch (error) {
      this.handleError('EXECUTION_REPORT_PROCESSING_FAILED', error, report.symbol);
    }
  }

  /**
   * Calculate order value
   */
  calculateOrderValue(orderRequest: OrderRequest, currentPrice?: number): number {
    const price = orderRequest.price || currentPrice || 0;
    return price * orderRequest.quantity;
  }

  /**
   * Calculate required margin
   */
  calculateRequiredMargin(
    orderRequest: OrderRequest, 
    leverage: number = 1,
    currentPrice?: number
  ): number {
    const orderValue = this.calculateOrderValue(orderRequest, currentPrice);
    return orderValue / leverage;
  }

  /**
   * Get order statistics
   */
  getOrderStatistics(): {
    totalOrders: number;
    activeOrders: number;
    filledOrders: number;
    canceledOrders: number;
    rejectedOrders: number;
    fillRate: number;
    averageExecutionTime: number;
  } {
    const orders = Array.from(this.orders.values());
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'NEW' || o.status === 'PARTIALLY_FILLED').length;
    const filledOrders = orders.filter(o => o.status === 'FILLED').length;
    const canceledOrders = orders.filter(o => o.status === 'CANCELED').length;
    const rejectedOrders = orders.filter(o => o.status === 'REJECTED').length;
    
    const fillRate = totalOrders > 0 ? filledOrders / totalOrders : 0;
    
    // Calculate average execution time for filled orders
    const executionTimes = orders
      .filter(o => o.status === 'FILLED')
      .map(o => o.updateTime - o.time);
    const averageExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    return {
      totalOrders,
      activeOrders,
      filledOrders,
      canceledOrders,
      rejectedOrders,
      fillRate,
      averageExecutionTime
    };
  }

  // Private methods

  private async validateOrder(
    orderRequest: OrderRequest,
    brokerId?: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // Basic validation
    if (!orderRequest.symbol || !orderRequest.side || !orderRequest.type || !orderRequest.quantity) {
      return { valid: false, reason: 'Missing required order fields' };
    }

    if (orderRequest.quantity <= 0) {
      return { valid: false, reason: 'Quantity must be positive' };
    }

    if (orderRequest.type === 'LIMIT' && (!orderRequest.price || orderRequest.price <= 0)) {
      return { valid: false, reason: 'Limit orders require a positive price' };
    }

    // Risk limits validation
    if (this.riskLimits) {
      const orderValue = this.calculateOrderValue(orderRequest);
      
      if (orderValue > this.riskLimits.maxOrderValue) {
        return { valid: false, reason: 'Order value exceeds maximum allowed' };
      }

      if (orderRequest.quantity > this.riskLimits.maxPositionSize) {
        return { valid: false, reason: 'Order quantity exceeds maximum position size' };
      }

      // Check symbol restrictions
      if (this.riskLimits.blockedSymbols?.includes(orderRequest.symbol)) {
        return { valid: false, reason: 'Symbol is blocked for trading' };
      }

      if (this.riskLimits.allowedSymbols && 
          !this.riskLimits.allowedSymbols.includes(orderRequest.symbol)) {
        return { valid: false, reason: 'Symbol is not in allowed list' };
      }

      // Check maximum open orders
      const activeOrderCount = this.getActiveOrders().length;
      if (activeOrderCount >= this.riskLimits.maxOpenOrders) {
        return { valid: false, reason: 'Maximum open orders limit reached' };
      }
    }

    // Broker-specific validation
    if (brokerId) {
      const brokerValidation = await this.validateOrderForBroker(orderRequest, brokerId);
      if (!brokerValidation.valid) {
        return brokerValidation;
      }
    }

    return { valid: true };
  }

  private async validateOrderForBroker(
    orderRequest: OrderRequest,
    brokerId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    const account = this.brokerAccounts.get(brokerId);
    if (!account) {
      return { valid: false, reason: 'Broker account not found' };
    }

    // Check account permissions
    if (!account.permissions.includes('SPOT_TRADING') && orderRequest.type !== 'MARKET') {
      return { valid: false, reason: 'Account does not have spot trading permissions' };
    }

    // Check balance (simplified)
    const requiredMargin = this.calculateRequiredMargin(orderRequest);
    if (account.balance.availableBalance < requiredMargin) {
      return { valid: false, reason: 'Insufficient balance' };
    }

    return { valid: true };
  }

  private async submitToBroker(
    orderId: string,
    orderRequest: OrderRequest,
    brokerId: string
  ): Promise<void> {
    // This would integrate with actual broker APIs
    // For now, simulate order submission
    setTimeout(() => {
      const report: ExecutionReport = {
        orderId,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        orderType: orderRequest.type,
        executionType: 'NEW',
        orderStatus: 'NEW',
        price: orderRequest.price || 0,
        quantity: orderRequest.quantity,
        cumulativeFilledQuantity: 0,
        averagePrice: 0,
        commission: 0,
        commissionAsset: 'USDT',
        timestamp: Date.now(),
        transactionTime: Date.now(),
        brokerId
      };
      
      this.processExecutionReport(report);
    }, 100);
  }

  private async cancelOrderOnBroker(orderId: string, brokerId: string): Promise<void> {
    // Simulate order cancellation
    setTimeout(() => {
      const order = this.orders.get(orderId);
      if (order) {
        const report: ExecutionReport = {
          orderId,
          symbol: order.symbol,
          side: order.side,
          orderType: order.type,
          executionType: 'CANCELED',
          orderStatus: 'CANCELED',
          price: order.price,
          quantity: order.quantity,
          cumulativeFilledQuantity: order.executedQty,
          averagePrice: order.avgPrice,
          commission: order.commission,
          commissionAsset: order.commissionAsset,
          timestamp: Date.now(),
          transactionTime: Date.now(),
          brokerId
        };
        
        this.processExecutionReport(report);
      }
    }, 100);
  }

  private async modifyOrderOnBroker(
    orderId: string,
    modifications: Partial<OrderRequest>,
    brokerId: string
  ): Promise<void> {
    // Simulate order modification
    console.log(`Modifying order ${orderId} on broker ${brokerId}:`, modifications);
  }

  private linkOrders(parentOrderId: string, childOrderId: string, type: string): void {
    // Store order relationships for bracket orders
    // This would be implemented based on specific requirements
    console.log(`Linking orders: ${parentOrderId} -> ${childOrderId} (${type})`);
  }

  private async handleLinkedOrders(order: Order): Promise<void> {
    // Handle bracket order logic when parent order is filled
    if (order.status === 'FILLED') {
      // Cancel other legs of bracket order, activate stop/take profit orders, etc.
      console.log(`Handling linked orders for filled order: ${order.orderId}`);
    }
  }

  private generateOrderId(): string {
    return `ORD_${Date.now()}_${this.orderSequence++}`;
  }

  private handleError(code: string, error: any, symbol?: string): void {
    const tradingError: TradingError = {
      code,
      message: error.message || 'Unknown error',
      details: error,
      timestamp: Date.now(),
      severity: 'HIGH',
      component: 'OrderManager',
      symbol
    };

    console.error('Order Manager Error:', tradingError);
    this.onError?.(tradingError);
  }

  private async loadPersistedState(): Promise<void> {
    // Load orders and state from persistent storage
    // This would integrate with actual storage system
    console.log('Loading persisted order state...');
  }

  private async persistState(): Promise<void> {
    // Persist orders and state to storage
    console.log('Persisting order state...');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.orders.clear();
    this.pendingOrders.clear();
    this.executionReports.clear();
    this.brokerAccounts.clear();
    console.log('🧹 Order Manager destroyed');
  }
} 