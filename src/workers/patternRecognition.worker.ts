
// Pattern recognition worker for chart pattern detection
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
}

export class PatternRecognitionWorker {
  onmessage = (e: MessageEvent) => {
    const { type, data, id } = e.data;
    
    try {
      let result;
      
      switch (type) {
        case 'DETECT_DOUBLE_TOP':
          result = this.detectDoubleTop(data.candles);
          break;
        case 'DETECT_DOUBLE_BOTTOM':
          result = this.detectDoubleBottom(data.candles);
          break;
        case 'DETECT_HEAD_AND_SHOULDERS':
          result = this.detectHeadAndShoulders(data.candles);
          break;
        case 'DETECT_TRIANGLES':
          result = this.detectTriangles(data.candles);
          break;
        case 'DETECT_SUPPORT_RESISTANCE':
          result = this.detectSupportResistance(data.candles);
          break;
        case 'DETECT_ALL_PATTERNS':
          result = this.detectAllPatterns(data.candles);
          break;
        default:
          throw new Error(`Unknown pattern type: ${type}`);
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

  private detectDoubleTop(candles: CandlestickData[]): Pattern | null {
    if (candles.length < 30) return null;
    
    const peaks = this.findPeaks(candles.map(c => c.high));
    if (peaks.length < 2) return null;
    
    const lastTwoPeaks = peaks.slice(-2);
    const [peak1, peak2] = lastTwoPeaks;
    
    const priceDifference = Math.abs(peak1.value - peak2.value);
    const avgPrice = (peak1.value + peak2.value) / 2;
    const tolerance = 0.02; // 2%
    
    if (priceDifference / avgPrice <= tolerance && peak2.index - peak1.index >= 10) {
      return {
        type: 'DOUBLE_TOP',
        confidence: this.calculatePatternConfidence([peak1, peak2], 'DOUBLE_TOP'),
        startIndex: peak1.index,
        endIndex: peak2.index,
        description: 'Bearish reversal pattern with two similar peaks',
        signals: ['SELL', 'RESISTANCE_BREAK']
      };
    }
    
    return null;
  }

  private detectDoubleBottom(candles: CandlestickData[]): Pattern | null {
    if (candles.length < 30) return null;
    
    const troughs = this.findTroughs(candles.map(c => c.low));
    if (troughs.length < 2) return null;
    
    const lastTwoTroughs = troughs.slice(-2);
    const [trough1, trough2] = lastTwoTroughs;
    
    const priceDifference = Math.abs(trough1.value - trough2.value);
    const avgPrice = (trough1.value + trough2.value) / 2;
    const tolerance = 0.02; // 2%
    
    if (priceDifference / avgPrice <= tolerance && trough2.index - trough1.index >= 10) {
      return {
        type: 'DOUBLE_BOTTOM',
        confidence: this.calculatePatternConfidence([trough1, trough2], 'DOUBLE_BOTTOM'),
        startIndex: trough1.index,
        endIndex: trough2.index,
        description: 'Bullish reversal pattern with two similar troughs',
        signals: ['BUY', 'SUPPORT_BREAK']
      };
    }
    
    return null;
  }

  private detectHeadAndShoulders(candles: CandlestickData[]): Pattern | null {
    if (candles.length < 50) return null;
    
    const peaks = this.findPeaks(candles.map(c => c.high));
    if (peaks.length < 3) return null;
    
    const lastThreePeaks = peaks.slice(-3);
    const [leftShoulder, head, rightShoulder] = lastThreePeaks;
    
    // Head should be higher than both shoulders
    if (head.value > leftShoulder.value && head.value > rightShoulder.value) {
      const shoulderDiff = Math.abs(leftShoulder.value - rightShoulder.value);
      const avgShoulder = (leftShoulder.value + rightShoulder.value) / 2;
      
      if (shoulderDiff / avgShoulder <= 0.05) { // 5% tolerance
        return {
          type: 'HEAD_AND_SHOULDERS',
          confidence: this.calculatePatternConfidence(lastThreePeaks, 'HEAD_AND_SHOULDERS'),
          startIndex: leftShoulder.index,
          endIndex: rightShoulder.index,
          description: 'Bearish reversal pattern with head higher than shoulders',
          signals: ['SELL', 'NECKLINE_BREAK']
        };
      }
    }
    
    return null;
  }

  private detectTriangles(candles: CandlestickData[]): Pattern | null {
    if (candles.length < 40) return null;
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Find trend lines
    const upperTrendLine = this.findTrendLine(this.findPeaks(highs), 'descending');
    const lowerTrendLine = this.findTrendLine(this.findTroughs(lows), 'ascending');
    
    if (upperTrendLine && lowerTrendLine) {
      const convergencePoint = this.findConvergence(upperTrendLine, lowerTrendLine);
      
      if (convergencePoint && convergencePoint.distance < 50) {
        return {
          type: 'ASCENDING_TRIANGLE',
          confidence: 0.75,
          startIndex: Math.min(upperTrendLine.startIndex, lowerTrendLine.startIndex),
          endIndex: Math.max(upperTrendLine.endIndex, lowerTrendLine.endIndex),
          description: 'Bullish continuation pattern with converging trend lines',
          signals: ['BUY_ON_BREAKOUT', 'VOLUME_CONFIRMATION']
        };
      }
    }
    
    return null;
  }

  private detectSupportResistance(candles: CandlestickData[]): { support: number[], resistance: number[] } {
    const tolerance = 0.015; // 1.5%
    const minTouches = 3;
    
    const allPrices = candles.flatMap(c => [c.high, c.low, c.close]);
    const priceMap = new Map<number, { count: number, type: 'support' | 'resistance' | 'both' }>();
    
    // Group similar prices
    allPrices.forEach(price => {
      let foundLevel = false;
      for (const [level, data] of priceMap) {
        if (Math.abs(price - level) / level <= tolerance) {
          priceMap.set(level, { ...data, count: data.count + 1 });
          foundLevel = true;
          break;
        }
      }
      if (!foundLevel) {
        priceMap.set(price, { count: 1, type: 'both' });
      }
    });
    
    const significantLevels = Array.from(priceMap.entries())
      .filter(([_, data]) => data.count >= minTouches)
      .map(([level, data]) => ({ level, ...data }))
      .sort((a, b) => b.count - a.count);
    
    return {
      support: significantLevels.filter(l => l.type === 'support' || l.type === 'both').map(l => l.level),
      resistance: significantLevels.filter(l => l.type === 'resistance' || l.type === 'both').map(l => l.level)
    };
  }

  private detectAllPatterns(candles: CandlestickData[]): Pattern[] {
    const patterns: Pattern[] = [];
    
    const doubleTop = this.detectDoubleTop(candles);
    if (doubleTop) patterns.push(doubleTop);
    
    const doubleBottom = this.detectDoubleBottom(candles);
    if (doubleBottom) patterns.push(doubleBottom);
    
    const headAndShoulders = this.detectHeadAndShoulders(candles);
    if (headAndShoulders) patterns.push(headAndShoulders);
    
    const triangle = this.detectTriangles(candles);
    if (triangle) patterns.push(triangle);
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private findPeaks(values: number[]): { index: number, value: number }[] {
    const peaks: { index: number, value: number }[] = [];
    const minDistance = 5;
    
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isPeak = true;
      
      // Check if current value is higher than surrounding values
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && values[j] >= values[i]) {
          isPeak = false;
          break;
        }
      }
      
      if (isPeak) {
        peaks.push({ index: i, value: values[i] });
      }
    }
    
    return peaks;
  }

  private findTroughs(values: number[]): { index: number, value: number }[] {
    const troughs: { index: number, value: number }[] = [];
    const minDistance = 5;
    
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isTrough = true;
      
      // Check if current value is lower than surrounding values
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && values[j] <= values[i]) {
          isTrough = false;
          break;
        }
      }
      
