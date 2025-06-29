
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Brain, Zap, DollarSign, TestTube, Bot, Activity } from "lucide-react";
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

// Import backtesting components
import { ConfigurationForm } from "@/components/backtesting/ConfigurationForm";
import { BacktestResults } from "@/components/backtesting/BacktestResults";

// Import algo trading components
import { StrategyBuilder } from "@/components/algo/StrategyBuilder";

interface TradingTabsProps {
  selectedSymbol: string;
  currentPrice: number;
  marketData: any[];
  portfolio: any[];
  tradingMode: 'live' | 'paper' | 'algo' | 'backtest';
}

export const TradingTabs = ({ selectedSymbol, currentPrice, marketData, portfolio, tradingMode }: TradingTabsProps) => {
  const renderTradingContent = () => (
    <>
      {/* Trading Chart - Full Width */}
      <ErrorBoundary fallback={<TradingChartSkeleton />}>
        <div className="w-full">
          <TradingChart symbol={selectedSymbol} />
        </div>
      </ErrorBoundary>

      {/* Advanced Trading Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ErrorBoundary fallback={<OrderFormSkeleton />}>
          <AdvancedOrderForm 
            symbol={selectedSymbol} 
            currentPrice={currentPrice}
            tradingMode={tradingMode}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <SmartExecution tradingMode={tradingMode} />
        </ErrorBoundary>
      </div>

      {/* Trading Interface Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <ErrorBoundary fallback={<OrderFormSkeleton />}>
          <OrderForm 
            selectedSymbol={selectedSymbol} 
            currentPrice={currentPrice}
            tradingMode={tradingMode}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={<OrderBookSkeleton />}>
          <RealTimeOrderBook symbol={selectedSymbol} />
        </ErrorBoundary>

        <ErrorBoundary fallback={<PortfolioSkeleton />}>
          <PositionTracker tradingMode={tradingMode} />
        </ErrorBoundary>

        <ErrorBoundary>
          <TradingHistory tradingMode={tradingMode} />
        </ErrorBoundary>
      </div>
    </>
  );

  const renderAlgoContent = () => (
    <div className="space-y-6">
      <ErrorBoundary>
        <StrategyBuilder />
      </ErrorBoundary>
      {renderTradingContent()}
    </div>
  );

  const renderBacktestContent = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ErrorBoundary>
          <ConfigurationForm />
        </ErrorBoundary>
        <ErrorBoundary>
          <BacktestResults />
        </ErrorBoundary>
      </div>
      {renderTradingContent()}
    </div>
  );

  const getMainContent = () => {
    switch (tradingMode) {
      case 'algo':
        return renderAlgoContent();
      case 'backtest':
        return renderBacktestContent();
      default:
        return renderTradingContent();
    }
  };

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
            {getMainContent()}
          </TabsContent>

          <TabsContent value="ai-insights" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <AIInsightsDashboard 
                symbol={selectedSymbol} 
                marketData={marketData}
                portfolio={portfolio}
                tradingMode={tradingMode}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="smart-orders" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <SmartOrderManagement 
                symbol={selectedSymbol} 
                currentPrice={currentPrice}
                tradingMode={tradingMode}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="h-full overflow-auto mt-6">
            <ErrorBoundary>
              <HighPerformanceAnalytics 
                symbol={selectedSymbol} 
                prices={marketData.map(d => d.close)} 
                volumes={marketData.map(d => d.volume)}
                tradingMode={tradingMode}
              />
            </ErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
