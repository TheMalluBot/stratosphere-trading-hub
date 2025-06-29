// Unified WebSocket Service Architecture
export interface WebSocketAdapter {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(channel: string, callback: (data: any) => void): () => void;
  unsubscribe(channel: string, callback: (data: any) => void): void;
  send(message: any): void;
  getConnectionStatus(): ConnectionStatus;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
  lastConnected?: Date;
}

export interface WebSocketMessage {
  type: string;
  channel?: string;
  data: any;
  timestamp: number;
  priority?: 'high' | 'medium' | 'low';
}

export abstract class BaseWebSocketAdapter implements WebSocketAdapter {
  protected ws: WebSocket | null = null;
  protected subscribers = new Map<string, Set<(data: any) => void>>();
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected reconnectDelay = 1000;
  protected isConnected = false;
  protected url: string;

  constructor(url: string) {
    this.url = url;
  }

  abstract connect(): Promise<void>;
  abstract handleMessage(event: MessageEvent): void;
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(channel, callback);
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

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      connected: this.isConnected,
      reconnecting: this.reconnectAttempts > 0,
      lastConnected: this.isConnected ? new Date() : undefined
    };
  }

  protected notifySubscribers(channel: string, data: any): void {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket subscriber for channel ${channel}:`, error);
        }
      });
    }
  }

  protected handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    }
  }
} 