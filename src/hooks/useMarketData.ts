import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { measureFunction } from '../utils/performance/monitor';

// Types
export interface MarketSymbol {
  symbol: string;
  name: string;
  exchange: string;
  type: 'stock' | 'crypto' | 'forex' | 'futures' | 'options';
}

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface MarketDepth {
  symbol: string;
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>; // [price, size]
  timestamp: number;
}

export interface MarketTrade {
  id: string;
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

// API functions
const fetchMarketSymbols = async (): Promise<MarketSymbol[]> => {
  return measureFunction(
    async () => {
      const response = await fetch('/api/market/symbols');
      if (!response.ok) throw new Error('Failed to fetch market symbols');
      return response.json();
    },
    'fetch-market-symbols'
  );
};

const fetchMarketQuote = async (symbol: string): Promise<MarketQuote> => {
  return measureFunction(
    async () => {
      const response = await fetch(`/api/market/quote/${symbol}`);
      if (!response.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
      return response.json();
    },
    'fetch-market-quote',
    { symbol }
  );
};

const fetchMarketDepth = async (symbol: string): Promise<MarketDepth> => {
  return measureFunction(
    async () => {
      const response = await fetch(`/api/market/depth/${symbol}`);
      if (!response.ok) throw new Error(`Failed to fetch market depth for ${symbol}`);
      return response.json();
    },
    'fetch-market-depth',
    { symbol }
  );
};

const fetchMarketTrades = async (symbol: string, limit = 50): Promise<MarketTrade[]> => {
  return measureFunction(
    async () => {
      const response = await fetch(`/api/market/trades/${symbol}?limit=${limit}`);
      if (!response.ok) throw new Error(`Failed to fetch trades for ${symbol}`);
      return response.json();
    },
    'fetch-market-trades',
    { symbol, limit }
  );
};

// Standalone Hooks for fetching market data
export const useMarketSymbols = () => {
  return useQuery({
    queryKey: ['marketSymbols'],
    queryFn: fetchMarketSymbols,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMarketQuote = (symbol: string) => {
  return useQuery({
    queryKey: ['marketQuote', symbol],
    queryFn: () => fetchMarketQuote(symbol),
    enabled: !!symbol,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useMarketDepth = (symbol: string) => {
  return useQuery({
    queryKey: ['marketDepth', symbol],
    queryFn: () => fetchMarketDepth(symbol),
    enabled: !!symbol,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useMarketTrades = (symbol: string, limit = 50) => {
  return useQuery({
    queryKey: ['marketTrades', symbol, limit],
    queryFn: () => fetchMarketTrades(symbol, limit),
    enabled: !!symbol,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Manages WebSocket connection for real-time market data updates.
 */
export const useMarketData = (options: {
  symbols?: string[];
  wsEndpoint?: string;
  autoSubscribe?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { symbols = [], wsEndpoint = 'wss://api.example.com/market', autoSubscribe = true } = options;

  const { status: wsStatus, lastMessage, connect, disconnect, sendMessage, isConnected } = useWebSocket({
    url: wsEndpoint,
    autoConnect: autoSubscribe,
    onMessage: (data) => {
      if (data.type === 'quote') {
        queryClient.setQueryData(['marketQuote', data.symbol], data);
      } else if (data.type === 'depth') {
        queryClient.setQueryData(['marketDepth', data.symbol], data);
      } else if (data.type === 'trade') {
        queryClient.setQueryData(['marketTrades', data.symbol], (oldData: MarketTrade[] = []) => {
          return [data, ...oldData.slice(0, 49)];
        });
      }
    },
  });

  const subscribeToSymbols = useCallback((symbolsToSubscribe: string[]) => {
    if (isConnected) {
      sendMessage({ type: 'subscribe', symbols: symbolsToSubscribe });
    }
  }, [isConnected, sendMessage]);

  const unsubscribeFromSymbols = useCallback((symbolsToUnsubscribe: string[]) => {
    if (isConnected) {
      sendMessage({ type: 'unsubscribe', symbols: symbolsToUnsubscribe });
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (autoSubscribe && isConnected && symbols.length > 0) {
      subscribeToSymbols(symbols);
    }
    return () => {
      if (isConnected && symbols.length > 0) {
        unsubscribeFromSymbols(symbols);
      }
    };
  }, [isConnected, symbols, autoSubscribe, subscribeToSymbols, unsubscribeFromSymbols]);

  return {
    wsStatus,
    lastMessage,
    isConnected,
    connect,
    disconnect,
    subscribeToSymbols,
    unsubscribeFromSymbols,
  };
};
