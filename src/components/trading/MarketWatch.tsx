import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarketData } from '@/types/trading.types';
import { 
  Search, 
  Star, 
  StarOff, 
  TrendingUp, 
  TrendingDown,
  Plus,
  X,
  BarChart3,
  Volume2
} from 'lucide-react';

interface MarketWatchProps {
  symbols: string[];
  selectedSymbol: string;
  marketData: Map<string, MarketData>;
  onSymbolSelect: (symbol: string) => void;
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
}

interface SymbolRowProps {
  symbol: string;
  data: MarketData | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const SymbolRow: React.FC<SymbolRowProps> = ({
  symbol,
  data,
  isSelected,
  onSelect,
  onRemove
}) => {
  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const isPositive = data?.changePercent ? data.changePercent >= 0 : false;

  return (
    <div
      className={`p-3 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-primary/10 border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm truncate">{symbol}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {data ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold">
                  ${formatPrice(data.price)}
                </span>
                <div className={`flex items-center space-x-1 text-xs ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Vol: {formatVolume(data.volume24h)}</span>
                <span>H: ${formatPrice(data.high)}</span>
                <span>L: ${formatPrice(data.low)}</span>
              </div>
              
              {/* Mini sparkline placeholder */}
              <div className="mt-2 h-8 bg-muted/30 rounded flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MarketWatch: React.FC<MarketWatchProps> = ({
  symbols,
  selectedSymbol,
  marketData,
  onSymbolSelect,
  onAddSymbol,
  onRemoveSymbol
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('watchlist');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Popular symbols for quick access
  const popularSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
    'SOLUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT'
  ];

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return symbols;
    return symbols.filter(symbol =>
      symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [symbols, searchQuery]);

  const filteredPopularSymbols = useMemo(() => {
    if (!searchQuery) return popularSymbols;
    return popularSymbols.filter(symbol =>
      symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddSymbol = useCallback((symbol: string) => {
    if (!symbols.includes(symbol)) {
      onAddSymbol(symbol);
    }
  }, [symbols, onAddSymbol]);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  }, []);

  // Sort symbols by various criteria
  const sortedSymbols = useMemo(() => {
    return [...filteredSymbols].sort((a, b) => {
      const dataA = marketData.get(a);
      const dataB = marketData.get(b);
      
      // Selected symbol first
      if (a === selectedSymbol) return -1;
      if (b === selectedSymbol) return 1;
      
      // Favorites next
      const aIsFav = favorites.has(a);
      const bIsFav = favorites.has(b);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      
      // Then by volume (if data available)
      if (dataA && dataB) {
        return dataB.volume24h - dataA.volume24h;
      }
      
      // Finally alphabetical
      return a.localeCompare(b);
    });
  }, [filteredSymbols, marketData, selectedSymbol, favorites]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Market Watch
          <Badge variant="outline" className="text-xs">
            {symbols.length}
          </Badge>
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-3 mb-2">
            <TabsTrigger value="watchlist" className="text-xs">Watchlist</TabsTrigger>
            <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="group">
                {sortedSymbols.length > 0 ? (
                  sortedSymbols.map(symbol => (
                    <div key={symbol} className="group relative">
                      <SymbolRow
                        symbol={symbol}
                        data={marketData.get(symbol)}
                        isSelected={symbol === selectedSymbol}
                        onSelect={() => onSymbolSelect(symbol)}
                        onRemove={() => onRemoveSymbol(symbol)}
                      />
                      
                      {/* Favorite button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-8 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(symbol);
                        }}
                      >
                        {favorites.has(symbol) ? (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? 'No symbols found' : 'No symbols in watchlist'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="popular" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {filteredPopularSymbols.map(symbol => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSymbolSelect(symbol)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{symbol}</span>
                      {marketData.get(symbol) && (
                        <span className={`text-xs ${
                          marketData.get(symbol)!.changePercent >= 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {marketData.get(symbol)!.changePercent >= 0 ? '+' : ''}
                          {marketData.get(symbol)!.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!symbols.includes(symbol) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSymbol(symbol);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(symbol);
                        }}
                      >
                        {favorites.has(symbol) ? (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Quick Stats Footer */}
      <div className="p-3 border-t bg-muted/20">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">Gainers:</span>
            <span className="font-medium">
              {Array.from(marketData.values()).filter(d => d.changePercent > 0).length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span className="text-muted-foreground">Losers:</span>
            <span className="font-medium">
              {Array.from(marketData.values()).filter(d => d.changePercent < 0).length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}; 