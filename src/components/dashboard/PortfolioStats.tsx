
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, TrendingUp, Zap } from "lucide-react";

interface PortfolioStatsProps {
  portfolioStats: {
    totalValue: number;
    todayPnL: number;
    todayPnLPercent: number;
    totalPnL: number;
    totalPnLPercent: number;
  };
}

const PortfolioStats = ({ portfolioStats }: PortfolioStatsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(portfolioStats.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Total invested capital
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${portfolioStats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolioStats.todayPnL >= 0 ? '+' : ''}{formatPrice(portfolioStats.todayPnL)}
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolioStats.todayPnLPercent >= 0 ? '+' : ''}{portfolioStats.todayPnLPercent.toFixed(2)}% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${portfolioStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolioStats.totalPnL >= 0 ? '+' : ''}{formatPrice(portfolioStats.totalPnL)}
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolioStats.totalPnLPercent >= 0 ? '+' : ''}{portfolioStats.totalPnLPercent.toFixed(2)}% overall return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            Running algorithms
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioStats;
