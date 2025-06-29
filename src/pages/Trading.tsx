
import { useEffect, useState } from "react";
import { TrendingUp, Activity, Bot, TestTube, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LivePriceDisplay from "@/components/trading/LivePriceDisplay";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { TradingChartSkeleton, OrderFormSkeleton, PortfolioSkeleton, OrderBookSkeleton } from "@/components/loading/LoadingStates";
import { orderManager } from "@/services/orderManager";
import { enhancedWsService } from "@/services/enhancedWebSocketService";
import { realTimeDataManager } from "@/services/realTimeDataManager";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRetry } from "@/hooks/useRetry";
import { TradingTabs } from "@/components/trading/TradingTabs";

// Import components for different trading modes
import { BacktestEngine } from "@/lib/backtesting/BacktestEngine";
import { TradingEngine } from "@/lib/trading/TradingEngine";

const Trading = () => {
  const selectedSymbol = "BTCUSDT";
  const [connectionStatus, setConnectionStatus] = useState({ live: false, configured: false });
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(45234);
  const [tradingMode, setTradingMode] = useState<'live' | 'paper' | 'algo' | 'backtest'>('live');
  const [portfolio] = useState([
    { symbol: 'BTCUSDT', allocation: 0.4, value: 18000 },
    { symbol: 'ETHUSDT', allocation: 0.3, value: 13500 },
    { symbol: 'BNBUSDT', allocation: 0.2, value: 9000 },
    { symbol: 'ADAUSDT', allocation: 0.1, value: 4500 }
  ]);

  const { handleError } = useErrorHandler();
  const { retry, isRetrying } = useRetry();

  useEffect(() => {
    const initializeTrading = async () => {
      try {
        setIsLoading(true);

        // Initialize real-time data manager with retry
        await retry(async () => {
          await realTimeDataManager.initialize();
        }, {
          maxAttempts: 3,
          delay: 1000,
          onError: (error, attempt) => {
            console.warn(`Real-time data manager initialization attempt ${attempt} failed:`, error);
          }
        });

        // Subscribe to price updates for current price
        const unsubscribePrice = realTimeDataManager.subscribe(`price_${selectedSymbol}`, (priceData) => {
          setCurrentPrice(priceData.price);
        });
        
        // Get connection status with retry
        const status = await retry(async () => {
          return await orderManager.getConnectionStatus();
        }, {
          maxAttempts: 3,
          delay: 500
        });
        
        setConnectionStatus(status);
        
        // Generate sample market data for AI analysis
        const generateMarketData = () => {
          const data = [];
          const basePrice = currentPrice;
          const now = Date.now();
          
          for (let i = 99; i >= 0; i--) {
            const timestamp = now - (i * 60000); // 1 minute intervals
            const price = basePrice + (Math.random() - 0.5) * 2000;
            const volume = Math.random() * 100 + 50;
            
            data.push({
              timestamp,
              open: price,
              high: price * 1.002,
              low: price * 0.998,
              close: price,
              volume
            });
          }
          
          return data;
        };
        
        setMarketData(generateMarketData());
        
        // Update market data periodically
        const interval = setInterval(() => {
          setMarketData(generateMarketData());
        }, 60000); // Update every minute
        
        return () => {
          clearInterval(interval);
          unsubscribePrice();
        };

      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to initialize trading'), {
          toastMessage: 'Failed to initialize trading platform',
          retryable: true,
          onRetry: () => initializeTrading()
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeTrading();
  }, [handleError, retry, selectedSymbol, currentPrice]);

  const getTradingModeInfo = () => {
    switch (tradingMode) {
      case 'live':
        return {
          title: 'Live Trading',
          description: 'Execute real trades with live market data',
          icon: DollarSign,
          color: 'text-green-500',
          badge: connectionStatus.live ? 'LIVE' : 'DEMO'
        };
      case 'paper':
        return {
          title: 'Paper Trading',
          description: 'Practice trading with virtual money',
          icon: Activity,
          color: 'text-blue-500',
          badge: 'PAPER'
        };
      case 'algo':
        return {
          title: 'Algorithmic Trading',
          description: 'Automated trading with custom strategies',
          icon: Bot,
          color: 'text-purple-500',
          badge: 'ALGO'
        };
      case 'backtest':
        return {
          title: 'Backtesting',
          description: 'Test strategies on historical data',
          icon: TestTube,
          color: 'text-orange-500',
          badge: 'BACKTEST'
        };
    }
  };

  const modeInfo = getTradingModeInfo();

  if (isLoading && !isRetrying) {
    return (
      <div className="flex-1 h-full overflow-auto">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <TradingChartSkeleton />
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <OrderFormSkeleton />
            <OrderBookSkeleton />
            <PortfolioSkeleton />
            <PortfolioSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex-1 h-full overflow-auto">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="truncate">Unified Trading Platform</span>
                <Badge variant={connectionStatus.live ? "default" : "secondary"} className="ml-2 flex-shrink-0">
                  {modeInfo.badge}
                </Badge>
                {isRetrying && (
                  <Badge variant="outline" className="ml-2 animate-pulse flex-shrink-0">
                    Connecting...
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {connectionStatus.live 
                  ? "All-in-one trading platform with live execution, paper trading, algorithmic strategies, and backtesting" 
                  : "Unified trading platform - Configure API keys in Settings for live trading"
                }
              </p>
            </div>
            
            {/* Enhanced Live Price Display */}
            <div className="flex-shrink-0">
              <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Price unavailable</div>}>
                <LivePriceDisplay 
                  symbol={selectedSymbol} 
                  showVolume={true}
                  showHighLow={true}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Trading Mode Selector */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-4">
              <modeInfo.icon className={`w-5 h-5 ${modeInfo.color}`} />
              <h2 className="text-lg font-semibold">{modeInfo.title}</h2>
              <Badge variant="outline">{modeInfo.badge}</Badge>
            </div>
            
            <Tabs value={tradingMode} onValueChange={(value) => setTradingMode(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="paper" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Paper
                </TabsTrigger>
                <TabsTrigger value="algo" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Algo
                </TabsTrigger>
                <TabsTrigger value="backtest" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Backtest
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{modeInfo.description}</p>
              </div>
            </Tabs>
          </div>

          {/* Connection Status Alert */}
          {!connectionStatus.configured && tradingMode === 'live' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <span className="text-yellow-600 font-medium">Demo Mode Active</span>
                  <p className="text-sm text-yellow-600 mt-1">
                    Configure your MEXC API keys in Settings to enable live trading
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trading Interface */}
          <div className="min-h-0 flex-1">
            <TradingTabs 
              selectedSymbol={selectedSymbol}
              currentPrice={currentPrice}
              marketData={marketData}
              portfolio={portfolio}
              tradingMode={tradingMode}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Trading;
