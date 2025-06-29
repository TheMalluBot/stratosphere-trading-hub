export class MemoryManager {
  private cleanupTasks = new Set<() => void>();
  private memoryThreshold = 100 * 1024 * 1024; // 100MB
  private gcTimer: NodeJS.Timeout | null = null;
  private observers = new Set<MutationObserver>();
  private eventListeners = new Map<Element, Map<string, EventListener>>();

  constructor() {
    this.startMemoryMonitoring();
    this.setupVisibilityHandler();
  }

  initialize(): void {
    console.log('🧠 Memory Manager initialized');
  }

  private startMemoryMonitoring() {
    // Check memory usage every 30 seconds
    this.gcTimer = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);
  }

  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performCleanup();
      }
    });
  }

  registerCleanupTask(task: () => void) {
    this.cleanupTasks.add(task);
  }

  unregisterCleanupTask(task: () => void) {
    this.cleanupTasks.delete(task);
  }

  addEventListenerTracked(
    element: Element,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) {
    element.addEventListener(event, listener, options);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    this.eventListeners.get(element)!.set(event, listener);
  }

  removeEventListenerTracked(element: Element, event: string) {
    const elementListeners = this.eventListeners.get(element);
    if (elementListeners) {
      const listener = elementListeners.get(event);
      if (listener) {
        element.removeEventListener(event, listener);
        elementListeners.delete(event);
        
        if (elementListeners.size === 0) {
          this.eventListeners.delete(element);
        }
      }
    }
  }

  createMutationObserver(callback: MutationCallback, options?: MutationObserverInit): MutationObserver {
    const observer = new MutationObserver(callback);
    this.observers.add(observer);
    return observer;
  }

  disconnectObserver(observer: MutationObserver) {
    observer.disconnect();
    this.observers.delete(observer);
  }

  private checkMemoryUsage() {
    const memInfo = (performance as any).memory;
    if (!memInfo) return;

    const usedMemory = memInfo.usedJSHeapSize;
    const memoryUsagePercent = (usedMemory / memInfo.jsHeapSizeLimit) * 100;

    console.log(`Memory Usage: ${Math.round(memoryUsagePercent)}% (${Math.round(usedMemory / 1024 / 1024)}MB)`);

    if (usedMemory > this.memoryThreshold || memoryUsagePercent > 80) {
      console.warn('High memory usage detected, performing cleanup...');
      this.performCleanup();
    }
  }

  private performCleanup() {
    // Run all registered cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Error in cleanup task:', error);
      }
    });

    // Clear caches
    this.clearImageCache();
    this.clearComponentCache();
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  private clearImageCache() {
    // Clear image caches by setting src to empty
    const images = document.querySelectorAll('img[data-cached="true"]');
    images.forEach(img => {
      (img as HTMLImageElement).removeAttribute('data-cached');
    });
  }

  private clearComponentCache() {
    // Clear any cached data structures
    const cacheKeys = ['_reactInternalCache', '_componentCache'];
    cacheKeys.forEach(key => {
      if ((window as any)[key]) {
        try {
          (window as any)[key].clear();
        } catch (error) {
          console.warn(`Could not clear cache ${key}:`, error);
        }
      }
    });
  }

  optimizeScrolling(container: HTMLElement) {
    // Enable passive scrolling for better performance
    let isScrolling = false;
    
    const scrollHandler = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          // Handle scroll logic here
          isScrolling = false;
        });
        isScrolling = true;
      }
    };

    this.addEventListenerTracked(container, 'scroll', scrollHandler, { passive: true });
  }

  getMemoryStats() {
    const memInfo = (performance as any).memory;
    if (!memInfo) return null;

    return {
      used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100),
      cleanupTasks: this.cleanupTasks.size,
      observers: this.observers.size,
      eventListeners: this.eventListeners.size
    };
  }

  cleanup() {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Remove all tracked event listeners
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach((listener, event) => {
        element.removeEventListener(event, listener);
      });
    });
    this.eventListeners.clear();

    // Run final cleanup
    this.performCleanup();
    this.cleanupTasks.clear();
  }
}

export const memoryManager = new MemoryManager();
