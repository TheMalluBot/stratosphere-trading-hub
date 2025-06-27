
import { MarketData } from '@/types/strategy';

export class DataSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private basePrices: Map<string, number> = new Map();

  startSimulation(symbol: string, callback: (data: MarketData) => void): void {
    // Initialize base price if not exists
    if (!this.basePrices.has(symbol)) {
      this.basePrices.set(symbol, this.getBasePrice(symbol));
    }

    // Generate data every 2 seconds
    const interval = setInterval(() => {
      const simulatedData = this.generateSimulatedData(symbol);
      callback(simulatedData);
    }, 2000);

    this.intervals.set(symbol, interval);
  }

  stopSimulation(symbol: string): void {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  private generateSimulatedData(symbol: string): MarketData {
    const basePrice = this.basePrices.get(symbol) || 1000;
    const volatility = 0.02; // 2% volatility
    
    const change = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + change);
    
    // Update base price for next iteration
    this.basePrices.set(symbol, price);
    
    return {
      timestamp: Date.now(),
      open: price * 0.999,
      high: price * 1.001,
      low: price * 0.998,
      close: price,
      volume: Math.floor(Math.random() * 100000) + 50000
    };
  }

  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'RELIANCE': 2450,
      'TCS': 3200,
      'INFY': 1450,
      'HDFC': 1600,
      'ICICIBANK': 950,
      'SBIN': 420,
      'ITC': 250,
      'HDFCBANK': 1550,
      'BHARTIARTL': 850,
      'LT': 2800
    };
    return basePrices[symbol] || 1000;
  }
}
