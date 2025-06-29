import { useState, useEffect, useCallback, useRef } from 'react';
import { OrderManager } from '@/lib/orders/OrderManager';
import { CommissionCalculator } from '@/lib/orders/CommissionCalculator';
import {
  Order,
  OrderRequest,
  OrderStatus,
  OrderFill,
  OrderManagerConfig,
  OrderPerformanceMetrics,
  OrderError,
  OrderEvent,
  OrderHistoryFilter,
  OrderHistoryResult
} from '@/types/orders.types';

interface UseOrderManagementOptions {
  config?: Partial<OrderManagerConfig>;
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
}

interface OrderManagementState {
  orders: Order[];
  activeOrders: Order[];
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;
  performanceMetrics: OrderPerformanceMetrics | null;
  connectionStatus: Record<string, any>;
}

export function useOrderManagement(options: UseOrderManagementOptions = {}) {
  const {
    config = {},
    enableRealTimeUpdates = true,
    autoRefreshInterval = 5000
  } = options;
  
  // State
  const [state, setState] = useState<OrderManagementState>({
    orders: [],
    activeOrders: [],
    orderHistory: [],
    isLoading: false,
    error: null,
    performanceMetrics: null,
    connectionStatus: {}
  });
  
  // Refs
  const orderManagerRef = useRef<OrderManager | null>(null);
  const commissionCalculatorRef = useRef<CommissionCalculator | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize order manager
  useEffect(() => {
    const defaultConfig: OrderManagerConfig = {
      maxOrdersPerSecond: 10,
      maxOrderValue: 100000,
      maxOrderSize: 10000,
      maxOpenOrders: 50,
      orderTimeout: 30000,
      fillTimeout: 60000,
      cancelTimeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      retryBackoffMultiplier: 2,
      enablePreTradeRisk: true,
      enableRealTimeRisk: true,
      enablePostTradeRisk: true,
      enablePerformanceTracking: true,
      metricsCollectionInterval: 30000,
      orderHistoryRetentionDays: 90,
      compressionEnabled: true,
      defaultRoutingAlgorithm: 'BEST_EXECUTION',
      enableSmartRouting: true,
      routingUpdateInterval: 10000,
      ...config
    };
    
    try {
      orderManagerRef.current = OrderManager.getInstance(defaultConfig);
      commissionCalculatorRef.current = new CommissionCalculator();
      
      // Set up event listeners
      setupEventListeners();
      
      // Initial data load
      loadInitialData();
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize order manager'
      }));
    }
    
    return () => {
      cleanup();
    };
  }, []);
  
  // Auto refresh
  useEffect(() => {
    if (enableRealTimeUpdates && autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, autoRefreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [enableRealTimeUpdates, autoRefreshInterval]);
  
  const setupEventListeners = useCallback(() => {
    const orderManager = orderManagerRef.current;
    if (!orderManager) return;
    
    // Order events
    orderManager.on('orderEvent', handleOrderEvent);
    orderManager.on('fill', handleOrderFill);
    orderManager.on('error', handleOrderError);
    orderManager.on('performanceMetrics', handlePerformanceMetrics);
    orderManager.on('riskBreach', handleRiskBreach);
    orderManager.on('notification', handleNotification);
    
    // Connection events
    orderManager.on('connectionEstablished', handleConnectionChange);
    orderManager.on('connectionLost', handleConnectionChange);
    orderManager.on('connectionError', handleConnectionChange);
  }, []);
  
  const handleOrderEvent = useCallback((event: OrderEvent) => {
    // Update orders based on event
    setState(prev => {
      const updatedOrders = [...prev.orders];
      const orderIndex = updatedOrders.findIndex(o => o.orderId === event.orderId);
      
      if (orderIndex >= 0) {
        // Update existing order
        const order = updatedOrders[orderIndex];
        updatedOrders[orderIndex] = {
          ...order,
          ...event.data,
          lastModifiedAt: event.timestamp
        };
      }
      
      const activeOrders = updatedOrders.filter(order => 
        ['PENDING_VALIDATION', 'VALIDATED', 'SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(order.status)
      );
      
      return {
        ...prev,
        orders: updatedOrders,
        activeOrders
      };
    });
  }, []);
  
  const handleOrderFill = useCallback((fill: OrderFill) => {
    // Update order with fill information
    setState(prev => {
      const updatedOrders = prev.orders.map(order => {
        if (order.orderId === fill.orderId) {
          const updatedFills = [...order.fills, fill];
          const executedQuantity = updatedFills.reduce((sum, f) => sum + f.quantity, 0);
          const totalValue = updatedFills.reduce((sum, f) => sum + (f.price * f.quantity), 0);
          const averagePrice = executedQuantity > 0 ? totalValue / executedQuantity : 0;
          
          let status: OrderStatus = order.status;
          if (executedQuantity >= order.originalQuantity) {
            status = 'FILLED';
          } else if (executedQuantity > 0) {
            status = 'PARTIALLY_FILLED';
          }
          
          return {
            ...order,
            fills: updatedFills,
            executedQuantity,
            remainingQuantity: order.originalQuantity - executedQuantity,
            averagePrice,
            lastExecutedPrice: fill.price,
            totalCommission: order.totalCommission + fill.commission,
            totalFees: order.totalFees + fill.fees,
            status,
            lastModifiedAt: fill.timestamp
          };
        }
        return order;
      });
      
      const activeOrders = updatedOrders.filter(order => 
        ['PENDING_VALIDATION', 'VALIDATED', 'SUBMITTED', 'ACKNOWLEDGED', 'PARTIALLY_FILLED'].includes(order.status)
      );
      
      return {
        ...prev,
        orders: updatedOrders,
        activeOrders
      };
    });
  }, []);
  
  const handleOrderError = useCallback((error: OrderError) => {
    setState(prev => ({
      ...prev,
      error: error.message
    }));
  }, []);
  
  const handlePerformanceMetrics = useCallback((metrics: OrderPerformanceMetrics) => {
    setState(prev => ({
      ...prev,
      performanceMetrics: metrics
    }));
  }, []);
  
  const handleRiskBreach = useCallback((data: any) => {
    console.warn('Risk breach detected:', data);
    // Could trigger notifications or automatic actions
  }, []);
  
  const handleNotification = useCallback((notification: any) => {
    console.log('Order notification:', notification);
    // Could trigger UI notifications
  }, []);
  
  const handleConnectionChange = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        [data.venue]: data
      }
    }));
  }, []);
  
  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const orderManager = orderManagerRef.current;
      if (!orderManager) throw new Error('Order manager not initialized');
      
      // Load active orders
      const activeOrders = orderManager.getActiveOrders();
      
      // Load performance metrics
      const performanceMetrics = orderManager.getPerformanceMetrics();
      
      setState(prev => ({
        ...prev,
        orders: activeOrders,
        activeOrders,
        performanceMetrics,
        isLoading: false
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load initial data',
        isLoading: false
      }));
    }
  }, []);
  
  const refreshData = useCallback(async () => {
    try {
      const orderManager = orderManagerRef.current;
      if (!orderManager) return;
      
      const activeOrders = orderManager.getActiveOrders();
      const performanceMetrics = orderManager.getPerformanceMetrics();
      
      setState(prev => ({
        ...prev,
        orders: activeOrders,
        activeOrders,
        performanceMetrics
      }));
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, []);
  
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    const orderManager = orderManagerRef.current;
    if (orderManager) {
      orderManager.removeAllListeners();
    }
  }, []);
  
  // Order operations
  const createOrder = useCallback(async (orderRequest: OrderRequest): Promise<Order> => {
    const orderManager = orderManagerRef.current;
    if (!orderManager) {
      throw new Error('Order manager not initialized');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const order = await orderManager.createOrder(orderRequest);
      
      setState(prev => ({
        ...prev,
        orders: [...prev.orders, order],
        activeOrders: [...prev.activeOrders, order],
        isLoading: false
      }));
      
      return order;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create order',
        isLoading: false
      }));
      throw error;
    }
  }, []);
  
  const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
    const orderManager = orderManagerRef.current;
    if (!orderManager) {
      throw new Error('Order manager not initialized');
    }
    
    try {
      const success = await orderManager.cancelOrder(orderId, reason);
      
      if (success) {
        setState(prev => ({
          ...prev,
          orders: prev.orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'CANCELED', lastModifiedAt: Date.now() }
              : order
          ),
          activeOrders: prev.activeOrders.filter(order => order.orderId !== orderId)
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel order'
      }));
      return false;
    }
  }, []);
  
  const modifyOrder = useCallback(async (
    orderId: string,
    modifications: Partial<OrderRequest>,
    reason: string
  ): Promise<boolean> => {
    const orderManager = orderManagerRef.current;
    if (!orderManager) {
      throw new Error('Order manager not initialized');
    }
    
    try {
      const success = await orderManager.modifyOrder(orderId, modifications, reason);
      
      if (success) {
        setState(prev => ({
          ...prev,
          orders: prev.orders.map(order => 
            order.orderId === orderId 
              ? { ...order, ...modifications, lastModifiedAt: Date.now() }
              : order
          )
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to modify order'
      }));
      return false;
    }
  }, []);
  
  const getOrder = useCallback((orderId: string): Order | undefined => {
    const orderManager = orderManagerRef.current;
    return orderManager?.getOrder(orderId);
  }, []);
  
  const getOrdersBySymbol = useCallback((symbol: string): Order[] => {
    const orderManager = orderManagerRef.current;
    return orderManager?.getOrdersBySymbol(symbol) || [];
  }, []);
  
  const getOrdersByAccount = useCallback((account: string): Order[] => {
    const orderManager = orderManagerRef.current;
    return orderManager?.getOrdersByAccount(account) || [];
  }, []);
  
  const searchOrderHistory = useCallback(async (filter: OrderHistoryFilter): Promise<OrderHistoryResult> => {
    // Mock implementation - in production, this would call the order manager's search method
    const filteredOrders = state.orders.filter(order => {
      if (filter.symbols && !filter.symbols.includes(order.symbol)) return false;
      if (filter.sides && !filter.sides.includes(order.side)) return false;
      if (filter.types && !filter.types.includes(order.type)) return false;
      if (filter.statuses && !filter.statuses.includes(order.status)) return false;
      if (filter.accounts && !filter.accounts.includes(order.account)) return false;
      if (filter.dateFrom && order.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && order.createdAt > filter.dateTo) return false;
      return true;
    });
    
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      totalCount: filteredOrders.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredOrders.length / pageSize),
      summary: {
        totalOrders: filteredOrders.length,
        totalVolume: filteredOrders.reduce((sum, order) => sum + (order.averagePrice * order.executedQuantity), 0),
        totalValue: filteredOrders.reduce((sum, order) => sum + (order.averagePrice * order.executedQuantity), 0),
        totalCommission: filteredOrders.reduce((sum, order) => sum + order.totalCommission, 0),
        averageFillRate: filteredOrders.length > 0 ? 
          filteredOrders.reduce((sum, order) => sum + (order.executedQuantity / order.originalQuantity), 0) / filteredOrders.length : 0,
        averageSlippage: 0, // Would be calculated from actual slippage data
        averageExecutionTime: 0, // Would be calculated from actual timing data
        statusBreakdown: {} as Record<OrderStatus, number>,
        venueBreakdown: {},
        bestExecutingVenue: '',
        worstExecutingVenue: '',
        totalSavings: 0,
        totalCosts: filteredOrders.reduce((sum, order) => sum + order.totalCommission + order.totalFees, 0)
      }
    };
  }, [state.orders]);
  
  const estimateCommission = useCallback((
    venue: string,
    account: string,
    notionalValue: number,
    liquidityFlag: 'MAKER' | 'TAKER' = 'TAKER'
  ): number => {
    const calculator = commissionCalculatorRef.current;
    if (!calculator) return 0;
    
    return calculator.estimateCommission(venue, account, notionalValue, liquidityFlag);
  }, []);
  
  const getCommissionStats = useCallback((account: string, venue?: string) => {
    const calculator = commissionCalculatorRef.current;
    if (!calculator) return null;
    
    return calculator.getMonthlyStats(account, venue);
  }, []);
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  return {
    // State
    ...state,
    
    // Order operations
    createOrder,
    cancelOrder,
    modifyOrder,
    
    // Query operations
    getOrder,
    getOrdersBySymbol,
    getOrdersByAccount,
    searchOrderHistory,
    
    // Commission operations
    estimateCommission,
    getCommissionStats,
    
    // Utility operations
    refreshData,
    clearError,
    
    // Computed values
    orderCount: state.orders.length,
    activeOrderCount: state.activeOrders.length,
    filledOrderCount: state.orders.filter(o => o.status === 'FILLED').length,
    cancelledOrderCount: state.orders.filter(o => o.status === 'CANCELED').length,
    totalVolume: state.orders.reduce((sum, order) => sum + (order.averagePrice * order.executedQuantity), 0),
    totalCommission: state.orders.reduce((sum, order) => sum + order.totalCommission, 0),
    
    // Status indicators
    isConnected: Object.values(state.connectionStatus).some((status: any) => status.status === 'CONNECTED'),
    hasErrors: !!state.error,
    isOperational: !state.isLoading && !state.error
  };
} 