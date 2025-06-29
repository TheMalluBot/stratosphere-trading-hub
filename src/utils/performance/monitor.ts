/**
 * Performance monitoring utilities for tracking application performance metrics
 */

// Performance metrics types
export interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Global metrics store
const metrics: PerformanceMetric[] = [];

/**
 * Start tracking a performance metric
 * @param name - The name of the metric to track
 * @param metadata - Optional metadata to associate with the metric
 * @returns A unique identifier for the metric
 */
export const startMetric = (name: string, metadata?: Record<string, any>): string => {
  const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  metrics.push({
    name,
    startTime: performance.now(),
    metadata
  });
  return id;
};

/**
 * End tracking a performance metric
 * @param id - The identifier of the metric to end
 * @returns The completed metric with duration
 */
export const endMetric = (id: string): PerformanceMetric | undefined => {
  const index = metrics.findIndex(metric => `${metric.name}-${metric.startTime}` === id);
  if (index === -1) return undefined;
  
  const metric = metrics[index];
  metric.duration = performance.now() - metric.startTime;
  
  // Report to monitoring service if in production
  if (process.env.NODE_ENV === 'production') {
    reportMetricToService(metric);
  }
  
  return metric;
};

/**
 * Measure the execution time of a function
 * @param fn - The function to measure
 * @param name - The name of the metric
 * @param metadata - Optional metadata to associate with the metric
 * @returns The result of the function
 */
export const measureFunction = async <T>(
  fn: () => Promise<T> | T,
  name: string,
  metadata?: Record<string, any>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    metrics.push({
      name,
      startTime: start,
      duration,
      metadata
    });
    
    // Report to monitoring service if in production
    if (process.env.NODE_ENV === 'production') {
      reportMetricToService({
        name,
        startTime: start,
        duration,
        metadata
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    metrics.push({
      name: `${name}-error`,
      startTime: start,
      duration,
      metadata: { ...metadata, error: error instanceof Error ? error.message : String(error) }
    });
    
    throw error;
  }
};

/**
 * Get all collected performance metrics
 * @returns Array of performance metrics
 */
export const getMetrics = (): PerformanceMetric[] => {
  return [...metrics];
};

/**
 * Clear all collected performance metrics
 */
export const clearMetrics = (): void => {
  metrics.length = 0;
};

/**
 * Report a metric to an external monitoring service
 * @param metric - The metric to report
 */
const reportMetricToService = (metric: PerformanceMetric): void => {
  // Implementation would depend on the monitoring service being used
  // This is a placeholder for actual implementation
  console.log('[Performance Monitoring]', metric);
  
  // Example implementation with web vitals or custom analytics
  // sendToAnalytics({
  //   name: metric.name,
  //   value: metric.duration,
  //   metadata: metric.metadata
  // });
};

/**
 * Create a performance observer to monitor specific entry types
 * @param entryTypes - The types of performance entries to observe
 * @param callback - Callback function to handle the entries
 */
export const createPerformanceObserver = (
  entryTypes: string[],
  callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | undefined => {
  if (typeof PerformanceObserver === 'undefined') return undefined;
  
  const observer = new PerformanceObserver((list) => {
    callback(list.getEntries());
  });
  
  observer.observe({ entryTypes });
  return observer;
};

// Initialize performance monitoring
export const initPerformanceMonitoring = (): void => {
  // Monitor navigation timing
  createPerformanceObserver(['navigation'], (entries) => {
    entries.forEach(entry => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        metrics.push({
          name: 'page-load',
          startTime: 0,
          duration: navEntry.loadEventEnd,
          metadata: {
            domComplete: navEntry.domComplete,
            domInteractive: navEntry.domInteractive,
            fetchStart: navEntry.fetchStart,
            loadEventEnd: navEntry.loadEventEnd,
            responseEnd: navEntry.responseEnd,
            responseStart: navEntry.responseStart
          }
        });
      }
    });
  });
  
  // Monitor resource loading
  createPerformanceObserver(['resource'], (entries) => {
    entries.forEach(entry => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        metrics.push({
          name: `resource-${resourceEntry.name.split('/').pop()}`,
          startTime: resourceEntry.startTime,
          duration: resourceEntry.duration,
          metadata: {
            initiatorType: resourceEntry.initiatorType,
            size: resourceEntry.transferSize,
            url: resourceEntry.name
          }
        });
      }
    });
  });
};
