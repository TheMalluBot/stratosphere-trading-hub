
import { StrategyConfig, StrategyResult, StrategySignal, MarketData } from '@/types/strategy';

export class LinearRegressionStrategy {
  private config: StrategyConfig;

  constructor(config: StrategyConfig) {
    this.config = config;
  }

  calculate(marketData: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      linearRegression: [],
      trend: [],
      rSquared: []
    };

    const lookbackPeriod = this.config.parameters?.lookbackPeriod || 20;
    
    for (let i = lookbackPeriod; i < marketData.length; i++) {
      const dataSlice = marketData.slice(i - lookbackPeriod, i);
      const regression = this.calculateLinearRegression(dataSlice);
      
      indicators.linearRegression.push(regression.slope);
      indicators.trend.push(regression.trend);
      indicators.rSquared.push(regression.rSquared);

      // Generate signals based on linear regression
      if (regression.trend > 0.5 && regression.rSquared > 0.7) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'BUY',
          price: marketData[i].close,
          confidence: regression.rSquared,
          reason: `Strong upward trend detected (R²: ${regression.rSquared.toFixed(3)})`
        });
      } else if (regression.trend < -0.5 && regression.rSquared > 0.7) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'SELL',
          price: marketData[i].close,
          confidence: regression.rSquared,
          reason: `Strong downward trend detected (R²: ${regression.rSquared.toFixed(3)})`
        });
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculateBasicPerformance(signals, marketData),
      metadata: {
        strategyName: 'Linear Regression Strategy',
        parameters: this.config.parameters,
        executionTime: Date.now()
      }
    };
  }

  private calculateLinearRegression(data: MarketData[]) {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.close);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return {
      slope,
      intercept,
      rSquared,
      trend: slope > 0 ? 1 : slope < 0 ? -1 : 0
    };
  }

  private calculateBasicPerformance(signals: StrategySignal[], marketData: MarketData[]) {
    let totalReturn = 0;
    let wins = 0;
    let losses = 0;

    for (let i = 0; i < signals.length - 1; i += 2) {
      const entry = signals[i];
      const exit = signals[i + 1];
      
      if (entry && exit) {
        const returnPct = entry.type === 'BUY' 
          ? (exit.price - entry.price) / entry.price
          : (entry.price - exit.price) / entry.price;
        
        totalReturn += returnPct;
        if (returnPct > 0) wins++; else losses++;
      }
    }

    return {
      totalReturn: totalReturn * 100,
      winRate: wins / (wins + losses) * 100,
      totalTrades: signals.length,
      sharpeRatio: totalReturn / Math.sqrt(0.16) // Simplified calculation
    };
  }
}
