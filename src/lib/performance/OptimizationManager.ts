
export class OptimizationManager {
  private animationFrame: number | null = null;
  private isVisible = true;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.setupVisibilityAPI();
    this.setupPerformanceMonitoring();
  }

  private setupVisibilityAPI() {
    // Optimize performance when app is not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      
      if (this.isVisible) {
        this.resumeOptimizations();
      } else {
        this.pauseOptimizations();
      }
    });
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  startMeasure(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string) {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  optimizeScrolling(element: HTMLElement) {
    // Add smooth scrolling optimization
    element.style.scrollBehavior = 'smooth';
    element.style.overflowAnchor = 'auto';
    
    // Use passive event listeners for better performance
    element.addEventListener('scroll', this.throttle(() => {
      // Handle scroll events
    }, 16), { passive: true });
  }

  optimizeRendering() {
    // Request animation frame for smooth rendering
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      // Perform rendering optimizations
      this.optimizeRendering();
    });
  }

  private pauseOptimizations() {
    // Pause expensive operations when app is not visible
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private resumeOptimizations() {
    // Resume optimizations when app becomes visible
    this.optimizeRendering();
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  enableGPUAcceleration(element: HTMLElement) {
    // Enable hardware acceleration for smooth animations
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform, opacity';
  }

  cleanup() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export const optimizationManager = new OptimizationManager();
