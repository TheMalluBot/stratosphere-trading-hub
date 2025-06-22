
import { useState, useEffect } from 'react';

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  symbol: string;
  timestamp: number;
}

export const useOrderBook = (symbol: string) => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time order book data
    const generateOrderBook = () => {
      const basePrice = 45234.50;
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];
      
      let bidTotal = 0;
      let askTotal = 0;

      // Generate bids (buy orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i * 0.5);
        const quantity = Math.random() * 2 + 0.1;
        bidTotal += quantity;
        bids.push({
          price: Number(price.toFixed(2)),
          quantity: Number(quantity.toFixed(4)),
          total: Number(bidTotal.toFixed(4))
        });
      }

      // Generate asks (sell orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i * 0.5);
        const quantity = Math.random() * 2 + 0.1;
        askTotal += quantity;
        asks.push({
          price: Number(price.toFixed(2)),
          quantity: Number(quantity.toFixed(4)),
          total: Number(askTotal.toFixed(4))
        });
      }

      setOrderBook({
        bids,
        asks,
        symbol,
        timestamp: Date.now()
      });
      setLoading(false);
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 1000);

    return () => clearInterval(interval);
  }, [symbol]);

  return { orderBook, loading };
};
