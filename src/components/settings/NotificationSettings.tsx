
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, TrendingUp, CheckCircle, Settings } from 'lucide-react';

export interface NotificationSettingsProps {
  notifications: {
    priceAlerts: boolean;
    orderExecutions: boolean;
    systemUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  onNotificationChange: (key: string, value: boolean) => void;
}

const NotificationSettings = ({ notifications, onNotificationChange }: NotificationSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Trading Notifications
          </CardTitle>
          <CardDescription>
            Configure alerts for trading activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when prices hit your targets
                </p>
              </div>
            </div>
            <Switch
              id="price-alerts"
              checked={notifications.priceAlerts}
              onCheckedChange={(checked) => onNotificationChange('priceAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="order-executions">Order Executions</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when orders are filled or cancelled
                </p>
              </div>
            </div>
            <Switch
              id="order-executions"
              checked={notifications.orderExecutions}
              onCheckedChange={(checked) => onNotificationChange('orderExecutions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Important system and feature updates
                </p>
              </div>
            </div>
            <Switch
              id="system-updates"
              checked={notifications.systemUpdates}
              onCheckedChange={(checked) => onNotificationChange('systemUpdates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => onNotificationChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Browser push notifications
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => onNotificationChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
