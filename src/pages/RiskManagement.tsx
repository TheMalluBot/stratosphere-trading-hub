
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskDashboard } from "@/components/risk/RiskDashboard";
import { VarAnalysis } from "@/components/risk/VarAnalysis";
import { StressTest } from "@/components/risk/StressTest";
import { PositionSizing } from "@/components/risk/PositionSizing";
import { ComplianceMonitor } from "@/components/risk/ComplianceMonitor";
import { Shield, TrendingDown, Activity, Calculator, AlertTriangle, Brain } from "lucide-react";
import PortfolioRiskAnalyzer from "@/components/risk/PortfolioRiskAnalyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RiskManagement = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            Elite Risk Management
          </h1>
          <p className="text-muted-foreground">
            Institutional-grade portfolio risk analysis and monitoring with Elite Risk Manager
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          🏆 ELITE POWERED
        </Badge>
      </div>

      {/* Elite Risk Management Features */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Kelly Criterion
            </CardTitle>
            <CardDescription>
              Optimal position sizing with risk-adjusted returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Kelly Fraction:</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Win Probability:</span>
                <span className="text-sm font-medium">68.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Risk-Adjusted Size:</span>
                <span className="text-sm font-medium text-green-600">12.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              VAR Analysis
            </CardTitle>
            <CardDescription>
              Value at Risk with Monte Carlo simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Daily VAR (95%):</span>
                <span className="text-sm font-medium text-red-600">-2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Portfolio VAR:</span>
                <span className="text-sm font-medium text-red-600">-1.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CVaR (95%):</span>
                <span className="text-sm font-medium text-red-600">-3.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Risk Parity
            </CardTitle>
            <CardDescription>
              Equal risk contribution portfolio optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Risk Budget Used:</span>
                <span className="text-sm font-medium">87.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Position Risk:</span>
                <span className="text-sm font-medium">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Correlation Adjusted:</span>
                <span className="text-sm font-medium text-green-600">Yes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Risk Analyzer */}
      <PortfolioRiskAnalyzer />
      
      {/* Advanced Risk Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="var">VAR Analysis</TabsTrigger>
          <TabsTrigger value="stress">Stress Test</TabsTrigger>
          <TabsTrigger value="sizing">Position Sizing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 lg:grid-cols-2">
          <RiskDashboard />
          <VarAnalysis />
        </TabsContent>

        <TabsContent value="var">
          <VarAnalysis />
        </TabsContent>

        <TabsContent value="stress">
          <StressTest />
        </TabsContent>

        <TabsContent value="sizing">
          <PositionSizing />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceMonitor />
        </TabsContent>

        <TabsContent value="monte-carlo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-500" />
                Monte Carlo Risk Analysis
              </CardTitle>
              <CardDescription>
                Advanced risk simulation with 10,000+ scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Return Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expected Return:</span>
                      <span className="text-sm font-medium text-green-600">8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volatility:</span>
                      <span className="text-sm font-medium">12.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Skewness:</span>
                      <span className="text-sm font-medium">-0.15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Kurtosis:</span>
                      <span className="text-sm font-medium">2.84</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">95% VAR:</span>
                      <span className="text-sm font-medium text-red-600">-18.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expected Shortfall:</span>
                      <span className="text-sm font-medium text-red-600">-24.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown:</span>
                      <span className="text-sm font-medium text-red-600">-31.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Probability of Loss:</span>
                      <span className="text-sm font-medium">23.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskManagement;
