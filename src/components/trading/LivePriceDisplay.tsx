
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";
import { useRealTimePrice } from "@/hooks/useRealTimePrice";

interface LivePriceDisplayProps {
  symbol: string;
  className?: string;
}

const LivePriceDisplay = ({ symbol, className }: LivePriceDisplayProps) => {
  const { priceData, isConnected, error } = useRealTimePrice(symbol);

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <WifiOff className="w-4 h-4 text-red-500" />
        <span className="text-sm text-muted-foreground">Offline</span>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const isPositive = priceData.change >= 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        <Badge variant="outline" className="text-xs">LIVE</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">
          ${priceData.price.toLocaleString()}
        </span>
        
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm">
            {isPositive ? '+' : ''}${priceData.change.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivePriceDisplay;
