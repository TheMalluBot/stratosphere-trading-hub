
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { ProductionValidator, ValidationResult } from '@/utils/productionValidator';

const HealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState<{
    environment: ValidationResult;
    api: ValidationResult;
    security: ValidationResult;
    overall: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const results = await ProductionValidator.runAllValidations();
      setHealthStatus(results);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
    
    // Run health check every 5 minutes
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health Monitor</CardTitle>
          <CardDescription>Checking system status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthStatus) return null;

  const getStatusIcon = (result: ValidationResult) => {
    if (!result.isValid) return <XCircle className="w-5 h-5 text-red-500" />;
    if (result.warnings.length > 0) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (result: ValidationResult) => {
    if (!result.isValid) return <Badge variant="destructive">Critical</Badge>;
    if (result.warnings.length > 0) return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="default">Healthy</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              System Health Monitor
              {healthStatus.overall ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              Last checked: {lastCheck.toLocaleString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.environment)}
              <div>
                <p className="font-medium">Environment</p>
                <p className="text-sm text-muted-foreground">Configuration & setup</p>
              </div>
            </div>
            {getStatusBadge(healthStatus.environment)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.api)}
              <div>
                <p className="font-medium">API Connections</p>
                <p className="text-sm text-muted-foreground">External service connectivity</p>
              </div>
            </div>
            {getStatusBadge(healthStatus.api)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.security)}
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-muted-foreground">SSL, HTTPS, and data protection</p>
              </div>
            </div>
            {getStatusBadge(healthStatus.security)}
          </div>
        </div>

        {/* Show errors */}
        {[...healthStatus.environment.errors, ...healthStatus.api.errors, ...healthStatus.security.errors].map((error, index) => (
          <Alert key={index} variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ))}

        {/* Show warnings */}
        {[...healthStatus.environment.warnings, ...healthStatus.api.warnings, ...healthStatus.security.warnings].map((warning, index) => (
          <Alert key={index}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}

        {healthStatus.overall && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All systems are operational and ready for production use.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMonitor;
