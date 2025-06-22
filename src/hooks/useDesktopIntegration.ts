
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useDesktopIntegration() {
  const navigate = useNavigate();

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const showNotification = useCallback(async (title: string, body: string, icon?: string) => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.showNotification({ title, body, icon });
      } catch (error) {
        console.error('Failed to show desktop notification:', error);
        // Fallback to web notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon });
        } else {
          toast(title, { description: body });
        }
      }
    } else {
      // Web fallback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon });
      } else {
        toast(title, { description: body });
      }
    }
  }, [isElectron]);

  const minimizeToTray = useCallback(async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.minimizeToTray();
      } catch (error) {
        console.error('Failed to minimize to tray:', error);
      }
    }
  }, [isElectron]);

  const focusWindow = useCallback(async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.focusWindow();
      } catch (error) {
        console.error('Failed to focus window:', error);
      }
    }
  }, [isElectron]);

  const getSystemInfo = useCallback(async () => {
    if (isElectron && window.electronAPI) {
      try {
        return await window.electronAPI.getSystemInfo();
      } catch (error) {
        console.error('Failed to get system info:', error);
        return null;
      }
    }
    return null;
  }, [isElectron]);

  // Setup electron event listeners
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Navigation handler
    const handleNavigateTo = (route: string) => {
      navigate(route);
    };

    // Trading action handlers
    const handleNewStrategy = () => {
      navigate('/algo-trading');
      toast.success('Creating new strategy...');
    };

    const handleImportStrategy = () => {
      navigate('/algo-trading');
      toast.info('Import strategy functionality');
    };

    const handleStartTrading = () => {
      navigate('/trading');
      toast.success('Starting trading session...');
    };

    const handleStopAllAlgos = () => {
      toast.warning('Stopping all algorithms...');
      // Add logic to stop all running algorithms
    };

    const handleEmergencyStop = () => {
      toast.error('EMERGENCY STOP - All trading halted!');
      // Add emergency stop logic
    };

    // Register event listeners
    window.electronAPI.onNavigateTo(handleNavigateTo);
    window.electronAPI.onNewStrategy(handleNewStrategy);
    window.electronAPI.onImportStrategy(handleImportStrategy);
    window.electronAPI.onStartTrading(handleStartTrading);
    window.electronAPI.onStopAllAlgos(handleStopAllAlgos);
    window.electronAPI.onEmergencyStop(handleEmergencyStop);

    // Cleanup function
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('navigate-to');
        window.electronAPI.removeAllListeners('new-strategy');
        window.electronAPI.removeAllListeners('import-strategy');
        window.electronAPI.removeAllListeners('start-trading');
        window.electronAPI.removeAllListeners('stop-all-algos');
        window.electronAPI.removeAllListeners('emergency-stop');
      }
    };
  }, [isElectron, navigate]);

  return {
    isElectron,
    showNotification,
    minimizeToTray,
    focusWindow,
    getSystemInfo,
  };
}
