
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
  notifications: {
    trades: boolean;
    priceAlerts: boolean;
    systemUpdates: boolean;
    marketNews: boolean;
  };
  onNotificationChange: (key: string, value: boolean) => void;
}

const NotificationSettings = ({ notifications, onNotificationChange }: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Trade Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified when trades are executed</p>
          </div>
          <Switch
            checked={notifications.trades}
            onCheckedChange={(checked) => onNotificationChange('trades', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Price Alerts</Label>
            <p className="text-sm text-muted-foreground">Alerts when watchlist items hit target prices</p>
          </div>
          <Switch
            checked={notifications.priceAlerts}
            onCheckedChange={(checked) => onNotificationChange('priceAlerts', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">System Updates</Label>
            <p className="text-sm text-muted-foreground">Platform updates and maintenance notifications</p>
          </div>
          <Switch
            checked={notifications.systemUpdates}
            onCheckedChange={(checked) => onNotificationChange('systemUpdates', checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Market News</Label>
            <p className="text-sm text-muted-foreground">Important market news and events</p>
          </div>
          <Switch
            checked={notifications.marketNews}
            onCheckedChange={(checked) => onNotificationChange('marketNews', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
