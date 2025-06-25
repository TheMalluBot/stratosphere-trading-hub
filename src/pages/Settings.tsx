
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Shield, TestTube, Activity, Eye } from 'lucide-react';
import ApiTab from '@/components/settings/ApiTab';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SystemStatus from '@/components/settings/SystemStatus';
import HealthMonitor from '@/components/system/HealthMonitor';
import TestRunner from '@/components/testing/TestRunner';
import { useSecurityAuditLogger } from '@/components/security/SecurityAuditLogger';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { getEvents, detectAnomalies, exportLogs, clearLogs } = useSecurityAuditLogger();
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  const securityEvents = getEvents(undefined, 50); // Last 50 events
  const anomalies = detectAnomalies();

  const handleExportLogs = () => {
    const logs = exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your trading platform and monitor system health
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">
            <Activity className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="testing">
            <TestTube className="w-4 h-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                General application settings and preferences will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemStatus />
          <HealthMonitor />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Monitoring
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecurityLogs(!showSecurityLogs)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showSecurityLogs ? 'Hide' : 'Show'} Logs
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportLogs}>
                    Export Logs
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearLogs}>
                    Clear Logs
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Security Anomalies Detected</h4>
                  {anomalies.map((anomaly, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <strong>{anomaly.type}:</strong> {anomaly.description} 
                        <span className="ml-2 text-xs">({anomaly.severity} severity)</span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {showSecurityLogs && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Security Events</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {securityEvents.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No security events recorded</p>
                    ) : (
                      securityEvents.map((event, index) => (
                        <div key={index} className="p-3 border rounded text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                            <span className="text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {Object.keys(event.details).length > 0 && (
                            <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {anomalies.length === 0 && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    No security anomalies detected. Your system appears to be secure.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <TestRunner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
