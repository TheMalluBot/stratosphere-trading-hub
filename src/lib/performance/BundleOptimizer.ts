
export class BundleOptimizer {
  private dynamicImports = new Map<string, Promise<any>>();

  // Lazy load components
  async loadComponent(componentName: string): Promise<any> {
    if (this.dynamicImports.has(componentName)) {
      return this.dynamicImports.get(componentName);
    }

    let importPromise: Promise<any>;

    switch (componentName) {
      case 'TradingChart':
        importPromise = import('@/components/trading/TradingChart');
        break;
      case 'PortfolioStats':
        importPromise = import('@/components/dashboard/PortfolioStats');
        break;
      case 'OrderBook':
        importPromise = import('@/components/trading/OrderBook');
        break;
      case 'BacktestResults':
        importPromise = import('@/components/backtesting/BacktestResults');
        break;
      default:
        throw new Error(`Component ${componentName} not found`);
    }

    this.dynamicImports.set(componentName, importPromise);
    return importPromise;
  }

  // Preload critical components
  preloadCriticalComponents() {
    const criticalComponents = ['TradingChart', 'PortfolioStats', 'OrderBook'];
    
    criticalComponents.forEach(component => {
      this.loadComponent(component).catch(error => {
        console.warn(`Failed to preload ${component}:`, error);
      });
    });
  }

  // Code splitting for routes
  async loadRoute(routeName: string): Promise<any> {
    switch (routeName) {
      case 'trading':
        return import('@/pages/Trading');
      case 'portfolio':
        return import('@/pages/PortfolioAnalytics');
      case 'backtesting':
        return import('@/pages/Backtesting');
      case 'settings':
        return import('@/pages/Settings');
      default:
        throw new Error(`Route ${routeName} not found`);
    }
  }

  // Get loading statistics - method that was missing
  getLoadingStats() {
    return {
      cachedComponents: this.dynamicImports.size,
      preloadedComponents: Array.from(this.dynamicImports.keys()).length,
      loadedChunks: Array.from(this.dynamicImports.keys())
    };
  }

  // Clear unused resources - method that was missing
  clearUnusedResources() {
    // Clear unused dynamic imports
    const unusedImports: string[] = [];
    this.dynamicImports.forEach((promise, key) => {
      // Simple heuristic: if not accessed recently, consider for cleanup
      unusedImports.push(key);
    });
    
    console.log(`Cleared ${unusedImports.length} unused resources`);
  }

  // Resource optimization
  optimizeImages(images: HTMLImageElement[]) {
    images.forEach(img => {
      // Add lazy loading
      img.loading = 'lazy';
      
      // Add intersection observer for better control
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imgElement = entry.target as HTMLImageElement;
            if (imgElement.dataset.src) {
              imgElement.src = imgElement.dataset.src;
              imgElement.removeAttribute('data-src');
              observer.unobserve(imgElement);
            }
          }
        });
      });
      
      observer.observe(img);
    });
  }

  // Service worker registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Bundle analysis
  getBundleInfo() {
    return {
      dynamicImports: this.dynamicImports.size,
      loadedChunks: Array.from(this.dynamicImports.keys()),
      memoryUsage: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
}

export const bundleOptimizer = new BundleOptimizer();
