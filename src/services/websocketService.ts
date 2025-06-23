
export interface WebSocketMessage {
  type: 'price' | 'orderbook' | 'trade' | 'ticker';
  symbol: string;
  data: any;
  timestamp: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private url: string;

  constructor(url?: string) {
    // Try MEXC first, fallback to demo mode
    this.url = url || 'wss://wbs.mexc.com/ws';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting WebSocket connection to:', this.url);
        this.ws = new WebSocket(this.url);
        
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();

          // Subscribe to a general ticker stream for demo
          this.sendSubscription('BTCUSDT');
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopPingInterval();
          
          if (event.code !== 1000) { // Not a normal closure
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          
          // Try fallback to demo mode
          if (this.url.includes('mexc.com')) {
            console.log('Falling back to demo mode');
            this.url = 'wss://echo.websocket.org'; // Demo WebSocket
            this.enableDemoMode();
            resolve();
          } else {
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private enableDemoMode() {
    console.log('WebSocket running in demo mode');
    this.isConnected = true;
    
    // Simulate price updates in demo mode
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

  private handleMessage(message: any) {
    // Handle different message formats
    try {
      if (message.c && message.s) {
        // MEXC ticker format
        const symbol = message.s;
        const priceData = {
          symbol,
          price: parseFloat(message.c),
          change: parseFloat(message.P || 0),
          volume: parseFloat(message.v || 0),
          timestamp: Date.now()
        };
        
        this.notifySubscribers(`price_${symbol}`, priceData);
        this.notifySubscribers('price_all', priceData);
      } else if (message.data) {
        // Generic data format
        this.notifySubscribers('general', message.data);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Send subscription message for price updates
    if (channel.startsWith('price_') && this.isConnected) {
      const symbol = channel.replace('price_', '');
      this.sendSubscription(symbol);
    }
  }

  unsubscribe(channel: string, callback: (data: any) => void) {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  private sendSubscription(symbol: string) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        const subscriptionMessage = {
          method: "SUBSCRIPTION",
          params: [`spot@public.miniTicker.v3.api@${symbol}`]
        };
        this.ws.send(JSON.stringify(subscriptionMessage));
        console.log('Sent subscription for:', symbol);
      } catch (error) {
        console.error('Error sending subscription:', error);
      }
    }
  }

  private notifySubscribers(channel: string, data: any) {
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

  private startPingInterval() {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'PING' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.log('Max reconnection attempts reached. Switching to demo mode.');
      this.enableDemoMode();
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscribers.clear();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectionInfo(): { connected: boolean; url: string; attempts: number } {
    return {
      connected: this.isConnected,
      url: this.url,
      attempts: this.reconnectAttempts
    };
  }
}

export const wsService = new WebSocketService();
