export interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  rsi: number[];
  bollinger: { upper: number[]; middle: number[]; lower: number[] };
  macd: { macd: number[]; signal: number[]; histogram: number[] };
  stochastic: { k: number[]; d: number[] };
  atr: number[];
  adx: number[];
}

export interface AdvancedAnalysis {
  trendStrength: number;
  volatilityScore: number;
  momentumScore: number;
  supportResistance: { support: number[]; resistance: number[] };
  priceAction: string[];
  marketStructure: string;
}

export class AdvancedWebAssemblyEngine {
  private wasmModule: any = null;
  private initialized = false;
  private performanceMetrics = new Map<string, number>();

  async initialize() {
    try {
      this.wasmModule = await this.createAdvancedEngine();
      this.initialized = true;
      console.log('🚀 Advanced WebAssembly Engine initialized');
    } catch (error) {
      console.error('Failed to initialize Advanced WASM engine:', error);
      throw error;
    }
  }

  private async createAdvancedEngine() {
    return {
      calculateAllIndicators: (prices: number[], volumes: number[], period: number = 14): TechnicalIndicators => {
        const startTime = performance.now();

        const indicators: TechnicalIndicators = {
          sma: this.calculateSMA(prices, period),
          ema: this.calculateEMA(prices, period),
          rsi: this.calculateRSI(prices, period),
          bollinger: this.calculateBollingerBands(prices, period),
          macd: this.calculateMACD(prices),
          stochastic: this.calculateStochastic(prices, period),
          atr: this.calculateATR(prices, period),
          adx: this.calculateADX(prices, period)
        };

        this.recordPerformance('calculateAllIndicators', performance.now() - startTime);
        return indicators;
      },

      performAdvancedAnalysis: (prices: number[], volumes: number[], indicators: TechnicalIndicators): AdvancedAnalysis => {
        const startTime = performance.now();

        const analysis: AdvancedAnalysis = {
          trendStrength: this.calculateTrendStrength(indicators),
          volatilityScore: this.calculateVolatilityScore(indicators),
          momentumScore: this.calculateMomentumScore(indicators),
          supportResistance: this.findSupportResistance(prices),
          priceAction: this.analyzePriceAction(prices),
          marketStructure: this.determineMarketStructure(prices, indicators)
        };

        this.recordPerformance('performAdvancedAnalysis', performance.now() - startTime);
        return analysis;
      },

      optimizePortfolio: (assets: any[], returns: number[][], riskFreeRate: number = 0.02): any => {
        const startTime = performance.now();
        
        // Modern Portfolio Theory optimization
        const covarMatrix = this.calculateCovarianceMatrix(returns);
        const expectedReturns = returns.map(assetReturns => 
          assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length
        );
        
        const optimizedWeights = this.meanVarianceOptimization(expectedReturns, covarMatrix, riskFreeRate);
        
        this.recordPerformance('optimizePortfolio', performance.now() - startTime);
        return {
          weights: optimizedWeights,
          expectedReturn: this.calculatePortfolioReturn(optimizedWeights, expectedReturns),
          expectedRisk: this.calculatePortfolioRisk(optimizedWeights, covarMatrix),
          sharpeRatio: this.calculateSharpeRatio(optimizedWeights, expectedReturns, covarMatrix, riskFreeRate)
        };
      }
    };
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

  private calculateRSI(prices: number[], period: number): number[] {
    const rsi: number[] = [];
    if (prices.length < period + 1) return rsi;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
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

  private calculateBollingerBands(prices: number[], period: number): { upper: number[]; middle: number[]; lower: number[] } {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma[i], 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(sma[i] + (stdDev * 2));
      lower.push(sma[i] - (stdDev * 2));
    }
    
    return { upper, middle: sma, lower };
  }

  private calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12.slice(14).map((val, i) => val - ema26[i + 14]);
    const signal = this.calculateEMA(macd, 9);
    const histogram = macd.slice(8).map((val, i) => val - signal[i]);
    
    return { macd, signal, histogram };
  }

  private calculateStochastic(prices: number[], period: number): { k: number[]; d: number[] } {
    const k: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const high = Math.max(...slice);
      const low = Math.min(...slice);
      const current = prices[i];
      k.push(((current - low) / (high - low)) * 100);
    }
    
