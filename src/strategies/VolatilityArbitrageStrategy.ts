
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class VolatilityArbitrageStrategy {
  private config: StrategyConfig;
  private lookbackPeriod: number;
  private volThreshold: number;
  private sigmaThreshold: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.lookbackPeriod = config.parameters?.lookbackPeriod || 30;
    this.volThreshold = config.parameters?.volThreshold || 0.05;
    this.sigmaThreshold = config.parameters?.sigmaThreshold || 2.0;
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      realizedVol: [],
      impliedVol: [],
      volSpread: [],
      volRatio: [],
      garchVol: []
    };

    for (let i = this.lookbackPeriod; i < data.length; i++) {
      const window = data.slice(i - this.lookbackPeriod, i);
      const returns = this.calculateReturns(window.map(d => d.close));
      
      // Calculate realized volatility
      const realizedVol = this.calculateRealizedVolatility(returns);
      
      // Simulate implied volatility (in practice, get from options data)
      const impliedVol = this.simulateImpliedVolatility(realizedVol, data[i]);
      
      // GARCH volatility forecasting
      const garchVol = this.calculateGARCHVolatility(returns);
      
      const volSpread = impliedVol - realizedVol;
      const volRatio = realizedVol > 0 ? impliedVol / realizedVol : 1;
      
      indicators.realizedVol.push(realizedVol);
      indicators.impliedVol.push(impliedVol);
      indicators.volSpread.push(volSpread);
      indicators.volRatio.push(volRatio);
      indicators.garchVol.push(garchVol);
      
      // Generate volatility arbitrage signals
      const volSigma = this.calculateVolatilityZScore(volSpread, indicators.volSpread);
      
      if (Math.abs(volSigma) > this.sigmaThreshold && Math.abs(volSpread) > this.volThreshold) {
        const signal: StrategySignal = {
          timestamp: data[i].timestamp,
          type: volSpread > 0 ? 'SELL' : 'BUY', // Sell if implied > realized
          strength: Math.min(Math.abs(volSigma) / this.sigmaThreshold, 1.0),
          price: data[i].close,
          metadata: {
            realizedVol,
            impliedVol,
            volSpread,
            volRatio,
            garchVol,
            volSigma,
            expectedReversion: this.calculateVolReversionTarget(indicators.volSpread)
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

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i-1]));
    }
    return returns;
  }

  private calculateRealizedVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized
  }

  private simulateImpliedVolatility(realizedVol: number, currentData: MarketData): number {
    // Simulate implied volatility with mean reversion and volatility clustering
    const volOfVol = 0.3;
    const meanReversionSpeed = 0.5;
    const longTermVol = 0.2;
    
    const noise = (Math.random() - 0.5) * volOfVol;
    const meanReversion = meanReversionSpeed * (longTermVol - realizedVol);
    
    return Math.max(0.05, realizedVol + meanReversion + noise);
  }

  private calculateGARCHVolatility(returns: number[]): number {
    // Simplified GARCH(1,1) model
    if (returns.length < 3) return 0;
    
    const omega = 0.000001; // Long-term variance
    const alpha = 0.1; // ARCH coefficient
    const beta = 0.85; // GARCH coefficient
    
    let variance = returns.reduce((sum, r) => sum + r * r, 0) / returns.length;
    
    for (let i = 1; i < returns.length; i++) {
      const lagged_return_sq = returns[i-1] * returns[i-1];
      variance = omega + alpha * lagged_return_sq + beta * variance;
    }
    
    return Math.sqrt(variance * 252); // Annualized
  }

  private calculateVolatilityZScore(currentSpread: number, spreadHistory: number[]): number {
    if (spreadHistory.length < 10) return 0;
    
    const recentHistory = spreadHistory.slice(-30);
    const mean = recentHistory.reduce((sum, s) => sum + s, 0) / recentHistory.length;
    const std = Math.sqrt(
      recentHistory.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / recentHistory.length
    );
    
    return std > 0 ? (currentSpread - mean) / std : 0;
  }

  private calculateVolReversionTarget(spreadHistory: number[]): number {
    if (spreadHistory.length < 10) return 0;
    
    const recentHistory = spreadHistory.slice(-60);
    return recentHistory.reduce((sum, s) => sum + s, 0) / recentHistory.length;
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
