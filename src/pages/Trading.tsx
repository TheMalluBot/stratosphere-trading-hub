
import { useEffect, useState } from "react";
import { TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { TradingChartSkeleton, OrderFormSkeleton, PortfolioSkeleton, OrderBookSkeleton } from "@/components/loading/LoadingStates";
import { orderManager } from "@/services/orderManager";
import { enhancedWsService } from "@/services/enhancedWebSocketService";
import { realTimeDataManager } from "@/services/realTimeDataManager";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRetry } from "@/hooks/useRetry";
import { TradingTabs } from "@/components/trading/TradingTabs";
import { TradingModeSelector } from "@/components/trading/TradingModeSelector";
import { TradingDashboard } from "@/components/trading/TradingDashboard";

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

        await retry(async () => {
          await realTimeDataManager.initialize();
        }, {
          maxAttempts: 3,
          delay: 1000,
          onError: (error, attempt) => {
            console.warn(`Real-time data manager initialization attempt ${attempt} failed:`, error);
          }
        });

        const unsubscribePrice = realTimeDataManager.subscribe(`price_${selectedSymbol}`, (priceData) => {
          setCurrentPrice(priceData.price);
        });
        
        const status = await retry(async () => {
          return await orderManager.getConnectionStatus();
        }, {
          maxAttempts: 3,
          delay: 500
        });
        
        setConnectionStatus(status);
        
        const generateMarketData = () => {
          const data = [];
          const basePrice = currentPrice;
          const now = Date.now();
          
          for (let i = 99; i >= 0; i--) {
            const timestamp = now - (i * 60000);
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
        
        const interval = setInterval(() => {
          setMarketData(generateMarketData());
        }, 60000);
        
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

  if (isLoading && !isRetrying) {
    return (
      <div className="flex-1 h-full overflow-auto">
        <div className="space-y-6 p-6">
          <TradingChartSkeleton />
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
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500 flex-shrink-0" />
                <span className="truncate">Unified Trading Platform</span>
                {isRetrying && (
                  <Badge variant="outline" className="animate-pulse flex-shrink-0">
                    Connecting...
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Professional trading environment with multiple execution modes
              </p>
            </div>
          </div>

          {/* Trading Mode Selection */}
          <TradingModeSelector 
            currentMode={tradingMode}
            onModeChange={setTradingMode}
            connectionStatus={connectionStatus}
          />

          {/* Connection Warning */}
          {!connectionStatus.configured && tradingMode === 'live' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <span className="text-yellow-600 font-medium">Demo Mode Active</span>
                  <p className="text-sm text-yellow-600 mt-1">
                    Configure your MEXC API keys in Settings to enable live trading
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trading Dashboard */}
          <TradingDashboard 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            tradingMode={tradingMode}
            connectionStatus={connectionStatus}
          />

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
