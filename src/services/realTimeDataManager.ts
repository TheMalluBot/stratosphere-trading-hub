
import { enhancedWsService } from './enhancedWebSocketService';
import { optimizedWsService } from './optimizedWebSocketService';
import { mexcService } from './mexcService';

export interface RealTimePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface OrderBookUpdate {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface TradeUpdate {
  symbol: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

export class RealTimeDataManager {
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private priceCache = new Map<string, RealTimePrice>();
  private orderBookCache = new Map<string, OrderBookUpdate>();
  private isInitialized = false;
  private fallbackTimer: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    try {
      // Try to connect to enhanced WebSocket service first
      await enhancedWsService.connect();
      this.setupEnhancedWebSocketHandlers();
      this.isInitialized = true;
      console.log('📡 Real-time data manager initialized with enhanced WebSocket');
    } catch (error) {
      console.warn('Enhanced WebSocket failed, trying optimized service:', error);
      
      try {
        await optimizedWsService.connect();
        this.setupOptimizedWebSocketHandlers();
        this.isInitialized = true;
        console.log('📡 Real-time data manager initialized with optimized WebSocket');
      } catch (fallbackError) {
        console.warn('All WebSocket services failed, using REST API fallback:', fallbackError);
        this.startRestApiFallback();
      }
    }
  }

  private setupEnhancedWebSocketHandlers(): void {
    // Subscribe to price updates
    enhancedWsService.subscribe('price_all', (data) => {
      this.handlePriceUpdate(data);
    });

    // Subscribe to order book updates
    enhancedWsService.subscribe('orderbook_all', (data) => {
      this.handleOrderBookUpdate(data);
    });

    // Subscribe to trade updates
    enhancedWsService.subscribe('trade_all', (data) => {
      this.handleTradeUpdate(data);
    });
  }

  private setupOptimizedWebSocketHandlers(): void {
    // Subscribe to price updates using optimized service
    optimizedWsService.subscribe('price_updates', (data) => {
      this.handlePriceUpdate(data);
    });
  }

  private startRestApiFallback(): void {
    console.log('📊 Starting REST API fallback for real-time data');
    
    // Poll every 2 seconds for price updates
    this.fallbackTimer = setInterval(async () => {
      await this.fetchPriceUpdates();
    }, 2000);
  }

  private async fetchPriceUpdates(): Promise<void> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'];
      
      for (const symbol of symbols) {
        try {
          const ticker = await mexcService.getTicker24hr(symbol);
          const priceUpdate: RealTimePrice = {
            symbol,
            price: parseFloat(ticker.lastPrice),
            change: parseFloat(ticker.priceChange),
            changePercent: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.volume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            timestamp: Date.now()
          };
          
          this.handlePriceUpdate(priceUpdate);
        } catch (error) {
          console.error(`Failed to fetch ${symbol} data:`, error);
        }
      }
    } catch (error) {
      console.error('REST API fallback failed:', error);
    }
  }

  private handlePriceUpdate(data: RealTimePrice): void {
    // Cache the update
    this.priceCache.set(data.symbol, data);
    
    // Notify subscribers
    this.notifySubscribers(`price_${data.symbol}`, data);
    this.notifySubscribers('price_all', data);
  }

  private handleOrderBookUpdate(data: OrderBookUpdate): void {
    this.orderBookCache.set(data.symbol, data);
    this.notifySubscribers(`orderbook_${data.symbol}`, data);
  }

  private handleTradeUpdate(data: TradeUpdate): void {
    this.notifySubscribers(`trade_${data.symbol}`, data);
    this.notifySubscribers('trade_all', data);
  }

  private notifySubscribers(channel: string, data: any): void {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(callback);
    
    // Send cached data if available
    if (channel.startsWith('price_')) {
      const symbol = channel.replace('price_', '');
      const cached = this.priceCache.get(symbol);
      if (cached) {
        callback(cached);
      }
    }
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(channel);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  getCachedPrice(symbol: string): RealTimePrice | null {
    return this.priceCache.get(symbol) || null;
  }

  getCachedOrderBook(symbol: string): OrderBookUpdate | null {
    return this.orderBookCache.get(symbol) || null;
  }

  getConnectionStatus() {
    const enhanced = enhancedWsService.getConnectionStatus();
    const optimized = optimizedWsService.getConnectionStatus();
    
    return {
      isConnected: this.isInitialized,
      enhanced: enhanced.public || enhanced.private,
      optimized: optimized.state === 'connected',
      fallbackActive: this.fallbackTimer !== null
    };
  }

  cleanup(): void {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    
    this.subscribers.clear();
    this.priceCache.clear();
    this.orderBookCache.clear();
    this.isInitialized = false;
  }
}

export const realTimeDataManager = new RealTimeDataManager();
