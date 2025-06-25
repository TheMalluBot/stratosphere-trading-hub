import { useEffect } from 'react';

interface SecurityEvent {
  type: 'login' | 'logout' | 'api_call' | 'order_placed' | 'config_changed' | 'error' | 'suspicious_activity';
  details: Record<string, any>;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  private constructor() {
    this.loadFromStorage();
    this.setupEventListeners();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('security_audit_log');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load security audit log:', error);
    }
  }

  private saveToStorage() {
    try {
      // Keep only recent events
      const recentEvents = this.events.slice(-this.maxEvents);
      localStorage.setItem('security_audit_log', JSON.stringify(recentEvents));
      this.events = recentEvents;
    } catch (error) {
      console.error('Failed to save security audit log:', error);
    }
  }

  private setupEventListeners() {
    // Monitor for suspicious activities
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    document.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        if (clickCount > 50) { // More than 50 clicks in 5 seconds
          this.logEvent('suspicious_activity', {
            type: 'rapid_clicking',
            count: clickCount
          });
        }
        clickCount = 0;
      }, 5000);
    });

    // Monitor console access
    const originalConsole = { ...console };
    ['log', 'warn', 'error', 'info'].forEach(method => {
      (console as any)[method] = (...args: any[]) => {
        if (process.env.NODE_ENV === 'production') {
          this.logEvent('suspicious_activity', {
            type: 'console_access',
            method,
            args: args.slice(0, 2) // Only log first 2 args for privacy
          });
        }
        (originalConsole as any)[method](...args);
      };
    });
  }

  logEvent(type: SecurityEvent['type'], details: Record<string, any>, userId?: string) {
    const event: SecurityEvent = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    this.saveToStorage();

    // Log critical events immediately
    if (['suspicious_activity', 'error'].includes(type)) {
      console.warn('Security Event:', event);
    }
  }

  private getClientIP(): string {
    // In a real application, you would get this from your backend
    return 'client-ip-hidden';
  }

  getEvents(type?: SecurityEvent['type'], limit?: number): SecurityEvent[] {
    let filtered = type ? this.events.filter(e => e.type === type) : this.events;
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered.reverse(); // Most recent first
  }

  exportLogs(): string {
    return JSON.stringify(this.events, null, 2);
  }

  clearLogs() {
    this.events = [];
    localStorage.removeItem('security_audit_log');
  }

  // Check for suspicious patterns
  detectAnomalies(): Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> {
    const anomalies: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];
    const recentEvents = this.events.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );

    // Check for rapid API calls
    const apiCalls = recentEvents.filter(e => e.type === 'api_call');
    if (apiCalls.length > 100) {
      anomalies.push({
        type: 'high_api_usage',
        description: `${apiCalls.length} API calls in the last hour`,
        severity: 'medium'
      });
    }

    // Check for multiple failed logins
    const failedLogins = recentEvents.filter(e => 
      e.type === 'login' && e.details.success === false
    );
    if (failedLogins.length > 5) {
      anomalies.push({
        type: 'multiple_failed_logins',
        description: `${failedLogins.length} failed login attempts`,
        severity: 'high'
      });
    }

    // Check for suspicious activities
    const suspiciousActivities = recentEvents.filter(e => e.type === 'suspicious_activity');
    if (suspiciousActivities.length > 0) {
      anomalies.push({
        type: 'suspicious_behavior',
        description: `${suspiciousActivities.length} suspicious activities detected`,
        severity: 'high'
      });
    }

    return anomalies;
  }
}

// React hook for using the security logger
export const useSecurityAuditLogger = () => {
  const logger = SecurityAuditLogger.getInstance();

  useEffect(() => {
    // Log component mount
    logger.logEvent('login', { action: 'component_mounted', component: 'SecurityAuditLogger' });

    return () => {
      // Log component unmount
      logger.logEvent('logout', { action: 'component_unmounted', component: 'SecurityAuditLogger' });
    };
  }, [logger]);

  return {
    logEvent: (type: SecurityEvent['type'], details: Record<string, any>, userId?: string) =>
      logger.logEvent(type, details, userId),
    getEvents: (type?: SecurityEvent['type'], limit?: number) => logger.getEvents(type, limit),
    detectAnomalies: () => logger.detectAnomalies(),
    exportLogs: () => logger.exportLogs(),
    clearLogs: () => logger.clearLogs()
  };
};
