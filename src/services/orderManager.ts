import { MexcPrivateService, OrderRequest, MexcOrder } from './mexcPrivateService';
import { toast } from 'sonner';

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  quantity: number;
  price: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial' | 'rejected';
  timestamp: number;
  filled?: number;
  mexcOrderId?: string;
  mexcOrder?: MexcOrder;
}

export interface OrderValidation {
  valid: boolean;
  error?: string;
}

export class OrderManager {
  private mexcService: MexcPrivateService | null = null;
  private orders: Map<string, Order> = new Map();
  private isDemo: boolean = true; // Default to demo mode
  private initializationPromise: Promise<void>;

  constructor() {
    // Initialize asynchronously
    this.initializationPromise = this.initialize();
    
    // Load existing orders from localStorage
    this.loadOrdersFromStorage();
  }

  private async initialize(): Promise<void> {
    try {
      const isConfigured = await MexcPrivateService.isConfigured();
      if (isConfigured) {
        this.mexcService = new MexcPrivateService();
        this.isDemo = false;
        console.log('OrderManager: Using live MEXC trading');
      } else {
        this.isDemo = true;
        console.log('OrderManager: Using demo mode - API keys not configured');
      }
    } catch (error) {
      console.error('OrderManager initialization error:', error);
      this.isDemo = true;
    }
  }

  private async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
  }

  private loadOrdersFromStorage(): void {
    try {
      const savedOrders = localStorage.getItem('trading_orders');
      if (savedOrders) {
        const orderArray = JSON.parse(savedOrders);
        orderArray.forEach((order: Order) => {
          this.orders.set(order.id, order);
        });
      }
    } catch (error) {
      console.error('Failed to load orders from storage:', error);
    }
  }

  private saveOrdersToStorage(): void {
    try {
      const orderArray = Array.from(this.orders.values());
      localStorage.setItem('trading_orders', JSON.stringify(orderArray));
    } catch (error) {
      console.error('Failed to save orders to storage:', error);
    }
  }

  private validateOrder(orderRequest: OrderRequest, availableBalance: number = 10000): OrderValidation {
    // Basic validation
    if (orderRequest.quantity <= 0) {
      return { valid: false, error: 'Quantity must be greater than 0' };
    }

    if (orderRequest.type === 'LIMIT' && !orderRequest.price) {
      return { valid: false, error: 'Price is required for limit orders' };
    }

    if (orderRequest.type === 'STOP_LOSS' && !orderRequest.stopPrice) {
      return { valid: false, error: 'Stop price is required for stop orders' };
    }

    // Balance validation for buy orders
    if (orderRequest.side === 'BUY') {
      const orderValue = orderRequest.quantity * (orderRequest.price || 0);
      if (orderValue > availableBalance) {
        return { valid: false, error: 'Insufficient balance for this order' };
      }
    }

    // Price validation
    if (orderRequest.price && orderRequest.price <= 0) {
      return { valid: false, error: 'Price must be greater than 0' };
    }

    return { valid: true };
  }

  private convertToMexcOrderRequest(order: Partial<Order>): OrderRequest {
    const mexcType = order.type === 'market' ? 'MARKET' : 
                    order.type === 'limit' ? 'LIMIT' : 'STOP_LOSS';

    return {
      symbol: order.symbol!,
      side: order.side!.toUpperCase() as 'BUY' | 'SELL',
      type: mexcType,
      quantity: order.quantity!,
      price: order.price,
      stopPrice: order.stopPrice,
      timeInForce: mexcType === 'LIMIT' ? 'GTC' : undefined
    };
  }

  async placeOrder(orderData: Partial<Order>): Promise<Order> {
    await this.ensureInitialized();
    
    const orderId = Date.now().toString();
    
    const order: Order = {
      id: orderId,
      symbol: orderData.symbol!,
      side: orderData.side!,
      type: orderData.type!,
      quantity: orderData.quantity!,
      price: orderData.price!,
      stopPrice: orderData.stopPrice,
      status: 'pending',
      timestamp: Date.now()
    };

    try {
      if (this.isDemo) {
        // Demo mode - simulate order placement
        console.log('Demo mode: Simulating order placement', order);
        
        setTimeout(() => {
          order.status = 'filled';
          order.filled = order.quantity;
          this.orders.set(order.id, order);
          this.saveOrdersToStorage();
          toast.success(`Demo: ${order.side.toUpperCase()} order filled for ${order.quantity} ${order.symbol}`);
        }, 2000);

      } else if (this.mexcService) {
        // Live trading mode
        const mexcOrderRequest = this.convertToMexcOrderRequest(order);
        const validation = this.validateOrder(mexcOrderRequest);
        
        if (!validation.valid) {
          order.status = 'rejected';
          this.orders.set(order.id, order);
          this.saveOrdersToStorage();
          throw new Error(validation.error);
        }

        console.log('Placing live order on MEXC:', mexcOrderRequest);
        const mexcOrder = await this.mexcService.placeOrder(mexcOrderRequest);
        
        order.mexcOrderId = mexcOrder.orderId;
        order.mexcOrder = mexcOrder;
        order.status = mexcOrder.status.toLowerCase() as any;
        
        toast.success(`Live order placed: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`);
      }

      this.orders.set(order.id, order);
      this.saveOrdersToStorage();
      return order;

    } catch (error) {
      console.error('Failed to place order:', error);
      order.status = 'rejected';
      this.orders.set(order.id, order);
      this.saveOrdersToStorage();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Order failed: ${errorMessage}`);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.ensureInitialized();
    
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    try {
      if (this.isDemo) {
        // Demo mode
        order.status = 'cancelled';
        toast.success(`Demo: Order cancelled for ${order.symbol}`);
      } else if (this.mexcService && order.mexcOrderId) {
        // Live trading mode
        await this.mexcService.cancelOrder(order.symbol, order.mexcOrderId);
        order.status = 'cancelled';
        toast.success(`Live order cancelled: ${order.symbol}`);
      }

      this.orders.set(orderId, order);
      this.saveOrdersToStorage();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      toast.error(errorMessage);
      throw error;
    }
  }

  async refreshOrderStatus(orderId: string): Promise<Order> {
    await this.ensureInitialized();
    
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (this.isDemo || !this.mexcService || !order.mexcOrderId) {
      return order;
    }

    try {
      const mexcOrder = await this.mexcService.getOrderStatus(order.symbol, order.mexcOrderId);
      order.mexcOrder = mexcOrder;
      order.status = mexcOrder.status.toLowerCase() as any;
      order.filled = parseFloat(mexcOrder.executedQty);
      
      this.orders.set(orderId, order);
      this.saveOrdersToStorage();
      return order;
    } catch (error) {
      console.error('Failed to refresh order status:', error);
      return order;
    }
  }

  getOrders(): Order[] {
    return Array.from(this.orders.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  getOpenOrders(): Order[] {
    return this.getOrders().filter(order => 
      order.status === 'pending' || order.status === 'partial'
    );
  }

  isLiveMode(): boolean {
    return !this.isDemo;
  }

  async getConnectionStatus(): Promise<{ live: boolean; configured: boolean }> {
    await this.ensureInitialized();
    const configured = await MexcPrivateService.isConfigured();
    return {
      live: !this.isDemo,
      configured
    };
  }
}

// Global instance
export const orderManager = new OrderManager();
