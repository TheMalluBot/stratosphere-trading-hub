
// High-performance technical analysis worker
export class TechnicalAnalysisWorker {
  onmessage = (e: MessageEvent) => {
    const { type, data, id } = e.data;
    
    try {
      let result;
      
      switch (type) {
        case 'CALCULATE_RSI':
          result = this.calculateRSI(data.prices, data.period || 14);
          break;
        case 'CALCULATE_MACD':
          result = this.calculateMACD(data.prices);
          break;
        case 'CALCULATE_BOLLINGER_BANDS':
          result = this.calculateBollingerBands(data.prices, data.period || 20);
          break;
        case 'CALCULATE_STOCHASTIC':
          result = this.calculateStochastic(data.highs, data.lows, data.closes, data.period || 14);
          break;
        case 'CALCULATE_EMA':
          result = this.calculateEMA(data.prices, data.period || 20);
          break;
        case 'CALCULATE_SMA':
          result = this.calculateSMA(data.prices, data.period || 20);
          break;
        case 'CALCULATE_ALL_INDICATORS':
          result = this.calculateAllIndicators(data);
          break;
        default:
          throw new Error(`Unknown calculation type: ${type}`);
      }
      
      postMessage({
        type: 'SUCCESS',
        id,
        payload: result
      });
    } catch (error) {
      postMessage({
        type: 'ERROR',
        id,
        payload: { error: error.message }
      });
    }
  };

  private calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) return [];
    
    const rsi: number[] = [];
    let gains = 0, losses = 0;

    // Initial calculation
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  private calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macd: number[] = [];
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macd.push(ema12[i + (ema26.length - ema12.length) || 0] - ema26[i]);
    }
    
    const signal = this.calculateEMA(macd, 9);
    const histogram: number[] = [];
    
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i + (macd.length - signal.length) || 0] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number = 20): { 
    upper: number[], middle: number[], lower: number[] 
  } {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, val) => sum + val, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(sma[i - period + 1] + (2 * stdDev));
      lower.push(sma[i - period + 1] - (2 * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  private calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14): {
    k: number[], d: number[]
  } {
    const k: number[] = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const currentClose = closes[i];
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(k, 3);
    return { k, d };
  }

  private calculateEMA(prices: number[], period: number): number[] {
    if (prices.length < period) return [];
    
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA value is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema.push(sum / period);
    
    // Calculate remaining EMA values
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  private calculateAllIndicators(data: any) {
    const { prices, highs, lows, closes } = data;
    
    return {
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices, 20),
      stochastic: this.calculateStochastic(highs, lows, closes, 14),
      ema20: this.calculateEMA(prices, 20),
      ema50: this.calculateEMA(prices, 50),
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50)
    };
  }
}

// Initialize worker
new TechnicalAnalysisWorker();
