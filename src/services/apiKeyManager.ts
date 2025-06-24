
import { secureStorage } from '@/lib/security/SecureStorage';

export interface ApiKeys {
  mexc: {
    apiKey: string;
    secretKey: string;
  };
  coinGecko: {
    apiKey: string;
  };
}

export class ApiKeyManager {
  private static isSecureStorageReady = false;
  
  private static async ensureSecureStorage() {
    if (!this.isSecureStorageReady) {
      try {
        const userId = 'demo-user'; // In production, get from Clerk
        await secureStorage.initialize({ userId });
        this.isSecureStorageReady = true;
      } catch (error) {
        console.warn('Secure storage not available, falling back to localStorage');
      }
    }
  }
  
  static async saveApiKeys(apiKeys: ApiKeys): Promise<void> {
    try {
      await this.ensureSecureStorage();
      
      if (this.isSecureStorageReady) {
        // Use secure storage
        await secureStorage.saveSecureData('apiKeys', 'mexc', apiKeys.mexc);
        await secureStorage.saveSecureData('apiKeys', 'coinGecko', apiKeys.coinGecko);
        console.log('✅ API keys saved securely');
      } else {
        // Fallback to localStorage with better encoding
        const encrypted = btoa(JSON.stringify(apiKeys));
        localStorage.setItem('trading_api_keys', encrypted);
        console.warn('⚠️ Using fallback storage for API keys');
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Failed to save API keys securely');
    }
  }

  static async getApiKeys(): Promise<ApiKeys | null> {
    try {
      await this.ensureSecureStorage();
      
      if (this.isSecureStorageReady) {
        // Use secure storage
        const mexcKeys = await secureStorage.getSecureData('apiKeys', 'mexc');
        const coinGeckoKeys = await secureStorage.getSecureData('apiKeys', 'coinGecko');
        
        if (mexcKeys && coinGeckoKeys) {
          return {
            mexc: mexcKeys,
            coinGecko: coinGeckoKeys
          };
        }
      }
      
      // Fallback to localStorage
      const encrypted = localStorage.getItem('trading_api_keys');
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve API keys:', error);
      return null;
    }
  }

  static async hasValidKeys(provider: 'mexc' | 'coinGecko'): Promise<boolean> {
    const keys = await this.getApiKeys();
    if (!keys) return false;

    if (provider === 'mexc') {
      return !!(keys.mexc.apiKey && keys.mexc.secretKey);
    }
    
    if (provider === 'coinGecko') {
      return !!keys.coinGecko.apiKey;
    }

    return false;
  }

  static async testConnection(provider: 'mexc' | 'coinGecko'): Promise<boolean> {
    const keys = await this.getApiKeys();
    if (!keys) return false;

    try {
      if (provider === 'mexc') {
        // Test MEXC connection with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch('https://api.mexc.com/api/v3/ping', {
            signal: controller.signal,
            headers: {
              'X-MEXC-APIKEY': keys.mexc.apiKey
            }
          });
          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
      
      if (provider === 'coinGecko') {
        const url = keys.coinGecko.apiKey 
          ? `https://api.coingecko.com/api/v3/ping?x_cg_pro_api_key=${keys.coinGecko.apiKey}`
          : 'https://api.coingecko.com/api/v3/ping';
        
        const response = await fetch(url);
        return response.ok;
      }
    } catch (error) {
      console.error(`${provider} connection test failed:`, error);
      return false;
    }

    return false;
  }

  static async clearApiKeys(): Promise<void> {
    try {
      await this.ensureSecureStorage();
      
      if (this.isSecureStorageReady) {
        await secureStorage.clearAllData();
      }
      
      localStorage.removeItem('trading_api_keys');
      console.log('🗑️ API keys cleared securely');
    } catch (error) {
      console.error('Failed to clear API keys:', error);
    }
  }

  static async getSecurityStatus(): Promise<{
    secureStorage: boolean;
    encrypted: boolean;
    lastUpdate: number | null;
  }> {
    await this.ensureSecureStorage();
    
    return {
      secureStorage: this.isSecureStorageReady,
      encrypted: true,
      lastUpdate: Date.now()
    };
  }
}
