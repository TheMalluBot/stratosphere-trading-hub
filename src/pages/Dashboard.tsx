
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import PortfolioStats from "@/components/dashboard/PortfolioStats";
import MarketOverview from "@/components/dashboard/MarketOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import { useCryptoData } from "@/hooks/useCryptoData";

const Dashboard = () => {
  const { marketData, loading, error, lastUpdate, refreshData } = useCryptoData();

  const [portfolioStats] = useState({
    totalValue: 125000,
    todayPnL: 2450,
    todayPnLPercent: 1.96,
    totalPnL: 15000,
    totalPnLPercent: 13.64,
  });

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your cryptocurrency portfolio and market movements in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-medium">API Notice</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {/* Portfolio Overview */}
      <PortfolioStats portfolioStats={portfolioStats} />

      {/* Market Overview */}
      <MarketOverview 
        marketData={marketData.map(crypto => ({
          symbol: crypto.symbol,
          price: crypto.price,
          change: crypto.change,
          changePercent: crypto.changePercent
        }))} 
        loading={loading}
        lastUpdate={lastUpdate}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
