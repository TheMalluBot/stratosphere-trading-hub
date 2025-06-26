
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class CrossAssetArbitrageStrategy {
  private config: StrategyConfig;
  private correlationThreshold: number;
  private divergenceThreshold: number;
  private volumeFilter: number;
  private lookbackPeriod: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.correlationThreshold = config.parameters?.correlationThreshold || 0.8;
    this.divergenceThreshold = config.parameters?.divergenceThreshold || 2.5;
    this.volumeFilter = config.parameters?.volumeFilter || 1000000;
    this.lookbackPeriod = config.parameters?.lookbackPeriod || 50;
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      correlation: [],
      spread: [],
      normalizedSpread: [],
      arbitrageScore: [],
      basketValue: []
    };

    // Generate synthetic basket/ETF prices for arbitrage detection
    const basketPrices = this.generateBasketPrices(data);
    
    for (let i = this.lookbackPeriod; i < data.length; i++) {
      const window = i - this.lookbackPeriod;
      
      // Calculate rolling correlation between asset and synthetic basket
      const assetPrices = data.slice(window, i).map(d => d.close);
      const basketWindow = basketPrices.slice(window, i);
      
      const correlation = this.calculateCorrelation(assetPrices, basketWindow);
      const spread = data[i].close - basketPrices[i];
      const normalizedSpread = this.normalizeSpread(spread, assetPrices);
      const basketValue = basketPrices[i];
      
      // Advanced arbitrage scoring with multiple factors
      const arbitrageScore = this.calculateArbitrageScore(
        correlation,
        normalizedSpread,
        data[i].volume,
        this.calculateVolatilityRatio(assetPrices, basketWindow)
      );
      
      indicators.correlation.push(correlation);
      indicators.spread.push(spread);
      indicators.normalizedSpread.push(normalizedSpread);
      indicators.arbitrageScore.push(arbitrageScore);
      indicators.basketValue.push(basketValue);
      
      // Generate signals for cross-asset arbitrage opportunities
      if (this.isArbitrageOpportunity(correlation, normalizedSpread, data[i].volume, arbitrageScore)) {
        const signal: StrategySignal = {
          timestamp: data[i].timestamp,
          type: spread > 0 ? 'SELL' : 'BUY',
          strength: Math.min(arbitrageScore / 10, 1.0),
          price: data[i].close,
          metadata: {
            spread,
            normalizedSpread,
            correlation,
            arbitrageScore,
            basketValue,
            expectedReversion: this.calculateReversionTarget(spread, assetPrices),
            riskAdjustedReturn: this.calculateRiskAdjustedReturn(spread, assetPrices)
          }
        };
        signals.push(signal);
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculatePerformance(signals, data)
    };
  }

  private generateBasketPrices(data: MarketData[]): number[] {
    // Simulate correlated asset basket (in practice, use real constituent data)
    return data.map((d, i) => {
      const basePrice = d.close;
      const marketNoise = (Math.random() - 0.5) * basePrice * 0.01;
      const sectorTrend = Math.sin(i / 200) * basePrice * 0.005;
      const momentumFactor = i > 20 ? (data[i].close - data[i-20].close) / data[i-20].close * 0.1 : 0;
      
      return basePrice + marketNoise + sectorTrend + momentumFactor;
    });
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;
    
    const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
    const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator > 0 ? numerator / denominator : 0;
  }

  private normalizeSpread(spread: number, prices: number[]): number {
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const std = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
    );
    return std > 0 ? spread / std : 0;
  }

  private calculateVolatilityRatio(assetPrices: number[], basketPrices: number[]): number {
    const assetVol = this.calculateVolatility(assetPrices);
    const basketVol = this.calculateVolatility(basketPrices);
    return basketVol > 0 ? assetVol / basketVol : 1;
  }

  private calculateVolatility(prices: number[]): number {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
  }

  private calculateArbitrageScore(
    correlation: number,
    normalizedSpread: number,
    volume: number,
    volatilityRatio: number
  ): number {
    const correlationScore = correlation * 3;
    const spreadScore = Math.abs(normalizedSpread) * 2;
    const volumeScore = Math.min(volume / this.volumeFilter, 2);
    const volatilityScore = Math.min(Math.abs(volatilityRatio - 1) * 2, 1);
    
    return correlationScore + spreadScore + volumeScore + volatilityScore;
  }

  private isArbitrageOpportunity(
    correlation: number,
    normalizedSpread: number,
    volume: number,
    arbitrageScore: number
  ): boolean {
    return (
      Math.abs(normalizedSpread) > this.divergenceThreshold &&
      correlation > this.correlationThreshold &&
      volume > this.volumeFilter &&
      arbitrageScore > 5
    );
  }

  private calculateReversionTarget(spread: number, prices: number[]): number {
    // Calculate expected reversion target using historical spread mean
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return mean; // Simplified - in practice, use more sophisticated models
  }

  private calculateRiskAdjustedReturn(spread: number, prices: number[]): number {
    const volatility = this.calculateVolatility(prices);
    return volatility > 0 ? Math.abs(spread) / volatility : 0;
  }

  private calculatePerformance(signals: StrategySignal[], data: MarketData[]) {
    let totalReturn = 0;
    let trades = 0;
    let wins = 0;

    for (let i = 0; i < signals.length - 1; i++) {
      const entry = signals[i];
      const exit = signals[i + 1];
      
      if (entry.type !== exit.type) {
        trades++;
        const returnPct = entry.type === 'BUY' 
          ? (exit.price - entry.price) / entry.price
          : (entry.price - exit.price) / entry.price;
        
        totalReturn += returnPct;
        if (returnPct > 0) wins++;
      }
    }

    return {
      totalReturn: totalReturn * 100,
      winRate: trades > 0 ? (wins / trades) * 100 : 0,
      totalTrades: trades,
      sharpeRatio: trades > 0 ? (totalReturn / trades) * Math.sqrt(252) : 0,
      maxDrawdown: 0,
      profitFactor: 0,
      calmarRatio: 0,
      sortinoRatio: 0,
      informationRatio: 0,
      ulcerIndex: 0,
      var95: 0,
      cvar95: 0
    };
  }
}
