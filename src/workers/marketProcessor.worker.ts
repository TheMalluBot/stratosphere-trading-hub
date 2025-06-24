
export interface MarketProcessorMessage {
  type: 'PROCESS_MARKET_DATA' | 'CALCULATE_INDICATORS' | 'ANALYZE_PATTERNS' | 'CALCULATE_RISK';
  data: any;
  id?: string;
}

export interface ProcessedMarketData {
  vwap: number;
  rsi: number[];
  sma: number[];
  volatility: number;
  patterns: string[];
  momentum: number;
  timestamp: number;
}

class MarketProcessorWorker {
  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(e: MessageEvent<MarketProcessorMessage>) {
    const { type, data, id } = e.data;

    try {
      let result: any;

      switch (type) {
        case 'PROCESS_MARKET_DATA':
          result = this.processMarketData(data);
          break;
        case 'CALCULATE_INDICATORS':
          result = this.calculateIndicators(data);
          break;
        case 'ANALYZE_PATTERNS':
          result = this.analyzePatterns(data);
          break;
        case 'CALCULATE_RISK':
          result = this.calculateRisk(data);
          break;
        default:
          throw new Error(`Unknown message type: ${type}`);
      }

      self.postMessage({
        type: `${type}_RESULT`,
        result,
        id
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        id
      });
    }
  }

  private processMarketData(data: { prices: number[]; volumes: number[] }): ProcessedMarketData {
    const { prices, volumes } = data;
    
    return {
      vwap: this.calculateVWAP(prices, volumes),
      rsi: this.calculateRSI(prices),
      sma: this.calculateSMA(prices, 20),
      volatility: this.calculateVolatility(prices),
      patterns: this.detectPatterns(prices),
      momentum: this.calculateMomentum(prices),
      timestamp: Date.now()
    };
  }

  private calculateIndicators(data: { prices: number[]; period?: number }) {
    const { prices, period = 14 } = data;
    
    return {
      sma: this.calculateSMA(prices, period),
      ema: this.calculateEMA(prices, period),
      rsi: this.calculateRSI(prices, period),
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices, period)
    };
  }

  private analyzePatterns(data: { prices: number[] }): string[] {
    const { prices } = data;
    const patterns: string[] = [];
    
    // Simple pattern detection
    if (this.isUptrend(prices)) patterns.push('uptrend');
    if (this.isDowntrend(prices)) patterns.push('downtrend');
    if (this.isConsolidation(prices)) patterns.push('consolidation');
    
    return patterns;
  }

  private calculateRisk(data: { positions: any[]; marketData: any }) {
    const { positions, marketData } = data;
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const riskMetrics = {
      totalExposure: totalValue,
      concentrationRisk: this.calculateConcentrationRisk(positions),
      volatilityRisk: this.calculatePortfolioVolatility(positions, marketData),
      drawdownRisk: this.calculateMaxDrawdown(positions)
    };
    
    return riskMetrics;
  }

  private calculateVWAP(prices: number[], volumes: number[]): number {
    let totalVolume = 0;
    let totalValue = 0;

    for (let i = 0; i < Math.min(prices.length, volumes.length); i++) {
      totalValue += prices[i] * volumes[i];
      totalVolume += volumes[i];
    }

    return totalVolume > 0 ? totalValue / totalVolume : 0;
  }

  private calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    
    if (prices.length < period + 1) return rsi;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        avgGain += changes[i];
      } else {
        avgLoss += Math.abs(changes[i]);
      }
    }
    
    avgGain /= period;
    avgLoss /= period;
    
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema[0] = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = this.calculateEMA(macdLine, 9);
    const histogram = macdLine.map((val, i) => val - signalLine[i]);
    
    return { macdLine, signalLine, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number = 20) {
    const sma = this.calculateSMA(prices, period);
    const bands = sma.map((avg, i) => {
      const slice = prices.slice(i, i + period);
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      return {
        upper: avg + (stdDev * 2),
        middle: avg,
        lower: avg - (stdDev * 2)
      };
    });
    
    return bands;
  }

  private calculateVolatility(prices: number[], period: number = 20): number {
    if (prices.length < period) return 0;
    
    const recentPrices = prices.slice(-period);
    const mean = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => {
      return sum + Math.pow(price - mean, 2);
    }, 0) / period;
    
    return Math.sqrt(variance);
  }

  private calculateMomentum(prices: number[], period: number = 10): number {
    if (prices.length < period) return 0;
    
    const current = prices[prices.length - 1];
    const past = prices[prices.length - period];
    
    return ((current - past) / past) * 100;
  }

  private detectPatterns(prices: number[]): string[] {
    const patterns: string[] = [];
    
    if (this.isUptrend(prices)) patterns.push('uptrend');
    if (this.isDowntrend(prices)) patterns.push('downtrend');
    if (this.isConsolidation(prices)) patterns.push('consolidation');
    
    return patterns;
  }

  private isUptrend(prices: number[]): boolean {
    if (prices.length < 10) return false;
    
    const recent = prices.slice(-10);
    const slope = this.calculateSlope(recent);
    
    return slope > 0.001; // Positive slope indicates uptrend
  }

  private isDowntrend(prices: number[]): boolean {
    if (prices.length < 10) return false;
    
    const recent = prices.slice(-10);
    const slope = this.calculateSlope(recent);
    
    return slope < -0.001; // Negative slope indicates downtrend
  }

  private isConsolidation(prices: number[]): boolean {
    if (prices.length < 20) return false;
    
    const recent = prices.slice(-20);
    const volatility = this.calculateVolatility(recent, 20);
    const avgPrice = recent.reduce((sum, price) => sum + price, 0) / recent.length;
    
    return (volatility / avgPrice) < 0.02; // Low volatility indicates consolidation
  }

  private calculateSlope(prices: number[]): number {
    const n = prices.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = prices.reduce((sum, price) => sum + price, 0);
    const sumXY = prices.reduce((sum, price, i) => sum + (i * price), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateConcentrationRisk(positions: any[]): number {
    if (positions.length === 0) return 0;
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const maxPosition = Math.max(...positions.map(pos => pos.value));
    
    return maxPosition / totalValue;
  }

  private calculatePortfolioVolatility(positions: any[], marketData: any): number {
    // Simplified portfolio volatility calculation
    const weights = positions.map(pos => pos.value / positions.reduce((sum, p) => sum + p.value, 0));
    const volatilities = positions.map(pos => marketData[pos.symbol]?.volatility || 0.1);
    
    return Math.sqrt(weights.reduce((sum, weight, i) => sum + Math.pow(weight * volatilities[i], 2), 0));
  }

  private calculateMaxDrawdown(positions: any[]): number {
    // Simplified maximum drawdown calculation
    const values = positions.map(pos => pos.value);
    let maxDrawdown = 0;
    let peak = values[0] || 0;
    
    for (const value of values) {
      if (value > peak) {
        peak = value;
      } else {
        const drawdown = (peak - value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }
}

// Initialize the worker
new MarketProcessorWorker();
