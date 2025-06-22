
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
  private static readonly STORAGE_KEY = 'crypto_trading_api_keys';
  private static readonly ENCRYPTION_KEY = 'crypto_trade_pro_2024';

  static saveApiKeys(keys: Partial<ApiKeys>): void {
    try {
      const existingKeys = this.getApiKeys() || { mexc: { apiKey: '', secretKey: '' }, coinGecko: { apiKey: '' } };
      const updatedKeys = {
        ...existingKeys,
        ...keys,
        mexc: { ...existingKeys.mexc, ...(keys.mexc || {}) },
        coinGecko: { ...existingKeys.coinGecko, ...(keys.coinGecko || {}) }
      };
      
      const encrypted = btoa(JSON.stringify(updatedKeys));
      localStorage.setItem(this.STORAGE_KEY, encrypted);
      console.log('API keys saved successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
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
      console.error('Error retrieving API keys:', error);
      return null;
    }
  }

  static clearApiKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('API keys cleared');
  }

  static hasValidKeys(provider: 'mexc' | 'coinGecko'): boolean {
    const keys = this.getApiKeys();
    if (!keys) return false;

    switch (provider) {
      case 'mexc':
        return !!(keys.mexc?.apiKey && keys.mexc?.secretKey);
      case 'coinGecko':
        return !!keys.coinGecko?.apiKey;
      default:
        return false;
    }
  }

  static async testConnection(provider: 'mexc' | 'coinGecko'): Promise<boolean> {
    const keys = this.getApiKeys();
    if (!keys) return false;

    try {
      switch (provider) {
        case 'mexc':
          // Test MEXC connection with public endpoint first
          const mexcResponse = await fetch('https://api.mexc.com/api/v3/ping');
          return mexcResponse.ok;
          
        case 'coinGecko':
          // Test CoinGecko connection
          const cgResponse = await fetch('https://api.coingecko.com/api/v3/ping');
          return cgResponse.ok;
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      return false;
    }
  }
}
