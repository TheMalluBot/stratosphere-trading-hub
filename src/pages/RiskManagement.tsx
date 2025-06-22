
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskDashboard } from "@/components/risk/RiskDashboard";
import { VarAnalysis } from "@/components/risk/VarAnalysis";
import { StressTest } from "@/components/risk/StressTest";
import { PositionSizing } from "@/components/risk/PositionSizing";
import { ComplianceMonitor } from "@/components/risk/ComplianceMonitor";
import { Shield, TrendingDown, Activity, Calculator, AlertTriangle } from "lucide-react";

const RiskManagement = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage portfolio risk across all strategies
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="var" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            VaR Analysis
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Stress Testing
          </TabsTrigger>
          <TabsTrigger value="position" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Position Sizing
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <RiskDashboard />
        </TabsContent>

        <TabsContent value="var">
          <VarAnalysis />
        </TabsContent>

        <TabsContent value="stress">
          <StressTest />
        </TabsContent>

        <TabsContent value="position">
          <PositionSizing />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskManagement;
