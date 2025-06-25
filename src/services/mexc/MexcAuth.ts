
import { ApiKeyManager } from '../apiKeyManager';

export class MexcAuth {
  private apiKey: string = '';
  private secretKey: string = '';
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const keys = await ApiKeyManager.getApiKeys();
    if (!keys?.mexc.apiKey || !keys?.mexc.secretKey) {
      console.warn('MEXC API keys not found. Please configure them in Settings.');
      return;
    }
    this.apiKey = keys.mexc.apiKey;
    this.secretKey = keys.mexc.secretKey;
    this.initialized = true;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.apiKey || !this.secretKey) {
      throw new Error('MEXC API keys not found. Please configure them in Settings.');
    }
  }

  async createSignature(params: Record<string, any>): Promise<string> {
    const query = new URLSearchParams();
    Object.keys(params).sort().forEach(key => {
      if (params[key] !== undefined) {
        query.append(key, params[key].toString());
      }
    });
    
    const queryString = query.toString();
    
    // Use Web Crypto API for HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secretKey);
    const messageData = encoder.encode(queryString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getApiKey(): string {
    return this.apiKey;
  }

  static async isConfigured(): Promise<boolean> {
    const keys = await ApiKeyManager.getApiKeys();
    return !!(keys?.mexc.apiKey && keys?.mexc.secretKey);
  }
}
