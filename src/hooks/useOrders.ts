import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { measureFunction } from '../utils/performance/monitor';

// Order types
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'open' | 'filled' | 'partially_filled' | 'canceled' | 'rejected' | 'expired';
export type OrderTimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: OrderTimeInForce;
  clientOrderId?: string;
  extendedHours?: boolean;
}

export interface Order extends OrderRequest {
  id: string;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  fees?: number;
}

// Mock API functions (replace with actual API calls)
const fetchOrders = async (): Promise<Order[]> => {
  return measureFunction(
    async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    'fetch-orders'
  );
};

const fetchOrder = async (orderId: string): Promise<Order> => {
  return measureFunction(
    async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error(`Failed to fetch order ${orderId}`);
      return response.json();
    },
    'fetch-order',
    { orderId }
  );
};

const createOrder = async (orderRequest: OrderRequest): Promise<Order> => {
  return measureFunction(
    async () => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    'create-order',
    { orderRequest }
  );
};

const cancelOrder = async (orderId: string): Promise<{ success: boolean; message: string }> => {
  return measureFunction(
    async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to cancel order ${orderId}`);
      return response.json();
    },
    'cancel-order',
    { orderId }
  );
};

/**
 * Hook to fetch a single order by its ID.
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });
};

/**
 * Hook for managing trading orders with React Query
 */
export const useOrders = () => {
  const queryClient = useQueryClient();

  // Query for fetching all orders
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for creating a new order
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (newOrder) => {
      queryClient.setQueryData(['orders'], (oldOrders: Order[] = []) => [newOrder, ...oldOrders]);
      queryClient.setQueryData(['order', newOrder.id], newOrder);
    },
  });

  // Mutation for canceling an order
  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (_, orderId) => {
      queryClient.setQueryData(['order', orderId], (oldOrder: Order | undefined) => {
        if (!oldOrder) return undefined;
        return { ...oldOrder, status: 'canceled' as OrderStatus };
      });
      queryClient.setQueryData(['orders'], (oldOrders: Order[] = []) =>
        oldOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'canceled' as OrderStatus } : order
        )
      );
    },
  });

  // Helper functions to place orders
  const placeMarketOrder = (symbol: string, side: OrderSide, quantity: number) =>
    createOrderMutation.mutateAsync({ symbol, side, type: 'market', quantity });

  const placeLimitOrder = (
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
    timeInForce: OrderTimeInForce = 'day'
  ) => createOrderMutation.mutateAsync({ symbol, side, type: 'limit', quantity, price, timeInForce });

  const placeStopOrder = (
    symbol: string,
    side: OrderSide,
    quantity: number,
    stopPrice: number,
    timeInForce: OrderTimeInForce = 'day'
  ) => createOrderMutation.mutateAsync({ symbol, side, type: 'stop', quantity, stopPrice, timeInForce });

  const placeStopLimitOrder = (
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
    stopPrice: number,
    timeInForce: OrderTimeInForce = 'day'
  ) =>
    createOrderMutation.mutateAsync({
      symbol,
      side,
      type: 'stop_limit',
      quantity,
      price,
      stopPrice,
      timeInForce,
    });

  return {
    orders: ordersQuery,
    createOrder: createOrderMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    placeMarketOrder,
    placeLimitOrder,
    placeStopOrder,
    placeStopLimitOrder,
    isCreatingOrder: createOrderMutation.isPending,
    isCancelingOrder: cancelOrderMutation.isPending,
    createOrderError: createOrderMutation.error,
    cancelOrderError: cancelOrderMutation.error,
  };
};
