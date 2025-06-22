
import { TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import OrderForm from "@/components/trading/OrderForm";
import OrderBook from "@/components/trading/OrderBook";
import PositionTracker from "@/components/trading/PositionTracker";
import TradingChart from "@/components/trading/TradingChart";

const Trading = () => {
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
      </div>

      {/* Trading Chart - Full Width */}
      <TradingChart symbol="BTCUSDT" />

      {/* Trading Interface Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Form */}
        <div className="lg:col-span-1">
          <OrderForm selectedSymbol="BTCUSDT" currentPrice={45234} />
        </div>

        {/* Order Book */}
        <div className="lg:col-span-1">
          <OrderBook symbol="BTCUSDT" />
        </div>

        {/* Position Tracker */}
        <div className="lg:col-span-1">
          <PositionTracker />
        </div>
      </div>
    </div>
  );
};

export default Trading;
