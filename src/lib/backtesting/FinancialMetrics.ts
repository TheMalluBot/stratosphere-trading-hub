
import { StrategySignal, MarketData } from '@/types/strategy';

export interface FinancialMetricsResult {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  winRate: number;
  profitFactor: number;
  informationRatio: number;
  ulcerIndex: number;
  var95: number;
  cvar95: number;
  expectedShortfall: number;
  beta: number;
  alpha: number;
  treynorRatio: number;
  trackingError: number;
}

export class FinancialMetrics {
  private static readonly TRADING_DAYS_PER_YEAR = 252;
  private static readonly RISK_FREE_RATE = 0.02; // 2% annual risk-free rate

  static calculateAllMetrics(
    signals: StrategySignal[],
    marketData: MarketData[]
  ): FinancialMetricsResult {
    const returns = this.calculateReturns(signals, marketData);
    const benchmarkReturns = this.calculateBenchmarkReturns(marketData);
    const equityCurve = this.calculateEquityCurve(returns);
    const drawdowns = this.calculateDrawdowns(equityCurve);
    
    return {
      totalReturn: this.calculateTotalReturn(returns),
      annualizedReturn: this.calculateAnnualizedReturn(returns),
      volatility: this.calculateVolatility(returns),
      sharpeRatio: this.calculateSharpeRatio(returns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      calmarRatio: this.calculateCalmarRatio(returns, drawdowns),
      maxDrawdown: this.calculateMaxDrawdown(drawdowns),
      maxDrawdownDuration: this.calculateMaxDrawdownDuration(drawdowns),
      winRate: this.calculateWinRate(returns),
      profitFactor: this.calculateProfitFactor(returns),
      informationRatio: this.calculateInformationRatio(returns, benchmarkReturns),
      ulcerIndex: this.calculateUlcerIndex(drawdowns),
      var95: this.calculateVaR(returns, 0.95),
      cvar95: this.calculateCVaR(returns, 0.95),
      expectedShortfall: this.calculateExpectedShortfall(returns, 0.05),
      beta: this.calculateBeta(returns, benchmarkReturns),
      alpha: this.calculateAlpha(returns, benchmarkReturns),
      treynorRatio: this.calculateTreynorRatio(returns, benchmarkReturns),
      trackingError: this.calculateTrackingError(returns, benchmarkReturns)
    };
  }

  private static calculateReturns(signals: StrategySignal[], marketData: MarketData[]): number[] {
    const returns: number[] = [];
    let position = 0;
    let entryPrice = 0;
    let entryTime = 0;
    
    for (const signal of signals) {
      if (position === 0) {
        // Enter position
        position = signal.type === 'BUY' ? 1 : -1;
        entryPrice = signal.price;
        entryTime = signal.timestamp;
      } else if ((position > 0 && signal.type === 'SELL') || (position < 0 && signal.type === 'BUY')) {
        // Exit position
        const holdingPeriod = Math.max(1, (signal.timestamp - entryTime) / (1000 * 60 * 60 * 24)); // days
        const rawReturn = position > 0 
          ? (signal.price - entryPrice) / entryPrice
          : (entryPrice - signal.price) / entryPrice;
        
        // Adjust for holding period (annualize if held for different periods)
        const adjustedReturn = rawReturn;
        returns.push(adjustedReturn);
        position = 0;
      }
    }
    
    return returns.filter(r => isFinite(r) && !isNaN(r));
  }

  private static calculateBenchmarkReturns(marketData: MarketData[]): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < marketData.length; i++) {
      const returnRate = (marketData[i].close - marketData[i-1].close) / marketData[i-1].close;
      if (isFinite(returnRate) && !isNaN(returnRate)) {
        returns.push(returnRate);
      }
    }
    
