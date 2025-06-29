import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/lib/trading/WebSocketManager';
import { 
  MarketData, 
  OrderBook, 
  Trade, 
  Symbol,
  WebSocketSubscription,
  TradingError 
} from '@/types/trading.types';

interface UseRealtimeDataOptions {
  symbols?: string[];
  exchanges?: string[];
  enableOrderBook?: boolean;
  enableTrades?: boolean;
  enableKlines?: boolean;
  orderBookDepth?: number;
  reconnectOnError?: boolean;
  bufferSize?: number;
}

interface RealtimeDataState {
  marketData: Map<string, MarketData>;
  orderBooks: Map<string, OrderBook>;
  trades: Map<string, Trade[]>;
  isConnected: boolean;
  connectionStatus: Map<string, string>;
  latency: Map<string, number>;
  error: TradingError | null;
  subscriptions: Set<string>;
  lastUpdate: number;
}

export const useRealtimeData = (options: UseRealtimeDataOptions = {}) => {
  const {
    symbols = [],
    exchanges = ['mexc'],
    enableOrderBook = true,
    enableTrades = true,
    enableKlines = false,
    orderBookDepth = 20,
    reconnectOnError = true,
    bufferSize = 100
  } = options;

  const [state, setState] = useState<RealtimeDataState>({
    marketData: new Map(),
    orderBooks: new Map(),
    trades: new Map(),
    isConnected: false,
    connectionStatus: new Map(),
    latency: new Map(),
    error: null,
    subscriptions: new Set(),
    lastUpdate: 0
  });

  const wsManager = useRef<WebSocketManager | null>(null);
  const subscriptionsRef = useRef<Map<string, WebSocketSubscription>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataBufferRef = useRef<Map<string, any[]>>(new Map());

  // Initialize WebSocket manager
  useEffect(() => {
    wsManager.current = WebSocketManager.getInstance();
    return () => {
      cleanup();
    };
  }, []);

  // Setup connections for exchanges
  useEffect(() => {
    if (!wsManager.current) return;

    const setupConnections = async () => {
      try {
        for (const exchange of exchanges) {
          const connectionId = `${exchange}_market_data`;
          const wsUrl = getWebSocketUrl(exchange);
          
          await wsManager.current!.createConnection(connectionId, wsUrl, {
            compression: true,
            autoReconnect: reconnectOnError
          });

          // Update connection status
          setState(prev => ({
            ...prev,
            connectionStatus: new Map(prev.connectionStatus).set(exchange, 'CONNECTED'),
            isConnected: true
          }));
        }
      } catch (error) {
        console.error('Failed to setup WebSocket connections:', error);
        setState(prev => ({
          ...prev,
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Failed to establish WebSocket connections',
            details: error,
            timestamp: Date.now(),
            severity: 'HIGH',
            component: 'useRealtimeData'
          }
        }));
      }
    };

    setupConnections();
  }, [exchanges, reconnectOnError]);

  // Subscribe to symbols
  useEffect(() => {
    if (!wsManager.current || symbols.length === 0) return;

    const subscribeToSymbols = () => {
      symbols.forEach(symbol => {
        exchanges.forEach(exchange => {
          const connectionId = `${exchange}_market_data`;
          
          // Subscribe to ticker data
          subscribeToTicker(connectionId, symbol);
          
          // Subscribe to order book if enabled
          if (enableOrderBook) {
            subscribeToOrderBook(connectionId, symbol, orderBookDepth);
          }
          
          // Subscribe to trades if enabled
          if (enableTrades) {
            subscribeToTrades(connectionId, symbol);
          }
          
          // Subscribe to klines if enabled
          if (enableKlines) {
            subscribeToKlines(connectionId, symbol, '1m');
          }
        });
      });
    };

    subscribeToSymbols();

    return () => {
      unsubscribeAll();
    };
  }, [symbols, exchanges, enableOrderBook, enableTrades, enableKlines, orderBookDepth]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsManager.current) {
        const metrics = wsManager.current.getPerformanceMetrics();
        const latencyMap = new Map();
        
        Object.entries(metrics).forEach(([connectionId, data]: [string, any]) => {
          if (data.averageLatency !== undefined) {
            latencyMap.set(connectionId, data.averageLatency);
          }
        });

        setState(prev => ({
          ...prev,
          latency: latencyMap,
          lastUpdate: Date.now()
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to ticker data
  const subscribeToTicker = useCallback((connectionId: string, symbol: string) => {
    if (!wsManager.current) return;

    const subscription: WebSocketSubscription = {
      stream: `${symbol.toLowerCase()}@ticker`,
      symbol,
      callback: (data) => {
        const marketData = parseTickerData(data, symbol);
        if (marketData) {
          setState(prev => {
            const newMarketData = new Map(prev.marketData);
            newMarketData.set(symbol, marketData);
            return {
              ...prev,
              marketData: newMarketData,
              lastUpdate: Date.now()
            };
          });
        }
      }
    };

    const streamKey = `ticker_${symbol}`;
    subscriptionsRef.current.set(streamKey, subscription);
    wsManager.current.subscribe(connectionId, subscription);

    setState(prev => ({
      ...prev,
      subscriptions: new Set(prev.subscriptions).add(streamKey)
    }));
  }, []);

  // Subscribe to order book data
  const subscribeToOrderBook = useCallback((connectionId: string, symbol: string, depth: number) => {
    if (!wsManager.current) return;

    const subscription: WebSocketSubscription = {
      stream: `${symbol.toLowerCase()}@depth${depth}`,
      symbol,
      depth,
      callback: (data) => {
        const orderBook = parseOrderBookData(data, symbol);
        if (orderBook) {
          setState(prev => {
            const newOrderBooks = new Map(prev.orderBooks);
            newOrderBooks.set(symbol, orderBook);
            return {
              ...prev,
              orderBooks: newOrderBooks,
              lastUpdate: Date.now()
            };
          });
        }
      }
    };

    const streamKey = `orderbook_${symbol}`;
    subscriptionsRef.current.set(streamKey, subscription);
    wsManager.current.subscribe(connectionId, subscription);

    setState(prev => ({
      ...prev,
      subscriptions: new Set(prev.subscriptions).add(streamKey)
    }));
  }, []);

  // Subscribe to trades data
  const subscribeToTrades = useCallback((connectionId: string, symbol: string) => {
    if (!wsManager.current) return;

    const subscription: WebSocketSubscription = {
      stream: `${symbol.toLowerCase()}@trade`,
      symbol,
      callback: (data) => {
        const trade = parseTradeData(data, symbol);
        if (trade) {
          setState(prev => {
            const newTrades = new Map(prev.trades);
            const symbolTrades = newTrades.get(symbol) || [];
            
            // Add new trade and maintain buffer size
            const updatedTrades = [trade, ...symbolTrades].slice(0, bufferSize);
            newTrades.set(symbol, updatedTrades);
            
            return {
              ...prev,
              trades: newTrades,
              lastUpdate: Date.now()
            };
          });
        }
      }
    };

    const streamKey = `trades_${symbol}`;
    subscriptionsRef.current.set(streamKey, subscription);
    wsManager.current.subscribe(connectionId, subscription);

    setState(prev => ({
      ...prev,
      subscriptions: new Set(prev.subscriptions).add(streamKey)
    }));
  }, [bufferSize]);

  // Subscribe to kline data
  const subscribeToKlines = useCallback((connectionId: string, symbol: string, interval: string) => {
    if (!wsManager.current) return;

    const subscription: WebSocketSubscription = {
      stream: `${symbol.toLowerCase()}@kline_${interval}`,
      symbol,
      interval,
      callback: (data) => {
        const kline = parseKlineData(data, symbol);
        if (kline) {
          // Handle kline data - could be stored in a separate state
          console.log('Kline data received:', kline);
        }
      }
    };

    const streamKey = `klines_${symbol}_${interval}`;
    subscriptionsRef.current.set(streamKey, subscription);
    wsManager.current.subscribe(connectionId, subscription);

    setState(prev => ({
      ...prev,
      subscriptions: new Set(prev.subscriptions).add(streamKey)
    }));
  }, []);

  // Unsubscribe from all streams
  const unsubscribeAll = useCallback(() => {
    if (!wsManager.current) return;

    subscriptionsRef.current.forEach((subscription, streamKey) => {
      exchanges.forEach(exchange => {
        const connectionId = `${exchange}_market_data`;
        wsManager.current!.unsubscribe(connectionId, streamKey);
      });
    });

    subscriptionsRef.current.clear();
    setState(prev => ({
      ...prev,
      subscriptions: new Set()
    }));
  }, [exchanges]);

  // Add symbol to watchlist
  const addSymbol = useCallback((symbol: string) => {
    if (symbols.includes(symbol)) return;
    
    exchanges.forEach(exchange => {
      const connectionId = `${exchange}_market_data`;
      subscribeToTicker(connectionId, symbol);
      
      if (enableOrderBook) {
        subscribeToOrderBook(connectionId, symbol, orderBookDepth);
      }
      
      if (enableTrades) {
        subscribeToTrades(connectionId, symbol);
      }
    });
  }, [symbols, exchanges, enableOrderBook, enableTrades, orderBookDepth]);

  // Remove symbol from watchlist
  const removeSymbol = useCallback((symbol: string) => {
    const keysToRemove = Array.from(subscriptionsRef.current.keys())
      .filter(key => key.includes(symbol));
    
    keysToRemove.forEach(key => {
      exchanges.forEach(exchange => {
        const connectionId = `${exchange}_market_data`;
        wsManager.current?.unsubscribe(connectionId, key);
      });
      subscriptionsRef.current.delete(key);
    });

    setState(prev => {
      const newMarketData = new Map(prev.marketData);
      const newOrderBooks = new Map(prev.orderBooks);
      const newTrades = new Map(prev.trades);
      const newSubscriptions = new Set(prev.subscriptions);
      
      newMarketData.delete(symbol);
      newOrderBooks.delete(symbol);
      newTrades.delete(symbol);
      keysToRemove.forEach(key => newSubscriptions.delete(key));
      
      return {
        ...prev,
        marketData: newMarketData,
        orderBooks: newOrderBooks,
        trades: newTrades,
        subscriptions: newSubscriptions
      };
    });
  }, [exchanges]);

  // Get market data for specific symbol
  const getMarketData = useCallback((symbol: string): MarketData | undefined => {
    return state.marketData.get(symbol);
  }, [state.marketData]);

  // Get order book for specific symbol
  const getOrderBook = useCallback((symbol: string): OrderBook | undefined => {
    return state.orderBooks.get(symbol);
  }, [state.orderBooks]);

  // Get trades for specific symbol
  const getTrades = useCallback((symbol: string): Trade[] => {
    return state.trades.get(symbol) || [];
  }, [state.trades]);

  // Get connection health
  const getConnectionHealth = useCallback(() => {
    if (!wsManager.current) return { healthy: false, details: {} };

    const connections = wsManager.current.getAllConnections();
    const health = {
      healthy: true,
      details: {} as Record<string, any>
    };

    connections.forEach((connection, id) => {
      const isHealthy = connection.status === 'CONNECTED' && 
                       connection.latency < 1000 &&
                       connection.reconnectAttempts < 3;
      
      health.details[id] = {
        status: connection.status,
        latency: connection.latency,
        reconnectAttempts: connection.reconnectAttempts,
        healthy: isHealthy
      };

      if (!isHealthy) {
        health.healthy = false;
      }
    });

    return health;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    unsubscribeAll();
    
    if (wsManager.current) {
      exchanges.forEach(exchange => {
        const connectionId = `${exchange}_market_data`;
        wsManager.current!.close(connectionId);
      });
    }
  }, [exchanges, unsubscribeAll]);

  // Utility functions for parsing data
  const parseTickerData = (data: any, symbol: string): MarketData | null => {
    try {
      return {
        symbol,
        price: parseFloat(data.c || data.price || 0),
        bid: parseFloat(data.b || data.bid || 0),
        ask: parseFloat(data.a || data.ask || 0),
        bidSize: parseFloat(data.B || data.bidSize || 0),
        askSize: parseFloat(data.A || data.askSize || 0),
        volume: parseFloat(data.v || data.volume || 0),
        volume24h: parseFloat(data.q || data.volume24h || 0),
        change: parseFloat(data.P || data.change || 0),
        changePercent: parseFloat(data.p || data.changePercent || 0),
        high: parseFloat(data.h || data.high || 0),
        low: parseFloat(data.l || data.low || 0),
        open: parseFloat(data.o || data.open || 0),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to parse ticker data:', error);
      return null;
    }
  };

  const parseOrderBookData = (data: any, symbol: string): OrderBook | null => {
    try {
      return {
        symbol,
        bids: (data.bids || data.b || []).map((bid: any) => ({
          price: parseFloat(bid[0]),
          size: parseFloat(bid[1]),
          count: bid[2] ? parseInt(bid[2]) : undefined
        })),
        asks: (data.asks || data.a || []).map((ask: any) => ({
          price: parseFloat(ask[0]),
          size: parseFloat(ask[1]),
          count: ask[2] ? parseInt(ask[2]) : undefined
        })),
        timestamp: Date.now(),
        lastUpdateId: data.lastUpdateId || data.u || 0
      };
    } catch (error) {
      console.error('Failed to parse order book data:', error);
      return null;
    }
  };

  const parseTradeData = (data: any, symbol: string): Trade | null => {
    try {
      return {
        id: data.t || data.id || String(Date.now()),
        symbol,
        price: parseFloat(data.p || data.price || 0),
        quantity: parseFloat(data.q || data.quantity || 0),
        side: data.m ? 'SELL' : 'BUY', // m = buyer is maker
        timestamp: data.T || data.timestamp || Date.now(),
        isBuyerMaker: data.m || false
      };
    } catch (error) {
      console.error('Failed to parse trade data:', error);
      return null;
    }
  };

  const parseKlineData = (data: any, symbol: string): any | null => {
    try {
      const kline = data.k || data;
      return {
        symbol,
        openTime: kline.t,
        closeTime: kline.T,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        trades: kline.n,
        interval: kline.i
      };
    } catch (error) {
      console.error('Failed to parse kline data:', error);
      return null;
    }
  };

  const getWebSocketUrl = (exchange: string): string => {
    const urls = {
      mexc: 'wss://wbs.mexc.com/ws',
      binance: 'wss://stream.binance.com:9443/ws',
      // Add more exchanges as needed
    };
    
    return urls[exchange as keyof typeof urls] || urls.mexc;
  };

  return {
    // State
    marketData: state.marketData,
    orderBooks: state.orderBooks,
    trades: state.trades,
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    latency: state.latency,
    error: state.error,
    subscriptions: state.subscriptions,
    lastUpdate: state.lastUpdate,
    
    // Actions
    addSymbol,
    removeSymbol,
    getMarketData,
    getOrderBook,
    getTrades,
    getConnectionHealth,
    cleanup,
    
    // Utilities
    isSymbolSubscribed: (symbol: string) => 
      Array.from(state.subscriptions).some(sub => sub.includes(symbol)),
    getSubscriptionCount: () => state.subscriptions.size,
    getAverageLatency: () => {
      const latencies = Array.from(state.latency.values());
      return latencies.length > 0 
        ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
        : 0;
    }
  };
}; 