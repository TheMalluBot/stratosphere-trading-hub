import { useState, useEffect, Suspense, lazy } from "react";
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
  GraduationCap,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { ProgressiveLoader } from "@/components/landing/ProgressiveLoader";
import { GlobalLoader } from "@/components/loading/LoadingStates";

// Lazy load heavy components
const OptimizedMarketData = lazy(() => 
  import("@/components/landing/OptimizedMarketData").then(module => ({
    default: module.OptimizedMarketData
  }))
);

const Index = () => {
  const { marketData, loading } = useCryptoData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      setShowContent(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const heroFeatures = [
    "Educational Trading Simulation",
    "Risk-Free Backtesting",
    "Strategy Learning Tools",
    "Paper Trading Practice"
  ];

  const userTypes = [
    {
      type: "Students",
      icon: GraduationCap,
      description: "Learn financial markets and algorithmic trading concepts through academic research and hands-on simulation",
      features: [
        "Academic research tools and datasets",
        "Financial modeling exercises", 
        "Strategy development tutorials",
        "Risk management fundamentals"
      ],
      benefits: [
        "Build portfolio for internships",
        "Understand market mechanics",
        "Learn without financial risk"
      ],
      cta: "Start Learning",
      ctaIcon: BookOpen
    },
    {
      type: "Beginners",
      icon: Users,
      description: "New to trading? Our step-by-step approach teaches you the fundamentals through interactive simulation",
      features: [
        "Interactive trading tutorials",
        "Paper trading environment",
        "Basic strategy templates",
        "Educational resources library"
      ],
      benefits: [
        "Learn at your own pace",
        "No financial risk involved",
        "Build confidence gradually"
      ],
      cta: "Begin Journey",
      ctaIcon: Rocket
    },
    {
      type: "Developers",
      icon: Code,
      description: "Explore algorithmic trading development with our comprehensive backtesting and strategy building tools",
      features: [
        "Strategy development framework",
        "Backtesting engine access",
        "Code examples and templates",
        "Performance analytics tools"
      ],
      benefits: [
        "Practice algorithmic concepts",
        "Test strategies safely",
        "Learn quantitative finance"
      ],
      cta: "Explore Code",
      ctaIcon: Brain
    }
  ];

  const educationalStrategies = [
    {
      title: "Moving Average Strategy",
      description: "Learn trend-following strategies using simple and exponential moving averages",
      icon: TrendingUp,
      status: "Educational Tutorial"
    },
    {
      title: "Mean Reversion",
      description: "Understand how prices revert to their mean and build strategies around this concept",
      icon: Target,
      status: "Learning Module"
    },
    {
      title: "Risk Management",
      description: "Master position sizing, stop-losses, and portfolio risk management principles",
      icon: Shield,
      status: "Safety First"
    },
    {
      title: "Backtesting Basics",
      description: "Learn how to test trading strategies on historical data to evaluate performance",
      icon: BarChart3,
      status: "Simulation Tool"
    }
  ];

  const learningFeatures = [
    {
      title: "Paper Trading",
      description: "Practice with virtual money",
      icon: DollarSign
    },
    {
      title: "Educational Content",
      description: "Learn trading concepts",
      icon: BookOpen
    },
    {
      title: "Risk-Free Environment",
      description: "No real money at risk",
      icon: Shield
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning",
      icon: Trophy
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Computer Science Student, MIT",
      quote: "This platform helped me understand algorithmic trading concepts for my fintech course. The risk-free environment let me experiment without worry.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Finance Professional",
      quote: "Great educational tool for learning backtesting fundamentals. The tutorials are well-structured and easy to follow.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Software Developer",
      quote: "Perfect for exploring quantitative finance concepts. The code examples and strategy templates are very helpful for beginners.",
      rating: 5
    }
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "Sign Up Free",
      description: "Create your educational account in seconds",
      icon: Users
    },
    {
      step: 2,
      title: "Choose Learning Path",
      description: "Select beginner, intermediate, or developer track",
      icon: BookOpen
    },
    {
      step: 3,
      title: "Start Simulation",
      description: "Practice trading with virtual money",
      icon: Activity
    },
    {
      step: 4,
      title: "Learn & Grow",
      description: "Build knowledge through hands-on experience",
      icon: Trophy
    }
  ];

  const faqItems = [
    {
      question: "Is this platform completely free?",
      answer: "Yes, our educational platform is completely free to use. All simulation features, tutorials, and backtesting tools are available at no cost."
    },
    {
      question: "Do I need real money to start?",
      answer: "No, absolutely not. Everything is simulated with virtual money. You'll never need to deposit real funds or provide payment information."
    },
    {
      question: "What makes this different from real trading platforms?",
      answer: "We focus purely on education and simulation. There's no real money involved, no pressure to perform, and extensive learning resources to help you understand concepts."
    },
    {
      question: "Can I use this for academic research?",
      answer: "Yes! Students and researchers can use our platform for academic projects, thesis research, and financial modeling exercises."
    },
    {
      question: "How realistic are the simulations?",
      answer: "Our simulations use real historical market data and realistic market conditions, but all trading is virtual. Performance results are for educational purposes only."
    },
    {
      question: "Do you provide investment advice?",
      answer: "No, we do not provide investment advice. Our platform is purely educational. Always consult with qualified financial advisors for real investment decisions."
    }
  ];

  const platformStats = [
    { label: "Learning Modules", value: "15+", icon: BookOpen },
    { label: "Strategy Templates", value: "25+", icon: Bot },
    { label: "Simulated Trades", value: "10K+", icon: Activity },
    { label: "Educational Resources", value: "50+", icon: GraduationCap }
  ];

  if (isInitialLoading) {
    return (
      <ProgressiveLoader
        onComplete={() => setIsInitialLoading(false)}
        duration={2000}
      />
    );
  }

  if (!showContent) {
    return <GlobalLoader message="Preparing your learning experience..." />;
  }

  return (
    <div className="flex-1 space-y-8 md:space-y-12 p-4 md:p-6 overflow-auto custom-scrollbar">
      {/* Legal Disclaimer Banner */}
      <AnimatedSection animation="slideUp" delay={100}>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" />
            <span className="font-bold text-yellow-500 text-sm md:text-base">EDUCATIONAL PLATFORM DISCLAIMER</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            This is an educational trading simulation platform for learning purposes only. 
            All data and performance results shown are simulated or hypothetical. No real money is involved.
            This platform does not provide investment advice. Trading involves substantial risk of loss.
          </p>
        </div>
      </AnimatedSection>

      {/* Hero Section */}
      <AnimatedSection animation="fadeIn" delay={200}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-2xl md:rounded-3xl"></div>
          <div className="relative text-center space-y-4 md:space-y-8 py-8 md:py-16 px-4 md:px-8">
            <AnimatedSection animation="scale" delay={300}>
              <div className="flex flex-col items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                  <Rocket className="w-6 h-6 md:w-9 md:h-9 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    TradingHub Learn
                  </h1>
                  <p className="text-base md:text-xl text-muted-foreground">Educational Trading Simulation</p>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="slideUp" delay={400}>
              <p className="text-base md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Master algorithmic trading concepts through risk-free simulation and interactive tutorials. 
                Perfect for students, beginners, and developers exploring financial markets.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={500}>
              <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-8">
                {heroFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-primary/20 transition-colors">
                    <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={600}>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6">
                <Button asChild size="lg" className="text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 hover:scale-105 transition-transform">
                  <Link to="/auth">
                    <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start Learning Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 hover:scale-105 transition-transform" asChild>
                  <Link to="/auth">
                    <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    View Demo
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </AnimatedSection>

      {/* User Types Section */}
      <AnimatedSection animation="slideUp" delay={100}>
        <div>
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-4xl font-bold mb-2 md:mb-4">Perfect For Every Learner</h2>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a student, beginner, or developer, our platform adapts to your learning journey
            </p>
          </div>
          <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-3">
            {userTypes.map((userType, index) => (
              <AnimatedSection key={index} animation="slideUp" delay={200 + index * 100}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 h-full hover:scale-105">
                  <CardContent className="p-4 md:p-8 h-full flex flex-col">
                    <div className="flex-1">
                      <div className="text-center mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mx-auto mb-3 md:mb-4">
                          <userType.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">{userType.type}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-4">{userType.description}</p>
                      </div>

                      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                        <div>
                          <h4 className="font-medium text-sm md:text-base mb-2">What You'll Learn:</h4>
                          <div className="space-y-1 md:space-y-2">
                            {userType.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm md:text-base mb-2">Key Benefits:</h4>
                          <div className="space-y-1 md:space-y-2">
                            {userType.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild className="w-full mt-auto hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Link to="/auth" className="flex items-center justify-center gap-2">
                        <userType.ctaIcon className="w-4 h-4" />
                        {userType.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Getting Started Section */}
      <AnimatedSection animation="slideUp" delay={100}>
        <Card className="bg-gradient-to-br from-card to-muted/20 border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-3xl flex items-center justify-center gap-2 md:gap-3">
              <Rocket className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              Get Started in Minutes
            </CardTitle>
            <CardDescription className="text-sm md:text-lg">
              Your learning journey begins with these simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {gettingStartedSteps.map((step, index) => (
                <AnimatedSection key={index} animation="scale" delay={200 + index * 100}>
                  <div className="text-center p-3 md:p-6 rounded-xl bg-background/50 border relative hover:bg-background/80 transition-colors">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm md:text-lg mx-auto mb-3 md:mb-4">
                      {step.step}
                    </div>
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
                    <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">{step.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{step.description}</p>
                    {index < gettingStartedSteps.length - 1 && (
                      <ArrowRight className="hidden lg:block w-4 h-4 md:w-6 md:h-6 text-muted-foreground absolute -right-3 md:-right-4 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection animation="slideUp" delay={600}>
              <div className="text-center mt-4 md:mt-8">
                <Button asChild size="lg" className="hover:scale-105 transition-transform">
                  <Link to="/auth">
                    <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start Your Free Account
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Market Data Preview - Lazy Loaded */}
      <AnimatedSection animation="slideUp" delay={100}>
        <Suspense fallback={<GlobalLoader message="Loading market data..." />}>
          <OptimizedMarketData marketData={marketData} loading={loading} />
        </Suspense>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection animation="slideUp" delay={100}>
        <div>
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-4xl font-bold mb-2 md:mb-4">What Learners Say</h2>
            <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Real feedback from students and professionals using our educational platform
            </p>
          </div>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} animation="slideUp" delay={200 + index * 100}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm md:text-base">{testimonial.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection animation="slideUp" delay={100}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-3xl flex items-center justify-center gap-2 md:gap-3">
              <HelpCircle className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-sm md:text-lg">
              Common questions about our educational platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-4">
            {faqItems.map((faq, index) => (
              <AnimatedSection key={index} animation="slideLeft" delay={100 + index * 50}>
                <div className="border rounded-lg">
                  <button
                    className="w-full text-left p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-sm md:text-base pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0 transition-transform" />
                    ) : (
                      <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0 transition-transform" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="p-3 md:p-4 pt-0 text-xs md:text-sm text-muted-foreground border-t animate-in slide-in-from-top-2 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Platform Statistics */}
      <AnimatedSection animation="slideUp" delay={100}>
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
                <AnimatedSection key={index} animation="scale" delay={200 + index * 100}>
                  <div className="text-center p-4 md:p-6 rounded-xl bg-muted/50 border hover:bg-muted/80 transition-colors">
                    <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Educational Strategies */}
      <AnimatedSection animation="slideUp" delay={100}>
        <div>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Learning Modules</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore trading concepts through interactive simulations and educational content
            </p>
          </div>
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
            {educationalStrategies.map((strategy, index) => (
              <AnimatedSection key={index} animation="slideUp" delay={200 + index * 100}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-105">
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
                    <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Link to="/auth" className="flex items-center justify-center gap-2">
                        Try Simulation
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Learning Features */}
      <AnimatedSection animation="slideUp" delay={100}>
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
                <AnimatedSection key={index} animation="scale" delay={200 + index * 100}>
                  <div className="text-center p-4 md:p-6 rounded-xl bg-background/50 border hover:bg-background/80 transition-colors">
                    <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection animation="slideUp" delay={600}>
              <div className="text-center mt-6 md:mt-8">
                <Button asChild size="lg" className="hover:scale-105 transition-transform">
                  <Link to="/auth">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start Learning
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* System Status */}
      <AnimatedSection animation="slideUp" delay={100}>
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
                <AnimatedSection key={index} animation="slideLeft" delay={100 + index * 50}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                    <span className="font-medium text-sm md:text-base">{system}</span>
                    <Badge variant="outline" className="ml-auto text-green-600 border-green-600 text-xs">
                      Online
                    </Badge>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Call to Action */}
      <AnimatedSection animation="slideUp" delay={100}>
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="text-center py-6 md:py-12">
            <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-sm md:text-xl text-muted-foreground mb-4 md:mb-8 max-w-2xl mx-auto">
              Join thousands of learners exploring trading concepts through our educational simulation platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button size="lg" asChild className="text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 hover:scale-105 transition-transform">
                <Link to="/auth">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Start Learning Free
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 hover:scale-105 transition-transform" asChild>
                <Link to="/auth">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Browse Tutorials
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
};

export default Index;
