
import { ApiKeyManager } from './apiKeyManager';

export interface AccountInfo {
  balances: {
    asset: string;
    free: string;
    locked: string;
  }[];
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface MexcOrder {
  orderId: string;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  timeInForce: string;
  type: string;
  side: string;
  time: number;
  updateTime: number;
}

export class MexcPrivateService {
  private baseUrl = 'https://api.mexc.com/api/v3';
  private apiKey: string;
  private secretKey: string;

  constructor() {
    const keys = ApiKeyManager.getApiKeys();
    if (!keys?.mexc.apiKey || !keys?.mexc.secretKey) {
      throw new Error('MEXC API keys not found. Please configure them in Settings.');
    }
    this.apiKey = keys.mexc.apiKey;
    this.secretKey = keys.mexc.secretKey;
  }

  private async createSignature(params: Record<string, any>): Promise<string> {
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

  private async makePrivateRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE' = 'GET', 
    params: Record<string, any> = {}
  ): Promise<any> {
    const timestamp = Date.now();
    const requestParams = { ...params, timestamp };
    
    const signature = await this.createSignature(requestParams);
    requestParams.signature = signature;

    const headers: HeadersInit = {
      'X-MEXC-APIKEY': this.apiKey,
      'Content-Type': 'application/json'
    };

    let url = `${this.baseUrl}${endpoint}`;
    let body: string | undefined;

    if (method === 'GET') {
      const query = new URLSearchParams();
      Object.keys(requestParams).forEach(key => {
        query.append(key, requestParams[key].toString());
      });
      url += `?${query.toString()}`;
    } else {
      body = JSON.stringify(requestParams);
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`MEXC API Error: ${response.status} - ${errorData.msg || response.statusText}`);
    }

    return response.json();
  }

  async getAccountInfo(): Promise<AccountInfo> {
    return this.makePrivateRequest('/account');
  }

  async placeOrder(orderRequest: OrderRequest): Promise<MexcOrder> {
    const params: any = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      type: orderRequest.type,
      quantity: orderRequest.quantity
    };

    if (orderRequest.price) {
      params.price = orderRequest.price;
    }

    if (orderRequest.stopPrice) {
      params.stopPrice = orderRequest.stopPrice;
    }

    if (orderRequest.timeInForce) {
      params.timeInForce = orderRequest.timeInForce;
    } else if (orderRequest.type === 'LIMIT') {
      params.timeInForce = 'GTC';
    }

    return this.makePrivateRequest('/order', 'POST', params);
  }

  async cancelOrder(symbol: string, orderId: string): Promise<any> {
    return this.makePrivateRequest('/order', 'DELETE', {
      symbol,
      orderId
    });
  }

  async getOpenOrders(symbol?: string): Promise<MexcOrder[]> {
    const params: any = {};
    if (symbol) {
      params.symbol = symbol;
    }
    return this.makePrivateRequest('/openOrders', 'GET', params);
  }

  async getAllOrders(symbol: string, limit: number = 500): Promise<MexcOrder[]> {
    return this.makePrivateRequest('/allOrders', 'GET', {
      symbol,
      limit
    });
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<MexcOrder> {
    return this.makePrivateRequest('/order', 'GET', {
      symbol,
      orderId
    });
  }

  static isConfigured(): boolean {
    const keys = ApiKeyManager.getApiKeys();
    return !!(keys?.mexc.apiKey && keys?.mexc.secretKey);
  }
}
