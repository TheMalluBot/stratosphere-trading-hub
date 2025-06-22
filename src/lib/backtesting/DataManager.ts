
import { MarketData } from '@/types/strategy';

export class DataManager {
  private dbName = 'BacktestData';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('marketData')) {
          const store = db.createObjectStore('marketData', { keyPath: 'key' });
          store.createIndex('symbol', 'symbol', { unique: false });
          store.createIndex('timeframe', 'timeframe', { unique: false });
        }
      };
    });
  }

  async loadMarketData(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string
  ): Promise<MarketData[]> {
    const cacheKey = `${symbol}_${timeframe}_${startDate}_${endDate}`;
    
    // Try to get from cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Generate mock data if not cached
    const data = this.generateMockData(symbol, startDate, endDate, timeframe);
    
    // Cache the data
    await this.cacheData(cacheKey, data, symbol, timeframe);
    
    return data;
  }

  private async getCachedData(key: string): Promise<MarketData[] | null> {
    if (!this.db) await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['marketData'], 'readonly');
      const store = transaction.objectStore('marketData');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  private async cacheData(
    key: string,
    data: MarketData[],
    symbol: string,
    timeframe: string
  ): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['marketData'], 'readwrite');
      const store = transaction.objectStore('marketData');
      
      const request = store.put({
        key,
        data,
        symbol,
        timeframe,
        timestamp: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private generateMockData(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string
  ): MarketData[] {
    const data: MarketData[] = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    // Calculate interval based on timeframe
    const intervals: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1H': 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[timeframe] || intervals['1D'];
    let price = 2500; // Starting price
    
    for (let timestamp = start; timestamp <= end; timestamp += interval) {
      const change = (Math.random() - 0.5) * 0.04; // ±2% change
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({ timestamp, open, high, low, close, volume });
      price = close;
    }
    
    return data;
  }

  async preprocessData(data: MarketData[]): Promise<MarketData[]> {
    // Data validation and cleaning
    const cleanedData = data.filter(bar => 
      bar.high >= bar.low &&
      bar.high >= Math.max(bar.open, bar.close) &&
      bar.low <= Math.min(bar.open, bar.close) &&
      bar.volume > 0
    );

    // Sort by timestamp
    cleanedData.sort((a, b) => a.timestamp - b.timestamp);

    // Add technical indicators in chunks for large datasets
    return this.addTechnicalIndicators(cleanedData);
  }

  private addTechnicalIndicators(data: MarketData[]): MarketData[] {
    // Add simple moving averages and other indicators
    const enhancedData = data.map((bar, index) => {
      const sma20 = this.calculateSMA(data, index, 20);
      const sma50 = this.calculateSMA(data, index, 50);
      
      return {
        ...bar,
        sma20,
        sma50,
        rsi: this.calculateRSI(data, index, 14)
      };
    });

    return enhancedData;
  }

  private calculateSMA(data: MarketData[], index: number, period: number): number {
    if (index < period - 1) return data[index].close;
    
    const sum = data.slice(index - period + 1, index + 1)
      .reduce((acc, bar) => acc + bar.close, 0);
    
    return sum / period;
  }

  private calculateRSI(data: MarketData[], index: number, period: number): number {
    if (index < period) return 50;
    
    const changes = data.slice(index - period + 1, index + 1)
      .map((bar, i, arr) => i > 0 ? bar.close - arr[i - 1].close : 0)
      .slice(1);
    
    const gains = changes.filter(change => change > 0);
    const losses = changes.filter(change => change < 0).map(loss => Math.abs(loss));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}
