import { gpuComputeService } from './GPUComputeService';
import { advancedWasmEngine } from './AdvancedWebAssemblyEngine';
import { highPerformanceManager } from './HighPerformanceManager';

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'analysis' | 'calculation' | 'optimization' | 'simulation';
  priority: 'low' | 'medium' | 'high';
  data: any;
  dependencies?: string[];
  estimatedDuration: number;
  createdAt: number;
  scheduledFor?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
}

export interface TaskResult {
  taskId: string;
  result: any;
  duration: number;
  completedAt: number;
}

export class ComputationalTaskScheduler {
  private tasks = new Map<string, ScheduledTask>();
  private runningTasks = new Set<string>();
  private completedTasks = new Map<string, TaskResult>();
  private maxConcurrentTasks = navigator.hardwareConcurrency || 4;
  private isRunning = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startScheduler();
  }

  private startScheduler(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.schedulerInterval = setInterval(() => {
      this.processTasks();
    }, 100); // Check every 100ms
    
    console.log('📅 Computational Task Scheduler started');
  }

  stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    console.log('📅 Computational Task Scheduler stopped');
  }

  scheduleTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'status'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledTask: ScheduledTask = {
      ...task,
      id: taskId,
      createdAt: Date.now(),
      status: 'pending'
    };
    
    this.tasks.set(taskId, scheduledTask);
    
    console.log(`📋 Task scheduled: ${taskId} (${task.name})`);
    return taskId;
  }

  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    if (task.status === 'running') {
      // Cannot cancel running tasks for now
      return false;
    }
    
    task.status = 'cancelled';
    this.tasks.set(taskId, task);
    
    console.log(`❌ Task cancelled: ${taskId}`);
    return true;
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  getTaskResult(taskId: string): TaskResult | undefined {
    return this.completedTasks.get(taskId);
  }

  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  getQueueStatus(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length
    };
  }

  private async processTasks(): Promise<void> {
    if (this.runningTasks.size >= this.maxConcurrentTasks) return;
    
    // Get next task to process
    const nextTask = this.getNextTask();
    if (!nextTask) return;
    
    // Check dependencies
    if (!this.areDependenciesMet(nextTask)) return;
    
    // Start processing the task
    await this.executeTask(nextTask);
  }

  private getNextTask(): ScheduledTask | null {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .filter(task => !task.scheduledFor || task.scheduledFor <= Date.now())
      .sort((a, b) => {
        // Sort by priority then by creation time
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.createdAt - b.createdAt;
      });
    
    return pendingTasks[0] || null;
  }

  private areDependenciesMet(task: ScheduledTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    
    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    const startTime = Date.now();
    
    // Mark as running
    task.status = 'running';
    this.tasks.set(task.id, task);
    this.runningTasks.add(task.id);
    
    console.log(`🚀 Executing task: ${task.id} (${task.name})`);
    
    try {
      let result: any;
      
      switch (task.type) {
        case 'analysis':
          result = await this.executeAnalysisTask(task);
          break;
        case 'calculation':
          result = await this.executeCalculationTask(task);
          break;
        case 'optimization':
          result = await this.executeOptimizationTask(task);
          break;
        case 'simulation':
          result = await this.executeSimulationTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      // Mark as completed
      task.status = 'completed';
      task.result = result;
      this.tasks.set(task.id, task);
      
      // Store result
      const taskResult: TaskResult = {
        taskId: task.id,
        result,
        duration: Date.now() - startTime,
        completedAt: Date.now()
      };
      this.completedTasks.set(task.id, taskResult);
      
      console.log(`✅ Task completed: ${task.id} in ${taskResult.duration}ms`);
      
    } catch (error) {
      console.error(`❌ Task failed: ${task.id}`, error);
      
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      this.tasks.set(task.id, task);
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  private async executeAnalysisTask(task: ScheduledTask): Promise<any> {
    const { data } = task;
    
    if (!advancedWasmEngine.isInitialized()) {
      await advancedWasmEngine.initialize();
    }
    
    switch (data.analysisType) {
      case 'technical-indicators':
        return await advancedWasmEngine.calculateAllIndicators(
          data.prices, 
          data.volumes, 
          data.period
        );
      case 'advanced-analysis':
        const indicators = await advancedWasmEngine.calculateAllIndicators(
          data.prices, 
          data.volumes, 
          data.period
        );
        return await advancedWasmEngine.performAdvancedAnalysis(
          data.prices, 
          data.volumes, 
          indicators
        );
      default:
        throw new Error(`Unknown analysis type: ${data.analysisType}`);
    }
  }

  private async executeCalculationTask(task: ScheduledTask): Promise<any> {
    const { data } = task;
    
    // Use GPU service for intensive calculations
    if (gpuComputeService.isSupported()) {
      return await gpuComputeService.submitTask({
        id: task.id,
        type: data.calculationType,
        data: data.parameters,
        priority: task.priority
      });
    } else {
      // Fallback to worker pool
      return await highPerformanceManager.processMarketData(data.parameters);
    }
  }

  private async executeOptimizationTask(task: ScheduledTask): Promise<any> {
    const { data } = task;
    
    if (!advancedWasmEngine.isInitialized()) {
      await advancedWasmEngine.initialize();
    }
    
    return await advancedWasmEngine.optimizePortfolio(
      data.assets,
      data.returns,
      data.riskFreeRate
    );
  }

  private async executeSimulationTask(task: ScheduledTask): Promise<any> {
    const { data } = task;
    
    // Use GPU for Monte Carlo simulations if available
    if (gpuComputeService.isSupported()) {
      return await gpuComputeService.submitTask({
        id: task.id,
        type: 'monte-carlo',
        data: {
          simulations: data.simulations,
          parameters: data.parameters
        },
        priority: task.priority
      });
    } else {
      // Fallback to strategy worker
      return await highPerformanceManager.backtestStrategy(data);
    }
  }

  // Helper methods for common task types
  scheduleMarketAnalysis(prices: number[], volumes: number[], priority: 'low' | 'medium' | 'high' = 'medium'): string {
    return this.scheduleTask({
      name: 'Market Analysis',
      type: 'analysis',
      priority,
      data: {
        analysisType: 'advanced-analysis',
        prices,
        volumes,
        period: 14
      },
      estimatedDuration: 2000 // 2 seconds
    });
  }

  schedulePortfolioOptimization(assets: any[], returns: number[][], riskFreeRate: number = 0.02): string {
    return this.scheduleTask({
      name: 'Portfolio Optimization',
      type: 'optimization',
      priority: 'high',
      data: {
        assets,
        returns,
        riskFreeRate
      },
      estimatedDuration: 5000 // 5 seconds
    });
  }

  scheduleMonteCarloSimulation(simulations: number, parameters: any, priority: 'low' | 'medium' | 'high' = 'medium'): string {
    return this.scheduleTask({
      name: 'Monte Carlo Simulation',
      type: 'simulation',
      priority,
      data: {
        simulations,
        parameters
      },
      estimatedDuration: simulations * 0.1 // Rough estimate
    });
  }
}

export const taskScheduler = new ComputationalTaskScheduler();
