import { 
  WebSocketConnection, 
  WebSocketSubscription, 
  WebSocketMessage,
  MarketData,
  OrderBook,
  Trade,
  TradingError
} from '@/types/trading.types';

/**
 * Professional WebSocket Manager for Real-Time Trading Data
 * Handles multiple exchanges, automatic reconnection, and message queuing
 */
export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocketConnection> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private globalSubscriptions: Map<string, Set<WebSocketSubscription>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private pingTimers: Map<string, NodeJS.Timeout> = new Map();
  private performanceMetrics: Map<string, any> = new Map();
  
  // Configuration
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly INITIAL_RECONNECT_DELAY = 1000;
  private readonly MAX_RECONNECT_DELAY = 30000;
  private readonly PING_INTERVAL = 30000;
  private readonly PONG_TIMEOUT = 10000;
  private readonly MESSAGE_QUEUE_SIZE = 1000;
  private readonly COMPRESSION_ENABLED = true;

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private constructor() {
    this.setupPerformanceMonitoring();
  }

  /**
   * Create a new WebSocket connection
   */
  async createConnection(
    id: string,
    url: string,
    options: {
      protocols?: string[];
      headers?: Record<string, string>;
      compression?: boolean;
      autoReconnect?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const connection: WebSocketConnection = {
        id,
        url,
        status: 'CONNECTING',
        subscriptions: new Map(),
        reconnectAttempts: 0,
        maxReconnectAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectDelay: this.INITIAL_RECONNECT_DELAY,
        lastPing: 0,
        latency: 0
      };

      this.connections.set(id, connection);
      this.messageQueue.set(id, []);

      await this.connect(id, options);
    } catch (error) {
      console.error(`Failed to create WebSocket connection ${id}:`, error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket
   */
  private async connect(
    connectionId: string,
    options: any = {}
  ): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error(`Connection ${connectionId} not found`);

    try {
      connection.status = 'CONNECTING';
      
      const ws = new WebSocket(connection.url, options.protocols);
      
      // Enable compression if supported
      if (this.COMPRESSION_ENABLED && options.compression !== false) {
        // @ts-ignore - WebSocket compression extension
        ws.extensions = 'permessage-deflate';
      }

      // Store WebSocket instance
      (connection as any).ws = ws;

      ws.onopen = () => this.handleOpen(connectionId);
      ws.onmessage = (event) => this.handleMessage(connectionId, event);
      ws.onclose = (event) => this.handleClose(connectionId, event);
      ws.onerror = (error) => this.handleError(connectionId, error);

      // Set connection timeout
      setTimeout(() => {
        if (connection.status === 'CONNECTING') {
          ws.close();
          this.handleConnectionTimeout(connectionId);
        }
      }, 10000);

    } catch (error) {
      console.error(`WebSocket connection failed for ${connectionId}:`, error);
      connection.status = 'ERROR';
      this.scheduleReconnect(connectionId);
    }
  }

  /**
   * Subscribe to a data stream
   */
  subscribe(
    connectionId: string,
    subscription: WebSocketSubscription
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const streamKey = this.getStreamKey(subscription);
    connection.subscriptions.set(streamKey, subscription);

    // Add to global subscriptions for cross-connection management
    if (!this.globalSubscriptions.has(streamKey)) {
      this.globalSubscriptions.set(streamKey, new Set());
    }
    this.globalSubscriptions.get(streamKey)!.add(subscription);

    // Send subscription message if connected
    if (connection.status === 'CONNECTED') {
      this.sendSubscriptionMessage(connectionId, subscription, 'SUBSCRIBE');
    }
  }

  /**
   * Unsubscribe from a data stream
   */
  unsubscribe(
    connectionId: string,
    streamKey: string
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const subscription = connection.subscriptions.get(streamKey);
    if (!subscription) return;

    connection.subscriptions.delete(streamKey);

    // Remove from global subscriptions
    const globalSubs = this.globalSubscriptions.get(streamKey);
    if (globalSubs) {
      globalSubs.delete(subscription);
      if (globalSubs.size === 0) {
        this.globalSubscriptions.delete(streamKey);
      }
    }

    // Send unsubscription message if connected
    if (connection.status === 'CONNECTED') {
      this.sendSubscriptionMessage(connectionId, subscription, 'UNSUBSCRIBE');
    }
  }

  /**
   * Send a message through WebSocket
   */
  send(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const ws = (connection as any).ws;
    if (!ws || connection.status !== 'CONNECTED') {
      // Queue message for later delivery
      const queue = this.messageQueue.get(connectionId) || [];
      if (queue.length < this.MESSAGE_QUEUE_SIZE) {
        queue.push({
          stream: 'outbound',
          data: message,
          timestamp: Date.now()
        });
        this.messageQueue.set(connectionId, queue);
      }
      return;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      ws.send(messageStr);
      
      // Update performance metrics
      this.updateThroughputMetrics(connectionId, 'sent');
    } catch (error) {
      console.error(`Failed to send message on connection ${connectionId}:`, error);
      this.handleError(connectionId, error);
    }
  }

  /**
   * Close a WebSocket connection
   */
  close(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clear timers
    const reconnectTimer = this.reconnectTimers.get(connectionId);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      this.reconnectTimers.delete(connectionId);
    }

    const pingTimer = this.pingTimers.get(connectionId);
    if (pingTimer) {
      clearInterval(pingTimer);
      this.pingTimers.delete(connectionId);
    }

    // Close WebSocket
    const ws = (connection as any).ws;
    if (ws) {
      ws.close();
    }

    // Clean up
    this.connections.delete(connectionId);
    this.messageQueue.delete(connectionId);
    this.performanceMetrics.delete(connectionId);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(connectionId: string): string {
    const connection = this.connections.get(connectionId);
    return connection ? connection.status : 'NOT_FOUND';
  }

  /**
   * Get all connections
   */
  getAllConnections(): Map<string, WebSocketConnection> {
    return new Map(this.connections);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(connectionId?: string): any {
    if (connectionId) {
      return this.performanceMetrics.get(connectionId) || {};
    }
    return Object.fromEntries(this.performanceMetrics);
  }

  // Private methods

  private handleOpen(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.log(`✅ WebSocket connected: ${connectionId}`);
    connection.status = 'CONNECTED';
    connection.reconnectAttempts = 0;
    connection.reconnectDelay = this.INITIAL_RECONNECT_DELAY;

    // Start ping/pong monitoring
    this.startPingMonitoring(connectionId);

    // Resubscribe to all streams
    this.resubscribeAll(connectionId);

    // Process queued messages
    this.processMessageQueue(connectionId);

    // Update performance metrics
    this.updateConnectionMetrics(connectionId, 'connected');
  }

  private handleMessage(connectionId: string, event: MessageEvent): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const data = JSON.parse(event.data);
      const message: WebSocketMessage = {
        stream: data.stream || 'unknown',
        data: data,
        timestamp: Date.now()
      };

      // Handle pong messages
      if (data.pong) {
        connection.latency = Date.now() - connection.lastPing;
        this.updateLatencyMetrics(connectionId, connection.latency);
        return;
      }

      // Route message to appropriate handlers
      this.routeMessage(connectionId, message);

      // Update performance metrics
      this.updateThroughputMetrics(connectionId, 'received');

    } catch (error) {
      console.error(`Failed to parse WebSocket message from ${connectionId}:`, error);
      this.handleDataError(connectionId, error, event.data);
    }
  }

  private handleClose(connectionId: string, event: CloseEvent): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.warn(`🔌 WebSocket disconnected: ${connectionId}, Code: ${event.code}, Reason: ${event.reason}`);
    connection.status = 'DISCONNECTED';

    // Clear ping timer
    const pingTimer = this.pingTimers.get(connectionId);
    if (pingTimer) {
      clearInterval(pingTimer);
      this.pingTimers.delete(connectionId);
    }

    // Schedule reconnection if not manually closed
    if (event.code !== 1000) {
      this.scheduleReconnect(connectionId);
    }

    // Update performance metrics
    this.updateConnectionMetrics(connectionId, 'disconnected');
  }

  private handleError(connectionId: string, error: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.error(`❌ WebSocket error on ${connectionId}:`, error);
    connection.status = 'ERROR';

    // Emit error event
    this.emitError(connectionId, {
      code: 'WEBSOCKET_ERROR',
      message: `WebSocket error on connection ${connectionId}`,
      details: error,
      timestamp: Date.now(),
      severity: 'HIGH',
      component: 'WebSocketManager'
    });

    // Update performance metrics
    this.updateErrorMetrics(connectionId);
  }

  private handleConnectionTimeout(connectionId: string): void {
    console.warn(`⏰ WebSocket connection timeout: ${connectionId}`);
    this.scheduleReconnect(connectionId);
  }

  private scheduleReconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    if (connection.reconnectAttempts >= connection.maxReconnectAttempts) {
      console.error(`🚫 Max reconnection attempts reached for ${connectionId}`);
      connection.status = 'ERROR';
      return;
    }

    const delay = Math.min(
      connection.reconnectDelay * Math.pow(2, connection.reconnectAttempts),
      this.MAX_RECONNECT_DELAY
    );

    console.log(`🔄 Scheduling reconnection for ${connectionId} in ${delay}ms (attempt ${connection.reconnectAttempts + 1})`);

    const timer = setTimeout(async () => {
      connection.reconnectAttempts++;
      this.reconnectTimers.delete(connectionId);
      
      try {
        await this.connect(connectionId);
      } catch (error) {
        console.error(`Reconnection failed for ${connectionId}:`, error);
        this.scheduleReconnect(connectionId);
      }
    }, delay);

    this.reconnectTimers.set(connectionId, timer);
  }

  private startPingMonitoring(connectionId: string): void {
    const timer = setInterval(() => {
      this.sendPing(connectionId);
    }, this.PING_INTERVAL);

    this.pingTimers.set(connectionId, timer);
  }

  private sendPing(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.status !== 'CONNECTED') return;

    const ws = (connection as any).ws;
    if (!ws) return;

    try {
      connection.lastPing = Date.now();
      ws.send(JSON.stringify({ ping: connection.lastPing }));

      // Set pong timeout
      setTimeout(() => {
        if (Date.now() - connection.lastPing > this.PONG_TIMEOUT) {
          console.warn(`💔 Pong timeout for ${connectionId}`);
          ws.close();
        }
      }, this.PONG_TIMEOUT);

    } catch (error) {
      console.error(`Failed to send ping to ${connectionId}:`, error);
    }
  }

  private resubscribeAll(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.forEach(subscription => {
      this.sendSubscriptionMessage(connectionId, subscription, 'SUBSCRIBE');
    });
  }

  private processMessageQueue(connectionId: string): void {
    const queue = this.messageQueue.get(connectionId);
    if (!queue || queue.length === 0) return;

    console.log(`📨 Processing ${queue.length} queued messages for ${connectionId}`);

    queue.forEach(message => {
      this.send(connectionId, message.data);
    });

    this.messageQueue.set(connectionId, []);
  }

  private routeMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Find matching subscriptions
    const matchingSubscriptions = Array.from(connection.subscriptions.values())
      .filter(sub => this.matchesSubscription(sub, message));

    // Call subscription callbacks
    matchingSubscriptions.forEach(subscription => {
      try {
        subscription.callback(message.data);
      } catch (error) {
        console.error(`Subscription callback error for ${subscription.stream}:`, error);
      }
    });
  }

  private matchesSubscription(subscription: WebSocketSubscription, message: WebSocketMessage): boolean {
    // Basic stream matching - can be enhanced based on exchange protocols
    return message.stream.includes(subscription.stream) ||
           (subscription.symbol && message.stream.includes(subscription.symbol));
  }

  private sendSubscriptionMessage(
    connectionId: string,
    subscription: WebSocketSubscription,
    action: 'SUBSCRIBE' | 'UNSUBSCRIBE'
  ): void {
    const message = {
      method: action,
      params: [subscription.stream],
      id: Date.now()
    };

    this.send(connectionId, message);
  }

  private getStreamKey(subscription: WebSocketSubscription): string {
    return `${subscription.stream}_${subscription.symbol || ''}_${subscription.interval || ''}`;
  }

  private setupPerformanceMonitoring(): void {
    // Initialize performance monitoring
    setInterval(() => {
      this.updateGlobalMetrics();
    }, 1000);
  }

  private updateConnectionMetrics(connectionId: string, event: string): void {
    const metrics = this.performanceMetrics.get(connectionId) || {
      connections: 0,
      disconnections: 0,
      errors: 0,
      messagesReceived: 0,
      messagesSent: 0,
      averageLatency: 0,
      uptime: 0,
      startTime: Date.now()
    };

    if (event === 'connected') {
      metrics.connections++;
    } else if (event === 'disconnected') {
      metrics.disconnections++;
    }

    this.performanceMetrics.set(connectionId, metrics);
  }

  private updateThroughputMetrics(connectionId: string, direction: 'sent' | 'received'): void {
    const metrics = this.performanceMetrics.get(connectionId) || {};
    
    if (direction === 'sent') {
      metrics.messagesSent = (metrics.messagesSent || 0) + 1;
    } else {
      metrics.messagesReceived = (metrics.messagesReceived || 0) + 1;
    }

    this.performanceMetrics.set(connectionId, metrics);
  }

  private updateLatencyMetrics(connectionId: string, latency: number): void {
    const metrics = this.performanceMetrics.get(connectionId) || {};
    
    metrics.latency = latency;
    metrics.averageLatency = metrics.averageLatency 
      ? (metrics.averageLatency * 0.9 + latency * 0.1)
      : latency;

    this.performanceMetrics.set(connectionId, metrics);
  }

  private updateErrorMetrics(connectionId: string): void {
    const metrics = this.performanceMetrics.get(connectionId) || {};
    metrics.errors = (metrics.errors || 0) + 1;
    this.performanceMetrics.set(connectionId, metrics);
  }

  private updateGlobalMetrics(): void {
    // Calculate global performance metrics
    let totalConnections = 0;
    let totalLatency = 0;
    let totalMessages = 0;

    this.performanceMetrics.forEach((metrics, connectionId) => {
      const connection = this.connections.get(connectionId);
      if (connection && connection.status === 'CONNECTED') {
        totalConnections++;
        totalLatency += metrics.averageLatency || 0;
        totalMessages += (metrics.messagesReceived || 0) + (metrics.messagesSent || 0);
      }
    });

    // Store global metrics
    this.performanceMetrics.set('global', {
      activeConnections: totalConnections,
      averageLatency: totalConnections > 0 ? totalLatency / totalConnections : 0,
      totalMessages,
      timestamp: Date.now()
    });
  }

  private emitError(connectionId: string, error: TradingError): void {
    // Emit error event - can be enhanced with event emitter
    console.error(`Trading error on ${connectionId}:`, error);
    
    // Could integrate with error reporting system
    // this.errorHandler?.onConnectionError(error);
  }

  private handleDataError(connectionId: string, error: any, rawData: string): void {
    this.emitError(connectionId, {
      code: 'DATA_PARSE_ERROR',
      message: 'Failed to parse WebSocket data',
      details: { error, rawData: rawData.substring(0, 200) },
      timestamp: Date.now(),
      severity: 'MEDIUM',
      component: 'WebSocketManager'
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Close all connections
    this.connections.forEach((_, connectionId) => {
      this.close(connectionId);
    });

    // Clear all timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer));
    this.pingTimers.forEach(timer => clearInterval(timer));

    // Clear data structures
    this.connections.clear();
    this.messageQueue.clear();
    this.globalSubscriptions.clear();
    this.reconnectTimers.clear();
    this.pingTimers.clear();
    this.performanceMetrics.clear();

    console.log('🧹 WebSocket Manager destroyed');
  }
} 