    return returns;
  }

  private static calculateEquityCurve(returns: number[]): number[] {
    const curve = [1.0]; // Start with normalized equity of 1.0
    
    for (const returnRate of returns) {
      const newEquity = curve[curve.length - 1] * (1 + returnRate);
      curve.push(newEquity);
    }
    
    return curve;
  }

  private static calculateDrawdowns(equityCurve: number[]): number[] {
    const drawdowns: number[] = [];
    let peak = equityCurve[0];
    
    for (const equity of equityCurve) {
      if (equity > peak) {
        peak = equity;
      }
      
      const drawdown = (peak - equity) / peak;
      drawdowns.push(drawdown);
    }
    
    return drawdowns;
  }

  private static calculateTotalReturn(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    return returns.reduce((total, ret) => total * (1 + ret), 1) - 1;
  }

  private static calculateAnnualizedReturn(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const totalReturn = this.calculateTotalReturn(returns);
    const years = returns.length / this.TRADING_DAYS_PER_YEAR;
    
    if (years <= 0) return totalReturn;
    
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance * this.TRADING_DAYS_PER_YEAR);
  }

  private static calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const volatility = this.calculateVolatility(returns);
    
    if (volatility === 0) return annualizedReturn > 0 ? Infinity : 0;
    
    return (annualizedReturn - this.RISK_FREE_RATE) / volatility;
  }

  private static calculateSortinoRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const negativeReturns = returns.filter(ret => ret < 0);
    
    if (negativeReturns.length === 0) return annualizedReturn > 0 ? Infinity : 0;
    
    const downsideVariance = negativeReturns.reduce((sum, ret) => sum + ret * ret, 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance * this.TRADING_DAYS_PER_YEAR);
    
    if (downsideDeviation === 0) return annualizedReturn > 0 ? Infinity : 0;
    
    return (annualizedReturn - this.RISK_FREE_RATE) / downsideDeviation;
  }

  private static calculateCalmarRatio(returns: number[], drawdowns: number[]): number {
    if (returns.length === 0 || drawdowns.length === 0) return 0;
    
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const maxDrawdown = Math.max(...drawdowns);
    
    if (maxDrawdown === 0) return annualizedReturn > 0 ? Infinity : 0;
    
    return annualizedReturn / maxDrawdown;
  }

  private static calculateMaxDrawdown(drawdowns: number[]): number {
    if (drawdowns.length === 0) return 0;
    return Math.max(...drawdowns);
  }

  private static calculateMaxDrawdownDuration(drawdowns: number[]): number {
    let maxDuration = 0;
    let currentDuration = 0;
    
    for (const drawdown of drawdowns) {
      if (drawdown > 0) {
        currentDuration++;
        maxDuration = Math.max(maxDuration, currentDuration);
      } else {
        currentDuration = 0;
      }
    }
    
    return maxDuration;
  }

  private static calculateWinRate(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const winningTrades = returns.filter(ret => ret > 0).length;
    return (winningTrades / returns.length) * 100;
  }

  private static calculateProfitFactor(returns: number[]): number {
    const grossProfit = returns.filter(ret => ret > 0).reduce((sum, ret) => sum + ret, 0);
    const grossLoss = Math.abs(returns.filter(ret => ret < 0).reduce((sum, ret) => sum + ret, 0));
    
    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
    
    return grossProfit / grossLoss;
  }

  private static calculateInformationRatio(returns: number[], benchmarkReturns: number[]): number {
    if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
    
    const minLength = Math.min(returns.length, benchmarkReturns.length);
    const excessReturns = returns.slice(0, minLength).map((ret, i) => ret - benchmarkReturns[i]);
    
    const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
    const trackingError = this.calculateStandardDeviation(excessReturns);
    
    if (trackingError === 0) return meanExcessReturn > 0 ? Infinity : 0;
    
    return (meanExcessReturn * this.TRADING_DAYS_PER_YEAR) / (trackingError * Math.sqrt(this.TRADING_DAYS_PER_YEAR));
  }

  private static calculateUlcerIndex(drawdowns: number[]): number {
    if (drawdowns.length === 0) return 0;
    
    const squaredDrawdowns = drawdowns.map(dd => dd * dd);
    const meanSquaredDrawdown = squaredDrawdowns.reduce((sum, dd) => sum + dd, 0) / squaredDrawdowns.length;
    
    return Math.sqrt(meanSquaredDrawdown) * 100;
  }

  private static calculateVaR(returns: number[], confidenceLevel: number): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.max(0, Math.floor((1 - confidenceLevel) * sortedReturns.length) - 1);
    
    return Math.abs(sortedReturns[index] || 0) * 100;
  }

  private static calculateCVaR(returns: number[], confidenceLevel: number): number {
    if (returns.length === 0) return 0;
    
    const var95 = this.calculateVaR(returns, confidenceLevel) / 100;
    const tailReturns = returns.filter(ret => ret <= -var95);
    
    if (tailReturns.length === 0) return 0;
    
    return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length) * 100;
  }

  private static calculateExpectedShortfall(returns: number[], alpha: number): number {
    const var_alpha = this.calculateVaR(returns, 1 - alpha) / 100;
    const tailReturns = returns.filter(ret => ret <= -var_alpha);
    
    if (tailReturns.length === 0) return 0;
    
    return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length) * 100;
  }

  private static calculateBeta(returns: number[], benchmarkReturns: number[]): number {
    if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
    
    const minLength = Math.min(returns.length, benchmarkReturns.length);
    const strategyReturns = returns.slice(0, minLength);
    const marketReturns = benchmarkReturns.slice(0, minLength);
    
    const covariance = this.calculateCovariance(strategyReturns, marketReturns);
    const marketVariance = this.calculateVariance(marketReturns);
    
    if (marketVariance === 0) return 0;
    
    return covariance / marketVariance;
  }

  private static calculateAlpha(returns: number[], benchmarkReturns: number[]): number {
    const strategyReturn = this.calculateAnnualizedReturn(returns);
    const marketReturn = this.calculateAnnualizedReturn(benchmarkReturns);
    const beta = this.calculateBeta(returns, benchmarkReturns);
    
    return strategyReturn - (this.RISK_FREE_RATE + beta * (marketReturn - this.RISK_FREE_RATE));
  }

  private static calculateTreynorRatio(returns: number[], benchmarkReturns: number[]): number {
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const beta = this.calculateBeta(returns, benchmarkReturns);
    
    if (beta === 0) return annualizedReturn > 0 ? Infinity : 0;
    
    return (annualizedReturn - this.RISK_FREE_RATE) / beta;
  }

  private static calculateTrackingError(returns: number[], benchmarkReturns: number[]): number {
    if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
    
    const minLength = Math.min(returns.length, benchmarkReturns.length);
    const excessReturns = returns.slice(0, minLength).map((ret, i) => ret - benchmarkReturns[i]);
    
    return this.calculateStandardDeviation(excessReturns) * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
  }

  // Helper methods
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    
    return Math.sqrt(variance);
  }

  private static calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  }

  private static calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    return x.reduce((sum, xVal, i) => sum + (xVal - meanX) * (y[i] - meanY), 0) / (x.length - 1);
  }
}
