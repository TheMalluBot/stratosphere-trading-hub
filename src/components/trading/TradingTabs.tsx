
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
    <div className="flex flex-col h-full min-h-0">
      <Tabs defaultValue="trading" className="flex flex-col h-full min-h-0">
        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Trading</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="smart-orders" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Orders</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="trading" className="h-full overflow-auto space-y-6 mt-6">
            {/* Trading Chart - Full Width */}
            <ErrorBoundary fallback={<TradingChartSkeleton />}>
              <div className="w-full">
                <TradingChart symbol={selectedSymbol} />
              </div>
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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <ErrorBoundary fallback={<OrderFormSkeleton />}>
                <OrderForm selectedSymbol={selectedSymbol} currentPrice={currentPrice} />
              </ErrorBoundary>

              <ErrorBoundary fallback={<OrderBookSkeleton />}>
                <RealTimeOrderBook symbol={selectedSymbol} />
              </ErrorBoundary>

              <ErrorBoundary fallback={<PortfolioSkeleton />}>
                <PositionTracker />
              </ErrorBoundary>

              <ErrorBoundary>
                <TradingHistory />
              </ErrorBoundary>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <AIInsightsDashboard 
                symbol={selectedSymbol} 
                marketData={marketData}
                portfolio={portfolio}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="smart-orders" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <SmartOrderManagement 
                symbol={selectedSymbol} 
                currentPrice={currentPrice}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <HighPerformanceAnalytics 
                symbol={selectedSymbol} 
                prices={marketData.map(d => d.close)} 
                volumes={marketData.map(d => d.volume)} 
              />
            </ErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
