
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
  Globe,
  AlertTriangle,
  BookOpen,
  Users,
  Code,
  GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";

const Index = () => {
  const { marketData, loading } = useCryptoData();
  
  const heroFeatures = [
    "Educational Trading Simulation",
    "Risk-Free Backtesting",
    "Strategy Learning Tools",
    "Paper Trading Practice"
  ];

  const educationalStrategies = [
    {
      icon: Brain,
      title: "Statistical Analysis",
      description: "Learn mean reversion and statistical concepts through simulation",
      status: "Educational Demo"
    },
    {
      icon: Target,
      title: "Risk Management",
      description: "Understand portfolio risk and position sizing principles",
      status: "Learning Module"
    },
    {
      icon: Cpu,
      title: "Algorithm Basics",
      description: "Explore basic algorithmic trading concepts and backtesting",
      status: "Simulation Only"
    },
    {
      icon: Activity,
      title: "Market Analysis",
      description: "Practice technical analysis with historical data",
      status: "Educational Tool"
    }
  ];

  const learningFeatures = [
    {
      icon: Shield,
      title: "Risk Education",
      description: "Learn risk management fundamentals"
    },
    {
      icon: Lock,
      title: "Simulation Environment",
      description: "Practice without financial risk"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor your learning journey"
    },
    {
      icon: Zap,
      title: "Interactive Tutorials",
      description: "Hands-on learning experiences"
    }
  ];

  const userTypes = [
    {
      type: "Students",
      icon: GraduationCap,
      description: "Academic research and financial modeling education",
      features: ["Research tools", "Educational datasets", "Academic projects"],
      cta: "Start Learning"
    },
    {
      type: "Beginners",
      icon: BookOpen,
      description: "Learn trading fundamentals with risk-free simulation",
      features: ["Paper trading", "Basic tutorials", "Risk education"],
      cta: "Begin Journey"
    },
    {
      type: "Developers",
      icon: Code,
      description: "Explore algorithmic trading concepts and backtesting",
      features: ["Strategy templates", "Backtesting tools", "Code examples"],
      cta: "Explore Code"
    }
  ];

  const platformStats = [
    { label: "Learning Modules", value: "15+", icon: BookOpen },
    { label: "Strategy Templates", value: "25+", icon: Bot },
    { label: "Simulated Trades", value: "10K+", icon: Activity },
    { label: "Educational Resources", value: "50+", icon: GraduationCap }
  ];

  return (
    <div className="flex-1 space-y-12 p-4 md:p-6 overflow-auto custom-scrollbar">
      {/* Legal Disclaimer Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-yellow-500">EDUCATIONAL PLATFORM DISCLAIMER</span>
        </div>
        <p className="text-sm">
          This is an educational trading simulation platform for learning purposes only. 
          All data and performance results shown are simulated or hypothetical. No real money is involved.
          This platform does not provide investment advice. Trading involves substantial risk of loss.
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl"></div>
        <div className="relative text-center space-y-6 md:space-y-8 py-12 md:py-16 px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-xl">
              <Rocket className="w-6 h-6 md:w-9 md:h-9 text-primary-foreground" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                TradingHub Learn
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">Educational Trading Simulation</p>
            </div>
          </div>
          
          <p className="text-lg md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Learn algorithmic trading concepts through risk-free simulation and interactive tutorials. 
            Perfect for students, beginners, and developers exploring financial markets.
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            {heroFeatures.map((feature, index) => (
              <Badge key={index} variant="secondary" className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm">
                <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {feature}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <Button asChild size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
              <Link to="/auth">
                <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" asChild>
              <Link to="/auth">
                <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div>
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Perfect For Every Learner</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a student, beginner, or developer, our platform adapts to your learning needs
          </p>
        </div>
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
          {userTypes.map((userType, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 md:p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mx-auto mb-4">
                    <userType.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{userType.type}</h3>
                  <p className="text-muted-foreground mb-4">{userType.description}</p>
                  <div className="space-y-2 mb-6">
                    {userType.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/auth" className="flex items-center justify-center gap-2">
                      {userType.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Statistics */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Learning Platform Stats
          </CardTitle>
          <CardDescription className="text-base md:text-lg">
            Educational resources and simulated learning experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center p-4 md:p-6 rounded-xl bg-muted/50 border">
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Educational Strategies */}
      <div>
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Learning Modules</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore trading concepts through interactive simulations and educational content
          </p>
        </div>
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          {educationalStrategies.map((strategy, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <strategy.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold mb-2">{strategy.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">{strategy.description}</p>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {strategy.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    Try Simulation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Features */}
      <Card className="bg-gradient-to-br from-card to-muted/20 border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Safe Learning Environment
          </CardTitle>
          <CardDescription className="text-base md:text-lg">
            Risk-free education with comprehensive learning tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {learningFeatures.map((feature, index) => (
              <div key={index} className="text-center p-4 md:p-6 rounded-xl bg-background/50 border">
                <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-8">
            <Button asChild size="lg">
              <Link to="/auth">
                <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            Live Market Data Preview
          </CardTitle>
          <CardDescription>Educational market data for learning purposes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse p-4 rounded-lg border">
                  <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {marketData.slice(0, 6).map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-semibold text-base md:text-lg">{crypto.symbol}</div>
                    <div className="text-lg md:text-xl font-bold">${crypto.price.toLocaleString()}</div>
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
              <Link to="/auth">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Explore Learning Tools
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            Learning Platform Status - All Systems Operational
          </CardTitle>
          <CardDescription>Educational platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Learning Modules",
              "Simulation Engine", 
              "Educational Content",
              "Progress Tracking"
            ].map((system, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="font-medium text-sm md:text-base">{system}</span>
                <Badge variant="outline" className="ml-auto text-green-600 border-green-600 text-xs">
                  Online
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="text-center py-8 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of learners exploring trading concepts through our educational simulation platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
              <Link to="/auth">
                <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" asChild>
              <Link to="/auth">
                <PieChart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                View Tutorials
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
