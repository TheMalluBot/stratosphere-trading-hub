
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, TrendingUp, TrendingDown, Star, Trash } from "lucide-react";

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

const Watchlist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
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
    {
      symbol: "ETHUSDT",
      name: "Ethereum/USDT",
      price: 2580.75,
      change: 45.20,
      changePercent: 1.78,
      volume: "1.8B",
      type: "crypto",
      isFavorite: true,
    },
  ]);

  const toggleFavorite = (symbol: string) => {
    setWatchlistItems(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistItems(prev => prev.filter(item => item.symbol !== symbol));
  };

  const filteredItems = watchlistItems.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteItems = filteredItems.filter(item => item.isFavorite);

  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const WatchlistTable = ({ items }: { items: WatchlistItem[] }) => (
    <div className="rounded-md border">
      <table className="trading-table">
        <thead>
          <tr>
            <th></th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change</th>
            <th>Volume</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.symbol} className="hover:bg-muted/50">
              <td>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(item.symbol)}
                  className="p-1"
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.symbol}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
              </td>
              <td className="text-muted-foreground">{item.name}</td>
              <td className="font-semibold">{formatPrice(item.price, item.type)}</td>
              <td>
                <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{item.change >= 0 ? '+' : ''}{formatPrice(Math.abs(item.change), item.type)}</span>
                  <span>({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
                </div>
              </td>
              <td className="text-muted-foreground">{item.volume}</td>
              <td>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    Trade
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWatchlist(item.symbol)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">
            Monitor your favorite stocks and crypto assets
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Symbol
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stock">Stocks</SelectItem>
            <SelectItem value="index">Indices</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Symbols ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favoriteItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Watchlist Items</CardTitle>
              <CardDescription>
                Track performance across all your monitored assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <WatchlistTable items={filteredItems} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No symbols found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Symbols</CardTitle>
              <CardDescription>
                Your starred symbols for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteItems.length > 0 ? (
                <WatchlistTable items={favoriteItems} />
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No favorite symbols yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the star icon next to any symbol to add it to favorites
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Market Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indian Stocks</CardTitle>
            <CardDescription>NSE & BSE listed companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {watchlistItems.filter(item => item.type === 'stock' && item.change > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">stocks gaining today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cryptocurrencies</CardTitle>
            <CardDescription>MEXC exchange pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {watchlistItems.filter(item => item.type === 'crypto').length}
            </div>
            <p className="text-xs text-muted-foreground">crypto pairs tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indices</CardTitle>
            <CardDescription>Market benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {watchlistItems.filter(item => item.type === 'index').length}
            </div>
            <p className="text-xs text-muted-foreground">indices monitored</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Watchlist;
