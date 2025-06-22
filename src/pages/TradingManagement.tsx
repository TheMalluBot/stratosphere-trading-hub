
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommissionTracker } from "@/components/trading/CommissionTracker";
import { SmartOrderRouter } from "@/components/trading/SmartOrderRouter";
import { DollarSign, Zap, BarChart3, Settings } from "lucide-react";

const TradingManagement = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Management</h1>
          <p className="text-muted-foreground">
            Optimize costs and execution through smart order routing
          </p>
        </div>
      </div>

      <Tabs defaultValue="commission" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commission" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Commission Tracking
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Routing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cost Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commission">
          <CommissionTracker />
        </TabsContent>

        <TabsContent value="routing">
          <SmartOrderRouter />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8 text-muted-foreground">
            Advanced cost analytics coming in Phase 3...
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-8 text-muted-foreground">
            Trading management settings coming in Phase 3...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingManagement;
