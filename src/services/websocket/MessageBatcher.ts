
export class MessageBatcher {
  private batchSize = 10;
  private batchTimeout = 100; // ms
  private pendingBatch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  addToBatch(message: any, processFn: (message: any) => void) {
    this.pendingBatch.push(message);
    
    if (this.pendingBatch.length >= this.batchSize) {
      this.processBatch(processFn);
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch(processFn);
      }, this.batchTimeout);
    }
  }

  private processBatch(processFn: (message: any) => void) {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pendingBatch.length === 0) return;

    // Process batch efficiently
    requestAnimationFrame(() => {
      const batch = [...this.pendingBatch];
      this.pendingBatch = [];
      
      batch.forEach(message => processFn(message));
    });
  }

  cleanup() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.pendingBatch = [];
  }
}
