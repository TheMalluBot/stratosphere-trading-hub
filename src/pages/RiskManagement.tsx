
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskDashboard } from "@/components/risk/RiskDashboard";
import { PositionSizing } from "@/components/risk/PositionSizing";
import { VarAnalysis } from "@/components/risk/VarAnalysis";
import { StressTest } from "@/components/risk/StressTest";
import { Shield, Calculator, TrendingDown, AlertTriangle } from "lucide-react";

const RiskManagement = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" />
            Risk Management
          </h1>
          <p className="text-muted-foreground">
            Portfolio risk analysis, position sizing, and stress testing
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Risk Dashboard
          </TabsTrigger>
          <TabsTrigger value="sizing" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Position Sizing
          </TabsTrigger>
          <TabsTrigger value="var" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            VaR Analysis
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Stress Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <RiskDashboard />
        </TabsContent>

        <TabsContent value="sizing" className="space-y-4">
          <PositionSizing />
        </TabsContent>

        <TabsContent value="var" className="space-y-4">
          <VarAnalysis />
        </TabsContent>

        <TabsContent value="stress" className="space-y-4">
          <StressTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskManagement;
