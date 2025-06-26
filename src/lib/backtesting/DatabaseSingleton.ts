
import { MarketData } from '@/types/strategy';

export interface CachedDataEntry {
  key: string;
  data: MarketData[];
  symbol: string;
  timeframe: string;
  timestamp: number;
  dataHash: string;
}

export class DatabaseSingleton {
  private static instance: DatabaseSingleton;
  private dbPromise: Promise<IDBDatabase>;
  private dbName = 'BacktestDataV2';
  private dbVersion = 2;
  private isInitializing = false;

  private constructor() {
    this.dbPromise = this.initializeDatabase();
  }

  public static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }

  private async initializeDatabase(): Promise<IDBDatabase> {
    if (this.isInitializing) {
      // Wait for existing initialization
      let attempts = 0;
      while (this.isInitializing && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    this.isInitializing = true;

    try {
      return await this.createDatabase();
    } finally {
      this.isInitializing = false;
    }
  }

  private createDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let retryCount = 0;
      const maxRetries = 3;

      const attemptConnection = () => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => {
          console.error('IndexedDB connection error:', request.error);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying IndexedDB connection (${retryCount}/${maxRetries})`);
            setTimeout(attemptConnection, 1000 * retryCount);
          } else {
            reject(new Error(`Failed to open IndexedDB after ${maxRetries} attempts: ${request.error?.message}`));
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          
          db.onerror = (event) => {
            console.error('Database error:', event);
          };

          db.onversionchange = () => {
            console.warn('Database version changed, closing connection');
            db.close();
          };

          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          try {
            // Remove old stores if they exist
            if (db.objectStoreNames.contains('marketData')) {
              db.deleteObjectStore('marketData');
            }

            // Create new optimized store
            const marketDataStore = db.createObjectStore('marketData', { 
              keyPath: 'key' 
            });
            
            marketDataStore.createIndex('symbol', 'symbol', { unique: false });
            marketDataStore.createIndex('timeframe', 'timeframe', { unique: false });
            marketDataStore.createIndex('timestamp', 'timestamp', { unique: false });
            marketDataStore.createIndex('dataHash', 'dataHash', { unique: false });

            // Create cache metadata store
            const metadataStore = db.createObjectStore('cacheMetadata', {
              keyPath: 'key'
            });
            
            metadataStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
            metadataStore.createIndex('size', 'size', { unique: false });

            console.log('Database schema upgraded successfully');
          } catch (error) {
            console.error('Error during database upgrade:', error);
            reject(error);
          }
        };

        request.onblocked = () => {
          console.warn('IndexedDB upgrade blocked by another connection');
          // Try to resolve the blockage
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        };
      };

      attemptConnection();
    });
  }

  async loadMarketData(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string
  ): Promise<MarketData[]> {
    const cacheKey = this.generateCacheKey(symbol, timeframe, startDate, endDate);
    
    try {
      // Try to get from cache first
      const cachedData = await this.getCachedData(cacheKey);
      
      if (cachedData && this.isDataValid(cachedData)) {
        await this.updateAccessTime(cacheKey);
        return cachedData.data;
      }

      // Generate new data if not cached or invalid
      const data = this.generateOptimizedData(symbol, startDate, endDate, timeframe);
      
      // Cache the new data
      await this.cacheData(cacheKey, data, symbol, timeframe);
      
      return data;
    } catch (error) {
      console.error('Error loading market data:', error);
      // Fallback to generating data without caching
      return this.generateOptimizedData(symbol, startDate, endDate, timeframe);
    }
  }

  private async getCachedData(key: string): Promise<CachedDataEntry | null> {
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['marketData'], 'readonly');
      const store = transaction.objectStore('marketData');
      const request = store.get(key);

      transaction.onerror = () => {
        console.error('Transaction error while getting cached data:', transaction.error);
        resolve(null); // Don't reject, just return null to fallback
      };

      request.onerror = () => {
        console.error('Request error while getting cached data:', request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  private async cacheData(
    key: string,
    data: MarketData[],
    symbol: string,
    timeframe: string
  ): Promise<void> {
    try {
      const db = await this.dbPromise;
      const dataHash = this.generateDataHash(data);
      
      const entry: CachedDataEntry = {
        key,
        data,
        symbol,
        timeframe,
        timestamp: Date.now(),
        dataHash
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['marketData', 'cacheMetadata'], 'readwrite');
        
        transaction.onerror = () => {
          console.error('Transaction error while caching data:', transaction.error);
          resolve(); // Don't reject, caching failure shouldn't break the flow
        };

        transaction.oncomplete = () => {
          resolve();
        };

        // Store the data
        const marketDataStore = transaction.objectStore('marketData');
        marketDataStore.put(entry);

        // Store metadata for cache management
        const metadataStore = transaction.objectStore('cacheMetadata');
        metadataStore.put({
          key,
          size: this.estimateDataSize(data),
          lastAccessed: Date.now(),
          createdAt: Date.now()
        });
      });
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // Don't throw, caching failure shouldn't break the main flow
    }
  }

  private async updateAccessTime(key: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      
      const transaction = db.transaction(['cacheMetadata'], 'readwrite');
      const store = transaction.objectStore('cacheMetadata');
      
      const request = store.get(key);
      request.onsuccess = () => {
        const metadata = request.result;
        if (metadata) {
          metadata.lastAccessed = Date.now();
          store.put(metadata);
        }
      };
    } catch (error) {
      console.warn('Failed to update access time:', error);
    }
  }

  private generateCacheKey(symbol: string, timeframe: string, startDate: string, endDate: string): string {
    return `${symbol}_${timeframe}_${startDate}_${endDate}_v2`;
  }

  private generateDataHash(data: MarketData[]): string {
    const sample = data.slice(0, 10).concat(data.slice(-10));
    const hashInput = sample.map(d => `${d.timestamp}_${d.close}_${d.volume}`).join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }

  private isDataValid(cachedData: CachedDataEntry): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const isNotExpired = (Date.now() - cachedData.timestamp) < maxAge;
    const hasValidData = cachedData.data && cachedData.data.length > 0;
    
    return isNotExpired && hasValidData;
  }

  private estimateDataSize(data: MarketData[]): number {
    // Rough estimate: each MarketData entry is about 48 bytes
    return data.length * 48;
  }

  private generateOptimizedData(
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
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[timeframe] || intervals['1D'];
    const maxDataPoints = 10000; // Limit to prevent memory issues
    
    // Calculate step size to stay within limits
    const totalPeriods = Math.ceil((end - start) / interval);
    const stepSize = Math.max(1, Math.ceil(totalPeriods / maxDataPoints));
    
    let price = 2500 + (Math.random() - 0.5) * 500; // Starting price with variation
    let timestamp = start;
    let dataPointCount = 0;
    
    // Use more realistic price generation
    while (timestamp <= end && dataPointCount < maxDataPoints) {
      const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
      const trend = (Math.random() - 0.5) * 0.001; // Small trend component
      const change = (Math.random() - 0.5) * volatility + trend;
      
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 2000000) + 100000;
      
      data.push({ timestamp, open, high, low, close, volume });
      
      price = close;
      timestamp += interval * stepSize;
      dataPointCount++;
    }
    
    return data;
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const cutoffTime = Date.now() - maxAge;
      
      const transaction = db.transaction(['marketData', 'cacheMetadata'], 'readwrite');
      const metadataStore = transaction.objectStore('cacheMetadata');
      const marketDataStore = transaction.objectStore('marketData');
      
      const index = metadataStore.index('lastAccessed');
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      const request = index.openCursor(range);
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const key = cursor.value.key;
          marketDataStore.delete(key);
          metadataStore.delete(key);
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  async getCacheStats() {
    try {
      const db = await this.dbPromise;
      
      return new Promise<{totalEntries: number, totalSize: number}>((resolve) => {
        const transaction = db.transaction(['cacheMetadata'], 'readonly');
        const store = transaction.objectStore('cacheMetadata');
        
        let totalEntries = 0;
        let totalSize = 0;
        
        const request = store.openCursor();
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            totalEntries++;
            totalSize += cursor.value.size || 0;
            cursor.continue();
          } else {
            resolve({ totalEntries, totalSize });
          }
        };
        
        request.onerror = () => {
          resolve({ totalEntries: 0, totalSize: 0 });
        };
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}