      if (isTrough) {
        troughs.push({ index: i, value: values[i] });
      }
    }
    
    return troughs;
  }

  private calculatePatternConfidence(points: { index: number, value: number }[], patternType: string): number {
    // Basic confidence calculation based on pattern characteristics
    let confidence = 0.5; // Base confidence
    
    switch (patternType) {
      case 'DOUBLE_TOP':
      case 'DOUBLE_BOTTOM':
        if (points.length === 2) {
          const priceDiff = Math.abs(points[0].value - points[1].value);
          const avgPrice = (points[0].value + points[1].value) / 2;
          const similarity = 1 - (priceDiff / avgPrice);
          confidence = Math.min(0.95, 0.5 + (similarity * 0.45));
        }
        break;
      case 'HEAD_AND_SHOULDERS':
        if (points.length === 3) {
          const [left, head, right] = points;
          const shoulderSimilarity = 1 - Math.abs(left.value - right.value) / ((left.value + right.value) / 2);
          const headHeight = (head.value - Math.max(left.value, right.value)) / head.value;
          confidence = Math.min(0.9, 0.4 + (shoulderSimilarity * 0.3) + (headHeight * 0.2));
        }
        break;
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private findTrendLine(points: { index: number, value: number }[], direction: 'ascending' | 'descending') {
    if (points.length < 2) return null;
    
    // Simple linear regression for trend line
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.index, 0);
    const sumY = points.reduce((sum, p) => sum + p.value, 0);
    const sumXY = points.reduce((sum, p) => sum + (p.index * p.value), 0);
    const sumXX = points.reduce((sum, p) => sum + (p.index * p.index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
      slope,
      intercept,
      startIndex: points[0].index,
      endIndex: points[points.length - 1].index,
      direction
    };
  }

  private findConvergence(line1: any, line2: any) {
    // Find intersection point of two trend lines
    if (Math.abs(line1.slope - line2.slope) < 0.001) return null; // Parallel lines
    
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    
    return {
      x,
      y,
      distance: Math.abs(x - Math.max(line1.endIndex, line2.endIndex))
    };
  }
}

// Initialize worker
new PatternRecognitionWorker();
