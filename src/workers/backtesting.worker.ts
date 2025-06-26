// Backtesting worker for strategy execution in parallel
interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  commission: number;
  signal?: any;
}

interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  equity: number[];
  trades: Trade[];
}

export class BacktestingWorker {
  onmessage = (e: MessageEvent) => {
    const { type, data, id } = e.data;
    
    try {
      let result;
      
      switch (type) {
        case 'RUN_BACKTEST':
          result = this.runBacktest(data.strategy, data.data, data.config);
          break;
        case 'CALCULATE_PERFORMANCE_METRICS':
          result = this.calculatePerformanceMetrics(data.trades, data.equity, data.config);
          break;
        case 'OPTIMIZE_PARAMETERS':
          result = this.optimizeParameters(data.strategy, data.data, data.parameterRanges);
          break;
        default:
          throw new Error(`Unknown backtest type: ${type}`);
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

  private runBacktest(strategy: any, data: HistoricalData[], config: any): BacktestResult {
    const trades: Trade[] = [];
    let capital = config.initialCapital;
    let position = 0;
    const equity: number[] = [capital];
    let maxEquity = capital;
    let maxDrawdown = 0;

    const commission = config.commission || 0.001; // 0.1%
    const slippage = config.slippage || 0.0005; // 0.05%

    // Calculate technical indicators for the entire dataset
    const indicators = this.calculateIndicatorsForBacktest(data);

    for (let i = config.warmupPeriod || 50; i < data.length; i++) {
      const currentBar = data[i];
      const signals = this.generateSignals(strategy, data.slice(0, i + 1), indicators, i, position, capital);

      // Process buy signal
      if (signals.buy && position <= 0) {
        const riskAmount = capital * (config.riskPerTrade || 0.02); // 2% risk per trade
        const stopLossDistance = signals.stopLoss || (currentBar.close * 0.02);
        const orderSize = Math.floor(riskAmount / stopLossDistance);
        const entryPrice = currentBar.close * (1 + slippage);
        const cost = orderSize * entryPrice * (1 + commission);

        if (cost <= capital && orderSize > 0) {
          position = orderSize;
          capital -= cost;
          
          trades.push({
            type: 'BUY',
            price: entryPrice,
            quantity: orderSize,
            timestamp: currentBar.timestamp,
            commission: cost * commission,
            signal: signals
          });
        }
      }

      // Process sell signal
      if (signals.sell && position > 0) {
        const exitPrice = currentBar.close * (1 - slippage);
        const proceeds = position * exitPrice * (1 - commission);
        capital += proceeds;

        trades.push({
          type: 'SELL',
          price: exitPrice,
          quantity: position,
          timestamp: currentBar.timestamp,
          commission: proceeds * commission,
          signal: signals
        });

        position = 0;
      }

      // Update equity curve
      const currentEquity = capital + (position * currentBar.close);
      equity.push(currentEquity);

      // Track drawdown
      if (currentEquity > maxEquity) {
        maxEquity = currentEquity;
      } else {
        const drawdown = (maxEquity - currentEquity) / maxEquity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    return this.calculatePerformanceMetrics(trades, equity, config);
  }

  private generateSignals(strategy: any, data: HistoricalData[], indicators: any, currentIndex: number, position: number, capital: number) {
    // Basic strategy signal generation
    const current = data[currentIndex];
    const previous = data[currentIndex - 1];
    
    if (!current || !previous) return { buy: false, sell: false };

    // Get indicators for current position
    const rsi = indicators.rsi[currentIndex];
    const macd = indicators.macd[currentIndex];
    const ema20 = indicators.ema20[currentIndex];
    const ema50 = indicators.ema50[currentIndex];

    let buy = false;
    let sell = false;

    // Simple strategy logic (can be customized based on strategy type)
    switch (strategy.type) {
      case 'RSI_MEAN_REVERSION':
        buy = rsi < 30 && current.close > previous.close;
        sell = rsi > 70 && current.close < previous.close;
        break;
      
      case 'MACD_CROSSOVER':
        const prevMacd = indicators.macd[currentIndex - 1];
        buy = macd > 0 && prevMacd <= 0 && current.close > ema20;
        sell = macd < 0 && prevMacd >= 0 && current.close < ema20;
        break;
      
      case 'EMA_CROSSOVER':
        const prevEma20 = indicators.ema20[currentIndex - 1];
        const prevEma50 = indicators.ema50[currentIndex - 1];
        buy = ema20 > ema50 && prevEma20 <= prevEma50;
        sell = ema20 < ema50 && prevEma20 >= prevEma50;
        break;
      
      default:
        // Combined strategy
        buy = (rsi < 40 && ema20 > ema50 && current.close > ema20) || 
              (macd > 0 && current.close > previous.close);
        sell = (rsi > 60 && ema20 < ema50 && current.close < ema20) ||
               (macd < 0 && current.close < previous.close);
    }

    return {
      buy,
      sell,
      stopLoss: current.close * 0.02, // 2% stop loss
      takeProfit: current.close * 0.06 // 6% take profit
    };
  }

  private calculateIndicatorsForBacktest(data: HistoricalData[]) {
    const prices = data.map(d => d.close);
    
    return {
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices),
      ema20: this.calculateEMA(prices, 20),
      ema50: this.calculateEMA(prices, 50),
      sma20: this.calculateSMA(prices, 20)
    };
  }

  private calculatePerformanceMetrics(trades: Trade[], equity: number[], config: any): BacktestResult {
    const initialCapital = config.initialCapital;
    const finalEquity = equity[equity.length - 1];
    const totalReturn = (finalEquity - initialCapital) / initialCapital;
    
    // Calculate trade pairs
    const tradePairs = this.groupTradePairs(trades);
    const profitableTrades = tradePairs.filter(pair => pair.profit > 0);
    const losingTrades = tradePairs.filter(pair => pair.profit <= 0);
    
    // Calculate returns for Sharpe ratio
    const returns = this.calculateReturns(equity);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnStdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0;
    
    // Calculate max drawdown
    const maxDrawdown = this.calculateMaxDrawdown(equity);
    
    // Trade statistics
    const winRate = tradePairs.length > 0 ? profitableTrades.length / tradePairs.length : 0;
    const avgWin = profitableTrades.length > 0 ? 
      profitableTrades.reduce((sum, t) => sum + t.profit, 0) / profitableTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
      Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length) : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * profitableTrades.length) / (avgLoss * losingTrades.length) : 0;

    return {
      totalReturn,
      annualizedReturn: this.annualizeReturn(totalReturn, equity.length),
      sharpeRatio,
      maxDrawdown,
      winRate,
      totalTrades: tradePairs.length,
      profitFactor,
      equity,
      trades
    };
  }

  private groupTradePairs(trades: Trade[]): { profit: number, duration: number }[] {
    const pairs: { profit: number, duration: number }[] = [];
    
    for (let i = 0; i < trades.length - 1; i += 2) {
      const buyTrade = trades[i];
      const sellTrade = trades[i + 1];
      
      if (buyTrade && sellTrade && buyTrade.type === 'BUY' && sellTrade.type === 'SELL') {
        const profit = (sellTrade.price - buyTrade.price) * buyTrade.quantity - 
                      buyTrade.commission - sellTrade.commission;
        const duration = sellTrade.timestamp - buyTrade.timestamp;
        
        pairs.push({ profit, duration });
      }
    }
    
    return pairs;
  }

  private calculateReturns(equity: number[]): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < equity.length; i++) {
      const dailyReturn = (equity[i] - equity[i - 1]) / equity[i - 1];
      returns.push(dailyReturn);
    }
    
    return returns;
  }

