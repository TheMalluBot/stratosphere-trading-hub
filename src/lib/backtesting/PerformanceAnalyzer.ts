import { StrategyResult, MarketData, EnhancedPerformance } from '@/types/strategy';

export class PerformanceAnalyzer {
  async enhanceResults(
    results: StrategyResult[],
    marketData: MarketData[]
  ): Promise<StrategyResult[]> {
    return results.map(result => ({
      ...result,
      performance: {
        ...result.performance,
        ...this.calculateAdvancedMetrics(result, marketData)
      }
    }));
  }

  private calculateAdvancedMetrics(
    result: StrategyResult,
    marketData: MarketData[]
  ): EnhancedPerformance {
    const returns = this.calculateReturns(result, marketData);
    const drawdowns = this.calculateDrawdowns(returns);
    
    return {
      calmarRatio: this.calculateCalmarRatio(returns, drawdowns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      informationRatio: this.calculateInformationRatio(returns, marketData),
      maxAdverseExcursion: this.calculateMAE(result),
      maxFavorableExcursion: this.calculateMFE(result),
      profitFactor: this.calculateProfitFactor(result),
      recoveryFactor: this.calculateRecoveryFactor(returns, drawdowns),
      ulcerIndex: this.calculateUlcerIndex(returns),
      expectedReturn: this.calculateExpectedReturn(returns),
      standardDeviation: this.calculateStandardDeviation(returns),
      downside_deviation: this.calculateDownsideDeviation(returns),
      var95: this.calculateVaR(returns, 0.95),
      cvar95: this.calculateCVaR(returns, 0.95)
    };
  }

  private calculateReturns(result: StrategyResult, marketData: MarketData[]): number[] {
    const returns: number[] = [];
    let position = 0;
    let entryPrice = 0;
    
    for (const signal of result.signals) {
      if (signal.type === 'BUY' && position === 0) {
        position = 1;
        entryPrice = signal.price;
      } else if (signal.type === 'SELL' && position === 1) {
        const return_ = (signal.price - entryPrice) / entryPrice;
        returns.push(return_);
        position = 0;
      }
    }
    
    return returns;
  }

  private calculateDrawdowns(returns: number[]): number[] {
    const cumReturns = returns.reduce((acc, ret, i) => {
      acc.push(i === 0 ? (1 + ret) : acc[i - 1] * (1 + ret));
      return acc;
    }, [] as number[]);

    const drawdowns: number[] = [];
    let peak = 1;

    for (const value of cumReturns) {
      if (value > peak) peak = value;
      drawdowns.push((value - peak) / peak);
    }

    return drawdowns;
  }

  private calculateCalmarRatio(returns: number[], drawdowns: number[]): number {
    const annualReturn = this.calculateAnnualizedReturn(returns);
    const maxDrawdown = Math.min(...drawdowns);
    return maxDrawdown !== 0 ? annualReturn / Math.abs(maxDrawdown) : 0;
  }

  private calculateSortinoRatio(returns: number[]): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const downsideReturns = returns.filter(ret => ret < 0);
    
    if (downsideReturns.length === 0) return Infinity;
    
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((sum, ret) => sum + ret * ret, 0) / downsideReturns.length
    );
    
    return downsideDeviation !== 0 ? (meanReturn * Math.sqrt(252)) / (downsideDeviation * Math.sqrt(252)) : 0;
  }

  private calculateInformationRatio(returns: number[], marketData: MarketData[]): number {
    const benchmarkReturns = this.calculateBenchmarkReturns(marketData);
    const excessReturns = returns.map((ret, i) => ret - (benchmarkReturns[i] || 0));
    
    const meanExcess = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
    const trackingError = this.calculateStandardDeviation(excessReturns);
    
    return trackingError !== 0 ? meanExcess / trackingError : 0;
  }

  private calculateBenchmarkReturns(marketData: MarketData[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < marketData.length; i++) {
      returns.push((marketData[i].close - marketData[i - 1].close) / marketData[i - 1].close);
    }
    return returns;
  }

  private calculateMAE(result: StrategyResult): number {
    // Simplified MAE calculation
    return result.signals.reduce((maxAdverse, signal) => {
      const adverse = signal.metadata?.adverse || 0;
      return Math.min(maxAdverse, adverse);
    }, 0);
  }

  private calculateMFE(result: StrategyResult): number {
    // Simplified MFE calculation
    return result.signals.reduce((maxFavorable, signal) => {
      const favorable = signal.metadata?.favorable || 0;
      return Math.max(maxFavorable, favorable);
    }, 0);
  }

  private calculateProfitFactor(result: StrategyResult): number {
    let grossProfit = 0;
    let grossLoss = 0;
    let position = 0;
    let entryPrice = 0;

    for (const signal of result.signals) {
      if (signal.type === 'BUY' && position === 0) {
        position = 1;
        entryPrice = signal.price;
      } else if (signal.type === 'SELL' && position === 1) {
        const pnl = signal.price - entryPrice;
        if (pnl > 0) grossProfit += pnl;
        else grossLoss += Math.abs(pnl);
        position = 0;
      }
    }

    return grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  }

  private calculateRecoveryFactor(returns: number[], drawdowns: number[]): number {
    const totalReturn = this.calculateAnnualizedReturn(returns);
    const maxDrawdown = Math.abs(Math.min(...drawdowns));
    return maxDrawdown !== 0 ? totalReturn / maxDrawdown : 0;
  }

  private calculateUlcerIndex(returns: number[]): number {
    const cumReturns = returns.reduce((acc, ret, i) => {
      acc.push(i === 0 ? (1 + ret) : acc[i - 1] * (1 + ret));
      return acc;
    }, [] as number[]);

    let peak = 1;
    const drawdownsSquared: number[] = [];

    for (const value of cumReturns) {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak * 100;
      drawdownsSquared.push(drawdown * drawdown);
    }

    const meanSquaredDrawdown = drawdownsSquared.reduce((sum, dd) => sum + dd, 0) / drawdownsSquared.length;
    return Math.sqrt(meanSquaredDrawdown);
  }

  private calculateExpectedReturn(returns: number[]): number {
    return returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  }

  private calculateStandardDeviation(returns: number[]): number {
    const mean = this.calculateExpectedReturn(returns);
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateDownsideDeviation(returns: number[]): number {
    const negativeReturns = returns.filter(ret => ret < 0);
    if (negativeReturns.length === 0) return 0;
    
    const variance = negativeReturns.reduce((sum, ret) => sum + ret * ret, 0) / negativeReturns.length;
    return Math.sqrt(variance);
  }

  private calculateAnnualizedReturn(returns: number[]): number {
    const totalReturn = returns.reduce((product, ret) => product * (1 + ret), 1) - 1;
    const years = returns.length / 252; // Assuming daily returns
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const var95 = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(ret => ret <= var95);
    return tailReturns.length > 0 ? tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length : 0;
  }
}
