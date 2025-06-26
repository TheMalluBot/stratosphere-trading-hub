
// Professional technical analysis indicators library
export class TechnicalIndicators {
  // Moving Averages
  static sma(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
    
    return result;
  }

  static ema(values: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    if (values.length === 0) return result;
    
    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < Math.min(period, values.length); i++) {
      sum += values[i];
    }
    result.push(sum / Math.min(period, values.length));
    
    // Calculate remaining EMA values
    for (let i = period; i < values.length; i++) {
      const currentEMA = (values[i] * multiplier) + (result[result.length - 1] * (1 - multiplier));
      result.push(currentEMA);
    }
    
    return result;
  }

  static wma(values: number[], period: number): number[] {
    const result: number[] = [];
    const weights = Array.from({ length: period }, (_, i) => i + 1);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    
    for (let i = period - 1; i < values.length; i++) {
      let weightedSum = 0;
      for (let j = 0; j < period; j++) {
        weightedSum += values[i - period + 1 + j] * weights[j];
      }
      result.push(weightedSum / weightSum);
    }
    
    return result;
  }

  // Oscillators
  static rsi(values: number[], period: number = 14): number[] {
    if (values.length < period + 1) return [];
    
    const result: number[] = [];
    let gains = 0, losses = 0;

    // Calculate initial average gains and losses
    for (let i = 1; i <= period; i++) {
      const change = values[i] - values[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI values
    for (let i = period; i < values.length; i++) {
      const change = values[i] - values[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }

    return result;
  }

  static stochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3): {
    k: number[], d: number[]
  } {
    const k: number[] = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      const currentClose = closes[i];
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(isFinite(kValue) ? kValue : 50);
    }
    
    const d = this.sma(k, dPeriod);
    return { k, d };
  }

  static williams(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const currentClose = closes[i];
      
      const williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
      result.push(isFinite(williamsR) ? williamsR : -50);
    }
    
    return result;
  }

  // MACD
  static macd(values: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[], signal: number[], histogram: number[]
  } {
    const emaFast = this.ema(values, fastPeriod);
    const emaSlow = this.ema(values, slowPeriod);
    
    const macd: number[] = [];
    const startIndex = Math.max(0, emaSlow.length - emaFast.length);
    
    for (let i = 0; i < emaFast.length - startIndex; i++) {
      macd.push(emaFast[i + startIndex] - emaSlow[i]);
    }
    
    const signal = this.ema(macd, signalPeriod);
    const histogram: number[] = [];
    
    const signalStartIndex = Math.max(0, macd.length - signal.length);
    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[i + signalStartIndex] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  // Bollinger Bands
  static bollingerBands(values: number[], period: number = 20, stdDevMultiplier: number = 2): {
    upper: number[], middle: number[], lower: number[]
  } {
    const middle = this.sma(values, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < values.length; i++) {
      const slice = values.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, val) => sum + val, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      const middleValue = middle[i - period + 1];
      upper.push(middleValue + (stdDevMultiplier * stdDev));
      lower.push(middleValue - (stdDevMultiplier * stdDev));
    }
    
    return { upper, middle, lower };
  }

  // Average True Range
  static atr(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < closes.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.sma(trueRanges, period);
  }

  // Commodity Channel Index
  static cci(highs: number[], lows: number[], closes: number[], period: number = 20): number[] {
    const result: number[] = [];
    const typicalPrices = closes.map((close, i) => (highs[i] + lows[i] + close) / 3);
    
    for (let i = period - 1; i < typicalPrices.length; i++) {
      const slice = typicalPrices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, val) => sum + val, 0) / period;
      const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
      
      const cci = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
      result.push(isFinite(cci) ? cci : 0);
    }
    
    return result;
  }

  // Momentum
  static momentum(values: number[], period: number = 10): number[] {
    const result: number[] = [];
    
    for (let i = period; i < values.length; i++) {
      result.push(values[i] - values[i - period]);
    }
    
    return result;
  }

  // Rate of Change
  static roc(values: number[], period: number = 10): number[] {
    const result: number[] = [];
    
    for (let i = period; i < values.length; i++) {
      const roc = ((values[i] - values[i - period]) / values[i - period]) * 100;
      result.push(isFinite(roc) ? roc : 0);
    }
    
    return result;
  }

  // Volume-based indicators
  static vwap(highs: number[], lows: number[], closes: number[], volumes: number[]): number[] {
    const result: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (let i = 0; i < closes.length; i++) {
      const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
      const volume = volumes[i] || 1;
      
      cumulativeVolumePrice += typicalPrice * volume;
      cumulativeVolume += volume;
      
      result.push(cumulativeVolume > 0 ? cumulativeVolumePrice / cumulativeVolume : typicalPrice);
    }
    
    return result;
  }

  static onBalanceVolume(closes: number[], volumes: number[]): number[] {
    const result: number[] = [volumes[0] || 0];
    
    for (let i = 1; i < closes.length; i++) {
      const volume = volumes[i] || 0;
      let obv = result[result.length - 1];
      
      if (closes[i] > closes[i - 1]) {
        obv += volume;
      } else if (closes[i] < closes[i - 1]) {
        obv -= volume;
      }
      
      result.push(obv);
    }
    
    return result;
  }

  // Pivot Points
  static pivotPoints(highs: number[], lows: number[], closes: number[]): {
    pivot: number[], r1: number[], r2: number[], s1: number[], s2: number[]
  } {
    const pivot: number[] = [];
    const r1: number[] = [], r2: number[] = [];
    const s1: number[] = [], s2: number[] = [];
    
    for (let i = 1; i < closes.length; i++) {
      const p = (highs[i - 1] + lows[i - 1] + closes[i - 1]) / 3;
      pivot.push(p);
      
      r1.push(2 * p - lows[i - 1]);
      r2.push(p + (highs[i - 1] - lows[i - 1]));
      s1.push(2 * p - highs[i - 1]);
      s2.push(p - (highs[i - 1] - lows[i - 1]));
    }
    
    return { pivot, r1, r2, s1, s2 };
  }

  // Fibonacci Retracement
  static fibonacciRetracement(high: number, low: number): {
    level0: number, level236: number, level382: number, 
    level500: number, level618: number, level786: number, level1000: number
  } {
    const diff = high - low;
    
    return {
      level0: high,
      level236: high - (diff * 0.236),
      level382: high - (diff * 0.382),
      level500: high - (diff * 0.500),
      level618: high - (diff * 0.618),
      level786: high - (diff * 0.786),
      level1000: low
    };
  }
}
