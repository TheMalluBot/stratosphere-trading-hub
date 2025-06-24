
export class WebAssemblyEngine {
  private wasmModule: any = null;
  private initialized = false;

  async initialize() {
    try {
      // For now, create a JavaScript implementation
      // In production, this would load a compiled WASM module
      this.wasmModule = await this.createJSEngine();
      this.initialized = true;
      console.log('⚡ WebAssembly Engine initialized (JS fallback)');
    } catch (error) {
      console.error('Failed to initialize WASM engine:', error);
      throw error;
    }
  }

  private async createJSEngine() {
    return {
      calculatePositionSize: (accountBalance: number, stopLossDistance: number, riskPercentage: number): number => {
        const riskAmount = accountBalance * (riskPercentage / 100);
        const positionSize = riskAmount / stopLossDistance;
        const riskMultiplier = 0.02;
        const adjustedSize = positionSize * riskMultiplier;
        const maxPosition = accountBalance * 0.1; // 10% max position
        
        return Math.min(adjustedSize, maxPosition);
      },

      calculateTechnicalIndicators: (prices: number[], period: number = 14): number[] => {
        const sma: number[] = [];
        
        for (let i = period - 1; i < prices.length; i++) {
          const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
          sma.push(sum / period);
        }
        
        return sma;
      },

      calculateRSI: (prices: number[], period: number = 14): number[] => {
        const rsi: number[] = [];
        
        if (prices.length < period + 1) return rsi;
        
        // Calculate price changes
        const changes = prices.slice(1).map((price, i) => price - prices[i]);
        
        // Calculate initial average gain and loss
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
        
        // Calculate RSI values
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
          const rsiValue = 100 - (100 / (1 + rs));
          rsi.push(rsiValue);
        }
        
        return rsi;
      },

      calculateVWAP: (prices: number[], volumes: number[]): number => {
        let totalVolume = 0;
        let totalValue = 0;

        for (let i = 0; i < Math.min(prices.length, volumes.length); i++) {
          totalValue += prices[i] * volumes[i];
          totalVolume += volumes[i];
        }

        return totalVolume > 0 ? totalValue / totalVolume : 0;
      },

      calculateVolatility: (prices: number[], period: number = 20): number => {
        if (prices.length < period) return 0;
        
        const recentPrices = prices.slice(-period);
        const mean = recentPrices.reduce((sum, price) => sum + price, 0) / period;
        
        const variance = recentPrices.reduce((sum, price) => {
          return sum + Math.pow(price - mean, 2);
        }, 0) / period;
        
        return Math.sqrt(variance);
      }
    };
  }

  calculatePositionSize(accountBalance: number, stopLossDistance: number, riskPercentage: number): number {
    if (!this.initialized || !this.wasmModule) {
      throw new Error('WASM engine not initialized');
    }
    
    return this.wasmModule.calculatePositionSize(accountBalance, stopLossDistance, riskPercentage);
  }

  calculateTechnicalIndicators(prices: number[], period: number = 14): number[] {
    if (!this.initialized || !this.wasmModule) {
      throw new Error('WASM engine not initialized');
    }
    
    return this.wasmModule.calculateTechnicalIndicators(prices, period);
  }

  calculateRSI(prices: number[], period: number = 14): number[] {
    if (!this.initialized || !this.wasmModule) {
      throw new Error('WASM engine not initialized');
    }
    
    return this.wasmModule.calculateRSI(prices, period);
  }

  calculateVWAP(prices: number[], volumes: number[]): number {
    if (!this.initialized || !this.wasmModule) {
      throw new Error('WASM engine not initialized');
    }
    
    return this.wasmModule.calculateVWAP(prices, volumes);
  }

  calculateVolatility(prices: number[], period: number = 20): number {
    if (!this.initialized || !this.wasmModule) {
      throw new Error('WASM engine not initialized');
    }
    
    return this.wasmModule.calculateVolatility(prices, period);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const wasmEngine = new WebAssemblyEngine();
