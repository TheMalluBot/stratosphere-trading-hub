// Ambient module declarations for the Tauri JavaScript API.
// These are minimal shims so that TypeScript can compile in a web context
// where the real `@tauri-apps/api` package is unavailable.

declare module '@tauri-apps/api' {
  export namespace app {
    function getVersion(): Promise<string>;
    function platform(): Promise<string>;
    function whenReady(): Promise<void>;
    function quit(): Promise<void>;
  }

  export namespace window {
    interface CreateWindowOptions {
      width: number;
      height: number;
      title: string;
      center?: boolean;
      minWidth?: number;
      minHeight?: number;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createWindow(options: CreateWindowOptions): Promise<any>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createTray(options: any): Promise<any>;
  }

  export namespace performance {
    interface MemoryInfo {
      used: number;
    }
    interface CpuInfo {
      currentLoad: number;
    }
    function memory(): Promise<MemoryInfo>;
    function cpu(): Promise<CpuInfo>;
  }
}
