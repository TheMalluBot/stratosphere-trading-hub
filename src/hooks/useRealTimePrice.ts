
import { useState, useEffect, useCallback } from 'react';
import { wsService } from '@/services/websocketService';

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: number;
}

export const useRealTimePrice = (symbol?: string) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceUpdate = useCallback((data: PriceData) => {
    setPriceData(data);
  }, []);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        if (!wsService.getConnectionStatus()) {
          await wsService.connect();
        }
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError('Failed to connect to real-time data');
        console.error('WebSocket connection failed:', err);
      }
    };

    initializeConnection();

    return () => {
      if (symbol) {
        wsService.unsubscribe(`price_${symbol}`, handlePriceUpdate);
      }
    };
  }, []);

  useEffect(() => {
    if (symbol && isConnected) {
      wsService.subscribe(`price_${symbol}`, handlePriceUpdate);
      
      return () => {
        wsService.unsubscribe(`price_${symbol}`, handlePriceUpdate);
      };
    }
  }, [symbol, isConnected, handlePriceUpdate]);

  return {
    priceData,
    isConnected,
    error,
    lastUpdate: priceData?.timestamp
  };
};
