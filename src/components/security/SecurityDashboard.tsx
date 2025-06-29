import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Lock, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react';
import { SecurityAuditLogger } from '@/lib/security/SecurityAuditLogger';
import { ComplianceMonitor } from '@/lib/security/ComplianceMonitor';
import { 
  SecurityMetrics, 
  SecurityAlert, 
  ThreatIndicator,
  ComplianceViolation,
  SecurityEventSeverity 
} from '@/types/security.types';

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const auditLogger = SecurityAuditLogger.getInstance();
  const complianceMonitor = ComplianceMonitor.getInstance();

  useEffect(() => {
    loadSecurityData();
    
    // Set up auto-refresh
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security metrics
      const securityMetrics = await generateSecurityMetrics();
      setMetrics(securityMetrics);

      // Load security alerts
      const securityAlerts = auditLogger.getSecurityAlerts(true); // Unacknowledged only
      setAlerts(securityAlerts);

      // Load threat indicators
      const threats = auditLogger.getThreatIndicators();
      setThreatIndicators(threats);

      // Load compliance violations
      const complianceViolations = complianceMonitor.getViolations();
      setViolations(complianceViolations.slice(0, 10)); // Last 10 violations
      
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecurityMetrics = async (): Promise<SecurityMetrics> => {
    // In a real implementation, this would aggregate data from various sources
    const events = auditLogger.getSecurityAlerts();
    const criticalEvents = events.filter(e => e.severity === 'CRITICAL').length;
    const warningEvents = events.filter(e => e.severity === 'WARNING').length;
    const errorEvents = events.filter(e => e.severity === 'ERROR').length;
    
    return {
      totalEvents: events.length,
      criticalEvents,
      warningEvents,
      errorEvents,
      activeThreats: threatIndicators.filter(t => !t.mitigated).length,
      blockedAttempts: Math.floor(Math.random() * 50), // Mock data
      complianceViolations: violations.filter(v => !v.resolved).length,
      averageRiskScore: 0.3, // Mock data
      systemHealth: 95 // Mock data
    };
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await auditLogger.acknowledgeAlert(alertId, 'current-user'); // In real app, get current user
      await loadSecurityData();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityColor = (severity: SecurityEventSeverity): string => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'ERROR': return 'destructive';
      case 'WARNING': return 'secondary';
      case 'INFO': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: SecurityEventSeverity) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      case 'ERROR': return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING': return <Info className="h-4 w-4" />;
      case 'INFO': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (loading && !metrics) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time security monitoring and threat detection
          </p>
        </div>
        <Button onClick={loadSecurityData} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.systemHealth || 0}%</div>
            <Progress value={metrics?.systemHealth || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unmitigated threats detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.blockedAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metrics?.averageRiskScore || 0) * 100).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average risk level
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            Security Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="threats">Threat Indicators</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
              <CardDescription>
                Unacknowledged security alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No active alerts</p>
                  <p className="text-muted-foreground">All security alerts have been acknowledged</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <AlertTitle className="flex items-center space-x-2">
                              <span>{alert.title}</span>
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {alert.severity}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                              {alert.description}
                            </AlertDescription>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                              {alert.userId && (
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  User: {alert.userId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Indicators</CardTitle>
              <CardDescription>
                Active threat indicators and security patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threatIndicators.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No active threats</p>
                  <p className="text-muted-foreground">No threat indicators detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {threatIndicators.map((threat) => (
                    <div key={threat.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(threat.severity) as any}>
                            {threat.severity}
                          </Badge>
                          <span className="font-medium">{threat.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Count: {threat.count}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{threat.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>First seen: {new Date(threat.firstSeen).toLocaleString()}</span>
                        <span>Last seen: {new Date(threat.lastSeen).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Violations</CardTitle>
              <CardDescription>
                Recent compliance violations and regulatory issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No violations</p>
                  <p className="text-muted-foreground">All compliance checks passed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(violation.severity) as any}>
                            {violation.severity}
                          </Badge>
                          <span className="font-medium">{violation.ruleName}</span>
                        </div>
                        <Badge variant={violation.resolved ? 'default' : 'destructive'}>
                          {violation.resolved ? 'Resolved' : 'Open'}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{violation.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>User: {violation.userId}</span>
                        <span>{new Date(violation.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events and system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">User authentication successful</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm">API rate limit warning</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <Lock className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">Encryption key rotated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 