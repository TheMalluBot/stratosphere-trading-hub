import { BaseWebSocketAdapter } from './WebSocketAdapter';

export class DemoWebSocketAdapter extends BaseWebSocketAdapter {
  private simulationInterval: NodeJS.Timeout | null = null;
  private symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];

  constructor() {
    super('wss://echo.websocket.org');
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      const timeout = setTimeout(() => {
        reject(new Error('Demo WebSocket connection timeout'));
      }, 5000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Demo WebSocket connected');
        this.startPriceSimulation();
        resolve();
      };

      this.ws.onmessage = (event) => this.handleMessage(event);
      
      this.ws.onclose = () => {
        clearTimeout(timeout);
        this.isConnected = false;
        this.stopPriceSimulation();
        console.log('Demo WebSocket disconnected');
        this.handleReconnection();
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Demo WebSocket error:', error);
        reject(error);
      };
    });
  }

  handleMessage(event: MessageEvent): void {
    try {
      // Echo server just returns what we send, so we'll use this for heartbeat
      const message = JSON.parse(event.data);
      if (message.type === 'ping') {
        console.log('Demo WebSocket heartbeat received');
      }
    } catch (error) {
      // Ignore parsing errors for echo server
    }
  }

  private startPriceSimulation(): void {
    // Simulate price updates every 1-3 seconds
    this.simulationInterval = setInterval(() => {
      this.generateRandomPriceUpdate();
    }, Math.random() * 2000 + 1000);

    // Send initial prices
    this.symbols.forEach(symbol => {
      this.generatePriceUpdate(symbol, this.getBasePrice(symbol));
    });
  }

  private stopPriceSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private generateRandomPriceUpdate(): void {
    const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    const basePrice = this.getBasePrice(symbol);
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const newPrice = basePrice * (1 + variation);
    
    this.generatePriceUpdate(symbol, newPrice);
  }

  private generatePriceUpdate(symbol: string, price: number): void {
    const priceData = {
      symbol,
      price: parseFloat(price.toFixed(8)),
      change: (Math.random() - 0.5) * 10, // Random change percentage
      volume: Math.random() * 1000000,
      timestamp: Date.now()
    };

    this.notifySubscribers(`price_${symbol}`, priceData);
    this.notifySubscribers('price_all', priceData);

    // Also generate order book data
    this.generateOrderBookUpdate(symbol, price);
  }

  private generateOrderBookUpdate(symbol: string, price: number): void {
    const asks = [];
    const bids = [];

    // Generate 10 levels each side
    for (let i = 1; i <= 10; i++) {
      asks.push([
        (price * (1 + (i * 0.001))).toFixed(8), // Price slightly above
        (Math.random() * 100).toFixed(4) // Random quantity
      ]);
      
      bids.push([
        (price * (1 - (i * 0.001))).toFixed(8), // Price slightly below
        (Math.random() * 100).toFixed(4) // Random quantity
      ]);
    }

    const orderBookData = {
      symbol,
      asks,
      bids,
      timestamp: Date.now()
    };

    this.notifySubscribers(`orderbook_${symbol}`, orderBookData);
  }

  private getBasePrice(symbol: string): number {
    // Return realistic base prices for demo symbols
    const basePrices: Record<string, number> = {
      'BTCUSDT': 65000,
      'ETHUSDT': 3500,
      'ADAUSDT': 0.45,
      'SOLUSDT': 180,
      'DOTUSDT': 8.5
    };
    
    return basePrices[symbol] || 100;
  }

  // Simulate account updates for demo
  simulateAccountUpdate(): void {
    const accountData = {
      balances: [
        { asset: 'USDT', free: '10000.00', locked: '500.00' },
        { asset: 'BTC', free: '0.5', locked: '0.1' },
        { asset: 'ETH', free: '2.5', locked: '0.5' },
        { asset: 'ADA', free: '1000', locked: '100' }
      ]
    };

    this.notifySubscribers('account_update', accountData);
  }

  // Simulate order updates for demo
  simulateOrderUpdate(orderId: string, symbol: string, status: string): void {
    const orderData = {
      orderId,
      symbol,
      status,
      executedQty: Math.random() * 10,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      type: 'LIMIT'
    };

    this.notifySubscribers('order_update', orderData);
  }

  disconnect(): void {
    super.disconnect();
    this.stopPriceSimulation();
  }
} 