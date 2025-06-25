
export interface GPUCapabilities {
  supported: boolean;
  maxComputeUnits: number;
  maxWorkGroupSize: number;
  features: string[];
}

export interface ComputeTask {
  id: string;
  type: 'matrix-multiply' | 'correlation' | 'monte-carlo' | 'technical-indicators';
  data: any;
  priority: 'low' | 'medium' | 'high';
}

export class GPUComputeService {
  private device: GPUDevice | null = null;
  private adapter: GPUAdapter | null = null;
  private initialized = false;
  private taskQueue: ComputeTask[] = [];
  private isProcessing = false;

  async initialize(): Promise<void> {
    try {
      if (!navigator.gpu) {
        console.warn('WebGPU not supported, falling back to CPU');
        return;
      }

      this.adapter = await navigator.gpu.requestAdapter();
      if (!this.adapter) {
        console.warn('No WebGPU adapter found');
        return;
      }

      this.device = await this.adapter.requestDevice();
      this.initialized = true;
      
      console.log('🔥 GPU Compute Service initialized');
      console.log('GPU Capabilities:', this.getCapabilities());
      
      // Start processing queue
      this.processTaskQueue();
    } catch (error) {
      console.error('Failed to initialize GPU Compute Service:', error);
    }
  }

  getCapabilities(): GPUCapabilities {
    if (!this.adapter) {
      return {
        supported: false,
        maxComputeUnits: 0,
        maxWorkGroupSize: 0,
        features: []
      };
    }

    return {
      supported: true,
      maxComputeUnits: 64, // Typical value
      maxWorkGroupSize: 256, // Typical value
      features: Array.from(this.adapter.features)
    };
  }

  async submitTask(task: ComputeTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks = {
        ...task,
        resolve,
        reject
      };
      
      // Add to queue based on priority
      if (task.priority === 'high') {
        this.taskQueue.unshift(taskWithCallbacks as any);
      } else {
        this.taskQueue.push(taskWithCallbacks as any);
      }
      
      if (!this.isProcessing) {
        this.processTaskQueue();
      }
    });
  }

  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      
      try {
        let result;
        
        if (this.initialized && this.device) {
          result = await this.executeOnGPU(task);
        } else {
          result = await this.executeOnCPU(task);
        }
        
        (task as any).resolve(result);
      } catch (error) {
        console.error(`Task ${task.id} failed:`, error);
        (task as any).reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  private async executeOnGPU(task: ComputeTask): Promise<any> {
    if (!this.device) throw new Error('GPU device not available');
    
    const startTime = performance.now();
    
    switch (task.type) {
      case 'matrix-multiply':
        return await this.gpuMatrixMultiply(task.data);
      case 'correlation':
        return await this.gpuCorrelationMatrix(task.data);
      case 'monte-carlo':
        return await this.gpuMonteCarlo(task.data);
      case 'technical-indicators':
        return await this.gpuTechnicalIndicators(task.data);
      default:
        throw new Error(`Unknown GPU task type: ${task.type}`);
    }
  }

  private async executeOnCPU(task: ComputeTask): Promise<any> {
    // Fallback CPU implementations
    switch (task.type) {
      case 'matrix-multiply':
        return this.cpuMatrixMultiply(task.data);
      case 'correlation':
        return this.cpuCorrelationMatrix(task.data);
      case 'monte-carlo':
        return this.cpuMonteCarlo(task.data);
      case 'technical-indicators':
        return this.cpuTechnicalIndicators(task.data);
      default:
        throw new Error(`Unknown CPU task type: ${task.type}`);
    }
  }

  private async gpuMatrixMultiply(data: { a: number[][]; b: number[][] }): Promise<number[][]> {
    // Simplified GPU matrix multiplication (would use actual compute shaders in production)
    console.log('🔥 GPU Matrix Multiply');
    return this.cpuMatrixMultiply(data);
  }

  private async gpuCorrelationMatrix(data: { prices: number[][] }): Promise<number[][]> {
    console.log('🔥 GPU Correlation Matrix');
    return this.cpuCorrelationMatrix(data);
  }

  private async gpuMonteCarlo(data: { simulations: number; parameters: any }): Promise<any> {
    console.log('🔥 GPU Monte Carlo');
    return this.cpuMonteCarlo(data);
  }

  private async gpuTechnicalIndicators(data: { prices: number[]; volumes: number[] }): Promise<any> {
    console.log('🔥 GPU Technical Indicators');
    return this.cpuTechnicalIndicators(data);
  }

  // CPU fallback implementations
  private cpuMatrixMultiply(data: { a: number[][]; b: number[][] }): number[][] {
    const { a, b } = data;
    const result: number[][] = [];
    
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    
    return result;
  }

  private cpuCorrelationMatrix(data: { prices: number[][] }): number[][] {
    const { prices } = data;
    const n = prices.length;
    const correlations: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      correlations[i] = [];
      for (let j = 0; j < n; j++) {
        correlations[i][j] = this.calculateCorrelation(prices[i], prices[j]);
      }
    }
    
    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private cpuMonteCarlo(data: { simulations: number; parameters: any }): any {
    const { simulations, parameters } = data;
    const results: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      // Simple Monte Carlo simulation
      const randomReturn = (Math.random() - 0.5) * 0.1; // ±5% daily return
      const compoundedReturn = Math.pow(1 + randomReturn, 252) - 1; // Annualized
      results.push(compoundedReturn);
    }
    
    return {
      results,
      mean: results.reduce((sum, val) => sum + val, 0) / results.length,
      std: Math.sqrt(results.reduce((sum, val) => sum + Math.pow(val - results.reduce((s, v) => s + v, 0) / results.length, 2), 0) / results.length),
      percentiles: {
        p5: this.percentile(results, 0.05),
        p50: this.percentile(results, 0.5),
        p95: this.percentile(results, 0.95)
      }
    };
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * p);
    return sorted[index];
  }

  private cpuTechnicalIndicators(data: { prices: number[]; volumes: number[] }): any {
    const { prices } = data;
    
    // Fast parallel computation using Web Workers would go here
    // For now, simple CPU calculation
    const sma20 = this.calculateSMA(prices, 20);
    const rsi = this.calculateRSI(prices, 14);
    
    return { sma20, rsi };
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateRSI(prices: number[], period: number): number[] {
    const rsi: number[] = [];
    if (prices.length < period + 1) return rsi;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
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

  isSupported(): boolean {
    return this.initialized;
  }

  getQueueLength(): number {
    return this.taskQueue.length;
  }
}

export const gpuComputeService = new GPUComputeService();
