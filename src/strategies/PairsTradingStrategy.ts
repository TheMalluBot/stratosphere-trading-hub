
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class PairsTradingStrategy {
  private config: StrategyConfig;
  private lookbackPeriod: number;
  private cointegrationThreshold: number;
  private entryZScore: number;
  private exitZScore: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.lookbackPeriod = config.parameters?.lookbackPeriod || 60;
    this.cointegrationThreshold = config.parameters?.cointegrationThreshold || 0.05;
    this.entryZScore = config.parameters?.entryZScore || 2.0;
    this.exitZScore = config.parameters?.exitZScore || 0.5;
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      spread: [],
      zscore: [],
      hedgeRatio: [],
      cointegration: [],
      residuals: []
    };

    // Generate synthetic pair data (in practice, use real pair data)
    const pairData = this.generatePairData(data);
    
    for (let i = this.lookbackPeriod; i < data.length; i++) {
      const window1 = data.slice(i - this.lookbackPeriod, i).map(d => d.close);
      const window2 = pairData.slice(i - this.lookbackPeriod, i);
      
      // Calculate hedge ratio using linear regression
      const hedgeRatio = this.calculateHedgeRatio(window1, window2);
      
      // Calculate spread and z-score
      const spread = data[i].close - hedgeRatio * pairData[i];
      const spreadSeries = [];
      for (let j = Math.max(0, i - this.lookbackPeriod); j < i; j++) {
        spreadSeries.push(data[j].close - hedgeRatio * pairData[j]);
      }
      
      const spreadMean = spreadSeries.reduce((sum, s) => sum + s, 0) / spreadSeries.length;
      const spreadStd = Math.sqrt(
        spreadSeries.reduce((sum, s) => sum + Math.pow(s - spreadMean, 2), 0) / spreadSeries.length
      );
      const zScore = spreadStd > 0 ? (spread - spreadMean) / spreadStd : 0;
      
      // Test for cointegration (simplified Engle-Granger test)
      const cointegrationPValue = this.testCointegration(window1, window2);
      
      indicators.spread.push(spread);
      indicators.zscore.push(zScore);
      indicators.hedgeRatio.push(hedgeRatio);
      indicators.cointegration.push(cointegrationPValue);
      indicators.residuals.push(spread - spreadMean);
      
      // Generate pairs trading signals
      if (cointegrationPValue < this.cointegrationThreshold) {
        if (Math.abs(zScore) > this.entryZScore) {
          const signal: StrategySignal = {
            timestamp: data[i].timestamp,
            type: zScore > 0 ? 'SELL' : 'BUY',
            strength: Math.min(Math.abs(zScore) / this.entryZScore, 1.0),
            price: data[i].close,
            metadata: {
              spread,
              zScore,
              hedgeRatio,
              cointegrationPValue,
              pairPrice: pairData[i],
              expectedMeanReversion: spreadMean
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

  private generatePairData(data: MarketData[]): number[] {
    // Generate synthetic correlated asset (in practice, use real pair data)
    return data.map((d, i) => {
      const basePrice = d.close;
      const correlation = 0.8;
      const idiosyncraticNoise = (Math.random() - 0.5) * basePrice * 0.02;
      return basePrice * correlation + idiosyncraticNoise + (basePrice * 0.1 * Math.sin(i / 50));
    });
  }

  private calculateHedgeRatio(asset1: number[], asset2: number[]): number {
    const n = asset1.length;
    const sumX = asset2.reduce((sum, x) => sum + x, 0);
    const sumY = asset1.reduce((sum, y) => sum + y, 0);
    const sumXY = asset1.reduce((sum, y, i) => sum + y * asset2[i], 0);
    const sumX2 = asset2.reduce((sum, x) => sum + x * x, 0);
    
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return 1;
    
    return (n * sumXY - sumX * sumY) / denominator;
  }

  private testCointegration(asset1: number[], asset2: number[]): number {
    // Simplified Engle-Granger cointegration test
    const hedgeRatio = this.calculateHedgeRatio(asset1, asset2);
    const residuals = asset1.map((price, i) => price - hedgeRatio * asset2[i]);
    
    // ADF test on residuals (simplified)
    const laggedResiduals = residuals.slice(0, -1);
    const deltaResiduals = residuals.slice(1).map((r, i) => r - residuals[i]);
    
    const { slope } = this.linearRegression(laggedResiduals, deltaResiduals);
    
    // Convert to approximate p-value (simplified)
    const testStat = Math.abs(slope) * Math.sqrt(residuals.length);
    return Math.max(0.01, 1 / (1 + testStat * 2));
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
      sharpeRatio: this.calculateSharpeRatio(totalReturn, trades),
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

  private calculateSharpeRatio(totalReturn: number, trades: number): number {
    if (trades === 0) return 0;
    const avgReturn = totalReturn / trades;
    return avgReturn * Math.sqrt(252);
  }
}
