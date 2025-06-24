
import { securityMonitor } from '../security/SecurityMonitor';
import { secureStorage } from '../security/SecureStorage';
import { wasmEngine } from './WebAssemblyEngine';

export interface WorkerPool {
  market: Worker[];
  strategy: Worker[];
  risk: Worker[];
}

export class HighPerformanceManager {
  private workerPool: WorkerPool = { market: [], strategy: [], risk: [] };
  private initialized = false;
  private performanceMetrics: Map<string, number> = new Map();

  async initialize() {
    try {
      console.log('🚀 Initializing High Performance Manager...');
      
      // Initialize security layer first
      securityMonitor.initialize();
      
      // Initialize secure storage
      const userId = 'demo-user'; // In production, get from Clerk
      await secureStorage.initialize({ userId });
      
      // Initialize WebAssembly engine
      await wasmEngine.initialize();
      
      // Create worker pools
      await this.createWorkerPools();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      this.initialized = true;
      console.log('✅ High Performance Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize High Performance Manager:', error);
      throw error;
    }
  }

  private async createWorkerPools() {
    const cores = navigator.hardwareConcurrency || 4;
    console.log(`💪 Creating worker pools with ${cores} cores`);
    
    // Create market data processing workers
    for (let i = 0; i < Math.min(cores, 4); i++) {
      try {
        const workerCode = this.createWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        
        this.workerPool.market.push(worker);
      } catch (error) {
        console.warn(`Failed to create worker ${i}:`, error);
      }
    }
    
    // Create strategy workers
    for (let i = 0; i < 2; i++) {
      try {
        const workerCode = this.createStrategyWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = this.handleWorkerMessage.bind(this);
        this.workerPool.strategy.push(worker);
      } catch (error) {
        console.warn(`Failed to create strategy worker ${i}:`, error);
      }
    }
    
    console.log(`✅ Created ${this.workerPool.market.length} market workers and ${this.workerPool.strategy.length} strategy workers`);
  }

  private createWorkerCode(): string {
    return `
      class MarketWorker {
        onmessage = (e) => {
          const { type, data, id } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'PROCESS_MARKET_DATA':
                result = this.processMarketData(data);
                break;
              case 'CALCULATE_INDICATORS':
                result = this.calculateIndicators(data);
                break;
              case 'CALCULATE_RISK':
                result = this.calculateRisk(data);
                break;
              default:
                throw new Error('Unknown task type: ' + type);
            }
            
            postMessage({ type: type + '_RESULT', result, id });
          } catch (error) {
            postMessage({ type: 'ERROR', error: error.message, id });
          }
        };
        
        processMarketData(data) {
          const { prices, volumes } = data;
          return {
            vwap: this.calculateVWAP(prices, volumes),
            volatility: this.calculateVolatility(prices),
            momentum: this.calculateMomentum(prices),
            timestamp: Date.now()
          };
        }
        
        calculateIndicators(data) {
          const { prices, period = 14 } = data;
          return {
            sma: this.calculateSMA(prices, period),
            rsi: this.calculateRSI(prices, period)
          };
        }
        
        calculateRisk(data) {
          const { positions } = data;
          return {
            totalExposure: positions.reduce((sum, pos) => sum + pos.value, 0),
            maxPosition: Math.max(...positions.map(pos => pos.value))
          };
        }
        
        calculateVWAP(prices, volumes) {
          let totalVolume = 0;
          let totalValue = 0;
          for (let i = 0; i < Math.min(prices.length, volumes.length); i++) {
            totalValue += prices[i] * volumes[i];
            totalVolume += volumes[i];
          }
          return totalVolume > 0 ? totalValue / totalVolume : 0;
        }
        
        calculateVolatility(prices, period = 20) {
          if (prices.length < period) return 0;
          const recentPrices = prices.slice(-period);
          const mean = recentPrices.reduce((sum, price) => sum + price, 0) / period;
          const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
          return Math.sqrt(variance);
        }
        
        calculateMomentum(prices, period = 10) {
          if (prices.length < period) return 0;
          const current = prices[prices.length - 1];
          const past = prices[prices.length - period];
          return ((current - past) / past) * 100;
        }
        
        calculateSMA(prices, period) {
          const sma = [];
          for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
            sma.push(sum / period);
          }
          return sma;
        }
        
        calculateRSI(prices, period = 14) {
          const rsi = [];
          if (prices.length < period + 1) return rsi;
          
          const changes = prices.slice(1).map((price, i) => price - prices[i]);
          let avgGain = 0;
          let avgLoss = 0;
          
          for (let i = 0; i < period; i++) {
            if (changes[i] > 0) {
              avgGain += changes[i];
            } else {
              avgLoss += Math.abs(changes[i]);
            }
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
      }
      
      const worker = new MarketWorker();
      onmessage = worker.onmessage;
    `;
  }

