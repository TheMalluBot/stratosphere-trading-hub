
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
  CheckCircle,
  Target,
  Brain,
  Cpu,
  Lock,
  Trophy,
  Rocket,
  Star,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";

const Index = () => {
  const { marketData, loading } = useCryptoData();
  
  const heroFeatures = [
    "Elite Quantitative Strategies",
    "Advanced Risk Management",
    "Real-time Execution",
    "ML-Powered Analytics"
  ];

  const eliteStrategies = [
    {
      icon: Brain,
      title: "Statistical Arbitrage",
      description: "Mean reversion and cointegration strategies with Z-score analysis",
      performance: "+127% Annualized"
    },
    {
      icon: Target,
      title: "Cross-Asset Arbitrage",
      description: "Multi-asset correlation exploitation with dynamic hedging",
      performance: "0.89 Sharpe Ratio"
    },
    {
      icon: Cpu,
      title: "ML Momentum",
      description: "Machine learning momentum detection with regime awareness",
      performance: "73.2% Win Rate"
    },
    {
      icon: Activity,
      title: "Pairs Trading",
      description: "Market-neutral strategies with advanced correlation analysis",
      performance: "12.3% Max DD"
    }
  ];

  const riskFeatures = [
    {
      icon: Shield,
      title: "Kelly Criterion",
      description: "Optimal position sizing for maximum growth"
    },
    {
      icon: Lock,
      title: "Value at Risk",
      description: "Comprehensive risk quantification and monitoring"
    },
    {
      icon: Trophy,
      title: "Risk Parity",
      description: "Balanced portfolio construction methodology"
    },
    {
      icon: Zap,
      title: "Monte Carlo",
      description: "Advanced simulation and stress testing"
    }
  ];

  const platformStats = [
    { label: "Assets Under Management", value: "$2.5B+", icon: DollarSign },
    { label: "Daily Volume", value: "$150M+", icon: BarChart3 },
    { label: "Active Strategies", value: "500+", icon: Bot },
    { label: "Success Rate", value: "78.4%", icon: Target }
  ];

  return (
    <div className="flex-1 space-y-12 p-6 overflow-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl"></div>
        <div className="relative text-center space-y-8 py-16 px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-xl">
              <Rocket className="w-9 h-9 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AlgoTrade Elite
              </h1>
              <p className="text-xl text-muted-foreground">Institutional-Grade Trading Platform</p>
            </div>
          </div>
          
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Deploy sophisticated quantitative strategies with professional risk management. 
            Built for traders who demand institutional-level performance.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {heroFeatures.map((feature, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-2" />
                {feature}
              </Badge>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/trading">
                <Rocket className="w-5 h-5 mr-2" />
                Start Elite Trading
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/algo-trading">
                <Brain className="w-5 h-5 mr-2" />
                Explore Strategies
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            Platform Performance
          </CardTitle>
          <CardDescription className="text-lg">
            Trusted by institutional traders worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-muted/50 border">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Elite Strategies */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4">Elite Quantitative Strategies</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sophisticated algorithms developed by quantitative researchers with proven track records
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {eliteStrategies.map((strategy, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <strategy.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{strategy.title}</h3>
                    <p className="text-muted-foreground mb-4">{strategy.description}</p>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      {strategy.performance}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/backtesting" className="flex items-center justify-center gap-2">
                    Backtest Strategy
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Risk Management */}
      <Card className="bg-gradient-to-br from-card to-muted/20 border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Advanced Risk Management
          </CardTitle>
          <CardDescription className="text-lg">
            Institutional-grade risk controls and portfolio optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {riskFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-background/50 border">
                <feature.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link to="/risk-management">
                <Shield className="w-5 h-5 mr-2" />
                Explore Risk Tools
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6" />
            Live Market Data
          </CardTitle>
          <CardDescription>Real-time cryptocurrency market overview</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse p-4 rounded-lg border">
                  <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {marketData.slice(0, 6).map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-semibold text-lg">{crypto.symbol}</div>
                    <div className="text-xl font-bold">${crypto.price.toLocaleString()}</div>
                  </div>
                  <Badge 
                    variant={crypto.changePercent >= 0 ? "default" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-6">
            <Button variant="outline" asChild>
              <Link to="/charts">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Advanced Charts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            System Status - All Systems Operational
          </CardTitle>
          <CardDescription>Real-time platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Market Data Feed",
              "Trading Engine", 
              "Risk Management",
              "Strategy Execution"
            ].map((system, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">{system}</span>
                <Badge variant="outline" className="ml-auto text-green-600 border-green-600">
                  Online
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Elite Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join institutional traders using our advanced quantitative strategies and risk management tools
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/dashboard">
                <Activity className="w-5 h-5 mr-2" />
                Launch Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/portfolio-analytics">
                <PieChart className="w-5 h-5 mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
