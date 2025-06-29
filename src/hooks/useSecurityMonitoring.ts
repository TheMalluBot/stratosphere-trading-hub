import { useState, useEffect, useCallback } from 'react';
import { 
  SecurityEvent,
  SecurityEventType,
  SecurityEventCategory,
  SecurityEventSeverity,
  SecurityAlert,
  ComplianceViolation,
  RiskAssessment,
  SessionInfo,
  DeviceFingerprint,
  SecurityMetrics
} from '@/types/security.types';
import { SecurityAuditLogger } from '@/lib/security/SecurityAuditLogger';
import { ComplianceMonitor } from '@/lib/security/ComplianceMonitor';

interface UseSecurityMonitoringReturn {
  // State
  isInitialized: boolean;
  currentSession: SessionInfo | null;
  securityAlerts: SecurityAlert[];
  complianceViolations: ComplianceViolation[];
  riskAssessment: RiskAssessment | null;
  securityMetrics: SecurityMetrics | null;
  loading: boolean;
  error: string | null;

  // Actions
  initializeSession: (userId: string) => Promise<void>;
  logSecurityEvent: (
    category: SecurityEventCategory,
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    payload: Record<string, any>,
    options?: {
      correlationId?: string;
      parentEventId?: string;
      encrypt?: boolean;
      immutable?: boolean;
    }
  ) => Promise<string>;
  checkOrderCompliance: (orderData: any) => Promise<{
    allowed: boolean;
    violations: ComplianceViolation[];
    warnings: string[];
  }>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  generateRiskAssessment: () => Promise<RiskAssessment>;
  exportAuditLogs: (format?: 'JSON' | 'CSV' | 'XML') => Promise<string>;
  refreshSecurityData: () => Promise<void>;
}

