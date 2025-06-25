
import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, DollarSign, Activity, Brain, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderForm from "@/components/trading/OrderForm";
import PositionTracker from "@/components/trading/PositionTracker";
import TradingChart from "@/components/trading/TradingChart";
import LivePriceDisplay from "@/components/trading/LivePriceDisplay";
import RealTimeOrderBook from "@/components/trading/RealTimeOrderBook";
import TradingHistory from "@/components/trading/TradingHistory";
import AdvancedOrderForm from "@/components/trading/AdvancedOrderForm";
import SmartExecution from "@/components/trading/SmartExecution";
import HighPerformanceAnalytics from "@/components/trading/HighPerformanceAnalytics";
import AIInsightsDashboard from "@/components/ai/AIInsightsDashboard";
import SmartOrderManagement from "@/components/trading/SmartOrderManagement";
import { orderManager } from "@/services/orderManager";
import { enhancedWsService } from "@/services/enhancedWebSocketService";

const Trading = () => {
  const selectedSymbol = "BTCUSDT";
  const [connectionStatus, setConnectionStatus] = useState({ live: false, configured: false });
  const [marketData, setMarketData] = useState<any[]>([]);
  const [portfolio] = useState([
    { symbol: 'BTCUSDT', allocation: 0.4, value: 18000 },
    { symbol: 'ETHUSDT', allocation: 0.3, value: 13500 },
    { symbol: 'BNBUSDT', allocation: 0.2, value: 9000 },
    { symbol: 'ADAUSDT', allocation: 0.1, value: 4500 }
  ]);

  useEffect(() => {
    // Initialize enhanced WebSocket connection
    enhancedWsService.connect();
    
    // Get connection status
    const getStatus = async () => {
      const status = await orderManager.getConnectionStatus();
      setConnectionStatus(status);
    };
    
    getStatus();
    
    // Generate sample market data for AI analysis
    const generateMarketData = () => {
      const data = [];
      const basePrice = 45000;
      const now = Date.now();
      
      for (let i = 99; i >= 0; i--) {
        const timestamp = now - (i * 60000); // 1 minute intervals
        const price = basePrice + (Math.random() - 0.5) * 2000;
        const volume = Math.random() * 100 + 50;
        
        data.push({
          timestamp,
          open: price,
          high: price * 1.002,
          low: price * 0.998,
          close: price,
          volume
        });
      }
      
      setMarketData(data);
    };
    
    generateMarketData();
    const interval = setInterval(generateMarketData, 60000); // Update every minute
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            Advanced Trading Platform
            <Badge variant={connectionStatus.live ? "default" : "secondary"} className="ml-2">
              {connectionStatus.live ? "LIVE" : "DEMO"}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            {connectionStatus.live 
              ? "Execute real trades with MEXC API integration and AI-powered insights" 
              : "Demo mode with AI analytics - Configure API keys in Settings for live trading"
            }
          </p>
        </div>
        
        {/* Live Price Display */}
        <LivePriceDisplay symbol={selectedSymbol} />
      </div>

      {/* Connection Status Alert */}
      {!connectionStatus.configured && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-600 font-medium">Demo Mode Active</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Configure your MEXC API keys in Settings to enable live trading
          </p>
        </div>
      )}

      {/* Main Trading Interface */}
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
          <TradingChart symbol={selectedSymbol} />

          {/* Advanced Trading Features */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AdvancedOrderForm symbol={selectedSymbol} currentPrice={45234} />
            <SmartExecution />
          </div>

          {/* Trading Interface Grid */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Basic Order Form */}
            <div className="lg:col-span-1">
              <OrderForm selectedSymbol={selectedSymbol} currentPrice={45234} />
            </div>

            {/* Real-time Order Book */}
            <div className="lg:col-span-1">
              <RealTimeOrderBook symbol={selectedSymbol} />
            </div>

            {/* Position Tracker */}
            <div className="lg:col-span-1">
              <PositionTracker />
            </div>

            {/* Trading History */}
            <div className="lg:col-span-1">
              <TradingHistory />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsDashboard 
            symbol={selectedSymbol} 
            marketData={marketData}
            portfolio={portfolio}
          />
        </TabsContent>

        <TabsContent value="smart-orders" className="space-y-6">
          <SmartOrderManagement 
            symbol={selectedSymbol} 
            currentPrice={45234}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <HighPerformanceAnalytics 
            symbol={selectedSymbol} 
            prices={marketData.map(d => d.close)} 
            volumes={marketData.map(d => d.volume)} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trading;
