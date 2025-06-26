
import { useState, useEffect, useCallback } from 'react';
import { realTimeDataManager, RealTimePrice, OrderBookUpdate } from '@/services/realTimeDataManager';

export interface UseRealTimeDataOptions {
  symbol?: string;
  enableOrderBook?: boolean;
  enableTrades?: boolean;
  throttleMs?: number;
}

export const useEnhancedRealTimeData = (options: UseRealTimeDataOptions = {}) => {
  const { symbol, enableOrderBook = false, enableTrades = false, throttleMs = 100 } = options;
  
  const [priceData, setPriceData] = useState<RealTimePrice | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookUpdate | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    enhanced: false,
    optimized: false,
    fallbackActive: false
  });
  const [error, setError] = useState<string | null>(null);

  // Throttled update functions
  const throttledPriceUpdate = useCallback(
    throttle((data: RealTimePrice) => {
      setPriceData(data);
      setError(null);
    }, throttleMs),
    [throttleMs]
  );

  const throttledOrderBookUpdate = useCallback(
    throttle((data: OrderBookUpdate) => {
      setOrderBook(data);
    }, throttleMs),
    [throttleMs]
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        await realTimeDataManager.initialize();
        setConnectionStatus(realTimeDataManager.getConnectionStatus());
        
        // Get cached data immediately
        if (symbol) {
          const cachedPrice = realTimeDataManager.getCachedPrice(symbol);
          if (cachedPrice) {
            setPriceData(cachedPrice);
          }
          
          if (enableOrderBook) {
            const cachedOrderBook = realTimeDataManager.getCachedOrderBook(symbol);
            if (cachedOrderBook) {
              setOrderBook(cachedOrderBook);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize real-time data');
      }
    };

    initializeData();
  }, [symbol, enableOrderBook]);

  useEffect(() => {
    if (!symbol) return;

    const unsubscribers: (() => void)[] = [];

    try {
      // Subscribe to price updates
      const priceUnsub = realTimeDataManager.subscribe(
        `price_${symbol}`,
        throttledPriceUpdate
      );
      unsubscribers.push(priceUnsub);

      // Subscribe to order book updates
      if (enableOrderBook) {
        const orderBookUnsub = realTimeDataManager.subscribe(
          `orderbook_${symbol}`,
          throttledOrderBookUpdate
        );
        unsubscribers.push(orderBookUnsub);
      }

      // Subscribe to trade updates
      if (enableTrades) {
        const tradeUnsub = realTimeDataManager.subscribe(
          `trade_${symbol}`,
          (tradeData) => {
            setTrades(prev => [tradeData, ...prev.slice(0, 99)]); // Keep last 100 trades
          }
        );
        unsubscribers.push(tradeUnsub);
      }

      // Update connection status periodically
      const statusInterval = setInterval(() => {
        setConnectionStatus(realTimeDataManager.getConnectionStatus());
      }, 5000);

      return () => {
        unsubscribers.forEach(unsub => unsub());
        clearInterval(statusInterval);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to real-time data');
      return () => unsubscribers.forEach(unsub => unsub());
    }
  }, [symbol, enableOrderBook, enableTrades, throttledPriceUpdate, throttledOrderBookUpdate]);

  return {
    priceData,
    orderBook,
    trades,
    connectionStatus,
    error,
    isConnected: connectionStatus.isConnected,
    lastUpdate: priceData?.timestamp
  };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}
