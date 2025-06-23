import { SecureApiKeyManager } from './secureApiKeyManager';

export interface WebSocketMessage {
  type: 'price' | 'orderbook' | 'trade' | 'ticker' | 'account' | 'order';
  symbol?: string;
  data: any;
  timestamp: number;
}

export interface AccountUpdateData {
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
}

export interface OrderUpdateData {
  orderId: string;
  symbol: string;
  status: string;
  executedQty: string;
  side: string;
  type: string;
}

export class EnhancedWebSocketService {
  private publicWs: WebSocket | null = null;
  private privateWs: WebSocket | null = null;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private isConnected = false;
  private privateConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private listenKey: string | null = null;

  async connect(): Promise<void> {
    try {
      // Connect to public stream
      await this.connectPublicStream();
      
      // Try to connect to private stream if API keys are available
      const apiKeys = await SecureApiKeyManager.getApiKeys();
      if (apiKeys?.mexc.apiKey && apiKeys?.mexc.secretKey) {
        await this.connectPrivateStream();
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.enableDemoMode();
    }
  }

  private async connectPublicStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Connecting to MEXC public WebSocket...');
      this.publicWs = new WebSocket('wss://wbs.mexc.com/ws');

      const timeout = setTimeout(() => {
        if (this.publicWs && this.publicWs.readyState === WebSocket.CONNECTING) {
          this.publicWs.close();
          reject(new Error('Public WebSocket connection timeout'));
        }
      }, 10000);

      this.publicWs.onopen = () => {
        clearTimeout(timeout);
        console.log('Public WebSocket connected');
        this.isConnected = true;
        this.startPingInterval();
        resolve();
      };

      this.publicWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handlePublicMessage(message);
        } catch (error) {
          console.error('Error parsing public WebSocket message:', error);
        }
      };

      this.publicWs.onclose = () => {
        clearTimeout(timeout);
        console.log('Public WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.publicWs.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Public WebSocket error:', error);
        reject(error);
      };
    });
  }

  private async connectPrivateStream(): Promise<void> {
    try {
      // Get listen key from MEXC
      this.listenKey = await this.getListenKey();
      
      console.log('Connecting to MEXC private WebSocket...');
      this.privateWs = new WebSocket(`wss://wbs.mexc.com/ws/${this.listenKey}`);

      this.privateWs.onopen = () => {
        console.log('Private WebSocket connected');
        this.privateConnected = true;
      };

      this.privateWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handlePrivateMessage(message);
        } catch (error) {
          console.error('Error parsing private WebSocket message:', error);
        }
      };

      this.privateWs.onclose = () => {
        console.log('Private WebSocket disconnected');
        this.privateConnected = false;
      };

      this.privateWs.onerror = (error) => {
        console.error('Private WebSocket error:', error);
      };

      // Keep listen key alive
      this.startListenKeyKeepAlive();
    } catch (error) {
      console.error('Failed to connect private WebSocket:', error);
    }
  }

  private async getListenKey(): Promise<string> {
    const apiKeys = await SecureApiKeyManager.getApiKeys();
    if (!apiKeys?.mexc.apiKey) {
      throw new Error('API key required for private stream');
    }

    const response = await fetch('https://api.mexc.com/api/v3/userDataStream', {
      method: 'POST',
      headers: {
        'X-MEXC-APIKEY': apiKeys.mexc.apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get listen key');
    }

    const data = await response.json();
    return data.listenKey;
  }

  private startListenKeyKeepAlive(): void {
    // Extend listen key every 30 minutes
    setInterval(async () => {
      try {
        const apiKeys = await SecureApiKeyManager.getApiKeys();
        if (apiKeys?.mexc.apiKey && this.listenKey) {
          await fetch(`https://api.mexc.com/api/v3/userDataStream?listenKey=${this.listenKey}`, {
            method: 'PUT',
            headers: {
              'X-MEXC-APIKEY': apiKeys.mexc.apiKey
            }
          });
        }
      } catch (error) {
        console.error('Failed to extend listen key:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  private handlePublicMessage(message: any): void {
    if (message.c && message.s) {
      // Price ticker message
      const priceData = {
        symbol: message.s,
        price: parseFloat(message.c),
        change: parseFloat(message.P || 0),
        volume: parseFloat(message.v || 0),
        timestamp: Date.now()
      };
      
      this.notifySubscribers(`price_${message.s}`, priceData);
      this.notifySubscribers('price_all', priceData);
    }
  }

  private handlePrivateMessage(message: any): void {
    switch (message.e) {
      case 'outboundAccountPosition':
        // Account balance update
        const accountData: AccountUpdateData = {
          balances: message.B || []
        };
        this.notifySubscribers('account_update', accountData);
        break;

      case 'executionReport':
        // Order update
        const orderData: OrderUpdateData = {
          orderId: message.i,
          symbol: message.s,
          status: message.X,
          executedQty: message.z,
          side: message.S,
          type: message.o
        };
        this.notifySubscribers('order_update', orderData);
        this.notifySubscribers(`order_${message.i}`, orderData);
        break;
    }
  }

  subscribe(channel: string, callback: (data: any) => void): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Auto-subscribe to price feeds
    if (channel.startsWith('price_') && this.isConnected && this.publicWs) {
      const symbol = channel.replace('price_', '');
      this.subscribeToPrice(symbol);
    }
  }

  unsubscribe(channel: string, callback: (data: any) => void): void {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  private subscribeToPrice(symbol: string): void {
    if (this.publicWs?.readyState === WebSocket.OPEN) {
      this.publicWs.send(JSON.stringify({
        method: "SUBSCRIPTION",
        params: [`spot@public.miniTicker.v3.api@${symbol}`]
      }));
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  private enableDemoMode(): void {
    console.log('Enabling demo mode for WebSocket');
    this.isConnected = true;
    
    // Simulate price updates
    setInterval(() => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
      symbols.forEach(symbol => {
        const basePrice = symbol === 'BTCUSDT' ? 45000 : symbol === 'ETHUSDT' ? 2500 : 300;
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
        const change = (Math.random() - 0.5) * 100;
        
        const priceData = {
          symbol,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          volume: Math.random() * 1000 + 100,
          timestamp: Date.now()
        };
        
        this.notifySubscribers(`price_${symbol}`, priceData);
        this.notifySubscribers('price_all', priceData);
      });
    }, 2000);
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      if (this.publicWs?.readyState === WebSocket.OPEN) {
        this.publicWs.send(JSON.stringify({ method: 'PING' }));
      }
    }, 30000);
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect().catch(console.error);
      this.reconnectTimer = null;
    }, 5000);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    
    if (this.publicWs) {
      this.publicWs.close();
      this.publicWs = null;
    }
    
    if (this.privateWs) {
      this.privateWs.close();
      this.privateWs = null;
    }
    
    this.isConnected = false;
    this.privateConnected = false;
    this.subscribers.clear();
  }

  getConnectionStatus(): { public: boolean; private: boolean } {
    return {
      public: this.isConnected,
      private: this.privateConnected
    };
  }
}

export const enhancedWsService = new EnhancedWebSocketService();
