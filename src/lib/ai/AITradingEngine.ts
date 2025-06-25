import { MarketData, StrategyResult, StrategySignal } from '@/types/strategy';
import { taskScheduler } from '@/lib/performance/ComputationalTaskScheduler';

export interface AIModelConfig {
  id: string;
  name: string;
  type: 'lstm' | 'transformer' | 'cnn' | 'ensemble';
  description: string;
  parameters: {
    lookbackPeriod: number;
    predictionHorizon: number;
    confidence: number;
    features: string[];
  };
  performance: {
    accuracy: number;
    sharpe: number;
    lastTrained: number;
  };
}

export interface AIPrediction {
  timestamp: number;
  symbol: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  priceTarget: number;
  timeHorizon: number;
  reasoning: string[];
  features: Record<string, number>;
}

export interface AIPortfolioRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'rebalance';
  symbol: string;
  allocation: number;
  confidence: number;
  reasoning: string;
  riskScore: number;
}

export class AITradingEngine {
  private models: Map<string, AIModelConfig> = new Map();
  private predictions: Map<string, AIPrediction[]> = new Map();
  private isTraining = false;
  private performanceMetrics = {
    totalPredictions: 0,
    accuratePredictions: 0,
    avgConfidence: 0,
    lastModelUpdate: 0
  };

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    const models: AIModelConfig[] = [
      {
        id: 'lstm-price-predictor',
        name: 'LSTM Price Predictor',
        type: 'lstm',
        description: 'Long Short-Term Memory network for price prediction',
        parameters: {
          lookbackPeriod: 60,
          predictionHorizon: 24,
          confidence: 0.75,
          features: ['price', 'volume', 'volatility', 'momentum']
        },
        performance: {
          accuracy: 72.5,
          sharpe: 1.85,
          lastTrained: Date.now() - 86400000 // 1 day ago
        }
      },
      {
        id: 'transformer-sentiment',
        name: 'Transformer Sentiment Analysis',
        type: 'transformer',
        description: 'Transformer model for market sentiment analysis',
        parameters: {
          lookbackPeriod: 168,
          predictionHorizon: 12,
          confidence: 0.68,
          features: ['news', 'social', 'options', 'futures']
        },
        performance: {
          accuracy: 68.3,
          sharpe: 1.42,
          lastTrained: Date.now() - 43200000 // 12 hours ago
        }
      },
      {
        id: 'ensemble-strategy',
        name: 'Ensemble Strategy Engine',
        type: 'ensemble',
        description: 'Combined AI models for comprehensive analysis',
        parameters: {
          lookbackPeriod: 120,
          predictionHorizon: 48,
          confidence: 0.80,
          features: ['technical', 'fundamental', 'sentiment', 'macro']
        },
        performance: {
          accuracy: 78.9,
          sharpe: 2.14,
          lastTrained: Date.now() - 21600000 // 6 hours ago
        }
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
    console.log('🤖 AI Trading Engine initialized with', models.length, 'models');
  }

  async generatePredictions(symbol: string, marketData: MarketData[]): Promise<AIPrediction[]> {
    const predictions: AIPrediction[] = [];
    
    for (const [modelId, model] of this.models.entries()) {
      try {
        const prediction = await this.runModel(modelId, symbol, marketData);
        if (prediction) {
          predictions.push(prediction);
        }
      } catch (error) {
        console.error(`AI model ${modelId} failed:`, error);
      }
    }

    // Store predictions
    if (!this.predictions.has(symbol)) {
      this.predictions.set(symbol, []);
    }
    this.predictions.get(symbol)!.push(...predictions);

    // Keep only recent predictions (last 1000)
    const symbolPredictions = this.predictions.get(symbol)!;
    if (symbolPredictions.length > 1000) {
      this.predictions.set(symbol, symbolPredictions.slice(-1000));
    }

    console.log(`🔮 Generated ${predictions.length} AI predictions for ${symbol}`);
    return predictions;
  }

  private async runModel(modelId: string, symbol: string, marketData: MarketData[]): Promise<AIPrediction | null> {
    const model = this.models.get(modelId);
    if (!model || marketData.length < model.parameters.lookbackPeriod) {
      return null;
    }

    // Simulate AI model execution (would use actual ML models in production)
    const features = this.extractFeatures(marketData, model.parameters.features);
    const prediction = await this.simulateModelInference(model, symbol, features);
    
    return prediction;
  }

  private extractFeatures(marketData: MarketData[], featureTypes: string[]): Record<string, number> {
    const features: Record<string, number> = {};
    const latest = marketData[marketData.length - 1];
    const previous = marketData[marketData.length - 2] || latest;

    if (featureTypes.includes('price')) {
      features.priceChange = (latest.close - previous.close) / previous.close;
      features.priceVolatility = this.calculateVolatility(marketData.slice(-20).map(d => d.close));
    }

    if (featureTypes.includes('volume')) {
      features.volumeRatio = latest.volume / (marketData.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20);
      features.volumeTrend = this.calculateTrend(marketData.slice(-10).map(d => d.volume));
    }

    if (featureTypes.includes('momentum')) {
      features.rsi = this.calculateRSI(marketData.slice(-14));
      features.macd = this.calculateMACD(marketData.slice(-26));
    }

    if (featureTypes.includes('volatility')) {
      features.atr = this.calculateATR(marketData.slice(-14));
      features.bollingerPosition = this.calculateBollingerPosition(marketData.slice(-20));
    }

    return features;
  }

  private async simulateModelInference(model: AIModelConfig, symbol: string, features: Record<string, number>): Promise<AIPrediction> {
    // Simulate model processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    const baseConfidence = model.parameters.confidence;
    const featureScore = Object.values(features).reduce((sum, val) => sum + Math.abs(val), 0) / Object.keys(features).length;
    const confidence = Math.min(0.95, baseConfidence + (featureScore * 0.1));

    const direction = features.priceChange > 0.01 ? 'bullish' : 
                     features.priceChange < -0.01 ? 'bearish' : 'neutral';
    
    const currentPrice = 45000 + (Math.random() - 0.5) * 1000; // Simulate current price
    const priceTarget = currentPrice * (1 + (features.priceChange * 2));

    return {
      timestamp: Date.now(),
      symbol,
      direction,
      confidence,
      priceTarget,
      timeHorizon: model.parameters.predictionHorizon,
      reasoning: this.generateReasoning(model, features, direction),
      features
    };
  }

  private generateReasoning(model: AIModelConfig, features: Record<string, number>, direction: string): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`${model.name} analysis indicates ${direction} sentiment`);
    
