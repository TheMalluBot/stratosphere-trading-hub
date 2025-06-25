
import { useCallback, useEffect, useRef } from 'react';

export const usePerformanceOptimization = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }, []);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Lazy loading with Intersection Observer
  const useLazyLoading = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    useEffect(() => {
      if (!('IntersectionObserver' in window)) return;

      observerRef.current = new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      });

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [callback]);

    return observerRef.current;
  }, []);

  // Request Animation Frame optimization
  const useRAF = useCallback((callback: () => void) => {
    const tick = () => {
      callback();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
      rafIdRef.current = requestAnimationFrame(tick);
      
      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
    }, []);
  }, []);

  // Memory management
  const useMemoryManagement = useCallback(() => {
    useEffect(() => {
      const cleanup = () => {
        // Clear any large objects from memory
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }
      };

      // Cleanup on visibility change
      const handleVisibilityChange = () => {
        if (document.hidden) {
          cleanup();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cleanup();
      };
    }, []);
  }, []);

  // Image optimization
  const optimizeImage = useCallback((
    src: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): string => {
    // If using a CDN that supports on-the-fly optimization
    if (src.includes('cloudinary') || src.includes('imagekit')) {
      const params = [];
      if (width) params.push(`w_${width}`);
      if (height) params.push(`h_${height}`);
      params.push(`q_${quality}`);
      
      return src.replace(/\/upload\//, `/upload/${params.join(',')}/`);
    }
    
    return src;
  }, []);

  return {
    debounce,
    throttle,
    useLazyLoading,
    useRAF,
    useMemoryManagement,
    optimizeImage
  };
};
