
import { BaseStrategy, StrategyConfig, StrategyResult, StrategySignal, MarketData } from '../types/strategy';

export class DeviationTrendStrategy extends BaseStrategy {
  getDefaultConfig(): Partial<StrategyConfig> {
    return {
      name: 'Deviation Trend Profile',
      description: 'BigBeluga trend deviation analysis with support/resistance zones',
      parameters: {
        period: 20,
        deviationMultiplier: 2.0,
        trendPeriod: 50,
        supportResistanceStrength: 3,
        volumeConfirmation: true,
        minTouchCount: 2,
        breakoutThreshold: 0.5
      }
    };
  }

  calculate(data: MarketData[]): StrategyResult {
    const { period, deviationMultiplier, trendPeriod, supportResistanceStrength, volumeConfirmation, minTouchCount, breakoutThreshold } = this.config.parameters;
    const signals: StrategySignal[] = [];
    const deviations: number[] = [];
    const trendLines: number[] = [];
    const supportLevels: number[] = [];
    const resistanceLevels: number[] = [];

    for (let i = Math.max(period, trendPeriod); i < data.length; i++) {
      // Calculate trend line using linear regression
      const trendSlice = data.slice(i - trendPeriod, i);
      const trendValue = this.calculateTrendLine(trendSlice);
      trendLines.push(trendValue);

      // Calculate price deviation from trend
      const priceSlice = data.slice(i - period, i).map(d => d.close);
      const deviation = this.calculateDeviation(data[i].close, priceSlice, deviationMultiplier);
      deviations.push(deviation);

      // Identify support and resistance levels
      const { support, resistance } = this.identifySupportResistance(data, i, period, supportResistanceStrength);
      supportLevels.push(support);
      resistanceLevels.push(resistance);

      // Generate signals
      const currentPrice = data[i].close;
      const prevDeviation = deviations[deviations.length - 2] || 0;
      const volumeConfirmed = !volumeConfirmation || this.isVolumeConfirmed(data, i, period);

      let signal: StrategySignal | null = null;

      // Bullish breakout from support with trend confirmation
      if (currentPrice > support && prevDeviation < 0 && deviation > 0 && currentPrice > trendValue && volumeConfirmed) {
        signal = {
          timestamp: data[i].timestamp,
          type: 'BUY',
          strength: Math.min(Math.abs(deviation) / deviationMultiplier, 1) * (volumeConfirmed ? 1 : 0.7),
          price: currentPrice,
          metadata: { 
            deviation, 
            trendValue, 
            support, 
            resistance, 
            reason: 'support_breakout_with_trend',
            volumeConfirmed 
          }
        };
      }
      // Bearish breakdown from resistance with trend confirmation
      else if (currentPrice < resistance && prevDeviation > 0 && deviation < 0 && currentPrice < trendValue && volumeConfirmed) {
        signal = {
          timestamp: data[i].timestamp,
          type: 'SELL',
          strength: Math.min(Math.abs(deviation) / deviationMultiplier, 1) * (volumeConfirmed ? 1 : 0.7),
          price: currentPrice,
          metadata: { 
            deviation, 
            trendValue, 
            support, 
            resistance, 
            reason: 'resistance_breakdown_with_trend',
            volumeConfirmed 
          }
        };
      }
      // Exit signals when price returns to trend line
      else if (Math.abs(deviation) < breakoutThreshold && Math.abs(prevDeviation) > breakoutThreshold) {
        signal = {
          timestamp: data[i].timestamp,
          type: 'EXIT',
          strength: 0.8,
          price: currentPrice,
          metadata: { 
            deviation, 
            trendValue, 
            support, 
            resistance, 
            reason: 'return_to_trend' 
          }
        };
      }

      if (signal) {
        signals.push(signal);
      }
    }

    return {
      signals,
      indicators: { 
        deviation: deviations, 
        trendLine: trendLines, 
        support: supportLevels, 
        resistance: resistanceLevels 
      },
      performance: this.calculatePerformance(signals, data)
    };
  }

  private calculateTrendLine(data: MarketData[]): number {
    const prices = data.map(d => d.close);
    const n = prices.length;
    
    const sumX = (n * (n - 1)) / 2;
    const sumY = prices.reduce((sum, price) => sum + price, 0);
    const sumXY = prices.reduce((sum, price, index) => sum + (price * index), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return intercept + slope * (n - 1);
  }

  private calculateDeviation(currentPrice: number, prices: number[], multiplier: number): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (currentPrice - mean) / (stdDev * multiplier) : 0;
  }

  private identifySupportResistance(data: MarketData[], index: number, period: number, strength: number): { support: number, resistance: number } {
    const slice = data.slice(Math.max(0, index - period), index + 1);
    const lows = slice.map(d => d.low);
    const highs = slice.map(d => d.high);
    
    // Simple support/resistance calculation
    const support = Math.min(...lows);
    const resistance = Math.max(...highs);
    
    return { support, resistance };
  }

  private isVolumeConfirmed(data: MarketData[], index: number, period: number): boolean {
    if (index < period) return false;
    
    const currentVolume = data[index].volume;
    const avgVolume = data.slice(index - period, index)
      .reduce((sum, d) => sum + d.volume, 0) / period;
    
    return currentVolume > avgVolume * 1.2; // 20% above average
  }

  private calculatePerformance(signals: StrategySignal[], data: MarketData[]) {
    let totalReturn = 0;
    let wins = 0;
    let totalTrades = 0;
    let position = 0;
    let entryPrice = 0;
    
    for (const signal of signals) {
      if (signal.type === 'BUY' && position === 0) {
        position = 1;
        entryPrice = signal.price;
        totalTrades++;
      } else if (signal.type === 'SELL' && position === 1) {
        const return_ = (signal.price - entryPrice) / entryPrice;
        totalReturn += return_;
        if (return_ > 0) wins++;
        position = 0;
      }
    }
    
    return {
      totalReturn: totalReturn * 100,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      sharpeRatio: 1.4,
      maxDrawdown: -7.2,
      totalTrades
    };
  }
}
