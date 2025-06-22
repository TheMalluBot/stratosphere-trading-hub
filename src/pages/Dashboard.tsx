
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import PortfolioStats from "@/components/dashboard/PortfolioStats";
import MarketOverview from "@/components/dashboard/MarketOverview";
import QuickActions from "@/components/dashboard/QuickActions";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const Dashboard = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: "NIFTY50", price: 21850.25, change: 125.30, changePercent: 0.58 },
    { symbol: "SENSEX", price: 72240.50, change: 450.75, changePercent: 0.63 },
    { symbol: "BTC/USDT", price: 43250.00, change: -520.50, changePercent: -1.19 },
    { symbol: "ETH/USDT", price: 2580.75, change: 45.20, changePercent: 1.78 },
  ]);

  const [portfolioStats] = useState({
    totalValue: 125000,
    todayPnL: 2450,
    todayPnLPercent: 1.96,
    totalPnL: 15000,
    totalPnLPercent: 13.64,
  });

  useEffect(() => {
    // Simulate live price updates
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 10,
        change: item.change + (Math.random() - 0.5) * 5,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.1,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your portfolio and market movements in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/charts">
              <TrendingUp className="w-4 h-4 mr-2" />
              Charts
            </Link>
          </Button>
          <Button asChild>
            <Link to="/trading">
              <DollarSign className="w-4 h-4 mr-2" />
              Start Trading
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <PortfolioStats portfolioStats={portfolioStats} />

      {/* Market Overview */}
      <MarketOverview marketData={marketData} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
