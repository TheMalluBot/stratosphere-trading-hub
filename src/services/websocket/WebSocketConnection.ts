
export interface QueuedMessage {
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to optimized WebSocket...');
        this.ws = new WebSocket('wss://echo.websocket.org');
        
        const timeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ Optimized WebSocket connected');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage?.(event);
        };

        this.ws.onclose = () => {
          clearTimeout(timeout);
          console.log('❌ Optimized WebSocket disconnected');
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.handleReconnection();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.connectionState = 'disconnected';
          reject(error);
        };

      } catch (error) {
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }

  private handleReconnection() {
    if (this.connectionState === 'reconnecting') return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.connectionState = 'reconnecting';
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
      
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
          this.connectionState = 'disconnected';
        });
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.connectionState = 'disconnected';
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendRaw({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendRaw(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  getState() {
    return this.connectionState;
  }

  getWebSocket() {
    return this.ws;
  }

  setMessageHandler(handler: (event: MessageEvent) => void) {
    this.handleMessage = handler;
  }

  disconnect() {
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage?: (event: MessageEvent) => void;
}
