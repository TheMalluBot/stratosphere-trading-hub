
export interface WorkerTask {
  id: string;
  type: 'strategy' | 'monte_carlo' | 'walk_forward' | 'data_processing';
  data: any;
}

export interface WorkerProgress {
  overall: number;
  individual: Record<string, number>;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers: Set<Worker> = new Set();
  private maxWorkers: number;
  private workerUrl: string;

  constructor() {
    this.maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 8);
    this.workerUrl = this.createWorkerUrl();
    this.initializeWorkers();
  }

  private createWorkerUrl(): string {
    const workerCode = `
      // Import strategy classes (simplified for demo)
      const strategies = {
        'linear-regression': class LinearRegressionStrategy {
          constructor(config) { this.config = config; }
          calculate(data) {
            // Simplified calculation for demo
            return {
              signals: [],
              indicators: {},
              performance: {
                totalReturn: Math.random() * 20 - 10,
                winRate: Math.random() * 100,
                sharpeRatio: Math.random() * 3,
                maxDrawdown: -Math.random() * 15,
                totalTrades: Math.floor(Math.random() * 100)
              }
            };
          }
        },
        'z-score-trend': class ZScoreTrendStrategy {
          constructor(config) { this.config = config; }
          calculate(data) {
            return {
              signals: [],
              indicators: {},
              performance: {
                totalReturn: Math.random() * 15 - 5,
                winRate: Math.random() * 100,
                sharpeRatio: Math.random() * 2.5,
                maxDrawdown: -Math.random() * 12,
                totalTrades: Math.floor(Math.random() * 80)
              }
            };
          }
        }
      };

      self.onmessage = function(e) {
        const { id, type, data } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'strategy':
              const StrategyClass = strategies[data.strategy.id];
              if (StrategyClass) {
                const strategy = new StrategyClass(data.strategy);
                result = strategy.calculate(data.marketData);
              } else {
                throw new Error('Unknown strategy: ' + data.strategy.id);
              }
              break;
              
            case 'monte_carlo':
              result = runMonteCarloSimulation(data.results, data.runs);
              break;
              
            case 'walk_forward':
              result = runWalkForwardAnalysis(data.strategies, data.marketData);
              break;
              
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({ id, success: true, data: result });
        } catch (error) {
          self.postMessage({ id, success: false, error: error.message });
        }
      };

      function runMonteCarloSimulation(results, runs) {
        // Simplified Monte Carlo simulation
        const simulations = [];
        for (let i = 0; i < runs; i++) {
          simulations.push({
            returns: Math.random() * 30 - 10,
            sharpe: Math.random() * 3,
            maxDD: -Math.random() * 20
          });
          
          if (i % 100 === 0) {
            self.postMessage({ 
              id: 'progress', 
              progress: (i / runs) * 100 
            });
          }
        }
        return { simulations };
      }

      function runWalkForwardAnalysis(strategies, marketData) {
        // Simplified walk-forward analysis
        const results = [];
        const windows = 10;
        
        for (let i = 0; i < windows; i++) {
          results.push({
            window: i,
            inSample: Math.random() * 15,
            outOfSample: Math.random() * 12
          });
          
          self.postMessage({ 
            id: 'progress', 
            progress: (i / windows) * 100 
          });
        }
        
        return { walkForwardResults: results };
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(this.workerUrl);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async executeTasks(
    tasks: WorkerTask[],
    progressCallback?: (progress: WorkerProgress) => void
  ): Promise<Array<{ id: string; data: any }>> {
    return new Promise((resolve, reject) => {
      const results: Array<{ id: string; data: any }> = [];
      const taskQueue = [...tasks];
      const inProgress = new Map<string, Worker>();
      const individualProgress = new Map<string, number>();

      const updateProgress = () => {
        if (progressCallback) {
          const overall = (results.length / tasks.length) * 100;
          const individual: Record<string, number> = {};
          individualProgress.forEach((progress, taskId) => {
            individual[taskId] = progress;
          });
          progressCallback({ overall, individual });
        }
      };

      const processNextTask = () => {
        if (taskQueue.length === 0) return;
        if (this.availableWorkers.length === 0) return;

        const task = taskQueue.shift()!;
        const worker = this.availableWorkers.pop()!;
        
        this.busyWorkers.add(worker);
        inProgress.set(task.id, worker);
        individualProgress.set(task.id, 0);

        const messageHandler = (e: MessageEvent) => {
          const { id, success, data, error, progress } = e.data;

          if (id === 'progress') {
            individualProgress.set(task.id, progress);
            updateProgress();
            return;
          }

          if (id === task.id) {
            worker.removeEventListener('message', messageHandler);
            inProgress.delete(task.id);
            this.busyWorkers.delete(worker);
            this.availableWorkers.push(worker);

            if (success) {
              results.push({ id, data });
              individualProgress.set(task.id, 100);
            } else {
              reject(new Error(`Task ${id} failed: ${error}`));
              return;
            }

            updateProgress();

            if (results.length === tasks.length) {
              resolve(results);
            } else {
              processNextTask();
            }
          }
        };

        worker.addEventListener('message', messageHandler);
        worker.postMessage(task);
      };

      // Start processing tasks
      for (let i = 0; i < Math.min(this.maxWorkers, tasks.length); i++) {
        processNextTask();
      }
    });
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
    URL.revokeObjectURL(this.workerUrl);
  }
}