  private calculateMaxDrawdown(equity: number[]): number {
    let maxEquity = equity[0];
    let maxDrawdown = 0;
    
    for (const currentEquity of equity) {
      if (currentEquity > maxEquity) {
        maxEquity = currentEquity;
      } else {
        const drawdown = (maxEquity - currentEquity) / maxEquity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }
    
    return maxDrawdown;
  }

  private annualizeReturn(totalReturn: number, periods: number): number {
    const periodsPerYear = 252; // Trading days
    const years = periods / periodsPerYear;
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  // Technical indicator calculations (simplified versions)
  private calculateRSI(prices: number[], period: number): number[] {
    const rsi: number[] = [];
    let gains = 0, losses = 0;

    for (let i = 1; i <= period && i < prices.length; i++) {
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

  private calculateMACD(prices: number[]): number[] {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macd: number[] = [];
    const startIndex = Math.max(0, ema26.length - ema12.length);
    
    for (let i = 0; i < ema12.length - startIndex; i++) {
      macd.push(ema12[i + startIndex] - ema26[i]);
    }
    
    return macd;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    if (prices.length === 0) return ema;
    
    ema.push(prices[0]);
    
    for (let i = 1; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
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

  private optimizeParameters(strategy: any, data: HistoricalData[], parameterRanges: any) {
    // Parameter optimization using grid search
    const results: any[] = [];
    
    // Example: optimize RSI period
    if (parameterRanges.rsiPeriod) {
      const { min, max, step } = parameterRanges.rsiPeriod;
      
      for (let period = min; period <= max; period += step) {
        const modifiedStrategy = { ...strategy, rsiPeriod: period };
        const result = this.runBacktest(modifiedStrategy, data, { initialCapital: 100000 });
        
        results.push({
          parameters: { rsiPeriod: period },
          performance: result
        });
      }
    }
    
    // Sort by Sharpe ratio
    return results.sort((a, b) => b.performance.sharpeRatio - a.performance.sharpeRatio);
  }
}

// Initialize worker
new BacktestingWorker();
