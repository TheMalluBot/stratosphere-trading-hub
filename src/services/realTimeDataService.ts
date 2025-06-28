
import { MarketData } from '@/types/strategy';

export interface RealTimeDataConfig {
  apiKey?: string;
  refreshInterval: number;
  symbols: string[];
  enableWebSocket: boolean;
}

export interface DataProvider {
  name: string;
  getHistoricalData(symbol: string, timeframe: string, from: Date, to: Date): Promise<MarketData[]>;
  getRealtimePrice(symbol: string): Promise<number>;
  subscribeToUpdates(symbol: string, callback: (data: MarketData) => void): () => void;
}

export class RealTimeDataService {
  private config: RealTimeDataConfig;
  private activeSubscriptions = new Map<string, Set<(data: MarketData) => void>>();
  private priceCache = new Map<string, MarketData>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private isConnected = false;

  constructor(config: RealTimeDataConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    console.log('Connecting to real-time data service...');
    // Simulate connection - in production, this would connect to actual APIs
    this.isConnected = true;
    console.log('Real-time data service connected');
  }

  async getHistoricalData(
    symbol: string, 
    timeframe: string, 
    from: Date, 
    to: Date
  ): Promise<MarketData[]> {
    console.log(`Fetching historical data for ${symbol} from ${from.toISOString()} to ${to.toISOString()}`);
    
    // In production, this would call actual API
    // For now, generate realistic data based on actual market patterns
    return this.generateRealisticHistoricalData(symbol, from, to, timeframe);
  }

  subscribeToRealTime(symbol: string, callback: (data: MarketData) => void): () => void {
    if (!this.activeSubscriptions.has(symbol)) {
      this.activeSubscriptions.set(symbol, new Set());
      this.startRealtimeUpdates(symbol);
    }

    this.activeSubscriptions.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.activeSubscriptions.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.stopRealtimeUpdates(symbol);
          this.activeSubscriptions.delete(symbol);
        }
      }
    };
  }

  private startRealtimeUpdates(symbol: string): void {
    const interval = setInterval(() => {
      const data = this.generateRealtimeData(symbol);
      this.priceCache.set(symbol, data);
      
      const subscribers = this.activeSubscriptions.get(symbol);
      if (subscribers) {
        subscribers.forEach(callback => callback(data));
      }
    }, this.config.refreshInterval);

    this.intervals.set(symbol, interval);
  }

  private stopRealtimeUpdates(symbol: string): void {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  private generateRealisticHistoricalData(
    symbol: string, 
    from: Date, 
    to: Date, 
    timeframe: string
  ): MarketData[] {
    const data: MarketData[] = [];
    const startTime = from.getTime();
    const endTime = to.getTime();
    
    // Get interval in milliseconds
    const intervals: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[timeframe] || intervals['1h'];
    
    // Use realistic starting prices for Indian stocks
    const basePrices: Record<string, number> = {
      'RELIANCE': 2450,
      'TCS': 3200,
      'INFY': 1450,
      'HDFC': 1600,
      'ICICIBANK': 950,
      'SBIN': 420,
      'ITC': 250,
      'HDFCBANK': 1550,
      'BHARTIARTL': 850,
      'LT': 2800
    };
    
    let currentPrice = basePrices[symbol] || 1000;
    let trend = 0.0001; // Small upward trend
    let volatility = 0.02; // 2% volatility
    
    for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
      // Generate realistic price movement with trend and mean reversion
      const randomWalk = (Math.random() - 0.5) * volatility;
      const meanReversion = -0.1 * Math.log(currentPrice / (basePrices[symbol] || 1000));
      
      const priceChange = trend + randomWalk + meanReversion * 0.001;
      currentPrice *= (1 + priceChange);
      
      const open = currentPrice;
      const high = open * (1 + Math.random() * 0.01);
      const low = open * (1 - Math.random() * 0.01);
      const close = low + Math.random() * (high - low);
      const volume = Math.floor(Math.random() * 1000000 + 100000);
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  private generateRealtimeData(symbol: string): MarketData {
    const cached = this.priceCache.get(symbol);
    const basePrice = cached?.close || this.getBasePrice(symbol);
    
    // Generate realistic intraday movement
    const volatility = 0.001; // 0.1% per update
    const change = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + change);
    
    return {
      timestamp: Date.now(),
      open: price * 0.9995,
      high: price * 1.0005,
      low: price * 0.9995,
      close: price,
      volume: Math.floor(Math.random() * 10000 + 1000)
    };
  }

  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'RELIANCE': 2450,
      'TCS': 3200,
      'INFY': 1450,
      'HDFC': 1600,
      'ICICIBANK': 950,
      'SBIN': 420,
      'ITC': 250,
      'HDFCBANK': 1550,
      'BHARTIARTL': 850,
      'LT': 2800
    };
    return basePrices[symbol] || 1000;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.activeSubscriptions.clear();
    this.isConnected = false;
  }
}
