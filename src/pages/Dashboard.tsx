
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, List, FileText } from "lucide-react";
import { Link } from "react-router-dom";

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

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

      {/* Market Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Indian Markets</CardTitle>
            <CardDescription>Live indices and market status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.slice(0, 2).map((item) => (
                <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-semibold">{item.symbol}</div>
                    <div className="text-2xl font-bold">{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
                    </div>
                    <Badge variant={item.changePercent >= 0 ? "default" : "destructive"} className="mt-1">
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto Markets</CardTitle>
            <CardDescription>Major cryptocurrencies on MEXC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.slice(2, 4).map((item) => (
                <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-semibold">{item.symbol}</div>
                    <div className="text-2xl font-bold">{formatCryptoPrice(item.price)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}</span>
                    </div>
                    <Badge variant={item.changePercent >= 0 ? "default" : "destructive"} className="mt-1">
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key trading features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/watchlist">
                <List className="w-6 h-6 mb-2" />
                Watchlist
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/trading">
                <DollarSign className="w-6 h-6 mb-2" />
                Live Trading
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/paper-trading">
                <Activity className="w-6 h-6 mb-2" />
                Paper Trade
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/backtesting">
                <Zap className="w-6 h-6 mb-2" />
                Backtest
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/analysis">
                <TrendingUp className="w-6 h-6 mb-2" />
                Analysis
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/journal">
                <FileText className="w-6 h-6 mb-2" />
                Journal
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
