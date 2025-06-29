/**
 * Technical analysis indicators for market data analysis
 */

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  timestamp: number;
  value: number | number[] | null;
}

/**
 * Calculate Simple Moving Average (SMA)
 * 
 * @param data - Array of price data points
 * @param period - Period for the moving average
 * @param valueKey - Key to extract from data objects (default: 'close')
 * @returns Array of SMA values
 */
export const calculateSMA = (
  data: CandlestickData[],
  period: number,
  valueKey: keyof CandlestickData = 'close'
): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  
  if (data.length < period) {
    return data.map(candle => ({ timestamp: candle.timestamp, value: null }));
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: data[i].timestamp, value: null });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j][valueKey] as number;
      }
      results.push({
        timestamp: data[i].timestamp,
        value: sum / period
      });
    }
  }
  
  return results;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * 
 * @param data - Array of price data points
 * @param period - Period for the moving average
 * @param valueKey - Key to extract from data objects (default: 'close')
 * @returns Array of EMA values
 */
export const calculateEMA = (
  data: CandlestickData[],
  period: number,
  valueKey: keyof CandlestickData = 'close'
): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  
  if (data.length < period) {
    return data.map(candle => ({ timestamp: candle.timestamp, value: null }));
  }
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate first EMA using SMA
  let ema = data.slice(0, period).reduce((sum, candle) => sum + (candle[valueKey] as number), 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: data[i].timestamp, value: null });
    } else {
      if (i === period - 1) {
        // First EMA is SMA
        results.push({ timestamp: data[i].timestamp, value: ema });
      } else {
        // Calculate EMA: (Close - prevEMA) * multiplier + prevEMA
        ema = ((data[i][valueKey] as number) - ema) * multiplier + ema;
        results.push({ timestamp: data[i].timestamp, value: ema });
      }
    }
  }
  
  return results;
};

/**
 * Calculate Relative Strength Index (RSI)
 * 
 * @param data - Array of price data points
 * @param period - Period for RSI calculation (default: 14)
 * @param valueKey - Key to extract from data objects (default: 'close')
 * @returns Array of RSI values (0-100)
 */
export const calculateRSI = (
  data: CandlestickData[],
  period: number = 14,
  valueKey: keyof CandlestickData = 'close'
): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  
  if (data.length < period + 1) {
    return data.map(candle => ({ timestamp: candle.timestamp, value: null }));
  }
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push((data[i][valueKey] as number) - (data[i - 1][valueKey] as number));
  }
  
  // Calculate gains and losses
  const gains: number[] = changes.map(change => change > 0 ? change : 0);
  const losses: number[] = changes.map(change => change < 0 ? Math.abs(change) : 0);
  
  // Calculate average gain and average loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  // Add null values for the first period
  for (let i = 0; i < period; i++) {
    results.push({ timestamp: data[i].timestamp, value: null });
  }
  
  // Calculate first RSI
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  let rsi = 100 - (100 / (1 + rs));
  results.push({ timestamp: data[period].timestamp, value: rsi });
  
  // Calculate remaining RSI values
  for (let i = period + 1; i < data.length; i++) {
    // Update average gain and loss using smoothing method
    avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
    
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    rsi = 100 - (100 / (1 + rs));
    
    results.push({ timestamp: data[i].timestamp, value: rsi });
  }
  
  return results;
};

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * 
 * @param data - Array of price data points
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @param valueKey - Key to extract from data objects (default: 'close')
 * @returns Array of MACD values [MACD line, Signal line, Histogram]
 */
export const calculateMACD = (
  data: CandlestickData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
  valueKey: keyof CandlestickData = 'close'
): IndicatorResult[] => {
  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(data, fastPeriod, valueKey);
  const slowEMA = calculateEMA(data, slowPeriod, valueKey);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: { timestamp: number; value: number | null }[] = [];
  for (let i = 0; i < data.length; i++) {
    const fastValue = fastEMA[i].value;
    const slowValue = slowEMA[i].value;
    
    if (fastValue === null || slowValue === null) {
      macdLine.push({ timestamp: data[i].timestamp, value: null });
    } else {
      macdLine.push({ timestamp: data[i].timestamp, value: fastValue - slowValue });
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLineData = macdLine.map((item, i) => ({
    timestamp: item.timestamp,
    close: item.value === null ? 0 : item.value,
    open: 0, high: 0, low: 0, volume: 0 // These values aren't used
  }));
  
  const signalLine = calculateEMA(signalLineData, signalPeriod, 'close');
  
  // Calculate histogram (MACD line - signal line)
  const results: IndicatorResult[] = [];
  for (let i = 0; i < data.length; i++) {
    const macdValue = macdLine[i].value;
    const signalValue = signalLine[i].value;
    
    if (macdValue === null || signalValue === null) {
      results.push({ timestamp: data[i].timestamp, value: [null, null, null] });
    } else {
      const histogram = macdValue - signalValue;
      results.push({
        timestamp: data[i].timestamp,
        value: [macdValue, signalValue, histogram]
      });
    }
  }
  
  return results;
};

/**
 * Calculate Bollinger Bands
 * 
 * @param data - Array of price data points
 * @param period - Period for the moving average (default: 20)
 * @param stdDev - Number of standard deviations (default: 2)
 * @param valueKey - Key to extract from data objects (default: 'close')
 * @returns Array of Bollinger Bands values [middle, upper, lower]
 */
export const calculateBollingerBands = (
  data: CandlestickData[],
  period: number = 20,
  stdDev: number = 2,
  valueKey: keyof CandlestickData = 'close'
): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  
  if (data.length < period) {
    return data.map(candle => ({ timestamp: candle.timestamp, value: [null, null, null] }));
  }
  
  // Calculate SMA for middle band
  const sma = calculateSMA(data, period, valueKey);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: data[i].timestamp, value: [null, null, null] });
    } else {
      // Calculate standard deviation
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.pow((data[i - j][valueKey] as number) - (sma[i].value as number), 2);
      }
      const stdDevValue = Math.sqrt(sum / period);
      
      // Calculate bands
      const middle = sma[i].value as number;
      const upper = middle + (stdDevValue * stdDev);
      const lower = middle - (stdDevValue * stdDev);
      
      results.push({
        timestamp: data[i].timestamp,
        value: [middle, upper, lower]
      });
    }
  }
  
  return results;
};
