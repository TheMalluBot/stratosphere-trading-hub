
// Advanced pattern recognition system
interface CandlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

interface Pattern {
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
  signals: string[];
  targetPrice?: number;
  stopLoss?: number;
}

interface SupportResistanceLevel {
  price: number;
  touches: number;
  type: 'support' | 'resistance' | 'both';
  strength: number;
}

export class PatternRecognition {
  // Candlestick Patterns
  static detectDoji(candle: CandlestickData): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    return totalRange > 0 && (bodySize / totalRange) < 0.1;
  }

  static detectHammer(candle: CandlestickData): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const totalRange = candle.high - candle.low;
    
    return totalRange > 0 && 
           lowerShadow > (bodySize * 2) && 
           upperShadow < (bodySize * 0.3) &&
           (bodySize / totalRange) < 0.3;
  }

  static detectShootingStar(candle: CandlestickData): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const totalRange = candle.high - candle.low;
    
    return totalRange > 0 && 
           upperShadow > (bodySize * 2) && 
           lowerShadow < (bodySize * 0.3) &&
           (bodySize / totalRange) < 0.3;
  }

  static detectEngulfingPattern(candles: CandlestickData[]): 'bullish' | 'bearish' | null {
    if (candles.length < 2) return null;
    
    const [prev, current] = candles.slice(-2);
    const prevBody = Math.abs(prev.close - prev.open);
    const currentBody = Math.abs(current.close - current.open);
    
    // Bullish engulfing
    if (prev.close < prev.open && current.close > current.open &&
        current.open < prev.close && current.close > prev.open &&
        currentBody > prevBody) {
      return 'bullish';
    }
    
    // Bearish engulfing
    if (prev.close > prev.open && current.close < current.open &&
        current.open > prev.close && current.close < prev.open &&
        currentBody > prevBody) {
      return 'bearish';
    }
    
    return null;
  }

  // Chart Patterns
  static detectDoubleTop(data: CandlestickData[]): Pattern | null {
    if (data.length < 30) return null;
    
    const peaks = this.findPeaks(data.map(d => d.high));
    if (peaks.length < 2) return null;
    
    const lastTwoPeaks = peaks.slice(-2);
    const [peak1, peak2] = lastTwoPeaks;
    
    const priceDifference = Math.abs(peak1.value - peak2.value);
    const avgPrice = (peak1.value + peak2.value) / 2;
    const tolerance = 0.03; // 3%
    
    if (priceDifference / avgPrice <= tolerance && peak2.index - peak1.index >= 10) {
      const valleyBetween = this.findLowestBetween(data, peak1.index, peak2.index);
      const neckline = valleyBetween ? valleyBetween.low : avgPrice * 0.95;
      
      return {
        type: 'DOUBLE_TOP',
        confidence: this.calculatePatternConfidence([peak1, peak2], 'DOUBLE_TOP'),
        startIndex: peak1.index,
        endIndex: peak2.index,
        description: 'Bearish reversal pattern with two similar peaks',
        signals: ['SELL_ON_BREAK', 'RESISTANCE_LEVEL'],
        targetPrice: neckline - (avgPrice - neckline),
        stopLoss: Math.max(peak1.value, peak2.value) * 1.02
      };
    }
    
    return null;
  }

  static detectDoubleBottom(data: CandlestickData[]): Pattern | null {
    if (data.length < 30) return null;
    
    const troughs = this.findTroughs(data.map(d => d.low));
    if (troughs.length < 2) return null;
    
    const lastTwoTroughs = troughs.slice(-2);
    const [trough1, trough2] = lastTwoTroughs;
    
    const priceDifference = Math.abs(trough1.value - trough2.value);
    const avgPrice = (trough1.value + trough2.value) / 2;
    const tolerance = 0.03; // 3%
    
    if (priceDifference / avgPrice <= tolerance && trough2.index - trough1.index >= 10) {
      const peakBetween = this.findHighestBetween(data, trough1.index, trough2.index);
      const neckline = peakBetween ? peakBetween.high : avgPrice * 1.05;
      
      return {
        type: 'DOUBLE_BOTTOM',
        confidence: this.calculatePatternConfidence([trough1, trough2], 'DOUBLE_BOTTOM'),
        startIndex: trough1.index,
        endIndex: trough2.index,
        description: 'Bullish reversal pattern with two similar troughs',
        signals: ['BUY_ON_BREAK', 'SUPPORT_LEVEL'],
        targetPrice: neckline + (neckline - avgPrice),  
        stopLoss: Math.min(trough1.value, trough2.value) * 0.98
      };
    }
    
    return null;
  }

  static detectHeadAndShoulders(data: CandlestickData[]): Pattern | null {
    if (data.length < 50) return null;
    
    const peaks = this.findPeaks(data.map(d => d.high));
    if (peaks.length < 3) return null;
    
    const lastThreePeaks = peaks.slice(-3);
    const [leftShoulder, head, rightShoulder] = lastThreePeaks;
    
    // Head should be higher than both shoulders
    if (head.value > leftShoulder.value && head.value > rightShoulder.value) {
      const shoulderDiff = Math.abs(leftShoulder.value - rightShoulder.value);
      const avgShoulder = (leftShoulder.value + rightShoulder.value) / 2;
      
      if (shoulderDiff / avgShoulder <= 0.05) { // 5% tolerance
        const neckline = this.calculateNeckline(data, lastThreePeaks);
        
        return {
          type: 'HEAD_AND_SHOULDERS',
          confidence: this.calculatePatternConfidence(lastThreePeaks, 'HEAD_AND_SHOULDERS'),
          startIndex: leftShoulder.index,
          endIndex: rightShoulder.index,
          description: 'Bearish reversal pattern with head higher than shoulders',
          signals: ['SELL_ON_NECKLINE_BREAK', 'VOLUME_CONFIRMATION'],
          targetPrice: neckline - (head.value - neckline),
          stopLoss: head.value * 1.02
        };
      }
    }
    
    return null;
  }

  static detectInverseHeadAndShoulders(data: CandlestickData[]): Pattern | null {
    if (data.length < 50) return null;
    
    const troughs = this.findTroughs(data.map(d => d.low));
    if (troughs.length < 3) return null;
    
    const lastThreeTroughs = troughs.slice(-3);
    const [leftShoulder, head, rightShoulder] = lastThreeTroughs;
    
    // Head should be lower than both shoulders
    if (head.value < leftShoulder.value && head.value < rightShoulder.value) {
      const shoulderDiff = Math.abs(leftShoulder.value - rightShoulder.value);
      const avgShoulder = (leftShoulder.value + rightShoulder.value) / 2;
      
      if (shoulderDiff / avgShoulder <= 0.05) { // 5% tolerance
        const neckline = this.calculateNeckline(data, lastThreeTroughs);
        
        return {
          type: 'INVERSE_HEAD_AND_SHOULDERS',
          confidence: this.calculatePatternConfidence(lastThreeTroughs, 'INVERSE_HEAD_AND_SHOULDERS'),
          startIndex: leftShoulder.index,
          endIndex: rightShoulder.index,
          description: 'Bullish reversal pattern with head lower than shoulders',
          signals: ['BUY_ON_NECKLINE_BREAK', 'VOLUME_CONFIRMATION'],
          targetPrice: neckline + (neckline - head.value),
          stopLoss: head.value * 0.98
        };
      }
    }
    
    return null;
  }

  static detectTriangles(data: CandlestickData[]): Pattern | null {
    if (data.length < 40) return null;
    
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    
    const upperTrendLine = this.findTrendLine(this.findPeaks(highs), 'descending');
    const lowerTrendLine = this.findTrendLine(this.findTroughs(lows), 'ascending');
    
    if (upperTrendLine && lowerTrendLine) {
      const convergence = this.findConvergence(upperTrendLine, lowerTrendLine);
      
      if (convergence && convergence.distance < 50 && convergence.distance > 5) {
        let triangleType = 'SYMMETRICAL_TRIANGLE';
        
        // Determine triangle type
        if (Math.abs(upperTrendLine.slope) < 0.001) {
          triangleType = 'ASCENDING_TRIANGLE';
        } else if (Math.abs(lowerTrendLine.slope) < 0.001) {
          triangleType = 'DESCENDING_TRIANGLE';
        }
        
        return {
          type: triangleType,
          confidence: 0.75,
          startIndex: Math.min(upperTrendLine.startIndex, lowerTrendLine.startIndex),
          endIndex: Math.max(upperTrendLine.endIndex, lowerTrendLine.endIndex),
          description: `${triangleType.replace('_', ' ').toLowerCase()} - consolidation pattern`,
          signals: triangleType === 'ASCENDING_TRIANGLE' ? 
            ['BUY_ON_BREAKOUT', 'VOLUME_CONFIRMATION'] : 
            triangleType === 'DESCENDING_TRIANGLE' ?
            ['SELL_ON_BREAKDOWN', 'VOLUME_CONFIRMATION'] :
            ['BREAKOUT_DIRECTION', 'VOLUME_CONFIRMATION'],
          targetPrice: convergence.y,
          stopLoss: triangleType === 'ASCENDING_TRIANGLE' ? 
            lowerTrendLine.intercept * 0.98 : upperTrendLine.intercept * 1.02
        };
      }
    }
    
    return null;
  }

  static detectSupportResistance(data: CandlestickData[]): SupportResistanceLevel[] {
    const tolerance = 0.015; // 1.5%
    const minTouches = 3;
    const levels: SupportResistanceLevel[] = [];
    
    // Collect all significant price levels
    const significantPrices = [
      ...data.map(d => d.high),
      ...data.map(d => d.low),
      ...data.filter((_, i) => i % 5 === 0).map(d => d.close)
    ];
    
    const priceGroups = new Map<number, { count: number, isSupport: boolean, isResistance: boolean }>();
    
    // Group similar prices
    significantPrices.forEach(price => {
      let foundGroup = false;
      
      for (const [groupPrice, data] of priceGroups) {
        if (Math.abs(price - groupPrice) / groupPrice <= tolerance) {
          priceGroups.set(groupPrice, {
            count: data.count + 1,
            isSupport: data.isSupport,
            isResistance: data.isResistance
          });
          foundGroup = true;
          break;
        }
      }
      
      if (!foundGroup) {
        priceGroups.set(price, { count: 1, isSupport: false, isResistance: false });
      }
    });
    
    // Analyze each price level
    for (const [price, groupData] of priceGroups) {
      if (groupData.count >= minTouches) {
        const { isSupport, isResistance } = this.analyzePriceLevelBehavior(data, price, tolerance);
        
        let type: 'support' | 'resistance' | 'both' = 'both';
        if (isSupport && !isResistance) type = 'support';
        else if (isResistance && !isSupport) type = 'resistance';
        
        levels.push({
          price,
          touches: groupData.count,
          type,
          strength: this.calculateLevelStrength(groupData.count, data.length, isSupport, isResistance)
        });
      }
    }
    
    return levels.sort((a, b) => b.strength - a.strength);
  }

  // Helper methods
  private static findPeaks(values: number[]): { index: number, value: number }[] {
    const peaks: { index: number, value: number }[] = [];
    const minDistance = 5;
    const minProminence = 0.02; // 2% minimum prominence
    
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isPeak = true;
      const currentValue = values[i];
      
      // Check if current value is higher than surrounding values
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && values[j] >= currentValue) {
          isPeak = false;
          break;
        }
      }
      
      if (isPeak) {
        // Check prominence
        const leftMin = Math.min(...values.slice(Math.max(0, i - 20), i));
        const rightMin = Math.min(...values.slice(i + 1, Math.min(values.length, i + 21)));
        const prominence = (currentValue - Math.max(leftMin, rightMin)) / currentValue;
        
        if (prominence >= minProminence) {
          peaks.push({ index: i, value: currentValue });
        }
      }
    }
    
    return peaks;
  }

  private static findTroughs(values: number[]): { index: number, value: number }[] {
    const troughs: { index: number, value: number }[] = [];
    const minDistance = 5;
    const minProminence = 0.02; // 2% minimum prominence
    
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isTrough = true;
      const currentValue = values[i];
      
      // Check if current value is lower than surrounding values
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && values[j] <= currentValue) {
          isTrough = false;
          break;
        }
      }
      
      if (isTrough) {
        // Check prominence
        const leftMax = Math.max(...values.slice(Math.max(0, i - 20), i));
        const rightMax = Math.max(...values.slice(i + 1, Math.min(values.length, i + 21)));
        const prominence = (Math.min(leftMax, rightMax) - currentValue) / currentValue;
        
        if (prominence >= minProminence) {
          troughs.push({ index: i, value: currentValue });
        }
      }
    }
    
    return troughs;
  }

  private static calculatePatternConfidence(points: { index: number, value: number }[], patternType: string): number {
    let confidence = 0.5; // Base confidence
    
    switch (patternType) {
      case 'DOUBLE_TOP':
      case 'DOUBLE_BOTTOM':
        if (points.length === 2) {
          const priceDiff = Math.abs(points[0].value - points[1].value);
          const avgPrice = (points[0].value + points[1].value) / 2;
          const similarity = 1 - (priceDiff / avgPrice);
          const timeSeparation = Math.abs(points[1].index - points[0].index);
          
          confidence = Math.min(0.95, 0.3 + (similarity * 0.4) + (Math.min(timeSeparation / 30, 1) * 0.25));
        }
        break;
        
      case 'HEAD_AND_SHOULDERS':
      case 'INVERSE_HEAD_AND_SHOULDERS':
        if (points.length === 3) {
          const [left, head, right] = points;
          const shoulderSimilarity = 1 - Math.abs(left.value - right.value) / ((left.value + right.value) / 2);
          const headProminence = patternType === 'HEAD_AND_SHOULDERS' ?
            (head.value - Math.max(left.value, right.value)) / head.value :
            (Math.min(left.value, right.value) - head.value) / Math.min(left.value, right.value);
          
          confidence = Math.min(0.9, 0.2 + (shoulderSimilarity * 0.4) + (headProminence * 0.3));
        }
        break;
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private static findLowestBetween(data: CandlestickData[], startIndex: number, endIndex: number): CandlestickData | null {
    if (startIndex >= endIndex || startIndex < 0 || endIndex >= data.length) return null;
    
    let lowest = data[startIndex];
    for (let i = startIndex; i <= endIndex; i++) {
      if (data[i].low < lowest.low) {
        lowest = data[i];
      }
    }
    return lowest;
  }

  private static findHighestBetween(data: CandlestickData[], startIndex: number, endIndex: number): CandlestickData | null {
    if (startIndex >= endIndex || startIndex < 0 || endIndex >= data.length) return null;
    
    let highest = data[startIndex];
    for (let i = startIndex; i <= endIndex; i++) {
      if (data[i].high > highest.high) {
        highest = data[i];
      }
    }
    return highest;
  }

  private static calculateNeckline(data: CandlestickData[], peaks: { index: number, value: number }[]): number {
    // Find the valleys between peaks and calculate neckline
    const valleys: number[] = [];
    
    for (let i = 0; i < peaks.length - 1; i++) {
      const valley = this.findLowestBetween(data, peaks[i].index, peaks[i + 1].index);
      if (valley) valleys.push(valley.low);
    }
    
    return valleys.length > 0 ? valleys.reduce((sum, val) => sum + val, 0) / valleys.length : 
           peaks.reduce((sum, peak) => sum + peak.value, 0) / peaks.length * 0.95;
  }

  private static findTrendLine(points: { index: number, value: number }[], expectedDirection: 'ascending' | 'descending') {
    if (points.length < 2) return null;
    
    // Simple linear regression
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.index, 0);
    const sumY = points.reduce((sum, p) => sum + p.value, 0);
    const sumXY = points.reduce((sum, p) => sum + (p.index * p.value), 0);
    const sumXX = points.reduce((sum, p) => sum + (p.index * p.index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Check if slope matches expected direction
    const isValidDirection = expectedDirection === 'ascending' ? slope > 0 : slope < 0;
    
    if (!isValidDirection) return null;
    
    return {
      slope,
      intercept,
      startIndex: points[0].index,
      endIndex: points[points.length - 1].index,
      direction: expectedDirection,
      rSquared: this.calculateRSquared(points, slope, intercept)
    };
  }

  private static findConvergence(line1: any, line2: any) {
    if (Math.abs(line1.slope - line2.slope) < 0.0001) return null; // Parallel lines
    
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    
    return {
      x,
      y,
      distance: Math.abs(x - Math.max(line1.endIndex, line2.endIndex))
    };
  }

  private static calculateRSquared(points: { index: number, value: number }[], slope: number, intercept: number): number {
    const yMean = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (const point of points) {
      const predicted = slope * point.index + intercept;
      ssRes += Math.pow(point.value - predicted, 2);
      ssTot += Math.pow(point.value - yMean, 2);
    }
    
    return ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  }

  private static analyzePriceLevelBehavior(data: CandlestickData[], level: number, tolerance: number): {
    isSupport: boolean, isResistance: boolean
  } {
    let supportBounces = 0;
    let resistanceRejections = 0;
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      // Check for support behavior
      if (current.low <= level * (1 + tolerance) && current.low >= level * (1 - tolerance)) {
        if (current.close > current.open && previous.close < previous.open) {
          supportBounces++;
        }
      }
      
      // Check for resistance behavior
      if (current.high <= level * (1 + tolerance) && current.high >= level * (1 - tolerance)) {
        if (current.close < current.open && previous.close > previous.open) {
          resistanceRejections++;
        }
      }
    }
    
    return {
      isSupport: supportBounces >= 2,
      isResistance: resistanceRejections >= 2
    };
  }

  private static calculateLevelStrength(touches: number, dataLength: number, isSupport: boolean, isResistance: boolean): number {
    let strength = (touches / dataLength) * 100; // Base strength from frequency
    
    if (isSupport && isResistance) strength *= 1.5; // Both support and resistance
    else if (isSupport || isResistance) strength *= 1.2; // Either support or resistance
    
    return Math.min(10, strength); // Cap at 10
  }
}
