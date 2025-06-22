
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Navigation
  onNavigateTo: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate-to', (_, route) => callback(route));
  },

  // Trading actions
  onNewStrategy: (callback: () => void) => {
    ipcRenderer.on('new-strategy', callback);
  },
  onImportStrategy: (callback: () => void) => {
    ipcRenderer.on('import-strategy', callback);
  },
  onStartTrading: (callback: () => void) => {
    ipcRenderer.on('start-trading', callback);
  },
  onStopAllAlgos: (callback: () => void) => {
    ipcRenderer.on('stop-all-algos', callback);
  },
  onEmergencyStop: (callback: () => void) => {
    ipcRenderer.on('emergency-stop', callback);
  },

  // System integration
  showNotification: (notification: { title: string; body: string; icon?: string }) =>
    ipcRenderer.invoke('show-notification', notification),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  focusWindow: () => ipcRenderer.invoke('focus-window'),

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Types for TypeScript
declare global {
  interface Window {
    electronAPI: {
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
