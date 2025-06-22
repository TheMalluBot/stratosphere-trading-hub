
export class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private messageId = 0;
  private pendingPromises: Map<string, { resolve: Function; reject: Function }> = new Map();

  createWorker(name: string, workerPath: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    const worker = new Worker(workerPath, { type: 'module' });
    
    worker.addEventListener('message', (event) => {
      const { id, type, payload } = event.data;
      const promise = this.pendingPromises.get(id);
      
      if (promise) {
        if (type === 'SUCCESS') {
          promise.resolve(payload);
        } else {
          promise.reject(new Error(payload.error || 'Worker error'));
        }
        this.pendingPromises.delete(id);
      }
    });

    worker.addEventListener('error', (error) => {
      console.error(`Worker ${name} error:`, error);
    });

    this.workers.set(name, worker);
    return worker;
  }

  async postMessage(workerName: string, message: any): Promise<any> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`);
    }

    const id = `msg_${++this.messageId}`;
    
    return new Promise((resolve, reject) => {
      this.pendingPromises.set(id, { resolve, reject });
      
      worker.postMessage({
        id,
        ...message
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingPromises.has(id)) {
          this.pendingPromises.delete(id);
          reject(new Error('Worker timeout'));
        }
      }, 30000);
    });
  }

  terminateWorker(name: string) {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  terminateAll() {
    this.workers.forEach((worker, name) => {
      worker.terminate();
    });
    this.workers.clear();
    this.pendingPromises.clear();
  }
}

// Global worker manager instance
export const workerManager = new WorkerManager();
