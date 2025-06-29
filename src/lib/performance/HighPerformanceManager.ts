
import { WebAssemblyEngine } from './WebAssemblyEngine';
import { MemoryManager } from './MemoryManager';
import { OptimizationManager } from './OptimizationManager';

export class HighPerformanceManager {
  private wasmEngine: WebAssemblyEngine;
  private memoryManager: MemoryManager;
  private optimizationManager: OptimizationManager;
  private isInitialized = false;

  constructor() {
    this.wasmEngine = new WebAssemblyEngine();
    this.memoryManager = new MemoryManager();
    this.optimizationManager = new OptimizationManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing High Performance Manager...');

      // Initialize WebAssembly engine
      await this.wasmEngine.initialize();

      // Initialize memory management
      this.memoryManager.initialize();

      // Initialize optimization
      this.optimizationManager.initialize();

      this.isInitialized = true;
      console.log('✅ High Performance Manager initialized successfully');

      // Emit performance ready event
      this.emitPerformanceUpdate({
        initialized: true,
        wasmReady: true,
        memoryOptimized: true
      });

    } catch (error) {
      console.error('❌ Failed to initialize High Performance Manager:', error);
      throw error;
    }
  }

  private emitPerformanceUpdate(metrics: any): void {
    const event = new CustomEvent('performanceUpdate', { detail: metrics });
    window.dispatchEvent(event);
  }

  getPerformanceMetrics(): any {
    return {
      isInitialized: this.isInitialized,
      wasmEngine: this.wasmEngine.getStatus(),
      memoryUsage: this.memoryManager.getMemoryStats(),
      optimization: this.optimizationManager.getOptimizationStatus()
    };
  }

  cleanup(): void {
    if (!this.isInitialized) return;

    try {
      this.optimizationManager.cleanup();
      this.memoryManager.cleanup();
      this.wasmEngine.cleanup();
      this.isInitialized = false;
      console.log('🧹 High Performance Manager cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

export const highPerformanceManager = new HighPerformanceManager();
