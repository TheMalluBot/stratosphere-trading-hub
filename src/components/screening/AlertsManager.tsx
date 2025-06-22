
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Settings, TrendingUp, Volume2, AlertTriangle } from "lucide-react";

interface Alert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'pattern';
  symbol: string;
  condition: string;
  value: string;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: Date;
}

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "price",
      symbol: "AAPL",
      condition: "Price above $190",
      value: "190",
      enabled: true,
      triggered: false
    },
    {
      id: "2", 
      type: "volume",
      symbol: "TSLA",
      condition: "Volume > 2M",
      value: "2000000",
      enabled: true,
      triggered: true,
      lastTriggered: new Date()
    },
    {
      id: "3",
      type: "technical",
      symbol: "MSFT",
      condition: "RSI < 30",
      value: "30",
      enabled: false,
      triggered: false
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />;
      case 'volume': return <Volume2 className="w-4 h-4" />;
      case 'technical': return <Settings className="w-4 h-4" />;
      case 'pattern': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'price': return 'bg-green-100 text-green-800';
      case 'volume': return 'bg-blue-100 text-blue-800'; 
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'pattern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => alert.enabled);
  const triggeredAlerts = alerts.filter(alert => alert.triggered);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Real-time Alerts
          {triggeredAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {triggeredAlerts.length} active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Set up alerts for price movements, volume spikes, and technical signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {activeAlerts.length} of {alerts.length} alerts enabled
          </div>
          <Button size="sm">
            <Plus className="w-3 h-3 mr-1" />
            New Alert
          </Button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-lg ${alert.triggered ? 'border-red-200 bg-red-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getAlertColor(alert.type)}>
                    {getAlertIcon(alert.type)}
                    <span className="ml-1 capitalize">{alert.type}</span>
                  </Badge>
                  <span className="font-medium">{alert.symbol}</span>
                  {alert.triggered && (
                    <Badge variant="destructive" className="text-xs">
                      TRIGGERED
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={alert.enabled}
                  onCheckedChange={() => toggleAlert(alert.id)}
                />
              </div>
              
              <div className="text-sm text-muted-foreground mb-1">
                {alert.condition}
              </div>
              
              {alert.lastTriggered && (
                <div className="text-xs text-muted-foreground">
                  Last triggered: {alert.lastTriggered.toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No alerts configured</p>
            <Button className="mt-2" size="sm">
              Create Your First Alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
