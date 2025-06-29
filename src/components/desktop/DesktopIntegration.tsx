
import { useEffect } from 'react';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { highPerformanceManager } from '@/lib/performance/HighPerformanceManager';

export function DesktopIntegration() {
  const { showNotification } = useDesktopIntegration();

  useEffect(() => {
    console.log('🌐 AlgoTrade Pro - Advanced Trading Platform');
    
    const initializeBasicSystems = async () => {
      try {
        // Initialize high-performance manager without security systems
        await highPerformanceManager.initialize();
        
        showNotification(
          'AlgoTrade Pro', 
          '🚀 Trading platform loaded successfully!'
        );
        
        // Monitor performance
        const handlePerformanceUpdate = (event: CustomEvent) => {
          const metrics = event.detail;
          console.log('📊 Performance metrics:', metrics);
        };
        
        window.addEventListener('performanceUpdate', handlePerformanceUpdate as EventListener);
        
        return () => {
          window.removeEventListener('performanceUpdate', handlePerformanceUpdate as EventListener);
        };
      } catch (error) {
        console.error('❌ Failed to initialize systems:', error);
        showNotification(
          'AlgoTrade Pro', 
          '⚠️ Some features may not be available'
        );
      }
    };

    initializeBasicSystems();

    return () => {
      highPerformanceManager.cleanup();
    };
  }, [showNotification]);

  // This component doesn't render anything - it's just for initialization
  return null;
}
