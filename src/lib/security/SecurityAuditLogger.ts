import { 
  SecurityEvent, 
  SecurityEventType, 
  SecurityEventCategory, 
  SecurityEventSeverity, 
  SecurityEventMetadata,
  SessionInfo,
  DeviceFingerprint,
  GeolocationData,
  AuditTrailEntry,
  AuditTrailQuery,
  RiskAssessment,
  AnomalyDetection,
  BehaviorPattern,
  SecurityAlert,
  ThreatIndicator
} from '@/types/security.types';
import { EncryptionService } from '@/lib/security/EncryptionService';

/**
 * Institutional-grade Security Audit Logger
 * Provides comprehensive event tracking, behavioral analytics, and threat detection
 */
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: SecurityEvent[] = [];
  private auditTrail: AuditTrailEntry[] = [];
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private anomalies: AnomalyDetection[] = [];
  private alerts: SecurityAlert[] = [];
  private threatIndicators: ThreatIndicator[] = [];
  private encryptionService: EncryptionService;
  private sessionInfo: SessionInfo | null = null;
  private riskAssessmentCache: Map<string, RiskAssessment> = new Map();
  
  // Configuration
  private readonly MAX_EVENTS = 10000;
  private readonly MAX_AUDIT_ENTRIES = 50000;
  private readonly RISK_ASSESSMENT_INTERVAL = 300000; // 5 minutes
  private readonly ANOMALY_DETECTION_THRESHOLD = 0.7;
  private readonly HIGH_FREQUENCY_THRESHOLD = 100; // events per minute
  
  // Performance monitoring
  private eventBuffer: SecurityEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  private constructor() {
    this.encryptionService = new EncryptionService();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.encryptionService.initialize();
      await this.loadPersistedData();
      this.setupPerformanceMonitoring();
      this.setupBehavioralAnalytics();
      this.setupAnomalyDetection();
      this.startRiskAssessmentScheduler();
      
      console.log('🔒 Security Audit Logger initialized');
    } catch (error) {
      console.error('Failed to initialize Security Audit Logger:', error);
    }
  }

  /**
   * Log a security event with comprehensive metadata
   */
  async logEvent(
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
  ): Promise<string> {
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    const microsecondPrecision = performance.now();
    
    // Create comprehensive metadata
    const metadata: SecurityEventMetadata = {
      timestamp,
      microsecondPrecision,
      sessionInfo: this.sessionInfo || this.createEmptySessionInfo(),
      eventId,
      correlationId: options.correlationId,
      parentEventId: options.parentEventId,
      complianceFlags: this.generateComplianceFlags(category, type, payload),
      riskScore: await this.calculateEventRiskScore(category, type, payload),
      anomalyScore: await this.calculateAnomalyScore(type, payload)
    };

    // Create the security event
    const event: SecurityEvent = {
      id: eventId,
      category,
      type,
      severity,
      metadata,
      payload: options.encrypt ? await this.encryptionService.encrypt(payload) : payload,
      encrypted: options.encrypt || false,
      immutable: options.immutable || false,
      blockchainHash: options.immutable ? await this.generateBlockchainHash(eventId, payload) : undefined
    };

    // Add to buffer for batch processing
    this.eventBuffer.push(event);

    // Immediate processing for critical events
    if (severity === 'CRITICAL' || severity === 'ERROR') {
      await this.processEventImmediately(event);
    }

    // Trigger flush if buffer is full
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushEventBuffer();
    }

    // Update behavioral patterns
    this.updateBehaviorPattern(event);

    // Check for anomalies
    await this.checkForAnomalies(event);

    // Generate alerts if necessary
    await this.generateAlerts(event);

    return eventId;
  }

  /**
   * Create audit trail entry
   */
  async createAuditTrailEntry(
    eventType: SecurityEventType,
    userId: string,
    resource: string,
    action: string,
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED',
    details: Record<string, any>
  ): Promise<void> {
    const entry: AuditTrailEntry = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      eventType,
      userId,
      sessionId: this.sessionInfo?.sessionId || 'unknown',
      ipAddress: this.sessionInfo?.ipAddress || 'unknown',
      resource,
      action,
      result,
      details,
      hash: await this.calculateAuditHash(userId, resource, action, details),
      previousHash: this.auditTrail.length > 0 ? this.auditTrail[this.auditTrail.length - 1].hash : undefined,
      blockNumber: this.auditTrail.length
    };

    this.auditTrail.push(entry);

    // Maintain size limit
    if (this.auditTrail.length > this.MAX_AUDIT_ENTRIES) {
      await this.archiveOldAuditEntries();
    }

    // Persist to secure storage
    await this.persistAuditTrail();
  }

  /**
   * Set current session information
   */
  async setSessionInfo(sessionInfo: SessionInfo): Promise<void> {
    this.sessionInfo = sessionInfo;
    
    // Log session start
    await this.logEvent(
      'AUTHENTICATION',
      'LOGIN_SUCCESS',
      'INFO',
      {
        userId: sessionInfo.userId,
        ipAddress: sessionInfo.ipAddress,
        deviceFingerprint: sessionInfo.deviceFingerprint,
        geolocation: sessionInfo.geolocation,
        mfaVerified: sessionInfo.mfaVerified
      },
      { immutable: true }
    );

    // Initialize behavior pattern for user
    await this.initializeBehaviorPattern(sessionInfo.userId);
  }

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasFingerprint = '';
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprinting', 2, 2);
      canvasFingerprint = canvas.toDataURL();
    }

    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      plugins: Array.from(navigator.plugins).map(p => p.name),
      canvas: canvasFingerprint.substring(0, 100), // Truncate for storage
      webgl: this.getWebGLFingerprint()
    };
  }

  /**
   * Perform real-time risk assessment
   */
  async performRiskAssessment(userId: string): Promise<RiskAssessment> {
    const cached = this.riskAssessmentCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.RISK_ASSESSMENT_INTERVAL) {
      return cached;
    }

    const userEvents = this.events.filter(e => 
      e.metadata.sessionInfo.userId === userId &&
      Date.now() - e.metadata.timestamp < 3600000 // Last hour
    );

    const riskFactors = await this.calculateRiskFactors(userEvents);
    const overallRiskScore = this.calculateOverallRiskScore(riskFactors);
    
    const assessment: RiskAssessment = {
      userId,
      sessionId: this.sessionInfo?.sessionId || 'unknown',
      timestamp: Date.now(),
      overallRiskScore,
      riskFactors,
      recommendations: this.generateRiskRecommendations(riskFactors),
      requiresAction: overallRiskScore > 0.8,
      actionRequired: overallRiskScore > 0.8 ? ['SEND_ALERT', 'ESCALATE'] : undefined
    };

    this.riskAssessmentCache.set(userId, assessment);
    return assessment;
  }

  /**
   * Query audit trail with comprehensive filtering
   */
  async queryAuditTrail(query: AuditTrailQuery): Promise<AuditTrailEntry[]> {
    let results = [...this.auditTrail];

    // Apply filters
    if (query.startTime) {
      results = results.filter(entry => entry.timestamp >= query.startTime!);
    }

    if (query.endTime) {
      results = results.filter(entry => entry.timestamp <= query.endTime!);
    }

    if (query.userId) {
      results = results.filter(entry => entry.userId === query.userId);
    }

    if (query.eventTypes && query.eventTypes.length > 0) {
      results = results.filter(entry => query.eventTypes!.includes(entry.eventType));
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      results = results.filter(entry =>
        entry.resource.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.details).toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(unacknowledged: boolean = false): SecurityAlert[] {
    const alerts = unacknowledged 
      ? this.alerts.filter(alert => !alert.acknowledged)
      : this.alerts;
    
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Acknowledge security alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
      
      await this.logEvent(
        'SYSTEM',
        'CONFIG_CHANGED',
        'INFO',
        { alertId, acknowledgedBy, action: 'alert_acknowledged' }
      );
    }
  }

  /**
   * Get threat indicators
   */
  getThreatIndicators(): ThreatIndicator[] {
    return this.threatIndicators
      .filter(indicator => !indicator.mitigated)
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  /**
   * Export audit logs for regulatory compliance
   */
  async exportAuditLogs(
    format: 'JSON' | 'CSV' | 'XML' = 'JSON',
    query?: AuditTrailQuery
  ): Promise<string> {
    const entries = query ? await this.queryAuditTrail(query) : this.auditTrail;
    
    // Log the export event
    await this.logEvent(
      'COMPLIANCE',
      'DATA_EXPORT',
      'WARNING',
      { 
        format, 
        entryCount: entries.length, 
        query,
        exportedBy: this.sessionInfo?.userId 
      },
      { immutable: true }
    );

    switch (format) {
      case 'CSV':
        return this.exportToCSV(entries);
      case 'XML':
        return this.exportToXML(entries);
      default:
        return JSON.stringify(entries, null, 2);
    }
  }

  // Private helper methods

  private async processEventImmediately(event: SecurityEvent): Promise<void> {
    // Immediate processing for critical events
    this.events.push(event);
    await this.persistEvents();
    
    // Create audit trail entry
    await this.createAuditTrailEntry(
      event.type,
      event.metadata.sessionInfo.userId,
      'security_event',
      'log_event',
      'SUCCESS',
      { eventId: event.id, severity: event.severity }
    );
  }

  private async flushEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    // Add to main events array
    this.events.push(...eventsToFlush);

    // Maintain size limit
    if (this.events.length > this.MAX_EVENTS) {
      await this.archiveOldEvents();
    }

    // Persist to storage
    await this.persistEvents();

    // Clear flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private setupPerformanceMonitoring(): void {
    // Setup automatic buffer flushing
    this.flushTimer = setInterval(async () => {
      await this.flushEventBuffer();
    }, this.FLUSH_INTERVAL);

    // Monitor high-frequency events
    setInterval(() => {
      this.detectHighFrequencyEvents();
    }, 60000); // Check every minute
  }

  private setupBehavioralAnalytics(): void {
    // Update behavior patterns every 5 minutes
    setInterval(() => {
      this.updateAllBehaviorPatterns();
    }, 300000);
  }

  private setupAnomalyDetection(): void {
    // Run anomaly detection every minute
    setInterval(() => {
      this.runAnomalyDetection();
    }, 60000);
  }

  private startRiskAssessmentScheduler(): void {
    // Perform risk assessments every 5 minutes for active users
    setInterval(() => {
      this.performScheduledRiskAssessments();
    }, this.RISK_ASSESSMENT_INTERVAL);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createEmptySessionInfo(): SessionInfo {
    return {
      sessionId: 'unknown',
      userId: 'anonymous',
      startTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress: 'unknown',
      deviceFingerprint: this.generateDeviceFingerprint(),
      mfaVerified: false,
      permissions: []
    };
  }

  private generateComplianceFlags(
    category: SecurityEventCategory,
    type: SecurityEventType,
    payload: Record<string, any>
  ): string[] {
    const flags: string[] = [];

    // Add regulatory flags based on event type
    if (category === 'TRADING') {
      flags.push('MIFID_II', 'BEST_EXECUTION');
    }

    if (type === 'SUSPICIOUS_ACTIVITY') {
      flags.push('AML_MONITORING', 'SAR_REQUIRED');
    }

    if (category === 'RISK_MANAGEMENT') {
      flags.push('RISK_REPORTING', 'POSITION_MONITORING');
    }

    return flags;
  }

  private async calculateEventRiskScore(
    category: SecurityEventCategory,
    type: SecurityEventType,
    payload: Record<string, any>
  ): Promise<number> {
    let riskScore = 0;

    // Base risk scores by category
    const categoryRisk = {
      'AUTHENTICATION': 0.3,
      'TRADING': 0.5,
      'PORTFOLIO': 0.4,
      'SYSTEM': 0.6,
      'RISK_MANAGEMENT': 0.8,
      'COMPLIANCE': 0.9,
      'API_ACCESS': 0.4,
      'DATA_ACCESS': 0.5
    };

    riskScore += categoryRisk[category] || 0.3;

    // Adjust based on event type
    if (type.includes('FAILED') || type.includes('EXCEEDED') || type.includes('VIOLATION')) {
      riskScore += 0.3;
    }

    if (type === 'SUSPICIOUS_ACTIVITY') {
      riskScore += 0.5;
    }

    // Consider payload factors
    if (payload.amount && payload.amount > 100000) {
      riskScore += 0.2;
    }

    if (payload.frequency && payload.frequency > 10) {
      riskScore += 0.1;
    }

    return Math.min(riskScore, 1.0);
  }

  private async calculateAnomalyScore(
    type: SecurityEventType,
    payload: Record<string, any>
  ): Promise<number> {
    // Implement machine learning-based anomaly detection
    // This is a simplified version - in production, use proper ML models
    
    const recentEvents = this.events.filter(e => 
      Date.now() - e.metadata.timestamp < 3600000 // Last hour
    );

    const typeFrequency = recentEvents.filter(e => e.type === type).length;
    const avgFrequency = recentEvents.length / 60; // Events per minute
    
    let anomalyScore = 0;

    // Frequency-based anomaly detection
    if (typeFrequency > avgFrequency * 3) {
      anomalyScore += 0.4;
    }

    // Pattern-based detection
    if (this.detectSuspiciousPatterns(type, payload)) {
      anomalyScore += 0.6;
    }

    return Math.min(anomalyScore, 1.0);
  }

  private async generateBlockchainHash(eventId: string, payload: Record<string, any>): Promise<string> {
    const data = JSON.stringify({ eventId, payload, timestamp: Date.now() });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async calculateAuditHash(
    userId: string,
    resource: string,
    action: string,
    details: Record<string, any>
  ): Promise<string> {
    const data = JSON.stringify({ userId, resource, action, details, timestamp: Date.now() });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) return 'not-supported';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${renderer}|${vendor}`;
    } catch {
      return 'error';
    }
  }

  private async calculateRiskFactors(events: SecurityEvent[]): Promise<any[]> {
    // Implement comprehensive risk factor calculation
    // This is a simplified version
    return [
      {
        type: 'frequency',
        score: Math.min(events.length / 100, 1.0),
        weight: 0.3,
        description: 'Event frequency analysis',
        evidence: { eventCount: events.length }
      }
    ];
  }

  private calculateOverallRiskScore(riskFactors: any[]): number {
    return riskFactors.reduce((total, factor) => 
      total + (factor.score * factor.weight), 0
    );
  }

  private generateRiskRecommendations(riskFactors: any[]): string[] {
    const recommendations: string[] = [];
    
    riskFactors.forEach(factor => {
      if (factor.score > 0.7) {
        recommendations.push(`Review ${factor.type} patterns`);
      }
    });

    return recommendations;
  }

  private updateBehaviorPattern(event: SecurityEvent): void {
    // Implement behavioral pattern analysis
    // This would analyze user behavior over time
  }

  private async checkForAnomalies(event: SecurityEvent): Promise<void> {
    if (event.metadata.anomalyScore > this.ANOMALY_DETECTION_THRESHOLD) {
      const anomaly: AnomalyDetection = {
        id: this.generateEventId(),
        userId: event.metadata.sessionInfo.userId,
        timestamp: Date.now(),
        anomalyType: event.type,
        severity: event.severity,
        confidence: event.metadata.anomalyScore,
        description: `Anomalous ${event.type} event detected`,
        evidence: event.payload,
        falsePositive: false,
        investigated: false
      };
      
      this.anomalies.push(anomaly);
    }
  }

  private async generateAlerts(event: SecurityEvent): Promise<void> {
    if (event.severity === 'CRITICAL' || event.metadata.riskScore > 0.8) {
      const alert: SecurityAlert = {
        id: this.generateEventId(),
        type: event.type,
        severity: event.severity,
        title: `Security Alert: ${event.type}`,
        description: `High-risk security event detected`,
        timestamp: Date.now(),
        userId: event.metadata.sessionInfo.userId,
        sessionId: event.metadata.sessionInfo.sessionId,
        acknowledged: false,
        resolved: false,
        escalated: event.severity === 'CRITICAL'
      };
      
      this.alerts.push(alert);
    }
  }

  private detectHighFrequencyEvents(): void {
    const lastMinute = Date.now() - 60000;
    const recentEvents = this.events.filter(e => e.metadata.timestamp > lastMinute);
    
    if (recentEvents.length > this.HIGH_FREQUENCY_THRESHOLD) {
      this.logEvent(
        'SYSTEM',
        'SUSPICIOUS_ACTIVITY',
        'WARNING',
        { 
          type: 'high_frequency_events',
          count: recentEvents.length,
          threshold: this.HIGH_FREQUENCY_THRESHOLD
        }
      );
    }
  }

  private detectSuspiciousPatterns(type: SecurityEventType, payload: Record<string, any>): boolean {
    // Implement pattern detection logic
    // This is a placeholder for more sophisticated ML-based detection
    return false;
  }

  private updateAllBehaviorPatterns(): void {
    // Update behavior patterns for all active users
  }

  private runAnomalyDetection(): void {
    // Run comprehensive anomaly detection
  }

  private performScheduledRiskAssessments(): void {
    // Perform risk assessments for active users
  }

  private async initializeBehaviorPattern(userId: string): Promise<void> {
    // Initialize behavior pattern tracking for user
  }

  private async loadPersistedData(): Promise<void> {
    // Load persisted events, audit trail, etc.
  }

  private async persistEvents(): Promise<void> {
    // Persist events to secure storage
  }

  private async persistAuditTrail(): Promise<void> {
    // Persist audit trail to secure storage
  }

  private async archiveOldEvents(): Promise<void> {
    // Archive old events to long-term storage
  }

  private async archiveOldAuditEntries(): Promise<void> {
    // Archive old audit entries
  }

  private exportToCSV(entries: AuditTrailEntry[]): string {
    const headers = ['ID', 'Timestamp', 'Event Type', 'User ID', 'IP Address', 'Resource', 'Action', 'Result'];
    const rows = entries.map(entry => [
      entry.id,
      new Date(entry.timestamp).toISOString(),
      entry.eventType,
      entry.userId,
      entry.ipAddress,
      entry.resource,
      entry.action,
      entry.result
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToXML(entries: AuditTrailEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<audit_trail>\n';
    
    entries.forEach(entry => {
      xml += `  <entry>\n`;
      xml += `    <id>${entry.id}</id>\n`;
      xml += `    <timestamp>${new Date(entry.timestamp).toISOString()}</timestamp>\n`;
      xml += `    <event_type>${entry.eventType}</event_type>\n`;
      xml += `    <user_id>${entry.userId}</user_id>\n`;
      xml += `    <ip_address>${entry.ipAddress}</ip_address>\n`;
      xml += `    <resource>${entry.resource}</resource>\n`;
      xml += `    <action>${entry.action}</action>\n`;
      xml += `    <result>${entry.result}</result>\n`;
      xml += `  </entry>\n`;
    });
    
    xml += '</audit_trail>';
    return xml;
  }
}
