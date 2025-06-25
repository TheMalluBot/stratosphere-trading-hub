
import { useEffect, useState } from "react";
import { TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LivePriceDisplay from "@/components/trading/LivePriceDisplay";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { TradingChartSkeleton, OrderFormSkeleton, PortfolioSkeleton, OrderBookSkeleton } from "@/components/loading/LoadingStates";
import { orderManager } from "@/services/orderManager";
import { enhancedWsService } from "@/services/enhancedWebSocketService";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRetry } from "@/hooks/useRetry";
import { TradingTabs } from "@/components/trading/TradingTabs";

const Trading = () => {
  const selectedSymbol = "BTCUSDT";
  const [connectionStatus, setConnectionStatus] = useState({ live: false, configured: false });
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        // Initialize enhanced WebSocket connection with retry
        await retry(async () => {
          enhancedWsService.connect();
        }, {
          maxAttempts: 3,
          delay: 1000,
          onError: (error, attempt) => {
            console.warn(`WebSocket connection attempt ${attempt} failed:`, error);
          }
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
          const basePrice = 45000;
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
  }, [handleError, retry]);

  if (isLoading && !isRetrying) {
    return (
      <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
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
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              Advanced Trading Platform
              <Badge variant={connectionStatus.live ? "default" : "secondary"} className="ml-2">
                {connectionStatus.live ? "LIVE" : "DEMO"}
              </Badge>
              {isRetrying && (
                <Badge variant="outline" className="ml-2 animate-pulse">
                  Connecting...
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              {connectionStatus.live 
                ? "Execute real trades with MEXC API integration and AI-powered insights" 
                : "Demo mode with AI analytics - Configure API keys in Settings for live trading"
              }
            </p>
          </div>
          
          {/* Live Price Display */}
          <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Price unavailable</div>}>
            <LivePriceDisplay symbol={selectedSymbol} />
          </ErrorBoundary>
        </div>

        {/* Connection Status Alert */}
        {!connectionStatus.configured && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-600 font-medium">Demo Mode Active</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Configure your MEXC API keys in Settings to enable live trading
            </p>
          </div>
        )}

        {/* Trading Interface */}
        <TradingTabs 
          selectedSymbol={selectedSymbol}
          currentPrice={45234}
          marketData={marketData}
          portfolio={portfolio}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Trading;
