import { app, window } from '@tauri-apps/api';
import { logSecurityEvent } from '@/lib/security/SecurityAuditLogger';

export const initializeDesktopIntegration = async () => {
  // Native app features
  await app.whenReady();
  
  const mainWindow = await window.createWindow({
    width: 1200,
    height: 800,
    title: "Stratosphere Trading Hub",
    center: true,
    minWidth: 1024,
    minHeight: 768,
  });

  // Security audit logging for desktop startup
  const version = await app.getVersion();
  const platform = await app.platform();
  logSecurityEvent('DESKTOP_START', { 
    version,
    platform,
    windowSize: { width: 1200, height: 800 }
  });

  await mainWindow.loadURL('http://localhost:3000');
  
  // Enable system tray integration
  const tray = await window.createTray({
    icon: 'public/tray-icon.png',
    menu: [{
      text: 'Show',
      action: () => mainWindow.show()
    }, {
      text: 'Exit',
      action: () => app.quit()
    }]
  });
};
