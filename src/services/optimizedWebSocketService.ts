
interface QueuedMessage {
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

export class OptimizedWebSocketService {
  private ws: WebSocket | null = null;
  private messageQueue: QueuedMessage[] = [];
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageRateLimit = new Map<string, number>();
  private compressionEnabled = true;
  private batchSize = 10;
  private batchTimeout = 100; // ms
  private pendingBatch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

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
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
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

  private handleMessage(event: MessageEvent) {
    try {
      let data = event.data;
      
      // Decompress if needed
      if (this.compressionEnabled && typeof data === 'string' && data.startsWith('compressed:')) {
        data = this.decompress(data.substring(11));
      }

      const message = JSON.parse(data);
      
      // Rate limiting check
      const messageType = message.type || 'unknown';
      const now = Date.now();
      const lastMessageTime = this.messageRateLimit.get(messageType) || 0;
      
      if (now - lastMessageTime < 50) { // 50ms rate limit
        return; // Skip this message
      }
      
      this.messageRateLimit.set(messageType, now);
      
      // Add to batch or process immediately based on priority
      if (message.priority === 'high') {
        this.processMessage(message);
      } else {
        this.addToBatch(message);
      }
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private addToBatch(message: any) {
    this.pendingBatch.push(message);
    
    if (this.pendingBatch.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeout);
    }
  }

  private processBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pendingBatch.length === 0) return;

    // Process batch efficiently
    requestAnimationFrame(() => {
      const batch = [...this.pendingBatch];
      this.pendingBatch = [];
      
      batch.forEach(message => this.processMessage(message));
    });
  }

  private processMessage(message: any) {
    const { type, data } = message;
    const subscribers = this.subscribers.get(type);
    
    if (subscribers && subscribers.size > 0) {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        subscribers.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      });
    }
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
        this.sendMessage({ type: 'ping', timestamp: Date.now() }, 'low');
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, callback);
    };
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

  sendMessage(message: any, priority: 'high' | 'medium' | 'low' = 'medium') {
    const queuedMessage: QueuedMessage = {
      data: message,
      timestamp: Date.now(),
      priority
    };

    if (this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      this.transmitMessage(queuedMessage);
    } else {
      this.messageQueue.push(queuedMessage);
      
      // Limit queue size
      if (this.messageQueue.length > 1000) {
        this.messageQueue = this.messageQueue.slice(-500); // Keep last 500 messages
      }
    }
  }

  private transmitMessage(queuedMessage: QueuedMessage) {
    try {
      let data = JSON.stringify(queuedMessage.data);
      
      // Compress large messages
      if (this.compressionEnabled && data.length > 1024) {
        data = 'compressed:' + this.compress(data);
      }
      
      this.ws?.send(data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private processMessageQueue() {
    // Sort by priority and timestamp
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Send queued messages
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.transmitMessage(message);
    }
  }

  private compress(data: string): string {
    // Simple compression placeholder - in production use proper compression
    return btoa(data);
  }

  private decompress(data: string): string {
    // Simple decompression placeholder
    return atob(data);
  }

  getConnectionStatus() {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      subscriberCount: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0),
      compressionEnabled: this.compressionEnabled
    };
  }

  getPerformanceStats() {
    return {
      messageQueue: this.messageQueue.length,
      pendingBatch: this.pendingBatch.length,
      subscribers: this.subscribers.size,
      rateLimitEntries: this.messageRateLimit.size,
      connectionState: this.connectionState
    };
  }

  disconnect() {
    this.connectionState = 'disconnected';
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscribers.clear();
    this.messageQueue = [];
    this.pendingBatch = [];
    this.messageRateLimit.clear();
  }
}

export const optimizedWsService = new OptimizedWebSocketService();
