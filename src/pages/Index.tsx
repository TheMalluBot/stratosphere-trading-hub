
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Zap, 
  Shield,
  Bot,
  PieChart,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";

const Index = () => {
  const { marketData, loading } = useCryptoData();
  
  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Trading",
      description: "Execute trades with live market data and advanced order types",
      link: "/trading",
      color: "text-green-500"
    },
    {
      icon: Bot,
      title: "Algorithmic Trading",
      description: "Automated strategies with backtesting and optimization",
      link: "/algo-trading",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Charts",
      description: "Professional charting with technical indicators",
      link: "/charts",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Comprehensive risk analysis and position sizing",
      link: "/risk-management",
      color: "text-red-500"
    },
    {
      icon: PieChart,
      title: "Portfolio Analytics",
      description: "Deep dive into performance attribution and metrics",
      link: "/portfolio-analytics",
      color: "text-orange-500"
    },
    {
      icon: Activity,
      title: "Market Intelligence",
      description: "Economic calendar, sentiment analysis, and market trends",
      link: "/market-intelligence",
      color: "text-indigo-500"
    }
  ];

  const stats = [
    { label: "Active Strategies", value: "12", change: "+3" },
    { label: "Portfolio Value", value: "$125,000", change: "+2.4%" },
    { label: "Today's P&L", value: "+$2,450", change: "+1.96%" },
    { label: "Win Rate", value: "73.2%", change: "+5.1%" }
  ];

  return (
    <div className="flex-1 space-y-8 p-6 overflow-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AlgoTrade Pro</h1>
            <p className="text-muted-foreground">Advanced Cryptocurrency Trading Platform</p>
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional-grade tools for cryptocurrency trading, portfolio management, and algorithmic strategies
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <Button asChild size="lg">
            <Link to="/trading">
              <DollarSign className="w-5 h-5 mr-2" />
              Start Trading
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/dashboard">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Platform Overview
          </CardTitle>
          <CardDescription>Real-time portfolio and trading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <Badge variant="default" className="mt-2 bg-green-500">
                  {stat.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Snapshot
          </CardTitle>
          <CardDescription>Top cryptocurrency prices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse p-3 rounded-lg border">
                  <div className="h-4 bg-muted rounded w-12 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {marketData.slice(0, 6).map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-semibold">{crypto.symbol}</div>
                    <div className="text-lg font-bold">${crypto.price.toLocaleString()}</div>
                  </div>
                  <Badge variant={crypto.changePercent >= 0 ? "default" : "destructive"}>
                    {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={feature.link} className="flex items-center gap-2">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Real-time platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Market Data Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Trading Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Risk Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Algo Strategies</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
