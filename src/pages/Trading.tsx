
import { TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OrderForm from "@/components/trading/OrderForm";
import PositionTracker from "@/components/trading/PositionTracker";
import TradingChart from "@/components/trading/TradingChart";
import LivePriceDisplay from "@/components/trading/LivePriceDisplay";
import RealTimeOrderBook from "@/components/trading/RealTimeOrderBook";
import TradingHistory from "@/components/trading/TradingHistory";
import { orderManager } from "@/services/orderManager";

const Trading = () => {
  const selectedSymbol = "BTCUSDT";
  const connectionStatus = orderManager.getConnectionStatus();

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            Advanced Trading
            <Badge variant={connectionStatus.live ? "default" : "secondary"} className="ml-2">
              {connectionStatus.live ? "LIVE" : "DEMO"}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            {connectionStatus.live 
              ? "Execute real trades with MEXC API integration" 
              : "Demo mode - Configure API keys in Settings for live trading"
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

      {/* Trading Chart - Full Width */}
      <TradingChart symbol={selectedSymbol} />

      {/* Trading Interface Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Order Form */}
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
    </div>
  );
};

export default Trading;
