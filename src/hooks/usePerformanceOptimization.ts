import { useState, useEffect } from 'react';


export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    memory: 0,
    cpu: 0,
    latency: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      let memoryMb = 0;
      let cpuLoad = 0;

      try {
        // Dynamically import Tauri performance API only when available (desktop build)
        interface TauriWindow extends Window { __TAURI__?: unknown }
        const tauriWindow = window as TauriWindow;
        if (typeof tauriWindow !== 'undefined' && tauriWindow.__TAURI__) {
          const { performance } = await import('@tauri-apps/api');
          const mem = await performance.memory();
          const cpu = await performance.cpu();
          memoryMb = Math.round((mem.used || 0) / 1024 / 1024);
          cpuLoad = Math.round(cpu.currentLoad || 0);
        }
      } catch {
        // ignore – running in web context
      }

      setMetrics(prev => ({ ...prev, memory: memoryMb, cpu: cpuLoad }));
    };

    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};
