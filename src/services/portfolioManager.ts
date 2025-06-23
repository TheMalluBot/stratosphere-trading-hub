
import { MexcPrivateService } from './mexcPrivateService';
import { enhancedWsService, AccountUpdateData } from './enhancedWebSocketService';
import { toast } from 'sonner';

export interface Position {
  symbol: string;
  asset: string;
  quantity: number;
  free: number;
  locked: number;
  price: number;
  value: number;
  change24h: number;
  changePercent24h: number;
}

export interface Portfolio {
  positions: Position[];
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  lastUpdate: number;
  isLoading: boolean;
}

export class PortfolioManager {
  private mexcService: MexcPrivateService | null = null;
  private portfolio: Portfolio = {
    positions: [],
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    lastUpdate: 0,
    isLoading: false
  };
  private subscribers = new Set<(portfolio: Portfolio) => void>();
  private updateTimer: NodeJS.Timeout | null = null;
  private isDemo = false;

  constructor() {
    try {
      this.mexcService = new MexcPrivateService();
      console.log('PortfolioManager: Using live MEXC data');
    } catch (error) {
      console.log('PortfolioManager: Using demo mode');
      this.isDemo = true;
      this.initializeDemoPortfolio();
    }

    // Subscribe to account updates
    enhancedWsService.subscribe('account_update', this.handleAccountUpdate.bind(this));
    
    // Start periodic updates
    this.startPeriodicUpdates();
  }

  private initializeDemoPortfolio(): void {
    this.portfolio = {
      positions: [
        {
          symbol: 'BTCUSDT',
          asset: 'BTC',
          quantity: 0.5,
          free: 0.5,
          locked: 0,
          price: 45234,
          value: 22617,
          change24h: 1234,
          changePercent24h: 2.8
        },
        {
          symbol: 'ETHUSDT',
          asset: 'ETH',
          quantity: 8.2,
          free: 7.8,
          locked: 0.4,
          price: 2456,
          value: 20139,
          change24h: -156,
          changePercent24h: -0.8
        },
        {
          symbol: 'BNBUSDT',
          asset: 'BNB',
          quantity: 15.6,
          free: 15.6,
          locked: 0,
          price: 312,
          value: 4867,
          change24h: 87,
          changePercent24h: 1.9
        }
      ],
      totalValue: 47623,
      totalChange: 1165,
      totalChangePercent: 2.5,
      lastUpdate: Date.now(),
      isLoading: false
    };
  }

  async refreshPortfolio(): Promise<void> {
    if (this.portfolio.isLoading) return;

    this.portfolio.isLoading = true;
    this.notifySubscribers();

    try {
      if (this.isDemo) {
        // Update demo portfolio with random changes
        this.updateDemoPortfolio();
      } else {
        await this.fetchRealPortfolio();
      }
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
      toast.error('Failed to update portfolio data');
    } finally {
      this.portfolio.isLoading = false;
      this.portfolio.lastUpdate = Date.now();
      this.notifySubscribers();
    }
  }

  private async fetchRealPortfolio(): Promise<void> {
    if (!this.mexcService) return;

    const accountInfo = await this.mexcService.getAccountInfo();
    const positions: Position[] = [];

    // Process non-zero balances
    const nonZeroBalances = accountInfo.balances.filter(
      balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );

    for (const balance of nonZeroBalances) {
      if (balance.asset === 'USDT') continue; // Skip USDT for now

      try {
        const symbol = `${balance.asset}USDT`;
        const price = await this.getAssetPrice(symbol);
        const quantity = parseFloat(balance.free) + parseFloat(balance.locked);
        
        if (quantity > 0 && price > 0) {
          positions.push({
            symbol,
            asset: balance.asset,
            quantity,
            free: parseFloat(balance.free),
            locked: parseFloat(balance.locked),
            price,
            value: quantity * price,
            change24h: 0, // Will be updated by price stream
            changePercent24h: 0
          });
        }
      } catch (error) {
        console.warn(`Failed to get price for ${balance.asset}:`, error);
      }
    }

    // Calculate totals
    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalChange = positions.reduce((sum, pos) => sum + pos.change24h, 0);
    const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

    this.portfolio = {
      positions,
      totalValue,
      totalChange,
      totalChangePercent,
      lastUpdate: Date.now(),
      isLoading: false
    };
  }

  private updateDemoPortfolio(): void {
    // Simulate price changes for demo
    this.portfolio.positions = this.portfolio.positions.map(position => {
      const priceChange = (Math.random() - 0.5) * position.price * 0.02;
      const newPrice = position.price + priceChange;
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

    // Recalculate totals
    this.portfolio.totalValue = this.portfolio.positions.reduce((sum, pos) => sum + pos.value, 0);
    this.portfolio.totalChange = this.portfolio.positions.reduce((sum, pos) => sum + pos.change24h, 0);
    this.portfolio.totalChangePercent = this.portfolio.totalValue > 0 
      ? (this.portfolio.totalChange / this.portfolio.totalValue) * 100 
      : 0;
  }

  private async getAssetPrice(symbol: string): Promise<number> {
    try {
      // Use CoinGecko or other price API
      const response = await fetch(`https://api.mexc.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      return 0;
    }
  }

  private handleAccountUpdate(data: AccountUpdateData): void {
    if (this.isDemo) return;

    console.log('Received account update:', data);
    // Refresh portfolio when account balances change
    this.refreshPortfolio();
  }

  private startPeriodicUpdates(): void {
    // Update portfolio every 30 seconds
    this.updateTimer = setInterval(() => {
      this.refreshPortfolio();
    }, 30000);
    
    // Initial load
    this.refreshPortfolio();
  }

  subscribe(callback: (portfolio: Portfolio) => void): void {
    this.subscribers.add(callback);
    // Immediately notify new subscriber
    callback(this.portfolio);
  }

  unsubscribe(callback: (portfolio: Portfolio) => void): void {
    this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.portfolio);
      } catch (error) {
        console.error('Error in portfolio subscriber:', error);
      }
    });
  }

  getPortfolio(): Portfolio {
    return this.portfolio;
  }

  cleanup(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    enhancedWsService.unsubscribe('account_update', this.handleAccountUpdate.bind(this));
    this.subscribers.clear();
  }
}

export const portfolioManager = new PortfolioManager();
