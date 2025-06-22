
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useDesktopIntegration() {
  const navigate = useNavigate();

  const showNotification = useCallback(async (title: string, body: string, icon?: string) => {
    // Web notification implementation
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, icon });
        } else {
          toast(title, { description: body });
        }
      } else {
        toast(title, { description: body });
      }
    } else {
      toast(title, { description: body });
    }
  }, []);

  const getSystemInfo = useCallback(async () => {
    // Web environment system info
    return {
      platform: navigator.platform,
      arch: 'web',
      userAgent: navigator.userAgent,
      cores: navigator.hardwareConcurrency || 4,
      memory: (navigator as any).deviceMemory || 'unknown'
    };
  }, []);

  // Setup keyboard shortcuts for maximum efficiency
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 1 - Dashboard
      if ((event.ctrlKey || event.metaKey) && event.key === '1') {
        event.preventDefault();
        navigate('/dashboard');
      }
      // Ctrl/Cmd + 2 - TradingView
      else if ((event.ctrlKey || event.metaKey) && event.key === '2') {
        event.preventDefault();
        navigate('/tradingview');
      }
      // Ctrl/Cmd + 3 - Algo Trading
      else if ((event.ctrlKey || event.metaKey) && event.key === '3') {
        event.preventDefault();
        navigate('/algo-trading');
      }
      // Ctrl/Cmd + N - New Strategy
      else if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        navigate('/algo-trading');
        toast.success('Creating new strategy...');
      }
      // Ctrl/Cmd + T - Start Trading
      else if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        navigate('/trading');
        toast.success('Starting trading session...');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return {
    showNotification,
    getSystemInfo,
  };
}
