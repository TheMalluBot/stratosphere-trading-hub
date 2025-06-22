import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, Volume2, AlertCircle, RefreshCw } from "lucide-react";

interface MomentumStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  volumeRatio: number;
  momentum: number;
  gapPercent?: number;
  type: 'breakout' | 'volume_spike' | 'gap_up' | 'acceleration';
}

export function MomentumScanner() {
  const [momentumStocks, setMomentumStocks] = useState<MomentumStock[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial scan
    runMomentumScan();
    
    // Set up real-time scanning every 30 seconds
    const interval = setInterval(() => {
      runMomentumScan();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const runMomentumScan = async () => {
    setIsScanning(true);
    
    // Simulate real-time momentum scanning
    setTimeout(() => {
      const mockMomentumStocks: MomentumStock[] = [
        {
          symbol: "MSTR",
          name: "MicroStrategy Inc.",
          price: 125.67,
          change: 12.34,
          volume: 8900000,
          volumeRatio: 4.2,
          momentum: 9.1,
          type: "breakout"
        },
        {
          symbol: "ROKU",
          name: "Roku Inc.",
          price: 67.89,
          change: 8.45,
          volume: 5600000,
          volumeRatio: 3.8,
          momentum: 8.7,
          gapPercent: 6.2,
          type: "gap_up"
        },
        {
          symbol: "PLTR",
          name: "Palantir Technologies",
          price: 23.45,
          change: 15.67,
          volume: 12300000,
          volumeRatio: 5.9,
          momentum: 9.5,
          type: "volume_spike"
        },
        {
          symbol: "SOFI",
          name: "SoFi Technologies",
          price: 8.92,
          change: 7.23,
          volume: 4200000,
          volumeRatio: 2.8,
          momentum: 7.8,
          type: "acceleration"
        }
      ];
      
      setMomentumStocks(mockMomentumStocks);
      setLastUpdate(new Date());
      setIsScanning(false);
    }, 1500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breakout': return 'bg-green-100 text-green-800';
      case 'volume_spike': return 'bg-blue-100 text-blue-800';
      case 'gap_up': return 'bg-purple-100 text-purple-800';
      case 'acceleration': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breakout': return <TrendingUp className="w-3 h-3" />;
      case 'volume_spike': return <Volume2 className="w-3 h-3" />;
      case 'gap_up': return <AlertCircle className="w-3 h-3" />;
      case 'acceleration': return <Zap className="w-3 h-3" />;
      default: return <TrendingUp className="w-3 h-3" />;
    }
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 9) return "text-green-600";
    if (momentum >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Momentum Scanner
          <Button
            onClick={runMomentumScan}
            disabled={isScanning}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Real-time detection of unusual price and volume activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Badge variant="secondary">
            {momentumStocks.length} alerts
          </Badge>
        </div>

        {isScanning && (
          <div className="text-center py-4">
            <Zap className="w-6 h-6 mx-auto mb-2 animate-pulse text-blue-500" />
            <p className="text-sm text-muted-foreground">Scanning for momentum...</p>
          </div>
        )}

        <div className="space-y-3">
          {momentumStocks.map((stock) => (
            <div key={stock.symbol} className="p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{stock.symbol}</h4>
                    <Badge className={getTypeColor(stock.type)}>
                      {getTypeIcon(stock.type)}
                      <span className="ml-1 capitalize">{stock.type.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">${stock.price}</div>
                  <div className="text-sm text-green-600">
                    +{stock.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Momentum Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Momentum Score</span>
                  <span className={`text-sm font-medium ${getMomentumColor(stock.momentum)}`}>
                    {stock.momentum}/10
                  </span>
                </div>
                <Progress value={stock.momentum * 10} className="h-2" />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-medium">
                    {(stock.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume Ratio</div>
                  <div className="font-medium text-blue-600">
                    {stock.volumeRatio.toFixed(1)}x
                  </div>
                </div>
                {stock.gapPercent && (
                  <>
                    <div>
                      <div className="text-muted-foreground">Gap %</div>
                      <div className="font-medium text-purple-600">
                        +{stock.gapPercent.toFixed(1)}%
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-3 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  View Chart
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Add Alert
                </Button>
              </div>
            </div>
          ))}
        </div>

        {momentumStocks.length === 0 && !isScanning && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No momentum alerts detected</p>
            <p className="text-xs">Scanner runs automatically every 30 seconds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
