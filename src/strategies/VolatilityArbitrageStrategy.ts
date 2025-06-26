
import { StrategyConfig, StrategyResult, StrategySignal, MarketData } from '@/types/strategy';

export class VolatilityArbitrageStrategy {
  private config: StrategyConfig;

  constructor(config: StrategyConfig) {
    this.config = config;
  }

  calculate(marketData: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      historicalVolatility: [],
      impliedVolatility: [],
      volatilitySpread: [],
      bollinger: []
    };

    const period = this.config.parameters?.period || 20;
    const threshold = this.config.parameters?.threshold || 0.5;
    
    for (let i = period; i < marketData.length; i++) {
      const historicalVol = this.calculateHistoricalVolatility(marketData, i, period);
      const impliedVol = this.calculateImpliedVolatility(marketData, i, period);
      const volSpread = impliedVol - historicalVol;
      const bollinger = this.calculateBollingerBands(marketData, i, period);
      
      indicators.historicalVolatility.push(historicalVol);
      indicators.impliedVolatility.push(impliedVol);
      indicators.volatilitySpread.push(volSpread);
      indicators.bollinger.push(bollinger.position);

      // Volatility arbitrage signals
      if (volSpread > threshold && bollinger.position < -0.8) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'BUY',
          strength: Math.min(Math.abs(volSpread) / threshold, 1),
          price: marketData[i].close,
          confidence: Math.min(Math.abs(volSpread) / threshold, 1),
          reason: `Low volatility opportunity (Spread: ${volSpread.toFixed(3)})`
        });
      } else if (volSpread < -threshold && bollinger.position > 0.8) {
        signals.push({
          timestamp: marketData[i].timestamp,
          type: 'SELL',
          strength: Math.min(Math.abs(volSpread) / threshold, 1),
          price: marketData[i].close,
          confidence: Math.min(Math.abs(volSpread) / threshold, 1),
          reason: `High volatility opportunity (Spread: ${volSpread.toFixed(3)})`
        });
      }
    }

    return {
      signals,
      indicators,
      performance: this.calculateBasicPerformance(signals, marketData),
      metadata: {
        strategyName: 'Volatility Arbitrage Strategy',
        parameters: this.config.parameters,
        executionTime: Date.now()
      }
    };
  }

  private calculateHistoricalVolatility(data: MarketData[], index: number, period: number): number {
    if (index < period) return 0;
    
    const returns = [];
    for (let i = index - period + 1; i <= index; i++) {
      const returnRate = Math.log(data[i].close / data[i - 1].close);
      returns.push(returnRate);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateImpliedVolatility(data: MarketData[], index: number, period: number): number {
    // Simplified implied volatility calculation
    const historicalVol = this.calculateHistoricalVolatility(data, index, period);
    const recentVolatility = this.calculateHistoricalVolatility(data, index, Math.min(period / 2, 10));
    
    // Market stress factor based on price movements
    const priceChange = Math.abs((data[index].close - data[index - 1].close) / data[index - 1].close);
    const stressFactor = 1 + (priceChange * 10);
    
    return historicalVol * stressFactor * (0.8 + Math.random() * 0.4); // Add some randomness
  }

  private calculateBollingerBands(data: MarketData[], index: number, period: number) {
    if (index < period) return { upper: 0, lower: 0, middle: 0, position: 0 };
    
    const prices = data.slice(index - period + 1, index + 1).map(d => d.close);
    const middle = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    const upper = middle + (2 * stdDev);
    const lower = middle - (2 * stdDev);
    const currentPrice = data[index].close;
    
    // Position within bands (-1 to 1)
    const position = (currentPrice - middle) / (stdDev * 2);
    
    return { upper, lower, middle, position };
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
