
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Brain, Zap, DollarSign } from "lucide-react";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { TradingChartSkeleton, OrderFormSkeleton, PortfolioSkeleton, OrderBookSkeleton } from "@/components/loading/LoadingStates";
import TradingChart from "./TradingChart";
import AdvancedOrderForm from "./AdvancedOrderForm";
import SmartExecution from "./SmartExecution";
import OrderForm from "./OrderForm";
import RealTimeOrderBook from "./RealTimeOrderBook";
import PositionTracker from "./PositionTracker";
import TradingHistory from "./TradingHistory";
import AIInsightsDashboard from "@/components/ai/AIInsightsDashboard";
import SmartOrderManagement from "./SmartOrderManagement";
import HighPerformanceAnalytics from "./HighPerformanceAnalytics";

interface TradingTabsProps {
  selectedSymbol: string;
  currentPrice: number;
  marketData: any[];
  portfolio: any[];
}

export const TradingTabs = ({ selectedSymbol, currentPrice, marketData, portfolio }: TradingTabsProps) => {
  return (
    <Tabs defaultValue="trading" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="trading" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Trading
        </TabsTrigger>
        <TabsTrigger value="ai-insights" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Insights
        </TabsTrigger>
        <TabsTrigger value="smart-orders" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Smart Orders
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="trading" className="space-y-6">
        {/* Trading Chart - Full Width */}
        <ErrorBoundary fallback={<TradingChartSkeleton />}>
          <TradingChart symbol={selectedSymbol} />
        </ErrorBoundary>

        {/* Advanced Trading Features */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ErrorBoundary fallback={<OrderFormSkeleton />}>
            <AdvancedOrderForm symbol={selectedSymbol} currentPrice={currentPrice} />
          </ErrorBoundary>
          <ErrorBoundary>
            <SmartExecution />
          </ErrorBoundary>
        </div>

        {/* Trading Interface Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ErrorBoundary fallback={<OrderFormSkeleton />}>
              <OrderForm selectedSymbol={selectedSymbol} currentPrice={currentPrice} />
            </ErrorBoundary>
          </div>

          <div className="lg:col-span-1">
            <ErrorBoundary fallback={<OrderBookSkeleton />}>
              <RealTimeOrderBook symbol={selectedSymbol} />
            </ErrorBoundary>
          </div>

          <div className="lg:col-span-1">
            <ErrorBoundary fallback={<PortfolioSkeleton />}>
              <PositionTracker />
            </ErrorBoundary>
          </div>

          <div className="lg:col-span-1">
            <ErrorBoundary>
              <TradingHistory />
            </ErrorBoundary>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="ai-insights" className="space-y-6">
        <ErrorBoundary>
          <AIInsightsDashboard 
            symbol={selectedSymbol} 
            marketData={marketData}
            portfolio={portfolio}
          />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="smart-orders" className="space-y-6">
        <ErrorBoundary>
          <SmartOrderManagement 
            symbol={selectedSymbol} 
            currentPrice={currentPrice}
          />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <ErrorBoundary>
          <HighPerformanceAnalytics 
            symbol={selectedSymbol} 
            prices={marketData.map(d => d.close)} 
            volumes={marketData.map(d => d.volume)} 
          />
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
};
