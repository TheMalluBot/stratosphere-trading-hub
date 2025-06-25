
import { WebSocketConnection, QueuedMessage } from './websocket/WebSocketConnection';
import { MessageBatcher } from './websocket/MessageBatcher';
import { MessageProcessor } from './websocket/MessageProcessor';

export class OptimizedWebSocketService {
  private connection = new WebSocketConnection();
  private batcher = new MessageBatcher();
  private processor = new MessageProcessor();
  private messageQueue: QueuedMessage[] = [];
  private subscribers = new Map<string, Set<(data: any) => void>>();

  async connect(): Promise<void> {
    this.connection.setMessageHandler((event) => this.handleMessage(event));
    await this.connection.connect();
    this.processMessageQueue();
  }

  private handleMessage(event: MessageEvent) {
    const message = this.processor.processMessage(event, this.subscribers);
    if (!message) return;

    const { type, data } = message;
    
    // Add to batch or process immediately based on priority
    if (message.priority === 'high') {
      this.processor.notifySubscribers(type, data, this.subscribers);
    } else {
      this.batcher.addToBatch(message, (msg) => {
        this.processor.notifySubscribers(msg.type, msg.data, this.subscribers);
      });
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

    if (this.connection.getState() === 'connected' && this.connection.getWebSocket()?.readyState === WebSocket.OPEN) {
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
      if (data.length > 1024) {
        data = 'compressed:' + this.processor.compress(data);
      }
      
      this.connection.sendRaw(data);
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
    while (this.messageQueue.length > 0 && this.connection.getWebSocket()?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.transmitMessage(message);
    }
  }

  getConnectionStatus() {
    return {
      state: this.connection.getState(),
      queueSize: this.messageQueue.length,
      subscriberCount: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0),
      compressionEnabled: true
    };
  }

  getPerformanceStats() {
    return {
      messageQueue: this.messageQueue.length,
      subscribers: this.subscribers.size,
      connectionState: this.connection.getState()
    };
  }

  disconnect() {
    this.connection.disconnect();
    this.batcher.cleanup();
    this.processor.clearRateLimit();
    this.subscribers.clear();
    this.messageQueue = [];
  }
}

export const optimizedWsService = new OptimizedWebSocketService();
