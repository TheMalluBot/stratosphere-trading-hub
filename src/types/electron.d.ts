
// Electron API type definitions
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getSystemInfo: () => Promise<{
        platform: string;
        arch: string;
        nodeVersion: string;
        electronVersion: string;
      }>;
      onNavigateTo: (callback: (route: string) => void) => void;
      onNewStrategy: (callback: () => void) => void;
      onImportStrategy: (callback: () => void) => void;
      onStartTrading: (callback: () => void) => void;
      onStopAllAlgos: (callback: () => void) => void;
      onEmergencyStop: (callback: () => void) => void;
      showNotification: (notification: { title: string; body: string; icon?: string }) => Promise<void>;
      minimizeToTray: () => Promise<void>;
      focusWindow: () => Promise<void>;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export {};
