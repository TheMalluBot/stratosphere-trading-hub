
import { useEffect } from 'react';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { optimizationManager } from '@/lib/performance/OptimizationManager';

export function DesktopIntegration() {
  const { isElectron, showNotification } = useDesktopIntegration();

  useEffect(() => {
    if (isElectron) {
      console.log('🖥️ Running in Electron desktop mode');
      
      // Initialize performance optimizations
      optimizationManager.optimizeRendering();
      
      // Show welcome notification
      showNotification(
        'AlgoTrade Pro', 
        'Desktop application started successfully!'
      );
      
      // Enable hardware acceleration for better performance
      const appElement = document.getElementById('root');
      if (appElement) {
        optimizationManager.enableGPUAcceleration(appElement);
      }
    } else {
      console.log('🌐 Running in web browser mode');
    }

    return () => {
      optimizationManager.cleanup();
    };
  }, [isElectron, showNotification]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
