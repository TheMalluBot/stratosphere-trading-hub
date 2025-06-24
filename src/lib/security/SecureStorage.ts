
export interface EncryptedData {
  iv: number[];
  data: number[];
  timestamp: number;
}

export interface SecureStorageOptions {
  userId: string;
  sessionToken?: string;
}

export class SecureStorage {
  private encryptionKey: CryptoKey | null = null;
  private db: IDBDatabase | null = null;
  private dbName = 'SecureTradingDB';
  private dbVersion = 1;

  async initialize(options: SecureStorageOptions) {
    this.encryptionKey = await this.deriveUserKey(options.userId, options.sessionToken);
    this.db = await this.initializeIndexedDB();
    console.log('🔐 Secure storage initialized');
  }

  private async deriveUserKey(userId: string, sessionToken?: string): Promise<CryptoKey> {
    const keyMaterial = sessionToken || userId + 'trading-app-fallback';
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keyMaterial),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('algotrade-secure-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async initializeIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for secure trading data
        if (!db.objectStoreNames.contains('positions')) {
          const positionStore = db.createObjectStore('positions', { keyPath: 'id' });
          positionStore.createIndex('symbol', 'symbol', { unique: false });
          positionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('apiKeys')) {
          const apiStore = db.createObjectStore('apiKeys', { keyPath: 'provider' });
        }

        if (!db.objectStoreNames.contains('marketData')) {
          const marketStore = db.createObjectStore('marketData', { keyPath: 'key' });
          marketStore.createIndex('symbol_timeframe', ['symbol', 'timeframe'], { unique: false });
          marketStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('strategies')) {
          const strategyStore = db.createObjectStore('strategies', { keyPath: 'id' });
          strategyStore.createIndex('performance', 'performance', { unique: false });
        }
      };
    });
  }

  async encryptData(data: any): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encodedData
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      timestamp: Date.now()
    };
  }

  async decryptData(encryptedData: EncryptedData): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    const decodedData = new TextDecoder().decode(decrypted);
    return JSON.parse(decodedData);
  }

  async saveSecureData(storeName: string, key: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const encrypted = await this.encryptData(data);
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    await store.put({
      id: key,
      data: encrypted,
      timestamp: Date.now()
    });
  }

  async getSecureData(storeName: string, key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = async () => {
        if (request.result && request.result.data) {
          try {
            const decrypted = await this.decryptData(request.result.data);
            resolve(decrypted);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async compressAndStore(key: string, data: any): Promise<void> {
    const compressed = await this.compressData(JSON.stringify(data));
    await this.saveSecureData('marketData', key, compressed);
  }

  private async compressData(data: string): Promise<ArrayBuffer> {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(new TextEncoder().encode(data));
    writer.close();
    
    const chunks = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result.buffer;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) return;
    
    const storeNames = ['positions', 'apiKeys', 'marketData', 'strategies'];
    
    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }
}

export const secureStorage = new SecureStorage();
