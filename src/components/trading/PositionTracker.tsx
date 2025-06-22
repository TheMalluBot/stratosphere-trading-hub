
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, X, DollarSign } from "lucide-react";

interface Position {
  id: string;
  symbol: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

const PositionTracker = () => {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    // Mock positions for demonstration
    const mockPositions: Position[] = [
      {
        id: "1",
        symbol: "BTCUSDT",
        side: "long",
        size: 0.5,
        entryPrice: 44500,
        currentPrice: 45234,
        pnl: 367,
        pnlPercent: 1.65,
        timestamp: Date.now() - 3600000
      },
      {
        id: "2",
        symbol: "ETHUSDT",
        side: "short",
        size: 2.8,
        entryPrice: 2420,
        currentPrice: 2398,
        pnl: 61.6,
        pnlPercent: 0.91,
        timestamp: Date.now() - 1800000
      }
    ];
    setPositions(mockPositions);
  }, []);

  const closePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      toast.success(`Closed ${position.side} position for ${position.symbol} with ${position.pnl >= 0 ? 'profit' : 'loss'} of $${Math.abs(position.pnl)}`);
      setPositions(prev => prev.filter(p => p.id !== positionId));
    }
  };

  const totalPnl = positions.reduce((sum, position) => sum + position.pnl, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Open Positions
            </CardTitle>
            <CardDescription>
              Track your active trading positions
            </CardDescription>
          </div>
          <Badge variant={totalPnl >= 0 ? "default" : "destructive"} className="text-lg">
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No open positions</p>
            <p className="text-xs">Place a trade to see positions here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <div key={position.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{position.symbol}</span>
                    <Badge variant={position.side === "long" ? "default" : "secondary"}>
                      {position.side === "long" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {position.side.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closePosition(position.id)}
                    className="h-6 w-6 p-0 hover:bg-red-500/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Size</div>
                    <div className="font-mono">{position.size} {position.symbol.replace("USDT", "")}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entry Price</div>
                    <div className="font-mono">${position.entryPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Price</div>
                    <div className="font-mono">${position.currentPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">P&L</div>
                    <div className={`font-mono ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionTracker;
