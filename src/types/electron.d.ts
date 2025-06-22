
// Web-only type definitions for desktop integration compatibility
declare global {
  interface Window {
    // Web APIs for desktop-like functionality
    showNotification?: (title: string, body: string) => void;
    requestIdleCallback?: (callback: () => void) => void;
  }
  
  interface Navigator {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  }
}

export {};
