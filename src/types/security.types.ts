// Security Event Types and Interfaces
export type SecurityEventCategory = 
  | 'AUTHENTICATION'
  | 'TRADING'
  | 'PORTFOLIO'
  | 'SYSTEM'
  | 'RISK_MANAGEMENT'
  | 'COMPLIANCE'
  | 'API_ACCESS'
  | 'DATA_ACCESS';

export type SecurityEventType = 
  // Authentication events
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'SESSION_TIMEOUT'
  | 'CONCURRENT_SESSION_DETECTED'
  
  // Trading events
  | 'ORDER_PLACED'
  | 'ORDER_MODIFIED'
  | 'ORDER_CANCELLED'
  | 'ORDER_FILLED'
  | 'STRATEGY_DEPLOYED'
  | 'STRATEGY_STOPPED'
  | 'EMERGENCY_STOP'
  
  // Portfolio events
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'POSITION_OPENED'
  | 'POSITION_CLOSED'
  | 'LEVERAGE_CHANGED'
  
  // System events
  | 'SYSTEM_ERROR'
  | 'CONFIG_CHANGED'
  | 'API_KEY_CREATED'
  | 'API_KEY_ROTATED'
  | 'API_KEY_DELETED'
  | 'PERMISSION_CHANGED'
  
  // Risk management
  | 'RISK_LIMIT_EXCEEDED'
  | 'POSITION_LIMIT_EXCEEDED'
  | 'DRAWDOWN_LIMIT_EXCEEDED'
  | 'MARGIN_CALL'
  | 'LIQUIDATION'
  
  // Compliance
  | 'COMPLIANCE_VIOLATION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'REGULATORY_REPORT'
  | 'AUDIT_TRAIL_ACCESS'
  | 'DATA_EXPORT';

export type SecurityEventSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface DeviceFingerprint {
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  plugins: string[];
  canvas?: string;
  webgl?: string;
}

export interface GeolocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  isVpn?: boolean;
  isTor?: boolean;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  ipAddress: string;
  deviceFingerprint: DeviceFingerprint;
  geolocation?: GeolocationData;
  mfaVerified: boolean;
  permissions: string[];
}

export interface SecurityEventMetadata {
  timestamp: number;
  microsecondPrecision: number;
  sessionInfo: SessionInfo;
  eventId: string;
  correlationId?: string;
  parentEventId?: string;
  complianceFlags: string[];
  riskScore: number;
  anomalyScore: number;
}

export interface SecurityEvent {
  id: string;
  category: SecurityEventCategory;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  metadata: SecurityEventMetadata;
  payload: Record<string, any>;
  encrypted: boolean;
  immutable: boolean;
  blockchainHash?: string;
}

// Compliance Types
export type ComplianceRuleType = 
  | 'POSITION_LIMIT'
  | 'LEVERAGE_LIMIT'
  | 'DAILY_LOSS_LIMIT'
  | 'CONCENTRATION_LIMIT'
  | 'WASH_TRADING'
  | 'MARKET_MANIPULATION'
  | 'BEST_EXECUTION'
  | 'CLIENT_ASSET_SEGREGATION'
  | 'AML_KYC'
  | 'MIFID_II'
  | 'EMIR';

export interface ComplianceRule {
  id: string;
  type: ComplianceRuleType;
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
  severity: SecurityEventSeverity;
  actions: ComplianceAction[];
  lastUpdated: number;
  version: string;
}

export type ComplianceActionType = 
  | 'BLOCK_ORDER'
  | 'REDUCE_POSITION'
  | 'FREEZE_ACCOUNT'
  | 'SEND_ALERT'
  | 'GENERATE_REPORT'
  | 'ESCALATE'
  | 'LOG_VIOLATION';

export interface ComplianceAction {
  type: ComplianceActionType;
  parameters: Record<string, any>;
  automatic: boolean;
  requiresApproval: boolean;
  approvers: string[];
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  type: ComplianceRuleType;
  severity: SecurityEventSeverity;
  timestamp: number;
  userId: string;
  description: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
  actions: ComplianceAction[];
}