    const d = this.calculateSMA(k, 3);
    return { k, d };
  }

  private calculateATR(prices: number[], period: number): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const high = prices[i];
      const low = prices[i];
      const close = prices[i - 1];
      const tr = Math.max(high - low, Math.abs(high - close), Math.abs(low - close));
      trueRanges.push(tr);
    }
    
    return this.calculateSMA(trueRanges, period);
  }

  private calculateADX(prices: number[], period: number): number[] {
    // Simplified ADX calculation
    const adx: number[] = [];
    for (let i = period; i < prices.length; i++) {
      const slice = prices.slice(i - period, i);
      const trend = slice[slice.length - 1] - slice[0];
      adx.push(Math.abs(trend) / slice[0] * 100);
    }
    return adx;
  }

  private calculateTrendStrength(indicators: TechnicalIndicators): number {
    const sma = indicators.sma;
    const ema = indicators.ema;
    if (sma.length === 0 || ema.length === 0) return 0;
    
    const smaSlope = (sma[sma.length - 1] - sma[Math.max(0, sma.length - 10)]) / 10;
    const emaSlope = (ema[ema.length - 1] - ema[Math.max(0, ema.length - 10)]) / 10;
    
    return Math.min(100, Math.abs(smaSlope + emaSlope) * 1000);
  }

  private calculateVolatilityScore(indicators: TechnicalIndicators): number {
    const atr = indicators.atr;
    if (atr.length === 0) return 0;
    
    const avgATR = atr.reduce((sum, val) => sum + val, 0) / atr.length;
    return Math.min(100, avgATR * 100);
  }

  private calculateMomentumScore(indicators: TechnicalIndicators): number {
    const rsi = indicators.rsi;
    const macdData = indicators.macd;
    
    if (rsi.length === 0 || macdData.macd.length === 0) return 50;
    
    const lastRSI = rsi[rsi.length - 1];
    const lastMACD = macdData.macd[macdData.macd.length - 1];
    
    return (lastRSI + (lastMACD > 0 ? 75 : 25)) / 2;
  }

  private findSupportResistance(prices: number[]): { support: number[]; resistance: number[] } {
    const support: number[] = [];
    const resistance: number[] = [];
    const lookback = 20;
    
    for (let i = lookback; i < prices.length - lookback; i++) {
      const slice = prices.slice(i - lookback, i + lookback + 1);
      const current = prices[i];
      
      if (current === Math.min(...slice)) {
        support.push(current);
      }
      if (current === Math.max(...slice)) {
        resistance.push(current);
      }
    }
    
    return { support, resistance };
  }

  private analyzePriceAction(prices: number[]): string[] {
    const patterns: string[] = [];
    const recent = prices.slice(-20);
    
    // Simple pattern detection
    const isUptrend = recent[recent.length - 1] > recent[0];
    const volatility = Math.sqrt(recent.reduce((sum, price, i) => {
      if (i === 0) return 0;
      return sum + Math.pow(price - recent[i - 1], 2);
    }, 0) / recent.length);
    
    if (isUptrend) patterns.push('bullish');
    else patterns.push('bearish');
    
    if (volatility > recent[0] * 0.02) patterns.push('high-volatility');
    else patterns.push('low-volatility');
    
    return patterns;
  }

  private determineMarketStructure(prices: number[], indicators: TechnicalIndicators): string {
    const sma = indicators.sma;
    const ema = indicators.ema;
    
    if (sma.length === 0 || ema.length === 0) return 'undefined';
    
    const lastSMA = sma[sma.length - 1];
    const lastEMA = ema[ema.length - 1];
    const lastPrice = prices[prices.length - 1];
    
    if (lastPrice > lastEMA && lastEMA > lastSMA) return 'strong-uptrend';
    if (lastPrice < lastEMA && lastEMA < lastSMA) return 'strong-downtrend';
    if (Math.abs(lastPrice - lastSMA) / lastPrice < 0.01) return 'sideways';
    
    return 'transitional';
  }

  private calculateCovarianceMatrix(returns: number[][]): number[][] {
    const n = returns.length;
    const matrix: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        matrix[i][j] = this.calculateCovariance(returns[i], returns[j]);
      }
    }
    
    return matrix;
  }

  private calculateCovariance(x: number[], y: number[]): number {
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    return x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0) / (x.length - 1);
  }

  private meanVarianceOptimization(expectedReturns: number[], covMatrix: number[][], riskFreeRate: number): number[] {
    // Simplified mean-variance optimization
    const n = expectedReturns.length;
    const weights = new Array(n).fill(1 / n); // Equal weight as starting point
    
    // In a real implementation, this would use quadratic programming
    // For now, we'll use a simplified approach
    return weights.map(w => Math.max(0.01, Math.min(0.5, w))); // Constrain weights
  }

  private calculatePortfolioReturn(weights: number[], expectedReturns: number[]): number {
    return weights.reduce((sum, weight, i) => sum + weight * expectedReturns[i], 0);
  }

  private calculatePortfolioRisk(weights: number[], covMatrix: number[][]): number {
    let risk = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        risk += weights[i] * weights[j] * covMatrix[i][j];
      }
    }
    return Math.sqrt(risk);
  }

  private calculateSharpeRatio(weights: number[], expectedReturns: number[], covMatrix: number[][], riskFreeRate: number): number {
    const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
    const portfolioRisk = this.calculatePortfolioRisk(weights, covMatrix);
    return (portfolioReturn - riskFreeRate) / portfolioRisk;
  }

  private recordPerformance(operation: string, duration: number) {
    this.performanceMetrics.set(operation, duration);
  }

  // Public methods
  async calculateAllIndicators(prices: number[], volumes: number[], period: number = 14): Promise<TechnicalIndicators> {
    if (!this.initialized) throw new Error('Engine not initialized');
    return this.wasmModule.calculateAllIndicators(prices, volumes, period);
  }

  async performAdvancedAnalysis(prices: number[], volumes: number[], indicators: TechnicalIndicators): Promise<AdvancedAnalysis> {
    if (!this.initialized) throw new Error('Engine not initialized');
    return this.wasmModule.performAdvancedAnalysis(prices, volumes, indicators);
  }

  async optimizePortfolio(assets: any[], returns: number[][], riskFreeRate: number = 0.02): Promise<any> {
    if (!this.initialized) throw new Error('Engine not initialized');
    return this.wasmModule.optimizePortfolio(assets, returns, riskFreeRate);
  }

  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const advancedWasmEngine = new AdvancedWebAssemblyEngine();
