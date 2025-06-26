
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wifi, WifiOff, Activity } from "lucide-react";
import { useEnhancedRealTimeData } from "@/hooks/useEnhancedRealTimeData";

interface LivePriceDisplayProps {
  symbol: string;
  className?: string;
  showVolume?: boolean;
  showHighLow?: boolean;
}

const LivePriceDisplay = ({ 
  symbol, 
  className, 
  showVolume = false, 
  showHighLow = false 
}: LivePriceDisplayProps) => {
  const { priceData, connectionStatus, error, isConnected } = useEnhancedRealTimeData({ 
    symbol,
    throttleMs: 50 // More responsive updates
  });

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <WifiOff className="w-4 h-4 text-red-500" />
        <span className="text-sm text-muted-foreground">Connection Error</span>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Activity className="w-4 h-4 animate-pulse text-blue-500" />
        <span className="text-sm text-muted-foreground">Connecting...</span>
      </div>
    );
  }

  const isPositive = priceData.changePercent >= 0;
  const connectionType = connectionStatus.enhanced ? 'Enhanced' : 
                        connectionStatus.optimized ? 'Optimized' : 
                        connectionStatus.fallbackActive ? 'REST' : 'Demo';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        <Badge 
          variant={isConnected ? "default" : "secondary"} 
          className="text-xs"
        >
          {isConnected ? `LIVE (${connectionType})` : 'OFFLINE'}
        </Badge>
      </div>
      
      {/* Price Information */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-bold text-2xl">
            ${priceData.price.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 8 
            })}
          </div>
          {showHighLow && (
            <div className="text-xs text-muted-foreground">
              H: ${priceData.high24h.toLocaleString()} 
              L: ${priceData.low24h.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <div className="text-right">
            <div className="text-sm font-medium">
              {isPositive ? '+' : ''}${priceData.change.toFixed(2)}
            </div>
            <div className="text-xs">
              ({isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Volume Information */}
      {showVolume && (
        <div className="text-xs text-muted-foreground">
          Volume: {priceData.volume.toLocaleString()} {symbol.replace('USDT', '')}
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-muted-foreground">
        Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default LivePriceDisplay;