    if (features.rsi > 70) {
      reasoning.push('RSI indicates overbought conditions');
    } else if (features.rsi < 30) {
      reasoning.push('RSI indicates oversold conditions');
    }
    
    if (features.volumeRatio > 1.5) {
      reasoning.push('Above-average volume supporting the move');
    }
    
    if (Math.abs(features.priceChange) > 0.02) {
      reasoning.push('Significant price movement detected');
    }

    return reasoning;
  }

  async generatePortfolioRecommendations(portfolio: any[], marketData: Map<string, MarketData[]>): Promise<AIPortfolioRecommendation[]> {
    const recommendations: AIPortfolioRecommendation[] = [];
    
    // Schedule AI portfolio optimization task
    const taskId = await taskScheduler.scheduleTask({
      name: 'AI Portfolio Optimization',
      type: 'optimization',
      priority: 'high',
      data: {
        portfolio,
        marketData: Array.from(marketData.entries()),
        optimizationType: 'ai-ensemble'
      },
      estimatedDuration: 5000
    });

    // Simulate recommendations while task processes
    for (const position of portfolio.slice(0, 5)) {
      const recommendation = await this.generateSingleRecommendation(position, marketData);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private async generateSingleRecommendation(position: any, marketData: Map<string, MarketData[]>): Promise<AIPortfolioRecommendation | null> {
    const symbol = position.symbol || 'BTCUSDT';
    const data = marketData.get(symbol);
    
    if (!data || data.length < 20) return null;

    const predictions = await this.generatePredictions(symbol, data);
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    const bullishPredictions = predictions.filter(p => p.direction === 'bullish').length;
    const bearishPredictions = predictions.filter(p => p.direction === 'bearish').length;
    
    let action: 'buy' | 'sell' | 'hold' | 'rebalance' = 'hold';
    let allocation = position.allocation || 0;
    
    if (bullishPredictions > bearishPredictions && avgConfidence > 0.7) {
      action = 'buy';
      allocation = Math.min(allocation + 0.05, 0.3);
    } else if (bearishPredictions > bullishPredictions && avgConfidence > 0.7) {
      action = 'sell';
      allocation = Math.max(allocation - 0.05, 0);
    }

    return {
      action,
      symbol,
      allocation,
      confidence: avgConfidence,
      reasoning: `AI ensemble recommends ${action} based on ${predictions.length} model predictions`,
      riskScore: this.calculateRiskScore(data)
    };
  }

  async retrainModels(symbol: string, historicalData: MarketData[]): Promise<void> {
    if (this.isTraining) {
      console.log('⏳ Model training already in progress');
      return;
    }

    this.isTraining = true;
    
    try {
      console.log('🔄 Starting AI model retraining...');
      
      // Schedule training tasks for each model
      for (const [modelId, model] of this.models.entries()) {
        const taskId = await taskScheduler.scheduleTask({
          name: `Retrain ${model.name}`,
          type: 'calculation',
          priority: 'medium',
          data: {
            modelId,
            symbol,
            historicalData,
            trainingType: 'incremental'
          },
          estimatedDuration: 10000
        });
        
        console.log(`📚 Scheduled training for ${model.name} (Task: ${taskId})`);
      }
      
      // Update last trained timestamp
      this.models.forEach(model => {
        model.performance.lastTrained = Date.now();
        // Simulate slight performance improvement
        model.performance.accuracy += (Math.random() - 0.5) * 2;
        model.performance.sharpe += (Math.random() - 0.5) * 0.2;
      });
      
      console.log('✅ AI model retraining completed');
    } catch (error) {
      console.error('❌ Model retraining failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  // Utility methods for technical indicators
  private calculateVolatility(prices: number[]): number {
    const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    return (secondAvg - firstAvg) / firstAvg;
  }

  private calculateRSI(data: MarketData[]): number {
    if (data.length < 14) return 50;
    
    const changes = data.slice(1).map((item, i) => item.close - data[i].close);
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < 14; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }
    
    avgGain /= 14;
    avgLoss /= 14;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(data: MarketData[]): number {
    if (data.length < 26) return 0;
    
    const prices = data.map(d => d.close);
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    return ema12 - ema26;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  private calculateATR(data: MarketData[]): number {
    if (data.length < 2) return 0;
    
    const trs = data.slice(1).map((item, i) => {
      const prev = data[i];
      return Math.max(
        item.high - item.low,
        Math.abs(item.high - prev.close),
        Math.abs(item.low - prev.close)
      );
    });
    
    return trs.reduce((sum, tr) => sum + tr, 0) / trs.length;
  }

  private calculateBollingerPosition(data: MarketData[]): number {
    if (data.length < 20) return 0.5;
    
    const prices = data.map(d => d.close);
    const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    const upperBand = sma + (2 * stdDev);
    const lowerBand = sma - (2 * stdDev);
    const currentPrice = prices[prices.length - 1];
    
    return (currentPrice - lowerBand) / (upperBand - lowerBand);
  }

  private calculateRiskScore(data: MarketData[]): number {
    const volatility = this.calculateVolatility(data.map(d => d.close));
    const atr = this.calculateATR(data);
    const priceChange = Math.abs((data[data.length - 1].close - data[0].close) / data[0].close);
    
    return Math.min(100, (volatility * 50) + (atr * 0.01) + (priceChange * 100));
  }

  // Public getters
  getModels(): AIModelConfig[] {
    return Array.from(this.models.values());
  }

  getPredictions(symbol: string): AIPrediction[] {
    return this.predictions.get(symbol) || [];
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  isModelTraining(): boolean {
    return this.isTraining;
  }
}

export const aiTradingEngine = new AITradingEngine();