export const useSecurityMonitoring = (): UseSecurityMonitoringReturn => {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceViolations, setComplianceViolations] = useState<ComplianceViolation[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Service instances
  const auditLogger = SecurityAuditLogger.getInstance();
  const complianceMonitor = ComplianceMonitor.getInstance();

  /**
   * Initialize security monitoring session
   */
  const initializeSession = useCallback(async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Generate device fingerprint
      const deviceFingerprint = auditLogger.generateDeviceFingerprint();

      // Get geolocation (mock for now - in production, use IP geolocation service)
      const geolocation = await getGeolocation();

      // Create session info
      const sessionInfo: SessionInfo = {
        sessionId: generateSessionId(),
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        ipAddress: await getClientIP(),
        deviceFingerprint,
        geolocation,
        mfaVerified: false, // This would be set based on actual MFA status
        permissions: await getUserPermissions(userId)
      };

      // Initialize audit logger with session
      await auditLogger.setSessionInfo(sessionInfo);
      setCurrentSession(sessionInfo);

      // Load initial security data
      await refreshSecurityData();

      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize security monitoring';
      setError(errorMessage);
      console.error('Security monitoring initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log a security event
   */
  const logSecurityEvent = useCallback(async (
    category: SecurityEventCategory,
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    payload: Record<string, any>,
    options: {
      correlationId?: string;
      parentEventId?: string;
      encrypt?: boolean;
      immutable?: boolean;
    } = {}
  ): Promise<string> => {
    try {
      const eventId = await auditLogger.logEvent(category, type, severity, payload, options);
      
      // Refresh alerts and metrics after logging critical events
      if (severity === 'CRITICAL' || severity === 'ERROR') {
        await refreshSecurityData();
      }

      return eventId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log security event';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Check order compliance
   */
  const checkOrderCompliance = useCallback(async (orderData: any) => {
    try {
      const result = await complianceMonitor.checkOrderCompliance(orderData);
      
      // Refresh compliance violations if any were found
      if (result.violations.length > 0) {
        await refreshSecurityData();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check order compliance';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Acknowledge a security alert
   */
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      const acknowledgedBy = currentSession?.userId || 'unknown';
      await auditLogger.acknowledgeAlert(alertId, acknowledgedBy);
      await refreshSecurityData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      setError(errorMessage);
      throw err;
    }
  }, [currentSession]);

  /**
   * Generate risk assessment for current user
   */
  const generateRiskAssessment = useCallback(async (): Promise<RiskAssessment> => {
    try {
      if (!currentSession) {
        throw new Error('No active session');
      }

      const assessment = await auditLogger.performRiskAssessment(currentSession.userId);
      setRiskAssessment(assessment);
      return assessment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate risk assessment';
      setError(errorMessage);
      throw err;
    }
  }, [currentSession]);

  /**
   * Export audit logs
   */
  const exportAuditLogs = useCallback(async (format: 'JSON' | 'CSV' | 'XML' = 'JSON'): Promise<string> => {
    try {
      return await auditLogger.exportAuditLogs(format);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export audit logs';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Refresh all security data
   */
  const refreshSecurityData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      // Load security alerts
      const alerts = auditLogger.getSecurityAlerts();
      setSecurityAlerts(alerts);

      // Load compliance violations
      const violations = complianceMonitor.getViolations();
      setComplianceViolations(violations);

      // Generate risk assessment if session exists
      if (currentSession) {
        try {
          const assessment = await auditLogger.performRiskAssessment(currentSession.userId);
          setRiskAssessment(assessment);
        } catch (err) {
          console.warn('Failed to generate risk assessment:', err);
        }
      }

      // Generate security metrics
      const metrics = await generateSecurityMetrics();
      setSecurityMetrics(metrics);

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh security data';
      setError(errorMessage);
      console.error('Failed to refresh security data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  /**
   * Generate security metrics
   */
  const generateSecurityMetrics = useCallback(async (): Promise<SecurityMetrics> => {
    const alerts = auditLogger.getSecurityAlerts();
    const violations = complianceMonitor.getViolations();
    const threatIndicators = auditLogger.getThreatIndicators();

    const criticalEvents = alerts.filter(a => a.severity === 'CRITICAL').length;
    const warningEvents = alerts.filter(a => a.severity === 'WARNING').length;
    const errorEvents = alerts.filter(a => a.severity === 'ERROR').length;
    const activeThreats = threatIndicators.filter(t => !t.mitigated).length;
    const unresolvedViolations = violations.filter(v => !v.resolved).length;

    // Calculate system health based on various factors
    let systemHealth = 100;
    systemHealth -= criticalEvents * 10; // Each critical event reduces health by 10%
    systemHealth -= errorEvents * 5; // Each error reduces health by 5%
    systemHealth -= activeThreats * 15; // Each active threat reduces health by 15%
    systemHealth -= unresolvedViolations * 3; // Each violation reduces health by 3%
    systemHealth = Math.max(0, Math.min(100, systemHealth));

    // Calculate average risk score
    const averageRiskScore = riskAssessment?.overallRiskScore || 0;

    return {
      totalEvents: alerts.length,
      criticalEvents,
      warningEvents,
      errorEvents,
      activeThreats,
      blockedAttempts: Math.floor(Math.random() * 50), // Mock data - replace with real metrics
      complianceViolations: unresolvedViolations,
      averageRiskScore,
      systemHealth
    };
  }, [riskAssessment]);

  // Auto-refresh security data periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      refreshSecurityData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [isInitialized, refreshSecurityData]);

  // Update last activity timestamp
  useEffect(() => {
    if (!currentSession) return;

    const updateActivity = () => {
      setCurrentSession(prev => prev ? {
        ...prev,
        lastActivity: Date.now()
      } : null);
    };

    // Update activity on user interactions
    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [currentSession]);

  return {
    // State
    isInitialized,
    currentSession,
    securityAlerts,
    complianceViolations,
    riskAssessment,
    securityMetrics,
    loading,
    error,

    // Actions
    initializeSession,
    logSecurityEvent,
    checkOrderCompliance,
    acknowledgeAlert,
    generateRiskAssessment,
    exportAuditLogs,
    refreshSecurityData
  };
};

// Helper functions

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function getClientIP(): Promise<string> {
  try {
    // In a real application, you would get this from your backend
    // For now, return a placeholder
    return 'client-ip-hidden';
  } catch {
    return 'unknown';
  }
}

async function getGeolocation(): Promise<any> {
  try {
    // In a real application, you would use IP geolocation service
    // For now, return mock data
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles'
    };
  } catch {
    return undefined;
  }
}

async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // In a real application, you would fetch user permissions from your backend
    // For now, return default permissions
    return ['trading', 'portfolio_view', 'market_data'];
  } catch {
    return [];
  }
} 