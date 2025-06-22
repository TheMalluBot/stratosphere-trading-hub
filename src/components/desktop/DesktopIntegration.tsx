
import { useEffect } from 'react';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { optimizationManager } from '@/lib/performance/OptimizationManager';

export function DesktopIntegration() {
  const { showNotification } = useDesktopIntegration();

  useEffect(() => {
    console.log('🌐 AlgoTrade Pro - Web Application Mode');
    showNotification(
      'AlgoTrade Pro', 
      'Trading platform loaded successfully!'
    );
    
    // Initialize performance optimizations for web
    optimizationManager.optimizeRendering();
    
    // Enable hardware acceleration for better performance
    const appElement = document.getElementById('root');
    if (appElement) {
      optimizationManager.enableGPUAcceleration(appElement);
    }

    // Web Workers for background processing
    optimizationManager.initializeWebWorkers();

    return () => {
      optimizationManager.cleanup();
    };
  }, [showNotification]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
