
export interface WorkerTask {
  id: string;
  type: 'strategy' | 'monte_carlo' | 'walk_forward' | 'data_processing';
  data: any;
  priority?: number;
}

export interface WorkerProgress {
  overall: number;
  individual: Record<string, number>;
}

export interface WorkerConfig {
  maxWorkers?: number;
  timeout?: number;
  fallbackToMainThread?: boolean;
}

export class RobustWorkerManager {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers: Map<Worker, WorkerTask> = new Map();
  private config: Required<WorkerConfig>;
  private isSupported: boolean;
  private taskQueue: WorkerTask[] = [];
  private activePromises: Map<string, { 
    resolve: (value: any) => void; 
    reject: (reason: any) => void; 
    timeout: NodeJS.Timeout | null;
  }> = new Map();

  constructor(config: WorkerConfig = {}) {
    this.config = {
      maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8),
      timeout: 30000,
      fallbackToMainThread: true,
      ...config
    };
    
    this.isSupported = this.checkWorkerSupport();
    
    if (this.isSupported) {
      this.initializeWorkers();
    }
  }

  private checkWorkerSupport(): boolean {
    try {
      return typeof Worker !== 'undefined' && typeof URL.createObjectURL === 'function';
    } catch {
      return false;
    }
  }

  private async initializeWorkers(): Promise<void> {
    const workerPromises = [];
    
    for (let i = 0; i < this.config.maxWorkers; i++) {
      workerPromises.push(this.createWorker(i));
    }

    try {
      const workers = await Promise.allSettled(workerPromises);
      
      workers.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          this.workers.push(result.value);
          this.availableWorkers.push(result.value);
        } else {
          console.warn(`Failed to create worker ${index}:`, result.status === 'rejected' ? result.reason : 'Unknown error');
        }
      });

      if (this.workers.length === 0) {
        console.warn('No workers could be created, will fall back to main thread processing');
        this.isSupported = false;
      }
    } catch (error) {
      console.error('Worker initialization failed:', error);
      this.isSupported = false;
    }
  }

  private async createWorker(index: number): Promise<Worker | null> {
    try {
      // Try to load dedicated worker file first
      const worker = new Worker('/workers/backtesting.worker.js', { type: 'module' });
      
      this.setupWorkerListeners(worker);
      
      // Test worker with a simple ping
      await this.testWorker(worker);
      
      return worker;
    } catch (error) {
      console.warn(`Failed to create worker ${index}:`, error);
      return null;
    }
  }

  private setupWorkerListeners(worker: Worker): void {
    worker.addEventListener('message', (event) => {
      const { id, type, payload, progress } = event.data;

      if (type === 'PROGRESS') {
        // Handle progress updates
        return;
      }

      const promise = this.activePromises.get(id);
      if (!promise) return;

      if (promise.timeout) {
        clearTimeout(promise.timeout);
      }
      this.activePromises.delete(id);

      // Free up the worker
      const task = this.busyWorkers.get(worker);
      if (task) {
        this.busyWorkers.delete(worker);
        this.availableWorkers.push(worker);
        this.processNextTask();
      }

      if (type === 'SUCCESS') {
        promise.resolve(payload);
      } else {
        promise.reject(new Error(payload?.error || 'Worker task failed'));
      }
    });

    worker.addEventListener('error', (error) => {
      console.error('Worker error:', error);
      this.handleWorkerError(worker);
    });

    worker.addEventListener('messageerror', (error) => {
      console.error('Worker message error:', error);
      this.handleWorkerError(worker);
    });
  }

  private async testWorker(worker: Worker): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker test timeout'));
      }, 5000);

      const handler = (event: MessageEvent) => {
        if (event.data.type === 'PING_RESPONSE') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          resolve();
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'PING', id: 'test' });
    });
  }

  private handleWorkerError(worker: Worker): void {
    // Remove failed worker
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex > -1) {
      this.workers.splice(workerIndex, 1);
    }

    const availableIndex = this.availableWorkers.indexOf(worker);
    if (availableIndex > -1) {
      this.availableWorkers.splice(availableIndex, 1);
    }

    // Handle any active task on this worker
    const task = this.busyWorkers.get(worker);
    if (task) {
      this.busyWorkers.delete(worker);
      
      const promise = this.activePromises.get(task.id);
      if (promise) {
        if (promise.timeout) {
          clearTimeout(promise.timeout);
        }
        this.activePromises.delete(task.id);
        
        if (this.config.fallbackToMainThread) {
          // Retry on main thread
          this.executeOnMainThread(task).then(promise.resolve).catch(promise.reject);
        } else {
          promise.reject(new Error('Worker failed and main thread fallback disabled'));
        }
      }
    }

    worker.terminate();
  }

  async executeTasks(
    tasks: WorkerTask[],
    progressCallback?: (progress: WorkerProgress) => void
  ): Promise<Array<{ id: string; data: any }>> {
    if (!this.isSupported && !this.config.fallbackToMainThread) {
      throw new Error('Workers not supported and fallback disabled');
    }

    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    const results: Array<{ id: string; data: any }> = [];
    const promises = sortedTasks.map(task => this.executeTask(task));

    // Track progress
    if (progressCallback) {
      const progressInterval = setInterval(() => {
        const completed = results.length;
        const total = tasks.length;
        const overall = (completed / total) * 100;
        
        const individual: Record<string, number> = {};
        tasks.forEach(task => {
          individual[task.id] = results.find(r => r.id === task.id) ? 100 : 0;
        });

        progressCallback({ overall, individual });
      }, 100);

      Promise.allSettled(promises).finally(() => {
        clearInterval(progressInterval);
      });
    }

    const settledResults = await Promise.allSettled(promises);
    
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push({ id: sortedTasks[index].id, data: result.value });
      } else {
        console.error(`Task ${sortedTasks[index].id} failed:`, result.reason);
        throw result.reason;
      }
    });

    return results;
  }

  private async executeTask(task: WorkerTask): Promise<any> {
    if (this.isSupported && this.availableWorkers.length > 0) {
      return this.executeOnWorker(task);
    } else if (this.config.fallbackToMainThread) {
      return this.executeOnMainThread(task);
    } else {
      throw new Error('No workers available and fallback disabled');
    }
  }

  private async executeOnWorker(task: WorkerTask): Promise<any> {
    const worker = this.availableWorkers.pop();
    if (!worker) {
      // Add to queue if no workers available
      return new Promise<any>((resolve, reject) => {
        this.taskQueue.push(task);
        this.activePromises.set(task.id, { resolve, reject, timeout: null });
      });
    }

    return new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.activePromises.delete(task.id);
        this.handleWorkerError(worker);
        reject(new Error(`Task ${task.id} timeout`));
      }, this.config.timeout);

      this.activePromises.set(task.id, { resolve, reject, timeout });
      this.busyWorkers.set(worker, task);

      worker.postMessage({
        id: task.id,
        type: task.type.toUpperCase(),
        payload: task.data
      });
    });
  }

  private processNextTask(): void {
    if (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      this.executeOnWorker(task);
    }
  }

  private async executeOnMainThread(task: WorkerTask): Promise<any> {
    // Fallback implementation for main thread processing
    const { MainThreadProcessor } = await import('./MainThreadProcessor');
    const processor = new MainThreadProcessor();
    
    return processor.execute(task);
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      isSupported: this.isSupported
    };
  }

  terminate(): void {
    // Clear all timeouts
    this.activePromises.forEach(({ timeout }) => {
      if (timeout) clearTimeout(timeout);
    });
    this.activePromises.clear();

    // Terminate all workers
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
    this.taskQueue = [];
  }
}
