
import { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain, globalShortcut } from 'electron';
import { join } from 'path';
import { isDev, platform } from './utils';

class AlgoTradePro {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting = false;

  constructor() {
    this.setupApp();
    this.createWindow();
    this.setupIPC();
    this.setupGlobalShortcuts();
  }

  private setupApp() {
    // Set app user model ID for Windows
    if (platform === 'win32') {
      app.setAppUserModelId('com.algotradepro.app');
    }

    // Security: prevent navigation to external URLs
    app.on('web-contents-created', (_, contents) => {
      contents.on('new-window', (navigationEvent, navigationUrl) => {
        navigationEvent.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });

    app.on('window-all-closed', () => {
      if (platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      title: 'AlgoTrade Pro',
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      icon: join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true,
      },
      show: false,
      titleBarStyle: platform === 'darwin' ? 'hiddenInset' : 'default',
    });

    // Load the application
    const url = isDev 
      ? 'http://localhost:8080' 
      : `file://${join(__dirname, '../dist/index.html')}`;
    
    this.mainWindow.loadURL(url);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window close
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && platform === 'win32') {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // Setup system tray
    this.setupTray();

    // Setup menu
    this.setupMenu();
  }

  private setupTray() {
    const icon = nativeImage.createFromPath(join(__dirname, '../assets/tray-icon.png'));
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show AlgoTrade Pro',
        click: () => {
          this.mainWindow?.show();
          this.mainWindow?.focus();
        }
      },
      {
        label: 'Trading Dashboard',
        click: () => {
          this.mainWindow?.show();
          this.mainWindow?.webContents.send('navigate-to', '/dashboard');
        }
      },
      {
        label: 'Live Trading',
        click: () => {
          this.mainWindow?.show();
          this.mainWindow?.webContents.send('navigate-to', '/trading');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.isQuitting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('AlgoTrade Pro - Advanced Trading Platform');
    
    this.tray.on('double-click', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });
  }

  private setupMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Strategy',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('new-strategy');
            }
          },
          {
            label: 'Import Strategy',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow?.webContents.send('import-strategy');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Trading',
        submenu: [
          {
            label: 'Start Trading',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.mainWindow?.webContents.send('start-trading');
            }
          },
          {
            label: 'Stop All Algorithms',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.mainWindow?.webContents.send('stop-all-algos');
            }
          },
          {
            label: 'Emergency Stop',
            accelerator: 'F12',
            click: () => {
              this.mainWindow?.webContents.send('emergency-stop');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/dashboard');
            }
          },
          {
            label: 'TradingView',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/tradingview');
            }
          },
          {
            label: 'Algo Trading',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/algo-trading');
            }
          },
          { type: 'separator' },
          {
            label: 'Toggle Fullscreen',
            accelerator: platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
            click: () => {
              const isFullScreen = this.mainWindow?.isFullScreen();
              this.mainWindow?.setFullScreen(!isFullScreen);
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            click: () => {
              this.mainWindow?.minimize();
            }
          },
          {
            label: 'Maximize',
            click: () => {
              if (this.mainWindow?.isMaximized()) {
                this.mainWindow?.unmaximize();
              } else {
                this.mainWindow?.maximize();
              }
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }

  private setupGlobalShortcuts() {
    // Register global shortcuts when app is focused
    app.on('browser-window-focus', () => {
      globalShortcut.register('CommandOrControl+Shift+E', () => {
        this.mainWindow?.webContents.send('emergency-stop');
      });
    });

    app.on('browser-window-blur', () => {
      globalShortcut.unregisterAll();
    });
  }

  private setupIPC() {
    // Handle renderer process requests
    ipcMain.handle('get-app-version', () => app.getVersion());
    
    ipcMain.handle('get-system-info', () => ({
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
    }));

    ipcMain.handle('show-notification', (_, { title, body, icon }) => {
      new Notification({
        title,
        body,
        icon: icon || join(__dirname, '../assets/icon.png'),
      }).show();
    });

    ipcMain.handle('minimize-to-tray', () => {
      this.mainWindow?.hide();
    });

    ipcMain.handle('focus-window', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });
  }
}

// Initialize app when ready
app.whenReady().then(() => {
  new AlgoTradePro();
});
