
import { MarketData } from '@/types/strategy';

export interface DataQuality {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  gaps: number;
  outliers: number;
}

export interface DataMetrics {
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  totalBars: number;
  quality: DataQuality;
}

export class HistoricalDataManager {
  private dbName = 'TradingData';
  private dbVersion = 2;
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
        
        // Historical data store
        if (!db.objectStoreNames.contains('historicalData')) {
          const store = db.createObjectStore('historicalData', { keyPath: 'id' });
          store.createIndex('symbol', 'symbol', { unique: false });
          store.createIndex('timeframe', 'timeframe', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Data quality metrics store
        if (!db.objectStoreNames.contains('dataMetrics')) {
          const metricsStore = db.createObjectStore('dataMetrics', { keyPath: 'id' });
          metricsStore.createIndex('symbol_timeframe', ['symbol', 'timeframe'], { unique: false });
        }
      };
    });
  }

  async storeHistoricalData(
    symbol: string,
    timeframe: string,
    data: MarketData[]
  ): Promise<void> {
    if (!this.db) await this.initializeDB();

    const transaction = this.db!.transaction(['historicalData', 'dataMetrics'], 'readwrite');
    const dataStore = transaction.objectStore('historicalData');
    const metricsStore = transaction.objectStore('dataMetrics');

    // Store individual data points
    for (const bar of data) {
      const record = {
        id: `${symbol}_${timeframe}_${bar.timestamp}`,
        symbol,
        timeframe,
        ...bar
      };
      dataStore.put(record);
    }

    // Calculate and store quality metrics
    const quality = this.calculateDataQuality(data);
    const metrics: DataMetrics = {
      symbol,
      timeframe,
      startDate: new Date(data[0]?.timestamp || 0),
      endDate: new Date(data[data.length - 1]?.timestamp || 0),
      totalBars: data.length,
      quality
    };

    metricsStore.put({
      id: `${symbol}_${timeframe}`,
      ...metrics
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getHistoricalData(
    symbol: string,
    timeframe: string,
    from?: Date,
    to?: Date
  ): Promise<MarketData[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historicalData'], 'readonly');
      const store = transaction.objectStore('historicalData');
      const symbolIndex = store.index('symbol');
      
      const request = symbolIndex.getAll(symbol);

      request.onsuccess = () => {
        let results = request.result.filter(record => 
          record.timeframe === timeframe
        );

        // Filter by date range if provided
        if (from) {
          results = results.filter(record => record.timestamp >= from.getTime());
        }
        if (to) {
          results = results.filter(record => record.timestamp <= to.getTime());
        }

        // Sort by timestamp
        results.sort((a, b) => a.timestamp - b.timestamp);

        // Convert to MarketData format
        const marketData: MarketData[] = results.map(record => ({
          timestamp: record.timestamp,
          open: record.open,
          high: record.high,
          low: record.low,
          close: record.close,
          volume: record.volume
        }));

        resolve(marketData);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getDataMetrics(symbol: string, timeframe: string): Promise<DataMetrics | null> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dataMetrics'], 'readonly');
      const store = transaction.objectStore('dataMetrics');
      
      const request = store.get(`${symbol}_${timeframe}`);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private calculateDataQuality(data: MarketData[]): DataQuality {
    if (data.length === 0) {
      return { completeness: 0, accuracy: 0, gaps: 0, outliers: 0 };
    }

    // Check for gaps in data
    let gaps = 0;
    let outliers = 0;

    for (let i = 1; i < data.length; i++) {
      const prevBar = data[i - 1];
      const currentBar = data[i];

      // Check for unrealistic price movements (outliers)
      const priceChange = Math.abs(currentBar.close - prevBar.close) / prevBar.close;
      if (priceChange > 0.1) { // 10% threshold
        outliers++;
      }

      // Check for data consistency
      if (currentBar.high < Math.max(currentBar.open, currentBar.close) ||
          currentBar.low > Math.min(currentBar.open, currentBar.close)) {
        outliers++;
      }
    }

    const completeness = 1 - (gaps / data.length);
    const accuracy = 1 - (outliers / data.length);

    return {
      completeness: Math.max(0, completeness),
      accuracy: Math.max(0, accuracy),
      gaps,
      outliers
    };
  }

  async cleanData(data: MarketData[]): Promise<MarketData[]> {
    if (data.length === 0) return data;

    const cleaned: MarketData[] = [];

    for (const bar of data) {
      // Basic validation
      if (bar.high >= Math.max(bar.open, bar.close) &&
          bar.low <= Math.min(bar.open, bar.close) &&
          bar.volume >= 0) {
        cleaned.push(bar);
      }
    }

    // Sort by timestamp
    cleaned.sort((a, b) => a.timestamp - b.timestamp);

    return cleaned;
  }

  async clearExpiredData(olderThanDays: number = 30): Promise<void> {
    if (!this.db) await this.initializeDB();

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historicalData'], 'readwrite');
      const store = transaction.objectStore('historicalData');
      const timestampIndex = store.index('timestamp');
      
      const request = timestampIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
