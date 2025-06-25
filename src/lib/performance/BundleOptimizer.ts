
export class BundleOptimizer {
  private preloadedComponents = new Map<string, Promise<any>>();
  private componentCache = new Map<string, any>();
  private criticalResourcesLoaded = false;

  async preloadCriticalComponents() {
    if (this.criticalResourcesLoaded) return;
    
    console.log('🚀 Preloading critical trading components...');
    
    const criticalComponents = [
      () => import('@/components/trading/TradingChart'),
      () => import('@/components/trading/OrderForm'),
      () => import('@/components/dashboard/PortfolioStats'),
      () => import('@/components/trading/OrderBook')
    ];

    try {
      await Promise.all(criticalComponents.map(loader => loader()));
      this.criticalResourcesLoaded = true;
      console.log('✅ Critical components preloaded');
    } catch (error) {
      console.error('❌ Failed to preload critical components:', error);
    }
  }

  async loadComponentLazy<T>(
    componentKey: string,
    loader: () => Promise<{ default: T }>
  ): Promise<T> {
    // Check cache first
    if (this.componentCache.has(componentKey)) {
      return this.componentCache.get(componentKey);
    }

    // Check if already loading
    if (this.preloadedComponents.has(componentKey)) {
      const module = await this.preloadedComponents.get(componentKey)!;
      this.componentCache.set(componentKey, module.default);
      return module.default;
    }

    // Start loading
    const loadPromise = loader();
    this.preloadedComponents.set(componentKey, loadPromise);

    try {
      const module = await loadPromise;
      this.componentCache.set(componentKey, module.default);
      return module.default;
    } catch (error) {
      this.preloadedComponents.delete(componentKey);
      throw error;
    }
  }

  optimizeImages(src: string, options?: { width?: number; quality?: number }): string {
    if (!src) return src;
    
    // For placeholder SVGs or external images, return as-is
    if (src.includes('placeholder.svg') || src.startsWith('http')) {
      return src;
    }

    // Add optimization parameters if using a CDN
    const { width = 800, quality = 85 } = options || {};
    
    // This would integrate with image optimization services in production
    return src;
  }

  clearUnusedResources() {
    // Clear components that haven't been accessed recently
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, timestamp] of this.componentCache.entries()) {
      if (now - (timestamp as any).lastAccessed > maxAge) {
        this.componentCache.delete(key);
      }
    }
  }

  getLoadingStats() {
    return {
      preloadedComponents: this.preloadedComponents.size,
      cachedComponents: this.componentCache.size,
      criticalResourcesLoaded: this.criticalResourcesLoaded
    };
  }
}

export const bundleOptimizer = new BundleOptimizer();
