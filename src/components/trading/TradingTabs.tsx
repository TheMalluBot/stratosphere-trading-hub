
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingDashboard } from "./TradingDashboard";
import { StrategyBuilder } from "@/components/algo/StrategyBuilder";
import { StrategyMarketplace } from "./StrategyMarketplace";
import { StrategyCommunityHub } from "./StrategyCommunityHub";
import { OnboardingGuide } from "./OnboardingGuide";
import { useState } from "react";
import { 
  BarChart3, 
  Bot, 
  Store, 
  Users, 
  BookOpen,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";

interface TradingTabsProps {
  selectedSymbol: string;
  currentPrice: number;
  tradingMode: 'live' | 'paper' | 'algo' | 'backtest';
  connectionStatus: { live: boolean; configured: boolean };
  marketData?: any[];
  portfolio?: Array<{
    symbol: string;
    allocation: number;
    value: number;
  }>;
}

export const TradingTabs = ({ 
  selectedSymbol, 
  currentPrice, 
  tradingMode, 
  connectionStatus,
  marketData,
  portfolio
}: TradingTabsProps) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide 
          tradingMode={tradingMode}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Strategy Builder
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TradingDashboard
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            tradingMode={tradingMode}
            connectionStatus={connectionStatus}
          />
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <StrategyBuilder />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <StrategyMarketplace />
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <StrategyCommunityHub />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Total P&L</span>
              </div>
              <div className="text-2xl font-bold text-green-700">$12,847.32</div>
              <div className="text-sm text-green-600">+15.3% this month</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Active Strategies</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">7</div>
              <div className="text-sm text-blue-600">3 outperforming</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">68.4%</div>
              <div className="text-sm text-purple-600">Above average</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">Learning Progress</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">78%</div>
              <div className="text-sm text-orange-600">Advanced level</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Trades</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Profitable Trades</span>
                  <span className="font-semibold text-green-600">853</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Trade Duration</span>
                  <span className="font-semibold">2.3 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio</span>
                  <span className="font-semibold">1.84</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Max Drawdown</span>
                  <span className="font-semibold text-red-600">-8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Value at Risk (95%)</span>
                  <span className="font-semibold">$1,234</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk/Reward Ratio</span>
                  <span className="font-semibold">1:2.1</span>
                </div>
                <div className="flex justify-between">
                  <span>Portfolio Volatility</span>
                  <span className="font-semibold">12.8%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
