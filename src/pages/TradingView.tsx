
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Search, 
  Maximize2, 
  Plus,
  Settings,
  Activity
} from "lucide-react";
import TradingChart from "@/components/trading/TradingChart";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  type: 'stock' | 'index' | 'crypto';
  isFavorite: boolean;
}

const TradingView = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState("1D");
  const [searchTerm, setSearchTerm] = useState("");
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);

  const [watchlistItems] = useState<WatchlistItem[]>([
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
      price: 2456.75,
      change: 45.20,
      changePercent: 1.87,
      volume: "12.5M",
      type: "stock",
      isFavorite: true,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      price: 3890.50,
      change: -25.80,
      changePercent: -0.66,
      volume: "8.2M",
      type: "stock",
      isFavorite: false,
    },
    {
      symbol: "NIFTY50",
      name: "NIFTY 50 Index",
      price: 21850.25,
      change: 125.30,
      changePercent: 0.58,
      volume: "N/A",
      type: "index",
      isFavorite: true,
    },
    {
      symbol: "BTCUSDT",
      name: "Bitcoin/USDT",
      price: 43250.00,
      change: -520.50,
      changePercent: -1.19,
      volume: "2.1B",
      type: "crypto",
      isFavorite: false,
    },
  ]);

  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
  
  const selectedSymbolData = watchlistItems.find(item => item.symbol === selectedSymbol);
  const currentPrice = selectedSymbolData?.price || 0;
  const priceChange = selectedSymbolData?.change || 0;
  const priceChangePercent = selectedSymbolData?.changePercent || 0;

  const filteredWatchlist = watchlistItems.filter(item =>
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex h-full bg-background">
      {/* Watchlist Sidebar */}
      <div className={`${isWatchlistCollapsed ? 'w-12' : 'w-80'} border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${isWatchlistCollapsed ? 'hidden' : 'block'}`}>Watchlist</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
          
          {!isWatchlistCollapsed && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search symbols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Symbol
              </Button>
            </>
          )}
        </div>

        {!isWatchlistCollapsed && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="space-y-1 p-2">
                  {filteredWatchlist.map((item) => (
                    <div
                      key={item.symbol}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedSymbol === item.symbol ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => handleSymbolSelect(item.symbol)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{item.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Star className={`w-3 h-3 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 truncate">{item.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{formatPrice(item.price, item.type)}</span>
                        <div className={`flex items-center gap-1 text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-0">
                <div className="space-y-1 p-2">
                  {filteredWatchlist.filter(item => item.isFavorite).map((item) => (
                    <div
                      key={item.symbol}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedSymbol === item.symbol ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => handleSymbolSelect(item.symbol)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{item.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 truncate">{item.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{formatPrice(item.price, item.type)}</span>
                        <div className={`flex items-center gap-1 text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col">
        {/* Chart Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{selectedSymbolData?.symbol}</h1>
                <p className="text-sm text-muted-foreground">{selectedSymbolData?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatPrice(currentPrice, selectedSymbolData?.type || 'stock')}
                  </div>
                  <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{priceChange >= 0 ? '+' : ''}{formatPrice(Math.abs(priceChange), selectedSymbolData?.type || 'stock')}</span>
                    <span>({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Indicators
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mt-4">
            <label className="text-sm font-medium">Timeframe:</label>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className="px-3"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Content - Now using the actual TradingChart component */}
        <div className="flex-1 p-4">
          <TradingChart symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
};

export default TradingView;
