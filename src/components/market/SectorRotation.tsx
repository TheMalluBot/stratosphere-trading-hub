
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SectorData {
  sector: string;
  performance: number;
  trend: 'up' | 'down' | 'neutral';
  volume: number;
  marketCap: string;
  momentum: number;
}

export function SectorRotation() {
  const [sectorData, setSectorData] = useState<SectorData[]>([]);

  useEffect(() => {
    // Mock data - replace with real API integration
    const mockData: SectorData[] = [
      {
        sector: "Technology",
        performance: 2.45,
        trend: 'up',
        volume: 2.8,
        marketCap: "$15.2T",
        momentum: 1.2
      },
      {
        sector: "Healthcare",
        performance: 1.23,
        trend: 'up',
        volume: 1.9,
        marketCap: "$6.8T",
        momentum: 0.8
      },
      {
        sector: "Financial Services",
        performance: -0.87,
        trend: 'down',
        volume: 2.2,
        marketCap: "$8.1T",
        momentum: -0.5
      },
      {
        sector: "Consumer Discretionary",
        performance: 0.56,
        trend: 'up',
        volume: 1.5,
        marketCap: "$7.3T",
        momentum: 0.3
      },
      {
        sector: "Energy",
        performance: -1.34,
        trend: 'down',
        volume: 1.8,
        marketCap: "$4.2T",
        momentum: -0.9
      },
      {
        sector: "Industrials",
        performance: 0.12,
        trend: 'neutral',
        volume: 1.3,
        marketCap: "$5.9T",
        momentum: 0.1
      },
      {
        sector: "Communication Services",
        performance: 1.89,
        trend: 'up',
        volume: 2.1,
        marketCap: "$4.7T",
        momentum: 1.1
      },
      {
        sector: "Materials",
        performance: -0.45,
        trend: 'down',
        volume: 1.1,
        marketCap: "$2.8T",
        momentum: -0.3
      }
    ];
    setSectorData(mockData);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return 'text-green-600';
    if (performance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const sortedSectors = [...sectorData].sort((a, b) => b.performance - a.performance);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sector Rotation Analysis
          </CardTitle>
          <CardDescription>
            Track sector performance and money flow patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Best Performing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedSectors.slice(0, 3).map((sector, index) => (
                      <div key={sector.sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="text-sm font-medium">{sector.sector}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(sector.trend)}
                          <span className={`text-sm font-medium ${getPerformanceColor(sector.performance)}`}>
                            {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Worst Performing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedSectors.slice(-3).reverse().map((sector, index) => (
                      <div key={sector.sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{sortedSectors.length - 2 + index}
                          </Badge>
                          <span className="text-sm font-medium">{sector.sector}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(sector.trend)}
                          <span className={`text-sm font-medium ${getPerformanceColor(sector.performance)}`}>
                            {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sector Performance Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedSectors.map((sector) => (
                    <div key={sector.sector} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium min-w-[140px]">{sector.sector}</span>
                          {getTrendIcon(sector.trend)}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium ${getPerformanceColor(sector.performance)}`}>
                            {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                          </span>
                          <span className="text-xs text-muted-foreground">{sector.marketCap}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={Math.abs(sector.performance) * 10} 
                          className={`h-2 ${sector.performance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Volume: {sector.volume}B</span>
                          <span>Momentum: {sector.momentum > 0 ? '+' : ''}{sector.momentum}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
