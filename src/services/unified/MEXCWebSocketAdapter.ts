import { BaseWebSocketAdapter, WebSocketMessage } from './WebSocketAdapter';
import { SecureApiKeyManager } from '../secureApiKeyManager';

export class MEXCWebSocketAdapter extends BaseWebSocketAdapter {
  private listenKey: string | null = null;
  private privateWs: WebSocket | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    super('wss://wbs.mexc.com/ws');
  }

  async connect(): Promise<void> {
    try {
      // Connect to public stream
      await this.connectPublicStream();
      
      // Try to connect to private stream if API keys are available
      const apiKeys = await SecureApiKeyManager.getApiKeys();
      if (apiKeys?.mexc?.apiKey && apiKeys?.mexc?.secretKey) {
        await this.connectPrivateStream();
      }
    } catch (error) {
      console.error('Failed to connect MEXC WebSocket:', error);
      throw error;
    }
  }

  private async connectPublicStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('MEXC public WebSocket connected');
        resolve();
      };

      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = () => {
        clearTimeout(timeout);
        this.isConnected = false;
        console.log('MEXC public WebSocket disconnected');
        this.handleReconnection();
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  }

  private async connectPrivateStream(): Promise<void> {
    try {
      this.listenKey = await this.getListenKey();
      
      this.privateWs = new WebSocket(`wss://wbs.mexc.com/ws/${this.listenKey}`);
      
      this.privateWs.onopen = () => {
        console.log('MEXC private WebSocket connected');
        this.startKeepAlive();
      };

      this.privateWs.onmessage = (event) => this.handlePrivateMessage(event);
      
      this.privateWs.onclose = () => {
        console.log('MEXC private WebSocket disconnected');
        this.stopKeepAlive();
      };

    } catch (error) {
      console.error('Failed to connect private stream:', error);
    }
  }

  handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      // Handle different MEXC message types
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
      
      // Handle order book updates
      if (message.asks && message.bids) {
        const orderBookData = {
          symbol: message.s,
          asks: message.asks,
          bids: message.bids,
          timestamp: Date.now()
        };
        
        this.notifySubscribers(`orderbook_${message.s}`, orderBookData);
      }
      
    } catch (error) {
      console.error('Error parsing MEXC message:', error);
    }
  }

  private handlePrivateMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.e) {
        case 'outboundAccountPosition':
          this.notifySubscribers('account_update', {
            balances: message.B || []
          });
          break;
          
        case 'executionReport':
          this.notifySubscribers('order_update', {
            orderId: message.i,
            symbol: message.s,
            status: message.X,
            executedQty: message.z,
            side: message.S,
            type: message.o
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing MEXC private message:', error);
    }
  }

  private async getListenKey(): Promise<string> {
    const apiKeys = await SecureApiKeyManager.getApiKeys();
    if (!apiKeys?.mexc?.apiKey) {
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

  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(async () => {
      try {
        const apiKeys = await SecureApiKeyManager.getApiKeys();
        if (apiKeys?.mexc?.apiKey && this.listenKey) {
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

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  disconnect(): void {
    super.disconnect();
    if (this.privateWs) {
      this.privateWs.close();
      this.privateWs = null;
    }
    this.stopKeepAlive();
  }
} 