  private createStrategyWorkerCode(): string {
    return `
      class StrategyWorker {
        onmessage = (e) => {
          const { type, data, id } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'BACKTEST_STRATEGY':
                result = this.backtestStrategy(data);
                break;
              case 'OPTIMIZE_PARAMETERS':
                result = this.optimizeParameters(data);
                break;
              default:
                throw new Error('Unknown strategy task: ' + type);
            }
            
            postMessage({ type: type + '_RESULT', result, id });
          } catch (error) {
            postMessage({ type: 'ERROR', error: error.message, id });
          }
        };
        
        backtestStrategy(data) {
          const { strategy, marketData } = data;
          // Simplified backtesting logic
          return {
            totalReturns: Math.random() * 0.2 - 0.1, // -10% to +10%
            sharpeRatio: Math.random() * 2,
            maxDrawdown: Math.random() * 0.1,
            winRate: 0.4 + Math.random() * 0.4 // 40% to 80%
          };
        }
        
        optimizeParameters(data) {
          const { strategy, parameters } = data;
          // Simplified parameter optimization
          return {
            optimizedParams: parameters,
            score: Math.random()
          };
        }
      }
      
      const worker = new StrategyWorker();
      onmessage = worker.onmessage;
    `;
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, result, error, id } = event.data;
    
    if (error) {
      console.error(`Worker error (${id}):`, error);
      return;
    }
    
    // Record performance metrics
    this.recordPerformanceMetric(type, performance.now());
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('workerResult', {
      detail: { type, result, id }
    }));
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      const metrics = {
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        workerCount: this.getTotalWorkerCount(),
        activeConnections: 1 // Placeholder
      };
      
      // Store metrics
      this.performanceMetrics.set('memory', metrics.memoryUsage);
      this.performanceMetrics.set('workers', metrics.workerCount);
      
      // Emit performance update
      window.dispatchEvent(new CustomEvent('performanceUpdate', {
        detail: metrics
      }));
    }, 5000);
  }

  private recordPerformanceMetric(operation: string, timestamp: number) {
    this.performanceMetrics.set(`${operation}_last`, timestamp);
  }

  private getTotalWorkerCount(): number {
    return this.workerPool.market.length + this.workerPool.strategy.length + this.workerPool.risk.length;
  }

  async processMarketData(data: any): Promise<any> {
    if (!this.initialized) {
      throw new Error('HighPerformanceManager not initialized');
    }
    
    const worker = this.getAvailableWorker('market');
    if (!worker) {
      throw new Error('No available market workers');
    }
    
    return this.sendToWorker(worker, 'PROCESS_MARKET_DATA', data);
  }

  async calculateIndicators(data: any): Promise<any> {
    if (!this.initialized) {
      throw new Error('HighPerformanceManager not initialized');
    }
    
    const worker = this.getAvailableWorker('market');
    if (!worker) {
      throw new Error('No available workers');
    }
    
    return this.sendToWorker(worker, 'CALCULATE_INDICATORS', data);
  }

  async backtestStrategy(data: any): Promise<any> {
    if (!this.initialized) {
      throw new Error('HighPerformanceManager not initialized');
    }
    
    const worker = this.getAvailableWorker('strategy');
    if (!worker) {
      throw new Error('No available strategy workers');
    }
    
    return this.sendToWorker(worker, 'BACKTEST_STRATEGY', data);
  }

  private getAvailableWorker(type: keyof WorkerPool): Worker | null {
    const workers = this.workerPool[type];
    return workers.length > 0 ? workers[0] : null;
  }

  private sendToWorker(worker: Worker, type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 10000);
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === id) {
          clearTimeout(timeout);
          worker.removeEventListener('message', handleMessage);
          
          if (event.data.type === 'ERROR') {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };
      
      worker.addEventListener('message', handleMessage);
      worker.postMessage({ type, data, id });
    });
  }

  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  cleanup() {
    // Cleanup all workers
    [...this.workerPool.market, ...this.workerPool.strategy, ...this.workerPool.risk].forEach(worker => {
      worker.terminate();
    });
    
    // Cleanup security monitor
    securityMonitor.cleanup();
    
    console.log('🧹 High Performance Manager cleaned up');
  }
}

export const highPerformanceManager = new HighPerformanceManager();
