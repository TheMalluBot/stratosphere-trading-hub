
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, TrendingUp, Zap } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

const PortfolioStats = () => {
  const { portfolio } = usePortfolio();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(portfolio.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Total portfolio valuation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${portfolio.totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPrice(portfolio.totalChange)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(portfolio.totalChangePercent)} from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portfolio.positions.length}</div>
          <p className="text-xs text-muted-foreground">
            Open cryptocurrency positions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Assets</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolio.positions.filter(p => p.free > 0).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Assets available for trading
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioStats;
