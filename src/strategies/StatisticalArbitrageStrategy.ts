
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class StatisticalArbitrageStrategy {
  private config: StrategyConfig;
  private lookbackPeriod: number;
  private zScoreThreshold: number;
  private halfLifeThreshold: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.lookbackPeriod = config.parameters?.lookbackPeriod || 60;
    this.zScoreThreshold = config.parameters?.zScoreThreshold || 2.0;
    this.halfLifeThreshold = config.parameters?.halfLifeThreshold || 30;
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      spread: [],
      zscore: [],
      meanReversion: [],
      halfLife: [],
      ornsteinUhlenbeck: []
    };

    for (let i = this.lookbackPeriod; i < data.length; i++) {
      const window = data.slice(i - this.lookbackPeriod, i);
      const prices = window.map(d => d.close);
      const returns = this.calculateReturns(prices);
      
      // Ornstein-Uhlenbeck mean reversion parameters
      const halfLife = this.estimateHalfLife(returns);
      const meanReversionSpeed = this.calculateMeanReversionSpeed(returns);
      const ouParameter = this.calculateOUParameter(prices);
      
      // Statistical measures
      const currentPrice = data[i].close;
      const mean = this.calculateMean(prices);
      const std = this.calculateStandardDeviation(prices, mean);
      const zScore = (currentPrice - mean) / std;
      
      indicators.zscore.push(zScore);
      indicators.halfLife.push(halfLife);
      indicators.meanReversion.push(meanReversionSpeed);
      indicators.ornsteinUhlenbeck.push(ouParameter);
      
      // Generate signals based on statistical significance and mean reversion strength
      if (Math.abs(zScore) > this.zScoreThreshold && halfLife < this.halfLifeThreshold) {
        const confidence = this.calculateSignalConfidence(zScore, halfLife, meanReversionSpeed);
        
        if (confidence > 0.6) {
          const signal: StrategySignal = {
            timestamp: data[i].timestamp,
            type: zScore > 0 ? 'SELL' : 'BUY',
            strength: confidence,
            price: currentPrice,
            metadata: {
              zScore,
              halfLife,
              meanReversionSpeed,
              ouParameter,
              expectedReversion: mean,
              confidence
            }
          };
          signals.push(signal);
        }
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculatePerformance(signals, data)
    };
  }

  private estimateHalfLife(returns: number[]): number {
    if (returns.length < 2) return Infinity;
    
    const laggedReturns = returns.slice(0, -1);
    const currentReturns = returns.slice(1);
    
    const { slope } = this.linearRegression(laggedReturns, currentReturns);
    
    if (Math.abs(slope) >= 1) return Infinity;
    return -Math.log(2) / Math.log(Math.abs(slope));
  }

  private calculateMeanReversionSpeed(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    let autocorr = 0;
    
    for (let i = 1; i < returns.length; i++) {
      autocorr += (returns[i] - mean) * (returns[i-1] - mean);
    }
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return variance > 0 ? autocorr / ((returns.length - 1) * variance) : 0;
  }

  private calculateOUParameter(prices: number[]): number {
    const logPrices = prices.map(p => Math.log(p));
    const returns = this.calculateReturns(logPrices);
    
    // Estimate mean reversion parameter theta
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    // Simple OU parameter estimation
    return variance > 0 ? Math.abs(mean) / variance : 0;
  }

  private calculateSignalConfidence(zScore: number, halfLife: number, meanReversionSpeed: number): number {
    const zScoreConfidence = Math.min(Math.abs(zScore) / this.zScoreThreshold, 1.0);
    const halfLifeConfidence = Math.max(0, 1 - halfLife / this.halfLifeThreshold);
    const meanReversionConfidence = Math.min(Math.abs(meanReversionSpeed) * 10, 1.0);
    
    return (zScoreConfidence * 0.4 + halfLifeConfidence * 0.3 + meanReversionConfidence * 0.3);
  }

  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    
    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = y.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculatePerformance(signals: StrategySignal[], data: MarketData[]) {
    // Basic performance calculation
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
      sharpeRatio: this.calculateSharpeRatio(totalReturn, trades),
      maxDrawdown: 0, // Simplified for now
      profitFactor: 0, // Simplified for now
      calmarRatio: 0,
      sortinoRatio: 0,
      informationRatio: 0,
      ulcerIndex: 0,
      var95: 0,
      cvar95: 0
    };
  }

  private calculateSharpeRatio(totalReturn: number, trades: number): number {
    if (trades === 0) return 0;
    const avgReturn = totalReturn / trades;
    return avgReturn * Math.sqrt(252); // Annualized
  }
}
