
import { TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import OrderForm from "@/components/trading/OrderForm";
import PositionTracker from "@/components/trading/PositionTracker";
import TradingChart from "@/components/trading/TradingChart";
import LivePriceDisplay from "@/components/trading/LivePriceDisplay";
import RealTimeOrderBook from "@/components/trading/RealTimeOrderBook";
import TradingHistory from "@/components/trading/TradingHistory";

const Trading = () => {
  const selectedSymbol = "BTCUSDT";

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            Advanced Trading
          </h1>
          <p className="text-muted-foreground">
            Execute trades with advanced order types and real-time market data
          </p>
        </div>
        
        {/* Live Price Display */}
        <LivePriceDisplay symbol={selectedSymbol} />
      </div>

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
