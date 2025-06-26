
export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
  weight?: number;
}

export interface StrategySignal {
  timestamp: number;
  type: 'BUY' | 'SELL' | 'HOLD' | 'EXIT';
  strength: number; // 0-1 confidence level
  price: number;
  confidence?: number; // Optional confidence score
  reason?: string; // Optional reason for the signal
  metadata?: Record<string, any>;
}

export interface EnhancedPerformance {
  calmarRatio?: number;
  sortinoRatio?: number;
  informationRatio?: number;
  maxAdverseExcursion?: number;
  maxFavorableExcursion?: number;
  profitFactor?: number;
  recoveryFactor?: number;
  ulcerIndex?: number;
  expectedReturn?: number;
  standardDeviation?: number;
  downside_deviation?: number;
  var95?: number; // Value at Risk 95%
  cvar95?: number; // Conditional Value at Risk 95%
}

export interface StrategyResult {
  signals: StrategySignal[];
  indicators: Record<string, number[]>;
  performance: {
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalTrades: number;
  } & EnhancedPerformance;
}

export interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export abstract class BaseStrategy {
  protected config: StrategyConfig;
  
  constructor(config: StrategyConfig) {
    this.config = config;
  }

  abstract calculate(data: MarketData[]): StrategyResult;
  abstract getDefaultConfig(): Partial<StrategyConfig>;
  
  getName(): string {
    return this.config.name;
  }
  
  getConfig(): StrategyConfig {
    return this.config;
  }
  
  updateConfig(newConfig: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
