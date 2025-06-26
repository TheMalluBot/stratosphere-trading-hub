
import { MarketData, StrategyResult, StrategySignal, StrategyConfig } from '@/types/strategy';

export class MLMomentumStrategy {
  private config: StrategyConfig;
  private featureWindow: number;
  private predictionHorizon: number;
  private confidenceThreshold: number;
  private modelWeights: Record<string, number>;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.featureWindow = config.parameters?.featureWindow || 20;
    this.predictionHorizon = config.parameters?.predictionHorizon || 5;
    this.confidenceThreshold = config.parameters?.confidenceThreshold || 0.6;
    
    // Pre-trained model weights (in practice, these would be learned)
    this.modelWeights = {
      momentum_short: 0.25,
      momentum_long: 0.15,
      rsi_normalized: -0.02,
      volatility: -0.1,
      volume_ratio: 0.08,
      trend_strength: 0.3,
      market_regime: 0.15,
      mean_reversion: -0.12,
      skewness: 0.05,
      kurtosis: -0.03
    };
  }

  calculate(data: MarketData[]): StrategyResult {
    const signals: StrategySignal[] = [];
    const indicators: Record<string, number[]> = {
      mlPrediction: [],
      confidence: [],
      momentumScore: [],
      regimeScore: [],
      featureImportance: []
    };

    // Extract features for ML model
    const features = this.extractFeatures(data);
    
    for (let i = this.featureWindow; i < data.length - this.predictionHorizon; i++) {
      const currentFeatures = features[i - this.featureWindow];
      if (!currentFeatures) continue;
      
      // ML prediction using ensemble of techniques
      const prediction = this.ensemblePrediction(currentFeatures);
      const confidence = this.calculatePredictionConfidence(currentFeatures, i, data);
      
      // Technical momentum and regime analysis
      const momentumScore = this.calculateMomentumScore(data, i);
      const regimeScore = this.detectMarketRegime(data, i);
      const featureImportance = this.calculateFeatureImportance(currentFeatures);
      
      indicators.mlPrediction.push(prediction);
      indicators.confidence.push(confidence);
      indicators.momentumScore.push(momentumScore);
      indicators.regimeScore.push(regimeScore);
      indicators.featureImportance.push(featureImportance);
      
      // Generate signals based on ML prediction, confidence, and regime
      if (confidence > this.confidenceThreshold && Math.abs(prediction) > 0.3) {
        const signal: StrategySignal = {
          timestamp: data[i].timestamp,
          type: prediction > 0 ? 'BUY' : 'SELL',
          strength: confidence,
          price: data[i].close,
          metadata: {
            mlPrediction: prediction,
            confidence,
            momentumScore,
            regimeScore,
            featureImportance,
            features: currentFeatures,
            expectedReturn: prediction * data[i].close * 0.01
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

  private extractFeatures(data: MarketData[]): Array<Record<string, number>> {
    const features: Array<Record<string, number>> = [];
    
    for (let i = this.featureWindow; i < data.length; i++) {
      const window = data.slice(i - this.featureWindow, i);
      const prices = window.map(d => d.close);
      const volumes = window.map(d => d.volume);
      const highs = window.map(d => d.high);
      const lows = window.map(d => d.low);
      const returns = this.calculateReturns(prices);
      
      // Price-based features
      const momentum5 = this.calculateMomentum(prices, 5);
      const momentum20 = this.calculateMomentum(prices, Math.min(20, prices.length));
      const rsi = this.calculateRSI(prices, 14);
      const volatility = this.calculateVolatility(returns);
      
      // Volume-based features
      const volumeRatio = volumes.length > 1 ? 
        volumes[volumes.length - 1] / (volumes.reduce((sum, v) => sum + v, 0) / volumes.length) : 1;
      const volumeTrend = this.calculateVolumeTrend(volumes);
      
      // Market microstructure features
      const bidAskSpread = this.estimateBidAskSpread(highs, lows, prices);
      const priceRange = (highs[highs.length - 1] - lows[lows.length - 1]) / prices[prices.length - 1];
      
      // Statistical features
      const skewness = this.calculateSkewness(returns);
      const kurtosis = this.calculateKurtosis(returns);
      const autocorrelation = this.calculateAutocorrelation(returns, 1);
      
      // Regime and trend features
      const trendStrength = this.calculateTrendStrength(prices);
      const meanReversion = this.calculateMeanReversionIndicator(prices);
      
      features.push({
        momentum_short: momentum5,
        momentum_long: momentum20,
        rsi_normalized: (rsi - 50) / 50, // Normalize RSI to [-1, 1]
        volatility: volatility,
        volume_ratio: Math.log(volumeRatio), // Log transform for stability
        volume_trend: volumeTrend,
        bid_ask_spread: bidAskSpread,
        price_range: priceRange,
        skewness: skewness,
        kurtosis: kurtosis,
        autocorrelation: autocorrelation,
        trend_strength: trendStrength,
        mean_reversion: meanReversion
      });
    }
    
    return features;
  }

  private ensemblePrediction(features: Record<string, number>): number {
    // Linear model prediction
    let linearPred = 0;
    for (const [feature, value] of Object.entries(features)) {
      if (this.modelWeights[feature]) {
        linearPred += this.modelWeights[feature] * value;
      }
    }
    
    // Non-linear adjustments
    const momentumBoost = Math.tanh(features.momentum_short * 2) * 0.1;
    const volatilityPenalty = -Math.min(features.volatility * 2, 0.2);
    const regimeAdjustment = features.trend_strength * 0.15;
    
    const finalPrediction = linearPred + momentumBoost + volatilityPenalty + regimeAdjustment;
    
    // Apply sigmoid activation and scale
    return 2 / (1 + Math.exp(-finalPrediction * 2)) - 1;
  }

  private calculatePredictionConfidence(features: Record<string, number>, index: number, data: MarketData[]): number {
    // Base confidence from feature stability
    const volatility = Math.abs(features.volatility || 0);
    const trendConsistency = Math.abs(features.trend_strength || 0);
    const volumeStability = Math.min(Math.abs(features.volume_ratio || 0), 2) / 2;
    
    // Market condition adjustments
    const recentVolatility = this.calculateRecentVolatility(data, index, 5);
    const marketStress = recentVolatility > 0.03 ? 0.8 : 1.0; // Reduce confidence in high vol
    
    const baseConfidence = 0.5;
    const volatilityPenalty = Math.min(volatility * 3, 0.3);
    const trendBonus = trendConsistency * 0.2;
    const volumeBonus = (1 - volumeStability) * 0.1;
    
    const confidence = (baseConfidence - volatilityPenalty + trendBonus + volumeBonus) * marketStress;
    
    return Math.max(0.1, Math.min(confidence, 0.95));
  }

  private calculateMomentum(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0;
    const current = prices[prices.length - 1];
    const past = prices[prices.length - 1 - period];
    return (current - past) / past;
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
    
    const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / period : 0;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
  }

  private calculateReturns(prices: number[]): number[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  private calculateVolumeTrend(volumes: number[]): number {
    if (volumes.length < 5) return 0;
    const recent = volumes.slice(-5);
    const older = volumes.slice(-10, -5);
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  private estimateBidAskSpread(highs: number[], lows: number[], prices: number[]): number {
    // Simple bid-ask spread estimation using high-low range
    const lastIndex = prices.length - 1;
    const range = highs[lastIndex] - lows[lastIndex];
    return range / prices[lastIndex];
  }

  private calculateSkewness(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);
    
    if (std === 0) return 0;
    
    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 3), 0) / returns.length;
    return skewness;
  }

  private calculateKurtosis(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);
    
    if (std === 0) return 0;
    
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 4), 0) / returns.length;
    return kurtosis - 3; // Excess kurtosis
  }

  private calculateAutocorrelation(returns: number[], lag: number): number {
    if (returns.length <= lag) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    let numerator = 0;
    let denominator = 0;
    
    for (let i = lag; i < returns.length; i++) {
      numerator += (returns[i] - mean) * (returns[i - lag] - mean);
    }
    
    for (let i = 0; i < returns.length; i++) {
      denominator += Math.pow(returns[i] - mean, 2);
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateTrendStrength(prices: number[]): number {
    if (prices.length < 3) return 0;
    
    const returns = this.calculateReturns(prices);
    const positiveReturns = returns.filter(r => r > 0).length;
    const trendRatio = positiveReturns / returns.length;
    
    // Adjust for magnitude
    const avgPositiveReturn = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0) / positiveReturns || 0;
    const avgNegativeReturn = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0) / (returns.length - positiveReturns)) || 0;
    
    const magnitudeRatio = (avgPositiveReturn + avgNegativeReturn) > 0 ? 
      avgPositiveReturn / (avgPositiveReturn + avgNegativeReturn) : 0.5;
    
    return (trendRatio * 0.6 + magnitudeRatio * 0.4) * 2 - 1; // Scale to [-1, 1]
  }

  private calculateMeanReversionIndicator(prices: number[]): number {
    if (prices.length < 10) return 0;
    
    const returns = this.calculateReturns(prices);
    const autocorr = this.calculateAutocorrelation(returns, 1);
    
    // Negative autocorrelation indicates mean reversion
    return -autocorr;
  }

  private calculateMomentumScore(data: MarketData[], index: number): number {
    const shortPeriod = 5;
    const longPeriod = 20;
    
    if (index < longPeriod) return 0;
    
    const shortWindow = data.slice(index - shortPeriod, index);
    const longWindow = data.slice(index - longPeriod, index);
    
    const shortReturn = (shortWindow[shortWindow.length - 1].close - shortWindow[0].close) / shortWindow[0].close;
    const longReturn = (longWindow[longWindow.length - 1].close - longWindow[0].close) / longWindow[0].close;
    
    return (shortReturn - longReturn) * 100;
  }

  private detectMarketRegime(data: MarketData[], index: number): number {
    if (index < 20) return 0;
    
    const window = data.slice(index - 20, index);
    const prices = window.map(d => d.close);
    const returns = this.calculateReturns(prices);
    
    const volatility = this.calculateVolatility(returns);
    const autocorrelation = this.calculateAutocorrelation(returns, 1);
    const trendStrength = this.calculateTrendStrength(prices);
    
    // Combine indicators for regime detection
    const regimeScore = (autocorrelation * 0.4 + trendStrength * 0.4 - volatility * 0.2);
    return Math.tanh(regimeScore * 3); // Scale to [-1, 1]
  }

  private calculateFeatureImportance(features: Record<string, number>): number {
    // Calculate aggregate feature importance score
    let importance = 0;
    let totalWeight = 0;
    
    for (const [feature, value] of Object.entries(features)) {
      if (this.modelWeights[feature]) {
        importance += Math.abs(this.modelWeights[feature] * value);
        totalWeight += Math.abs(this.modelWeights[feature]);
      }
    }
    
    return totalWeight > 0 ? importance / totalWeight : 0;
  }

  private calculateRecentVolatility(data: MarketData[], index: number, period: number): number {
    if (index < period) return 0;
    
    const window = data.slice(index - period, index);
    const prices = window.map(d => d.close);
    const returns = this.calculateReturns(prices);
    
    return this.calculateVolatility(returns);
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
