
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Play, AlertCircle } from "lucide-react";

interface TechnicalScreenerProps {
  onResults: (results: any[]) => void;
}

interface ScreeningCriteria {
  patterns: string[];
  rsi: { enabled: boolean; min: number; max: number };
  volume: { enabled: boolean; minIncrease: number };
  priceChange: { enabled: boolean; min: number; max: number };
  movingAverage: { enabled: boolean; type: string };
}

export function TechnicalScreener({ onResults }: TechnicalScreenerProps) {
  const [criteria, setCriteria] = useState<ScreeningCriteria>({
    patterns: [],
    rsi: { enabled: false, min: 30, max: 70 },
    volume: { enabled: false, minIncrease: 150 },
    priceChange: { enabled: false, min: -5, max: 5 },
    movingAverage: { enabled: false, type: "bullish_cross" }
  });
  const [isScanning, setIsScanning] = useState(false);

  const technicalPatterns = [
    { id: "breakout", name: "Breakout", description: "Price breaking resistance" },
    { id: "cup_handle", name: "Cup & Handle", description: "Classic bullish pattern" },
    { id: "triangle", name: "Triangle", description: "Consolidation pattern" },
    { id: "flag", name: "Bull Flag", description: "Continuation pattern" },
    { id: "hammer", name: "Hammer", description: "Reversal candlestick" },
    { id: "doji", name: "Doji", description: "Indecision candlestick" }
  ];

  const handlePatternToggle = (patternId: string) => {
    setCriteria(prev => ({
      ...prev,
      patterns: prev.patterns.includes(patternId)
        ? prev.patterns.filter(p => p !== patternId)
        : [...prev.patterns, patternId]
    }));
  };

  const runScreening = async () => {
    setIsScanning(true);
    
    // Simulate screening process
    setTimeout(() => {
      const mockResults = [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 185.42,
          change: 2.34,
          volume: 1250000,
          patterns: ["breakout", "hammer"],
          rsi: 45.2,
          score: 8.5
        },
        {
          symbol: "MSFT",
          name: "Microsoft Corp.",
          price: 412.18,
          change: 1.89,
          volume: 890000,
          patterns: ["cup_handle"],
          rsi: 52.1,
          score: 7.8
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc.",
          price: 242.15,
          change: 4.21,
          volume: 2100000,
          patterns: ["flag", "breakout"],
          rsi: 38.5,
          score: 9.2
        }
      ];
      
      onResults(mockResults);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Technical Pattern Screener
        </CardTitle>
        <CardDescription>
          Screen stocks based on technical indicators and chart patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Patterns */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Chart Patterns</h4>
          <div className="grid grid-cols-2 gap-2">
            {technicalPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  criteria.patterns.includes(pattern.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => handlePatternToggle(pattern.id)}
              >
                <div className="font-medium text-sm">{pattern.name}</div>
                <div className="text-xs text-muted-foreground">{pattern.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RSI Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">RSI Filter</h4>
            <Switch
              checked={criteria.rsi.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, rsi: { ...prev.rsi, enabled: checked } }))
              }
            />
          </div>
          {criteria.rsi.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Min RSI</label>
                <Select
                  value={criteria.rsi.min.toString()}
                  onValueChange={(value) =>
                    setCriteria(prev => ({ ...prev, rsi: { ...prev.rsi, min: parseInt(value) } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 (Oversold)</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50 (Neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max RSI</label>
                <Select
                  value={criteria.rsi.max.toString()}
                  onValueChange={(value) =>
                    setCriteria(prev => ({ ...prev, rsi: { ...prev.rsi, max: parseInt(value) } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 (Neutral)</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="70">70</SelectItem>
                    <SelectItem value="80">80 (Overbought)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Volume Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Volume Spike</h4>
            <Switch
              checked={criteria.volume.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, volume: { ...prev.volume, enabled: checked } }))
              }
            />
          </div>
          {criteria.volume.enabled && (
            <Select
              value={criteria.volume.minIncrease.toString()}
              onValueChange={(value) =>
                setCriteria(prev => ({ ...prev, volume: { ...prev.volume, minIncrease: parseInt(value) } }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Min volume increase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="120">120% of average</SelectItem>
                <SelectItem value="150">150% of average</SelectItem>
                <SelectItem value="200">200% of average</SelectItem>
                <SelectItem value="300">300% of average</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Moving Average Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Moving Average</h4>
            <Switch
              checked={criteria.movingAverage.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, movingAverage: { ...prev.movingAverage, enabled: checked } }))
              }
            />
          </div>
          {criteria.movingAverage.enabled && (
            <Select
              value={criteria.movingAverage.type}
              onValueChange={(value) =>
                setCriteria(prev => ({ ...prev, movingAverage: { ...prev.movingAverage, type: value } }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish_cross">Bullish Cross (50/200)</SelectItem>
                <SelectItem value="bearish_cross">Bearish Cross (50/200)</SelectItem>
                <SelectItem value="above_ma20">Above 20-day MA</SelectItem>
                <SelectItem value="below_ma20">Below 20-day MA</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={runScreening}
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                Scanning Markets...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Technical Screening
              </>
            )}
          </Button>
          
          {criteria.patterns.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">Selected Patterns:</div>
              <div className="flex flex-wrap gap-1">
                {criteria.patterns.map(patternId => (
                  <Badge key={patternId} variant="secondary" className="text-xs">
                    {technicalPatterns.find(p => p.id === patternId)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
