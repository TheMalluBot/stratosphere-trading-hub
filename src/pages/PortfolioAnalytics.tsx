
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedAnalytics } from "@/components/portfolio/AdvancedAnalytics";
import { PerformanceAttribution } from "@/components/portfolio/PerformanceAttribution";
import { RiskMetrics } from "@/components/portfolio/RiskMetrics";
import { BenchmarkAnalysis } from "@/components/portfolio/BenchmarkAnalysis";
import { PieChart, TrendingUp, BarChart3, Target } from "lucide-react";

const PortfolioAnalytics = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PieChart className="w-8 h-8 text-purple-500" />
            Portfolio Analytics
          </h1>
          <p className="text-muted-foreground">
            Advanced portfolio analysis, attribution, and performance metrics
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="attribution" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Attribution
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Risk Metrics
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Benchmark
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          <PerformanceAttribution />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <RiskMetrics />
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-4">
          <BenchmarkAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioAnalytics;
