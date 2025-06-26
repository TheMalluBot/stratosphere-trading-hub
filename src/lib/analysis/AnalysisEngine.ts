
// Main analysis engine that coordinates all technical analysis
import { TechnicalIndicators } from './TechnicalIndicators';
import { PatternRecognition } from './PatternRecognition';
import { workerManager } from '../workers/WorkerManager';

interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AnalysisResult {
  indicators: {
    rsi: number[];
    macd: { macd: number[], signal: number[], histogram: number[] };
    bollingerBands: { upper: number[], middle: number[], lower: number[] };
    stochastic: { k: number[], d: number[] };
    ema20: number[];
    ema50: number[];
    sma20: number[];
    sma50: number[];
    atr: number[];
    cci: number[];
    momentum: number[];
    roc: number[];
    vwap: number[];
    obv: number[];
    williams: number[];
  };
  patterns: {
    candlestick: any[];
    chart: any[];
    supportResistance: any[];
  };
  signals: {
    buy: boolean;
    sell: boolean;
    strength: number;
    reasons: string[];
  };
  trend: {
    direction: 'bullish' | 'bearish' | 'sideways';
    strength: number;
    duration: number;
  };
}

export class AnalysisEngine {
  private workerInitialized = false;

  constructor() {
    this.initializeWorkers();
  }

  private async initializeWorkers() {
    try {
      // Create workers for parallel processing
      workerManager.createWorker('technicalAnalysis', '/src/workers/technicalAnalysis.worker.ts');
      workerManager.createWorker('patternRecognition', '/src/workers/patternRecognition.worker.ts');
      this.workerInitialized = true;
      console.log('🚀 Analysis workers initialized successfully');
    } catch (error) {
      console.warn('Workers not available, falling back to main thread', error);
      this.workerInitialized = false;
    }
  }

  async analyzeMarketData(data: MarketData[]): Promise<AnalysisResult> {
    if (data.length < 50) {
      throw new Error('Insufficient data for analysis (minimum 50 bars required)');
    }

    const [indicators, patterns, signals, trend] = await Promise.all([
      this.calculateAllIndicators(data),
      this.detectAllPatterns(data),
      this.generateSignals(data),
      this.analyzeTrend(data)
    ]);

    return {
      indicators,
      patterns,
      signals,
      trend
    };
  }

  private async calculateAllIndicators(data: MarketData[]): Promise<AnalysisResult['indicators']> {
    const prices = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);

    try {
      if (this.workerInitialized) {
        // Use Web Worker for heavy calculations
        const result = await workerManager.postMessage('technicalAnalysis', {
          type: 'CALCULATE_ALL_INDICATORS',
          data: { prices, highs, lows, closes: prices, volumes }
        });
        
        return {
          ...result,
          atr: TechnicalIndicators.atr(highs, lows, prices, 14),
          cci: TechnicalIndicators.cci(highs, lows, prices, 20),
          momentum: TechnicalIndicators.momentum(prices, 10),
          roc: TechnicalIndicators.roc(prices, 10),
          vwap: TechnicalIndicators.vwap(highs, lows, prices, volumes),
          obv: TechnicalIndicators.onBalanceVolume(prices, volumes),
          williams: TechnicalIndicators.williams(highs, lows, prices, 14)
        };
      }
    } catch (error) {
      console.warn('Worker calculation failed, using main thread:', error);
    }

