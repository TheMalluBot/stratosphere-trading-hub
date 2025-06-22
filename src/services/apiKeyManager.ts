
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
  private static readonly STORAGE_KEY = 'trading_api_keys';
  
  static saveApiKeys(apiKeys: ApiKeys): void {
    try {
      const encrypted = btoa(JSON.stringify(apiKeys));
      localStorage.setItem(this.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Failed to save API keys');
    }
  }

  static getApiKeys(): ApiKeys | null {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve API keys:', error);
      return null;
    }
  }

  static hasValidKeys(provider: 'mexc' | 'coinGecko'): boolean {
    const keys = this.getApiKeys();
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
    const keys = this.getApiKeys();
    if (!keys) return false;

    try {
      if (provider === 'mexc') {
        // Simulate MEXC API test
        await new Promise(resolve => setTimeout(resolve, 1000));
        return !!(keys.mexc.apiKey && keys.mexc.secretKey);
      }
      
      if (provider === 'coinGecko') {
        // Test CoinGecko API
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

  static clearApiKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
