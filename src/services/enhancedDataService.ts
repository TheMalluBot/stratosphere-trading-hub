
import { wsService } from './websocketService';
import { MexcService } from './mexcService';
import { CoinGeckoService } from './coinGeckoService';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export class EnhancedDataService {
  private mexcService: MexcService;
  private coinGeckoService: CoinGeckoService;
  private subscribers = new Map<string, Set<(data: PriceUpdate) => void>>();
  private priceCache = new Map<string, PriceUpdate>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.mexcService = new MexcService();
    this.coinGeckoService = new CoinGeckoService();
    this.initializeWebSocket();
  }

  private async initializeWebSocket() {
    try {
      if (!wsService.getConnectionStatus()) {
        await wsService.connect();
      }
      this.reconnectAttempts = 0;
      console.log('Enhanced data service: WebSocket connected');
    } catch (error) {
      console.error('Enhanced data service: WebSocket connection failed:', error);
      this.handleReconnection();
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Enhanced data service: Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    } else {
      console.log('Enhanced data service: Max reconnection attempts reached, falling back to polling');
      this.startPollingFallback();
    }
  }

  private startPollingFallback() {
    // Fallback to polling every 10 seconds
    setInterval(async () => {
      for (const symbol of this.subscribers.keys()) {
        if (symbol !== 'all') {
          try {
            const ticker = await this.mexcService.getTicker24hr(symbol);
            const priceUpdate: PriceUpdate = {
              symbol,
              price: parseFloat(ticker.lastPrice),
              change: parseFloat(ticker.priceChange),
              changePercent: parseFloat(ticker.priceChangePercent),
              volume: parseFloat(ticker.volume),
              timestamp: Date.now()
            };
            
            this.updatePrice(priceUpdate);
          } catch (error) {
            console.error(`Polling fallback failed for ${symbol}:`, error);
          }
        }
      }
    }, 10000);
  }

  subscribe(symbol: string, callback: (data: PriceUpdate) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    // Send cached data immediately if available
    const cached = this.priceCache.get(symbol);
    if (cached) {
      callback(cached);
    }

    // Subscribe to WebSocket updates
    if (wsService.getConnectionStatus()) {
      wsService.subscribe(`price_${symbol}`, this.handlePriceUpdate.bind(this));
    }

    // Also fetch initial data
    this.fetchInitialPrice(symbol);
  }

  unsubscribe(symbol: string, callback: (data: PriceUpdate) => void) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(symbol);
        wsService.unsubscribe(`price_${symbol}`, this.handlePriceUpdate.bind(this));
      }
    }
  }

  private async fetchInitialPrice(symbol: string) {
    try {
      const ticker = await this.mexcService.getTicker24hr(symbol);
      const priceUpdate: PriceUpdate = {
        symbol,
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChange),
        changePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        timestamp: Date.now()
      };
      
      this.updatePrice(priceUpdate);
    } catch (error) {
      console.error(`Failed to fetch initial price for ${symbol}:`, error);
    }
  }

  private handlePriceUpdate(data: any) {
    const priceUpdate: PriceUpdate = {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent || 0,
      volume: data.volume || 0,
      timestamp: data.timestamp || Date.now()
    };
    
    this.updatePrice(priceUpdate);
  }

  private updatePrice(priceUpdate: PriceUpdate) {
    // Cache the update
    this.priceCache.set(priceUpdate.symbol, priceUpdate);
    
    // Notify subscribers
    const subscribers = this.subscribers.get(priceUpdate.symbol);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(priceUpdate);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      });
    }

    // Also notify 'all' subscribers
    const allSubscribers = this.subscribers.get('all');
    if (allSubscribers) {
      allSubscribers.forEach(callback => {
        try {
          callback(priceUpdate);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      });
    }
  }

  getCachedPrice(symbol: string): PriceUpdate | null {
    return this.priceCache.get(symbol) || null;
  }

  getConnectionStatus(): { websocket: boolean; mexc: boolean; coinGecko: boolean } {
    return {
      websocket: wsService.getConnectionStatus(),
      mexc: true, // Assume MEXC is available if we can create the service
      coinGecko: true // Assume CoinGecko is available
    };
  }

  cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.subscribers.clear();
    this.priceCache.clear();
  }
}

export const enhancedDataService = new EnhancedDataService();
