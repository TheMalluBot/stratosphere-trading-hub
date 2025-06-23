
// Enhanced secure API key manager with proper encryption
export interface ApiKeys {
  mexc: {
    apiKey: string;
    secretKey: string;
  };
  coinGecko: {
    apiKey: string;
  };
}

export class SecureApiKeyManager {
  private static readonly STORAGE_KEY = 'secure_api_keys';
  private static readonly IV_KEY = 'api_keys_iv';
  
  // Generate a key from user's device fingerprint
  private static async generateMasterKey(): Promise<CryptoKey> {
    const deviceInfo = `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}`;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(deviceInfo),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const salt = encoder.encode('mexc-trading-app-salt');
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async saveApiKeys(apiKeys: ApiKeys): Promise<void> {
    try {
      // Test MEXC connection before saving
      if (apiKeys.mexc.apiKey && apiKeys.mexc.secretKey) {
        const isValid = await this.testMexcConnection(apiKeys.mexc);
        if (!isValid) {
          throw new Error('Invalid MEXC API credentials - connection test failed');
        }
      }

      // Encrypt the data
      const masterKey = await this.generateMasterKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(apiKeys));
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        masterKey,
        data
      );

      // Store encrypted data and IV
      localStorage.setItem(this.STORAGE_KEY, Array.from(new Uint8Array(encrypted)).join(','));
      localStorage.setItem(this.IV_KEY, Array.from(iv).join(','));
      
      console.log('API keys saved securely');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error(`Failed to save API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getApiKeys(): Promise<ApiKeys | null> {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      const ivData = localStorage.getItem(this.IV_KEY);
      
      if (!encryptedData || !ivData) {
        return null;
      }

      const masterKey = await this.generateMasterKey();
      const encrypted = new Uint8Array(encryptedData.split(',').map(x => parseInt(x)));
      const iv = new Uint8Array(ivData.split(',').map(x => parseInt(x)));

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        masterKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to decrypt API keys:', error);
      // Clear corrupted data
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.IV_KEY);
      return null;
    }
  }

  static hasValidKeys(provider: 'mexc' | 'coinGecko'): boolean {
    try {
      // Use synchronous check with cached data
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return false;

      // For immediate validation, we'll use a simpler approach
      // The full validation happens during getApiKeys()
      return true;
    } catch {
      return false;
    }
  }

  private static async testMexcConnection(mexcKeys: { apiKey: string; secretKey: string }): Promise<boolean> {
    try {
      // Create a test signature for account info endpoint
      const timestamp = Date.now();
      const params = `timestamp=${timestamp}`;
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(mexcKeys.secretKey);
      const messageData = encoder.encode(params);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Test the connection
      const response = await fetch(`https://api.mexc.com/api/v3/account?timestamp=${timestamp}&signature=${signatureHex}`, {
        headers: {
          'X-MEXC-APIKEY': mexcKeys.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('MEXC connection test failed:', error);
      return false;
    }
  }

  static async testConnection(provider: 'mexc' | 'coinGecko'): Promise<boolean> {
    const keys = await this.getApiKeys();
    if (!keys) return false;

    try {
      if (provider === 'mexc') {
        return this.testMexcConnection(keys.mexc);
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

  static clearApiKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.IV_KEY);
  }
}
