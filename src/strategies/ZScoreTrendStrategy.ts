
import { BaseStrategy, StrategyConfig, StrategyResult, StrategySignal, MarketData } from '@/types/strategy';

export class ZScoreTrendStrategy extends BaseStrategy {
  getDefaultConfig(): Partial<StrategyConfig> {
    return {
      name: 'Z-Score Trend Strategy',
      description: 'Mean reversion using Z-Score analysis',
      parameters: { period: 20, threshold: 2 },
      enabled: true
    };
  }

  calculate(marketData: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      zScore: [],
      movingAverage: [],
      standardDeviation: []
    };

    const period = this.config.parameters?.period || 20;
    const threshold = this.config.parameters?.threshold || 2;
    
    for (let i = period; i < marketData.length; i++) {
      const dataSlice = marketData.slice(i - period, i);
      const prices = dataSlice.map(d => d.close);
      
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      
      const currentPrice = marketData[i].close;
      const zScore = stdDev > 0 ? (currentPrice - mean) / stdDev : 0;
      
      indicators.zScore.push(zScore);
      indicators.movingAverage.push(mean);
      indicators.standardDeviation.push(stdDev);

      // Generate signals based on Z-Score thresholds
      if (zScore > threshold) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'SELL',
          strength: Math.min(Math.abs(zScore) / threshold, 1),
          price: currentPrice,
          confidence: Math.min(Math.abs(zScore) / threshold, 1),
          reason: `Overbought condition (Z-Score: ${zScore.toFixed(2)})`
        });
      } else if (zScore < -threshold) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'BUY',
          strength: Math.min(Math.abs(zScore) / threshold, 1),
          price: currentPrice,
          confidence: Math.min(Math.abs(zScore) / threshold, 1),
          reason: `Oversold condition (Z-Score: ${zScore.toFixed(2)})`
        });
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculateBasicPerformance(signals, marketData),
      metadata: {
        strategyName: 'Z-Score Trend Strategy',
        parameters: this.config.parameters,
        executionTime: Date.now()
      }
    };
  }

  private calculateBasicPerformance(signals: StrategySignal[], marketData: MarketData[]) {
    let totalReturn = 0;
    let wins = 0;
    let losses = 0;
    let maxDrawdown = 0;
    let peak = 1;
    let equity = 1;

    for (let i = 0; i < signals.length - 1; i += 2) {
      const entry = signals[i];
      const exit = signals[i + 1];
      
      if (entry && exit) {
        const returnPct = entry.type === 'BUY' 
          ? (exit.price - entry.price) / entry.price
          : (entry.price - exit.price) / entry.price;
        
        totalReturn += returnPct;
        equity *= (1 + returnPct);
        
        if (equity > peak) peak = equity;
        const drawdown = (peak - equity) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        
        if (returnPct > 0) wins++; else losses++;
      }
    }

    return {
      totalReturn: totalReturn * 100,
      winRate: wins / (wins + losses || 1) * 100,
      totalTrades: signals.length,
      sharpeRatio: totalReturn / Math.sqrt(0.16),
      maxDrawdown: maxDrawdown * 100
    };
  }
}
