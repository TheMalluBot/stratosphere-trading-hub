
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface Sector {
  name: string;
  performance: number;
  volume: number;
  marketCap: string;
  topCoins: string[];
  trend: 'up' | 'down' | 'stable';
}

export const SectorRotation = () => {
  const sectors: Sector[] = [
    {
      name: 'DeFi',
      performance: 12.5,
      volume: 2.8,
      marketCap: '$89.2B',
      topCoins: ['UNI', 'AAVE', 'COMP'],
      trend: 'up'
    },
    {
      name: 'Layer 1',
      performance: 8.3,
      volume: 4.2,
      marketCap: '$156.7B',
      topCoins: ['ETH', 'SOL', 'ADA'],
      trend: 'up'
    },
    {
      name: 'AI & Big Data',
      performance: 15.7,
      volume: 1.9,
      marketCap: '$23.4B',
      topCoins: ['FET', 'AI', 'GRT'],
      trend: 'up'
    },
    {
      name: 'Gaming',
      performance: -3.2,
      volume: 0.8,
      marketCap: '$12.8B',
      topCoins: ['AXS', 'SAND', 'MANA'],
      trend: 'down'
    },
    {
      name: 'Meme Coins',
      performance: 25.4,
      volume: 3.1,
      marketCap: '$45.3B',
      topCoins: ['DOGE', 'SHIB', 'PEPE'],
      trend: 'up'
    },
    {
      name: 'NFT',
      performance: -8.9,
      volume: 0.5,
      marketCap: '$8.9B',
      topCoins: ['BLUR', 'LRC', 'IMX'],
      trend: 'down'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (performance: number) => {
    return performance >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sector Rotation Analysis
        </CardTitle>
        <CardDescription>
          Performance and capital flow analysis across cryptocurrency sectors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sector Performance Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector, index) => (
              <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{sector.name}</h3>
                  {getTrendIcon(sector.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">24h Performance</span>
                    <span className={`text-sm font-bold ${getPerformanceColor(sector.performance)}`}>
                      {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Volume (24h)</span>
                    <span className="text-sm">${sector.volume}B</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Market Cap</span>
                    <span className="text-sm">{sector.marketCap}</span>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">Top Performers:</span>
                    <div className="flex gap-1 mt-1">
                      {sector.topCoins.map((coin, coinIndex) => (
                        <Badge key={coinIndex} variant="outline" className="text-xs">
                          {coin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rotation Summary */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3">Market Rotation Insights</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Strong inflow to AI & Big Data and Meme coin sectors</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span>Capital rotation away from NFT and Gaming sectors</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>DeFi and Layer 1 showing steady institutional accumulation</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
