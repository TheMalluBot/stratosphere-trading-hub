
import { enhancedDataService } from './enhancedDataService';

export interface Position {
  symbol: string;
  asset: string;
  quantity: number;
  price: number;
  value: number;
  free: number;
  locked: number;
  change24h: number;
  changePercent24h: number;
}

export interface Portfolio {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  positions: Position[];
  lastUpdate: number;
  isLoading: boolean;
}

export class PortfolioManager {
  private portfolio: Portfolio = {
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    positions: [],
    lastUpdate: Date.now(),
    isLoading: true
  };

  private subscribers = new Set<(portfolio: Portfolio) => void>();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializePortfolio();
    this.startPeriodicUpdates();
  }

  private async initializePortfolio() {
    try {
      // Load demo positions for demonstration
      const demoPositions: Position[] = [
        {
          symbol: 'BTCUSDT',
          asset: 'BTC',
          quantity: 0.25,
          price: 45000,
          value: 11250,
          free: 0.25,
          locked: 0,
          change24h: 125,
          changePercent24h: 1.12
        },
        {
          symbol: 'ETHUSDT',
          asset: 'ETH',
          quantity: 4.5,
          price: 2500,
          value: 11250,
          free: 4.5,
          locked: 0,
          change24h: -75,
          changePercent24h: -0.66
        },
        {
          symbol: 'BNBUSDT',
          asset: 'BNB',
          quantity: 15,
          price: 300,
          value: 4500,
          free: 15,
          locked: 0,
          change24h: 45,
          changePercent24h: 1.01
        }
      ];

      this.portfolio = {
        ...this.portfolio,
        positions: demoPositions,
        totalValue: demoPositions.reduce((sum, pos) => sum + pos.value, 0),
        totalChange: demoPositions.reduce((sum, pos) => sum + pos.change24h, 0),
        totalChangePercent: 0.52,
        lastUpdate: Date.now(),
        isLoading: false
      };

      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to initialize portfolio:', error);
      this.portfolio.isLoading = false;
      this.notifySubscribers();
    }
  }

  private startPeriodicUpdates() {
    this.updateInterval = setInterval(() => {
      this.refreshPortfolio();
    }, 30000); // Update every 30 seconds
  }

  subscribe(callback: (portfolio: Portfolio) => void) {
    this.subscribers.add(callback);
    callback(this.portfolio); // Send current state immediately
  }

  unsubscribe(callback: (portfolio: Portfolio) => void) {
    this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.portfolio);
      } catch (error) {
        console.error('Error in portfolio subscriber:', error);
      }
    });
  }

  refreshPortfolio() {
    // Simulate portfolio updates
    this.portfolio.positions = this.portfolio.positions.map(position => {
      const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
      const newPrice = position.price * (1 + priceChange);
      const newValue = position.quantity * newPrice;
      const change24h = newValue - position.value;
      const changePercent24h = (change24h / position.value) * 100;

      return {
        ...position,
        price: newPrice,
        value: newValue,
        change24h,
        changePercent24h
      };
    });

    this.portfolio.totalValue = this.portfolio.positions.reduce((sum, pos) => sum + pos.value, 0);
    this.portfolio.totalChange = this.portfolio.positions.reduce((sum, pos) => sum + pos.change24h, 0);
    this.portfolio.totalChangePercent = (this.portfolio.totalChange / (this.portfolio.totalValue - this.portfolio.totalChange)) * 100;
    this.portfolio.lastUpdate = Date.now();

    this.notifySubscribers();
  }

  getPortfolio(): Portfolio {
    return this.portfolio;
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.subscribers.clear();
  }
}

export const portfolioManager = new PortfolioManager();
