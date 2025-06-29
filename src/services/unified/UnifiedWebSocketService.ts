import { WebSocketAdapter, ConnectionStatus } from './WebSocketAdapter';
import { MEXCWebSocketAdapter } from './MEXCWebSocketAdapter';
import { DemoWebSocketAdapter } from './DemoWebSocketAdapter';

export type WebSocketProvider = 'mexc' | 'demo' | 'binance' | 'coinbase';

export class UnifiedWebSocketService {
  private adapters = new Map<WebSocketProvider, WebSocketAdapter>();
  private activeProvider: WebSocketProvider = 'demo';
  private subscribers = new Map<string, Set<(data: any) => void>>();

  constructor() {
    // Register available adapters
    this.registerAdapter('mexc', new MEXCWebSocketAdapter());
    this.registerAdapter('demo', new DemoWebSocketAdapter());
  }

  registerAdapter(provider: WebSocketProvider, adapter: WebSocketAdapter): void {
    this.adapters.set(provider, adapter);
  }

  async setProvider(provider: WebSocketProvider): Promise<void> {
    // Disconnect current provider if connected
    const currentAdapter = this.adapters.get(this.activeProvider);
    if (currentAdapter) {
      currentAdapter.disconnect();
    }

    this.activeProvider = provider;
    const newAdapter = this.adapters.get(provider);
    
    if (!newAdapter) {
      throw new Error(`WebSocket provider '${provider}' not registered`);
    }

    // Transfer subscriptions to new adapter
    await this.transferSubscriptions(newAdapter);
    
    // Connect to new provider
    await newAdapter.connect();
  }

  private async transferSubscriptions(newAdapter: WebSocketAdapter): Promise<void> {
    // Re-subscribe all channels to the new adapter
    for (const [channel, callbacks] of this.subscribers) {
      callbacks.forEach(callback => {
        newAdapter.subscribe(channel, callback);
      });
    }
  }

  async connect(): Promise<void> {
    const adapter = this.getActiveAdapter();
    await adapter.connect();
  }

  disconnect(): void {
    const adapter = this.getActiveAdapter();
    adapter.disconnect();
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    // Store subscription for provider switching
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Subscribe to active adapter
    const adapter = this.getActiveAdapter();
    const unsubscribeFromAdapter = adapter.subscribe(channel, callback);

    // Return combined unsubscribe function
    return () => {
      // Remove from our tracking
      const subscribers = this.subscribers.get(channel);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(channel);
        }
      }
      
      // Unsubscribe from adapter
      unsubscribeFromAdapter();
    };
  }

  unsubscribe(channel: string, callback: (data: any) => void): void {
    // Remove from tracking
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }

    // Unsubscribe from active adapter
    const adapter = this.getActiveAdapter();
    adapter.unsubscribe(channel, callback);
  }

  send(message: any): void {
    const adapter = this.getActiveAdapter();
    adapter.send(message);
  }

  getConnectionStatus(): ConnectionStatus & { provider: WebSocketProvider } {
    const adapter = this.getActiveAdapter();
    const status = adapter.getConnectionStatus();
    
    return {
      ...status,
      provider: this.activeProvider
    };
  }

  getAvailableProviders(): WebSocketProvider[] {
    return Array.from(this.adapters.keys());
  }

  getActiveProvider(): WebSocketProvider {
    return this.activeProvider;
  }

  private getActiveAdapter(): WebSocketAdapter {
    const adapter = this.adapters.get(this.activeProvider);
    if (!adapter) {
      throw new Error(`Active WebSocket provider '${this.activeProvider}' not found`);
    }
    return adapter;
  }

  // Utility methods for common trading operations
  subscribeToPrice(symbol: string, callback: (data: any) => void): () => void {
    return this.subscribe(`price_${symbol}`, callback);
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): () => void {
    return this.subscribe(`orderbook_${symbol}`, callback);
  }

  subscribeToTrades(symbol: string, callback: (data: any) => void): () => void {
    return this.subscribe(`trades_${symbol}`, callback);
  }

  subscribeToAccountUpdates(callback: (data: any) => void): () => void {
    return this.subscribe('account_update', callback);
  }

  subscribeToOrderUpdates(callback: (data: any) => void): () => void {
    return this.subscribe('order_update', callback);
  }
}

// Singleton instance
export const unifiedWebSocketService = new UnifiedWebSocketService(); 