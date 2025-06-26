
import { StrategyConfig, StrategyResult, StrategySignal, MarketData } from '@/types/strategy';

export class UltimateStrategy {
  private config: StrategyConfig;

  constructor(config: StrategyConfig) {
    this.config = config;
  }

  calculate(marketData: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      rsi: [],
      macd: [],
      ema20: [],
      ema50: [],
      volume: [],
      volatility: []
    };

    const rsiPeriod = 14;
    const emaShort = 20;
    const emaLong = 50;
    
    // Calculate indicators
    for (let i = Math.max(rsiPeriod, emaLong); i < marketData.length; i++) {
      const rsi = this.calculateRSI(marketData, i, rsiPeriod);
      const ema20 = this.calculateEMA(marketData, i, emaShort);
      const ema50 = this.calculateEMA(marketData, i, emaLong);
      const macd = this.calculateMACD(marketData, i);
      const volatility = this.calculateVolatility(marketData, i, 20);
      
      indicators.rsi.push(rsi);
      indicators.ema20.push(ema20);
      indicators.ema50.push(ema50);
      indicators.macd.push(macd);
      indicators.volume.push(marketData[i].volume);
      indicators.volatility.push(volatility);

      // Multi-condition signal generation
      const bullishConditions = [
        rsi < 30, // Oversold
        ema20 > ema50, // Short-term trend up
        macd > 0, // MACD positive
        marketData[i].volume > this.getAverageVolume(marketData, i, 10) // Above average volume
      ];

      const bearishConditions = [
        rsi > 70, // Overbought
        ema20 < ema50, // Short-term trend down
        macd < 0, // MACD negative
        volatility > this.getAverageVolatility(marketData, i, 10) // High volatility
      ];

      const bullishScore = bullishConditions.filter(Boolean).length / bullishConditions.length;
      const bearishScore = bearishConditions.filter(Boolean).length / bearishConditions.length;

      if (bullishScore >= 0.75) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'BUY',
          price: marketData[i].close,
          confidence: bullishScore,
          reason: `Strong bullish signal (Score: ${bullishScore.toFixed(2)})`
        });
      } else if (bearishScore >= 0.75) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'SELL',
          price: marketData[i].close,
          confidence: bearishScore,
          reason: `Strong bearish signal (Score: ${bearishScore.toFixed(2)})`
        });
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculateBasicPerformance(signals, marketData),
      metadata: {
        strategyName: 'Ultimate Combined Strategy',
        parameters: this.config.parameters,
        executionTime: Date.now()
      }
    };
  }

  private calculateRSI(data: MarketData[], index: number, period: number): number {
    if (index < period) return 50;
    
    const changes = [];
    for (let i = index - period + 1; i <= index; i++) {
      changes.push(data[i].close - data[i - 1].close);
    }
    
    const gains = changes.filter(change => change > 0);
    const losses = changes.filter(change => change < 0).map(loss => Math.abs(loss));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(data: MarketData[], index: number, period: number): number {
    if (index === 0) return data[0].close;
    
    const multiplier = 2 / (period + 1);
    const prevEMA = index === 1 ? data[0].close : this.calculateEMA(data, index - 1, period);
    
    return (data[index].close * multiplier) + (prevEMA * (1 - multiplier));
  }

  private calculateMACD(data: MarketData[], index: number): number {
    const ema12 = this.calculateEMA(data, index, 12);
    const ema26 = this.calculateEMA(data, index, 26);
    return ema12 - ema26;
  }

  private calculateVolatility(data: MarketData[], index: number, period: number): number {
    if (index < period) return 0;
    
    const returns = [];
    for (let i = index - period + 1; i <= index; i++) {
      const returnRate = (data[i].close - data[i - 1].close) / data[i - 1].close;
      returns.push(returnRate);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private getAverageVolume(data: MarketData[], index: number, period: number): number {
    const start = Math.max(0, index - period);
    const volumes = data.slice(start, index + 1).map(d => d.volume);
    return volumes.reduce((a, b) => a + b, 0) / volumes.length;
  }

  private getAverageVolatility(data: MarketData[], index: number, period: number): number {
    let totalVolatility = 0;
    for (let i = Math.max(period, index - period); i <= index; i++) {
      totalVolatility += this.calculateVolatility(data, i, 10);
    }
    return totalVolatility / Math.min(period, index + 1);
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
      sharpeRatio: totalReturn / Math.sqrt(0.16)
    };
  }
}
