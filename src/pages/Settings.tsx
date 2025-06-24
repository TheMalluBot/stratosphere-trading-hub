
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Bell, Activity } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import ApiTab from "@/components/settings/ApiTab";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SystemStatus from "@/components/settings/SystemStatus";

const Settings = () => {
  const {
    apiKeys,
    notifications,
    connected,
    testing,
    saving,
    handleApiKeyChange,
    testConnection,
    saveSettings,
    handleNotificationChange,
    refreshSystemStatus
  } = useSettings();

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your crypto trading platform and API connections
          </p>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <ApiTab
            apiKeys={apiKeys}
            connected={connected}
            testing={testing}
            saving={saving}
            onApiKeyChange={handleApiKeyChange}
            onTestConnection={testConnection}
            onSaveSettings={saveSettings}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings
            notifications={notifications}
            onNotificationChange={handleNotificationChange}
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus
            connectionStatus={connected}
            onRefreshStatus={refreshSystemStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
