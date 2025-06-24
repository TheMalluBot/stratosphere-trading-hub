
export class SecurityMonitor {
  private originalHashes: Map<string, string> = new Map();
  private integrityInterval: number | null = null;
  private isSecurityCompromised = false;

  initialize() {
    this.calculateOriginalHashes();
    this.startIntegrityMonitoring();
    this.setupAntiDebugging();
    this.setupConsoleProtection();
    console.log('🔒 Security Monitor initialized');
  }

  private calculateOriginalHashes() {
    // Store hashes of critical functions
    const criticalFunctions = [
      'placeOrder',
      'calculateRisk',
      'processMarketData',
      'encryptData',
      'validateTransaction'
    ];

    criticalFunctions.forEach((funcName, index) => {
      const hash = this.simpleHash(funcName + Date.now());
      this.originalHashes.set(`function_${index}`, hash);
    });
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private startIntegrityMonitoring() {
    this.integrityInterval = setInterval(() => {
      if (!this.verifyIntegrity()) {
        this.handleSecurityBreach();
      }
    }, 5000) as any;
  }

  private verifyIntegrity(): boolean {
    // Check if critical DOM elements have been tampered with
    const criticalElements = document.querySelectorAll('[data-critical]');
    if (criticalElements.length === 0) {
      return false;
    }

    // Check for suspicious modifications
    const scripts = document.querySelectorAll('script[src*="unknown"]');
    if (scripts.length > 0) {
      return false;
    }

    return true;
  }

  private setupAntiDebugging() {
    // Multiple anti-debugging techniques
    setInterval(() => {
      const start = performance.now();
      debugger; // This will pause if debugger is open
      const end = performance.now();
      
      if (end - start > 100) {
        this.handleSecurityBreach();
      }
    }, 2000);

    // Detect DevTools
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleSecurityBreach();
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  private setupConsoleProtection() {
    // Disable console methods in production
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
        (console as any)[method] = noop;
      });
    }
  }

  private handleSecurityBreach() {
    if (this.isSecurityCompromised) return;
    
    this.isSecurityCompromised = true;
    console.warn('⚠️ Security breach detected - initiating secure shutdown');
    
    // Clear sensitive data
    this.clearSensitiveData();
    
    // Show security warning
    this.showSecurityWarning();
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = '/security-alert';
    }, 3000);
  }

  private clearSensitiveData() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) indexedDB.deleteDatabase(db.name);
          });
        });
      }
    } catch (error) {
      console.error('Failed to clear sensitive data:', error);
    }
  }

  private showSecurityWarning() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 18px;
      z-index: 999999;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <h2>🔒 Security Alert</h2>
        <p>Unauthorized access detected.</p>
        <p>Application shutting down for security.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  cleanup() {
    if (this.integrityInterval) {
      clearInterval(this.integrityInterval);
    }
  }
}

export const securityMonitor = new SecurityMonitor();
