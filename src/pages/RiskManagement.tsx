import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskDashboard } from "@/components/risk/RiskDashboard";
import { VarAnalysis } from "@/components/risk/VarAnalysis";
import { StressTest } from "@/components/risk/StressTest";
import { PositionSizing } from "@/components/risk/PositionSizing";
import { ComplianceMonitor } from "@/components/risk/ComplianceMonitor";
import { Shield, TrendingDown, Activity, Calculator, AlertTriangle } from "lucide-react";
import PortfolioRiskAnalyzer from "@/components/risk/PortfolioRiskAnalyzer";

const RiskManagement = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            Risk Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive portfolio risk analysis and monitoring
          </p>
        </div>
      </div>

      {/* Portfolio Risk Analyzer */}
      <PortfolioRiskAnalyzer />
      
      {/* Existing risk management components */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RiskDashboard />
        <VarAnalysis />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <PositionSizing />
        <StressTest />
        <ComplianceMonitor />
      </div>
    </div>
  );
};

export default RiskManagement;
