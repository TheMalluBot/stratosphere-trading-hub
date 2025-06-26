
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class RegimeDetectionStrategy {
  private config: StrategyConfig;
  private lookbackPeriod: number;
  private regimeThreshold: number;
  private transitionSensitivity: number;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.lookbackPeriod = config.parameters?.lookbackPeriod || 50;
    this.regimeThreshold = config.parameters?.regimeThreshold || 0.6;
    this.transitionSensitivity = config.parameters?.transitionSensitivity || 0.3;
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      trendingRegime: [],
      meanRevertingRegime: [],
      volatilityRegime: [],
      regimeStrength: [],
      regimeTransition: []
    };

    for (let i = this.lookbackPeriod; i < data.length; i++) {
      const window = data.slice(i - this.lookbackPeriod, i);
      const prices = window.map(d => d.close);
      const volumes = window.map(d => d.volume);
      const returns = this.calculateReturns(prices);
      
      // Detect different market regimes
      const trendingScore = this.calculateTrendingScore(prices, returns);
      const meanRevertingScore = this.calculateMeanRevertingScore(returns);
      const volatilityScore = this.calculateVolatilityScore(returns);
      
      // Regime classification using Hidden Markov Model concepts
      const regimeProbs = this.classifyRegime(trendingScore, meanRevertingScore, volatilityScore);
      
      // Detect regime transitions
      const regimeTransition = this.detectRegimeTransition(indicators, regimeProbs);
      
      const regimeStrength = Math.max(...Object.values(regimeProbs));
      
      indicators.trendingRegime.push(regimeProbs.trending);
      indicators.meanRevertingRegime.push(regimeProbs.meanReverting);
      indicators.volatilityRegime.push(regimeProbs.volatility);
      indicators.regimeStrength.push(regimeStrength);
      indicators.regimeTransition.push(regimeTransition);
      
      // Generate signals based on regime and transitions
      if (regimeStrength > this.regimeThreshold && regimeTransition > this.transitionSensitivity) {
        const dominantRegime = this.getDominantRegime(regimeProbs);
        
        const signal: StrategySignal = {
          timestamp: data[i].timestamp,
          type: this.getSignalFromRegime(dominantRegime, trendingScore),
          strength: regimeStrength,
          price: data[i].close,
          metadata: {
            regime: dominantRegime,
            regimeProbs,
            trendingScore,
            meanRevertingScore,
            volatilityScore,
            regimeTransition,
            adaptiveStrategy: this.getAdaptiveStrategy(dominantRegime)
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
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  private calculateTrendingScore(prices: number[], returns: number[]): number {
    // Multiple trend indicators
    const linearTrend = this.calculateLinearTrend(prices);
    const momentumScore = this.calculateMomentum(prices);
    const trendConsistency = this.calculateTrendConsistency(returns);
    const breakoutScore = this.calculateBreakoutScore(prices);
    
    return (linearTrend + momentumScore + trendConsistency + breakoutScore) / 4;
  }

  private calculateMeanRevertingScore(returns: number[]): number {
    // Mean reversion indicators
    const autocorrelation = this.calculateAutocorrelation(returns, 1);
    const reversalFrequency = this.calculateReversalFrequency(returns);
    const rangeScore = this.calculateRangeScore(returns);
    
    return (-autocorrelation + reversalFrequency + rangeScore) / 3;
  }

  private calculateVolatilityScore(returns: number[]): number {
    // Volatility clustering and regime indicators
    const volatility = this.calculateVolatility(returns);
    const volClustering = this.calculateVolatilityClustering(returns);
    const garchEffect = this.calculateGARCHEffect(returns);
    
    return (volatility + volClustering + garchEffect) / 3;
  }

  private calculateLinearTrend(prices: number[]): number {
    const n = prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = prices;
    
    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = y.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Normalize slope
    const avgPrice = sumY / n;
    return Math.tanh((slope / avgPrice) * n * 10);
  }

  private calculateMomentum(prices: number[]): number {
    const shortPeriod = Math.floor(prices.length / 4);
    const longPeriod = Math.floor(prices.length / 2);
    
    if (prices.length < longPeriod) return 0;
    
    const shortMA = prices.slice(-shortPeriod).reduce((sum, p) => sum + p, 0) / shortPeriod;
    const longMA = prices.slice(-longPeriod).reduce((sum, p) => sum + p, 0) / longPeriod;
    
    return Math.tanh((shortMA - longMA) / longMA * 10);
  }

  private calculateTrendConsistency(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const positiveReturns = returns.filter(r => r > 0).length;
    const consistency = Math.abs(positiveReturns / returns.length - 0.5) * 2;
    
    return consistency;
  }

  private calculateBreakoutScore(prices: number[]): number {
    if (prices.length < 20) return 0;
    
    const recentPrices = prices.slice(-10);
    const historicalPrices = prices.slice(0, -10);
    
    const recentMax = Math.max(...recentPrices);
    const recentMin = Math.min(...recentPrices);
    const historicalMax = Math.max(...historicalPrices);
    const historicalMin = Math.min(...historicalPrices);
    
    const upBreakout = recentMax > historicalMax ? (recentMax - historicalMax) / historicalMax : 0;
    const downBreakout = recentMin < historicalMin ? (historicalMin - recentMin) / historicalMin : 0;
    
    return Math.tanh((upBreakout + downBreakout) * 10);
  }

  private calculateAutocorrelation(returns: number[], lag: number): number {
    if (returns.length <= lag) return 0;
    
    const n = returns.length - lag;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (returns[i] - mean) * (returns[i + lag] - mean);
    }
    
    for (let i = 0; i < returns.length; i++) {
      denominator += Math.pow(returns[i] - mean, 2);
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateReversalFrequency(returns: number[]): number {
    if (returns.length < 3) return 0;
    
    let reversals = 0;
    for (let i = 1; i < returns.length - 1; i++) {
      if ((returns[i-1] > 0 && returns[i] < 0 && returns[i+1] > 0) ||
          (returns[i-1] < 0 && returns[i] > 0 && returns[i+1] < 0)) {
        reversals++;
      }
    }
    
    return reversals / (returns.length - 2);
  }

  private calculateRangeScore(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const maxReturn = Math.max(...returns);
    const minReturn = Math.min(...returns);
    const avgAbsReturn = returns.reduce((sum, r) => sum + Math.abs(r), 0) / returns.length;
    
    return avgAbsReturn > 0 ? (maxReturn - minReturn) / avgAbsReturn : 0;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateVolatilityClustering(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const absReturns = returns.map(r => Math.abs(r));
    return this.calculateAutocorrelation(absReturns, 1);
  }

  private calculateGARCHEffect(returns: number[]): number {
    // Simplified GARCH effect detection
    if (returns.length < 5) return 0;
    
    const squaredReturns = returns.map(r => r * r);
    const autocorr = this.calculateAutocorrelation(squaredReturns, 1);
    
    return Math.max(0, autocorr);
  }

  private classifyRegime(trending: number, meanReverting: number, volatility: number): Record<string, number> {
    // Softmax classification
    const scores = { trending, meanReverting, volatility };
    const maxScore = Math.max(...Object.values(scores));
    const expScores = Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, Math.exp(value - maxScore)])
    );
    const sumExp = Object.values(expScores).reduce((sum, val) => sum + val, 0);
    
    return Object.fromEntries(
      Object.entries(expScores).map(([key, value]) => [key, value / sumExp])
    );
  }

  private detectRegimeTransition(indicators: Record<string, number[]>, currentProbs: Record<string, number>): number {
    if (indicators.trendingRegime.length < 5) return 0;
    
    const historyLength = 5;
    const recentTrending = indicators.trendingRegime.slice(-historyLength);
    const recentMeanReverting = indicators.meanRevertingRegime.slice(-historyLength);
    const recentVolatility = indicators.volatilityRegime.slice(-historyLength);
    
    const avgTrending = recentTrending.reduce((sum, val) => sum + val, 0) / historyLength;
    const avgMeanReverting = recentMeanReverting.reduce((sum, val) => sum + val, 0) / historyLength;
    const avgVolatility = recentVolatility.reduce((sum, val) => sum + val, 0) / historyLength;
    
    const trendingChange = Math.abs(currentProbs.trending - avgTrending);
    const meanRevertingChange = Math.abs(currentProbs.meanReverting - avgMeanReverting);
    const volatilityChange = Math.abs(currentProbs.volatility - avgVolatility);
    
    return Math.max(trendingChange, meanRevertingChange, volatilityChange);
  }

  private getDominantRegime(probs: Record<string, number>): string {
    return Object.entries(probs).reduce((a, b) => probs[a[0]] > probs[b[0]] ? a : b)[0];
  }

  private getSignalFromRegime(regime: string, trendingScore: number): 'BUY' | 'SELL' {
    switch (regime) {
      case 'trending':
        return trendingScore > 0 ? 'BUY' : 'SELL';
      case 'meanReverting':
        return trendingScore > 0 ? 'SELL' : 'BUY'; // Contrarian
      case 'volatility':
        return Math.random() > 0.5 ? 'BUY' : 'SELL'; // Neutral
      default:
        return 'BUY';
    }
  }

  private getAdaptiveStrategy(regime: string): string {
    switch (regime) {
      case 'trending':
        return 'momentum_following';
      case 'meanReverting':
        return 'contrarian_reversion';
      case 'volatility':
        return 'volatility_trading';
      default:
        return 'balanced';
    }
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