    // Fallback to main thread calculation
    return {
      rsi: TechnicalIndicators.rsi(prices, 14),
      macd: TechnicalIndicators.macd(prices, 12, 26, 9),
      bollingerBands: TechnicalIndicators.bollingerBands(prices, 20, 2),
      stochastic: TechnicalIndicators.stochastic(highs, lows, prices, 14, 3),
      ema20: TechnicalIndicators.ema(prices, 20),
      ema50: TechnicalIndicators.ema(prices, 50),
      sma20: TechnicalIndicators.sma(prices, 20),
      sma50: TechnicalIndicators.sma(prices, 50),
      atr: TechnicalIndicators.atr(highs, lows, prices, 14),
      cci: TechnicalIndicators.cci(highs, lows, prices, 20),
      momentum: TechnicalIndicators.momentum(prices, 10),
      roc: TechnicalIndicators.roc(prices, 10),
      vwap: TechnicalIndicators.vwap(highs, lows, prices, volumes),
      obv: TechnicalIndicators.onBalanceVolume(prices, volumes),
      williams: TechnicalIndicators.williams(highs, lows, prices, 14)
    };
  }

  private async detectAllPatterns(data: MarketData[]): Promise<AnalysisResult['patterns']> {
    const candlestickData = data.map(d => ({
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      timestamp: d.timestamp
    }));

    try {
      if (this.workerInitialized) {
        // Use Web Worker for pattern recognition
        const chartPatterns = await workerManager.postMessage('patternRecognition', {
          type: 'DETECT_ALL_PATTERNS',
          data: { candles: candlestickData }
        });

        const supportResistance = await workerManager.postMessage('patternRecognition', {
          type: 'DETECT_SUPPORT_RESISTANCE',
          data: { candles: candlestickData }
        });

        return {
          candlestick: this.detectCandlestickPatterns(candlestickData),
          chart: chartPatterns,
          supportResistance: supportResistance
        };
      }
    } catch (error) {
      console.warn('Worker pattern detection failed, using main thread:', error);
    }

    // Fallback to main thread
    return {
      candlestick: this.detectCandlestickPatterns(candlestickData),
      chart: this.detectChartPatterns(candlestickData),
      supportResistance: PatternRecognition.detectSupportResistance(candlestickData)
    };
  }

  private detectCandlestickPatterns(data: any[]): any[] {
    const patterns: any[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      // Doji
      if (PatternRecognition.detectDoji(current)) {
        patterns.push({
          type: 'DOJI',
          index: i,
          confidence: 0.7,
          description: 'Indecision candle - potential reversal'
        });
      }
      
      // Hammer
      if (PatternRecognition.detectHammer(current)) {
        patterns.push({
          type: 'HAMMER',
          index: i,
          confidence: 0.8,
          description: 'Bullish reversal candle'
        });
      }
      
      // Shooting Star
      if (PatternRecognition.detectShootingStar(current)) {
        patterns.push({
          type: 'SHOOTING_STAR',
          index: i,
          confidence: 0.8,
          description: 'Bearish reversal candle'
        });
      }
      
      // Engulfing patterns
      const engulfing = PatternRecognition.detectEngulfingPattern([previous, current]);
      if (engulfing) {
        patterns.push({
          type: engulfing === 'bullish' ? 'BULLISH_ENGULFING' : 'BEARISH_ENGULFING',
          index: i,
          confidence: 0.85,
          description: `${engulfing} engulfing pattern`
        });
      }
    }
    
    return patterns;
  }

  private detectChartPatterns(data: any[]): any[] {
    const patterns: any[] = [];
    
    const doubleTop = PatternRecognition.detectDoubleTop(data);
    if (doubleTop) patterns.push(doubleTop);
    
    const doubleBottom = PatternRecognition.detectDoubleBottom(data);
    if (doubleBottom) patterns.push(doubleBottom);
    
    const headAndShoulders = PatternRecognition.detectHeadAndShoulders(data);
    if (headAndShoulders) patterns.push(headAndShoulders);
    
    const inverseHeadAndShoulders = PatternRecognition.detectInverseHeadAndShoulders(data);
    if (inverseHeadAndShoulders) patterns.push(inverseHeadAndShoulders);
    
    const triangle = PatternRecognition.detectTriangles(data);
    if (triangle) patterns.push(triangle);
    
    return patterns;
  }

  private async generateSignals(data: MarketData[]): Promise<AnalysisResult['signals']> {
    if (data.length < 2) {
      return { buy: false, sell: false, strength: 0, reasons: [] };
    }

    const indicators = await this.calculateAllIndicators(data);
    const patterns = await this.detectAllPatterns(data);
    
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    const latestRSI = indicators.rsi[indicators.rsi.length - 1];
    const latestMACD = indicators.macd.macd[indicators.macd.macd.length - 1];
    const latestSignalLine = indicators.macd.signal[indicators.macd.signal.length - 1];
    const latestEMA20 = indicators.ema20[indicators.ema20.length - 1];
    const latestEMA50 = indicators.ema50[indicators.ema50.length - 1];
    const latestStochasticK = indicators.stochastic.k[indicators.stochastic.k.length - 1];
    
    let buyScore = 0;
    let sellScore = 0;
    const reasons: string[] = [];
    
    // RSI Analysis
    if (latestRSI < 30) {
      buyScore += 2;
      reasons.push('RSI oversold (<30)');
    } else if (latestRSI > 70) {
      sellScore += 2;
      reasons.push('RSI overbought (>70)');
    }
    
    // MACD Analysis
    if (latestMACD > latestSignalLine && latestMACD > 0) {
      buyScore += 2;
      reasons.push('MACD bullish crossover');
    } else if (latestMACD < latestSignalLine && latestMACD < 0) {
      sellScore += 2;
      reasons.push('MACD bearish crossover');
    }
    
    // EMA Analysis
    if (latestEMA20 > latestEMA50 && current.close > latestEMA20) {
      buyScore += 1;
      reasons.push('Price above bullish EMA');
    } else if (latestEMA20 < latestEMA50 && current.close < latestEMA20) {
      sellScore += 1;
      reasons.push('Price below bearish EMA');
    }
    
    // Stochastic Analysis
    if (latestStochasticK < 20) {
      buyScore += 1;
      reasons.push('Stochastic oversold');
    } else if (latestStochasticK > 80) {
      sellScore += 1;
      reasons.push('Stochastic overbought');
    }
    
    // Pattern Analysis
    patterns.candlestick.forEach(pattern => {
      if (pattern.type.includes('BULLISH') || pattern.type === 'HAMMER') {
        buyScore += 1;
        reasons.push(`Bullish pattern: ${pattern.type}`);
      } else if (pattern.type.includes('BEARISH') || pattern.type === 'SHOOTING_STAR') {
        sellScore += 1;
        reasons.push(`Bearish pattern: ${pattern.type}`);
      }
    });
    
    patterns.chart.forEach(pattern => {
      if (pattern.signals.includes('BUY') || pattern.signals.includes('BUY_ON_BREAK')) {
        buyScore += 2;
        reasons.push(`Chart pattern: ${pattern.type}`);
      } else if (pattern.signals.includes('SELL') || pattern.signals.includes('SELL_ON_BREAK')) {
        sellScore += 2;
        reasons.push(`Chart pattern: ${pattern.type}`);
      }
    });
    
    // Volume confirmation
    if (current.volume > previous.volume * 1.5) {
      if (current.close > previous.close) {
        buyScore += 1;
        reasons.push('Volume surge on price increase');
      } else {
        sellScore += 1;
        reasons.push('Volume surge on price decrease');
      }
    }
    
    const maxScore = Math.max(buyScore, sellScore);
    const strength = Math.min(maxScore / 5, 1); // Normalize to 0-1
    
    return {
      buy: buyScore > sellScore && buyScore >= 3,
      sell: sellScore > buyScore && sellScore >= 3,
      strength,
      reasons
    };
  }

  private async analyzeTrend(data: MarketData[]): Promise<AnalysisResult['trend']> {
    if (data.length < 20) {
      return { direction: 'sideways', strength: 0, duration: 0 };
    }

    const prices = data.map(d => d.close);
    const ema20 = TechnicalIndicators.ema(prices, 20);
    const ema50 = TechnicalIndicators.ema(prices, 50);
    
    const recent20 = ema20.slice(-10);
    const recent50 = ema50.slice(-10);
    
    let trendDirection: 'bullish' | 'bearish' | 'sideways' = 'sideways';
    let trendStrength = 0;
    let trendDuration = 0;
    
    // Determine trend direction
    const latest20 = recent20[recent20.length - 1];
    const latest50 = recent50[recent50.length - 1];
    
    if (latest20 > latest50) {
      // Check if uptrend is consistent
      const uptrend = recent20.every((val, i) => i === 0 || val >= recent20[i - 1]);
      if (uptrend) {
        trendDirection = 'bullish';
        trendStrength = this.calculateTrendStrength(recent20, 'bullish');
      }
    } else if (latest20 < latest50) {
      // Check if downtrend is consistent
      const downtrend = recent20.every((val, i) => i === 0 || val <= recent20[i - 1]);
      if (downtrend) {
        trendDirection = 'bearish';
        trendStrength = this.calculateTrendStrength(recent20, 'bearish');
      }
    }
    
    // Calculate trend duration
    if (trendDirection !== 'sideways') {
      trendDuration = this.calculateTrendDuration(ema20, trendDirection);
    }
    
    return {
      direction: trendDirection,
      strength: trendStrength,
      duration: trendDuration
    };
  }

  private calculateTrendStrength(values: number[], direction: 'bullish' | 'bearish'): number {
    if (values.length < 2) return 0;
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const percentChange = Math.abs((lastValue - firstValue) / firstValue);
    
    // Normalize to 0-1 scale
    let strength = Math.min(percentChange * 10, 1);
    
    // Check consistency
    let consistent = 0;
    for (let i = 1; i < values.length; i++) {
      if (direction === 'bullish' && values[i] >= values[i - 1]) consistent++;
      else if (direction === 'bearish' && values[i] <= values[i - 1]) consistent++;
    }
    
    const consistencyRatio = consistent / (values.length - 1);
    strength *= consistencyRatio;
    
    return Math.min(Math.max(strength, 0), 1);
  }

  private calculateTrendDuration(ema: number[], direction: 'bullish' | 'bearish'): number {
    let duration = 0;
    
    for (let i = ema.length - 1; i > 0; i--) {
      const isConsistent = direction === 'bullish' ? 
        ema[i] >= ema[i - 1] : 
        ema[i] <= ema[i - 1];
      
      if (isConsistent) {
        duration++;
      } else {
        break;
      }
    }
    
    return duration;
  }

  // Real-time analysis update
  async updateAnalysis(newBar: MarketData, previousAnalysis: AnalysisResult): Promise<AnalysisResult> {
    // For real-time updates, we can optimize by only recalculating recent indicators
    // This is a simplified version - in production, you'd implement incremental updates
    console.log('🔄 Updating analysis with new bar:', newBar.timestamp);
    
    // For now, return the previous analysis with a timestamp update
    // In a full implementation, you'd update only the necessary indicators
    return {
      ...previousAnalysis,
      // Update only the latest values
    };
  }

  dispose() {
    workerManager.terminateAll();
  }
}

// Global analysis engine instance
export const analysisEngine = new AnalysisEngine();
