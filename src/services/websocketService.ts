
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

  constructor(private url: string = 'wss://stream.mexc.com/ws') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to MEXC');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: any) {
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
    if (this.ws && this.isConnected) {
      const subscriptionMessage = {
        method: "SUBSCRIPTION",
        params: [`spot@public.miniTicker.v3.api@${symbol}`]
      };
      this.ws.send(JSON.stringify(subscriptionMessage));
    }
  }

  private notifySubscribers(channel: string, data: any) {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