// Audit Trail Types
export interface AuditTrailEntry {
  id: string;
  timestamp: number;
  eventType: SecurityEventType;
  userId: string;
  sessionId: string;
  ipAddress: string;
  resource: string;
  action: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details: Record<string, any>;
  hash: string;
  previousHash?: string;
  blockNumber?: number;
}

export interface AuditTrailQuery {
  startTime?: number;
  endTime?: number;
  userId?: string;
  eventTypes?: SecurityEventType[];
  severity?: SecurityEventSeverity[];
  categories?: SecurityEventCategory[];
  searchText?: string;
  limit?: number;
  offset?: number;
}

// Risk Assessment Types
export interface RiskAssessment {
  userId: string;
  sessionId: string;
  timestamp: number;
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  requiresAction: boolean;
  actionRequired?: ComplianceActionType[];
}

export interface RiskFactor {
  type: string;
  score: number;
  weight: number;
  description: string;
  evidence: Record<string, any>;
}

// Behavioral Analytics Types
export interface BehaviorPattern {
  userId: string;
  patternType: string;
  baseline: Record<string, number>;
  current: Record<string, number>;
  deviation: number;
  confidence: number;
  lastUpdated: number;
}

export interface AnomalyDetection {
  id: string;
  userId: string;
  timestamp: number;
  anomalyType: string;
  severity: SecurityEventSeverity;
  confidence: number;
  description: string;
  evidence: Record<string, any>;
  falsePositive: boolean;
  investigated: boolean;
  investigatedBy?: string;
  investigatedAt?: number;
}

// Encryption Types
export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyDerivation: 'PBKDF2' | 'Argon2id';
  iterations: number;
  saltLength: number;
  keyRotationInterval: number;
}

export interface EncryptedData {
  algorithm: string;
  iv: string;
  data: string;
  tag: string;
  timestamp: number;
  keyVersion: string;
}

// API Security Types
export interface ApiKeyInfo {
  id: string;
  name: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
  rateLimitWindow: number;
  lastUsed?: number;
  usageCount: number;
  created: number;
  expires?: number;
  revoked: boolean;
  revokedAt?: number;
  revokedBy?: string;
  ipWhitelist?: string[];
}

export interface ApiUsageMetrics {
  keyId: string;
  timestamp: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  rateLimitHit: boolean;
}

// Regulatory Reporting Types
export interface RegulatoryReport {
  id: string;
  type: 'MIFID_II' | 'EMIR' | 'BEST_EXECUTION' | 'SUSPICIOUS_ACTIVITY';
  period: {
    start: number;
    end: number;
  };
  data: Record<string, any>;
  generated: number;
  generatedBy: string;
  submitted?: number;
  submittedTo?: string;
  status: 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  errors?: string[];
}

// Security Dashboard Types
export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  errorEvents: number;
  activeThreats: number;
  blockedAttempts: number;
  complianceViolations: number;
  averageRiskScore: number;
  systemHealth: number;
}

export interface ThreatIndicator {
  id: string;
  type: string;
  severity: SecurityEventSeverity;
  description: string;
  firstSeen: number;
  lastSeen: number;
  count: number;
  source: string;
  mitigated: boolean;
  mitigatedAt?: number;
}

// Security Configuration Types
export interface SecurityConfig {
  sessionTimeout: number;
  maxConcurrentSessions: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
    preventReuse: number;
  };
  mfaRequired: boolean;
  ipWhitelisting: boolean;
  geoBlocking: {
    enabled: boolean;
    blockedCountries: string[];
    allowedCountries: string[];
  };
  rateLimit: {
    requests: number;
    window: number;
    blockDuration: number;
  };
  anomalyDetection: {
    enabled: boolean;
    sensitivity: number;
    learningPeriod: number;
  };
  encryption: EncryptionConfig;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: SecurityEventSeverity;
  title: string;
  description: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
  escalated: boolean;
  escalatedTo?: string[];
  escalatedAt?: number;
} 