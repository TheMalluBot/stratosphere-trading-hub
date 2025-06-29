
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Store, 
  Search, 
  Star, 
  Download, 
  Upload, 
  TrendingUp, 
  Users, 
  Heart,
  MessageSquare,
  Eye,
  Filter,
  SortAsc
} from "lucide-react";

interface MarketplaceStrategy {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  price: number; // 0 for free
  performance: {
    returns: number;
    sharpe: number;
    maxDrawdown: number;
    winRate: number;
  };
  timeframe: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
  featured: boolean;
  createdAt: string;
  lastUpdated: string;
}

const mockStrategies: MarketplaceStrategy[] = [
  {
    id: "1",
    name: "🚀 Quantum Momentum Pro",
    description: "Advanced momentum strategy using quantum computing algorithms for optimal entry/exit timing",
    author: "QuantGenius",
    category: "momentum",
    tags: ["quantum", "momentum", "high-frequency"],
    rating: 4.8,
    downloads: 2547,
    price: 99,
    performance: { returns: 45.6, sharpe: 2.1, maxDrawdown: 12.3, winRate: 73.2 },
    timeframe: "1m-15m",
    complexity: "Expert",
    verified: true,
    featured: true,
    createdAt: "2024-01-15",
    lastUpdated: "2024-06-20"
  },
  {
    id: "2", 
    name: "📈 Mean Reversion Master",
    description: "Statistical mean reversion strategy with adaptive parameters",
    author: "StatTrader",
    category: "mean-reversion",
    tags: ["statistics", "mean-reversion", "adaptive"],
    rating: 4.5,
    downloads: 1823,
    price: 0,
    performance: { returns: 28.4, sharpe: 1.7, maxDrawdown: 8.9, winRate: 68.5 },
    timeframe: "5m-1h",
    complexity: "Intermediate",
    verified: true,
    featured: false,
    createdAt: "2024-02-10",
    lastUpdated: "2024-06-18"
  },
  {
    id: "3",
    name: "🔥 Breakout Hunter",
    description: "Identifies and trades high-probability breakout patterns",
    author: "PatternPro",
    category: "breakout",
    tags: ["breakout", "patterns", "volatility"],
    rating: 4.2,
    downloads: 967,
    price: 49,
    performance: { returns: 31.8, sharpe: 1.9, maxDrawdown: 15.6, winRate: 65.3 },
    timeframe: "15m-4h",
    complexity: "Advanced",
    verified: false,
    featured: false,
    createdAt: "2024-03-05",
    lastUpdated: "2024-06-15"
  }
];

export const StrategyMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [strategies] = useState(mockStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<MarketplaceStrategy | null>(null);

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || strategy.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "downloads": return b.downloads - a.downloads;
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "performance": return b.performance.returns - a.performance.returns;
      default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const handlePurchase = (strategy: MarketplaceStrategy) => {
    if (strategy.price === 0) {
      toast.success(`Downloaded "${strategy.name}" for free!`);
    } else {
      toast.success(`Purchased "${strategy.name}" for $${strategy.price}`);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Beginner": return "bg-green-500";
      case "Intermediate": return "bg-blue-500";
      case "Advanced": return "bg-orange-500";
      case "Expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Strategy Marketplace
            <Badge variant="outline">2,547+ Strategies</Badge>
          </CardTitle>
          <CardDescription>
            Discover, purchase, and share algorithmic trading strategies from the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">Browse Strategies</TabsTrigger>
              <TabsTrigger value="my-strategies">My Strategies</TabsTrigger>
              <TabsTrigger value="publish">Publish Strategy</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search strategies, authors, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                    <SelectItem value="breakout">Breakout</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="performance">Best Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Strategy Grid */}
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStrategies.map((strategy) => (
                    <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {strategy.name}
                              {strategy.verified && <Badge className="bg-blue-500 text-white text-xs">✓</Badge>}
                              {strategy.featured && <Badge className="bg-yellow-500 text-white text-xs">★</Badge>}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">by {strategy.author}</div>
                          </div>
                          <Badge className={`text-xs text-white ${getComplexityColor(strategy.complexity)}`}>
                            {strategy.complexity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {strategy.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Returns: <span className="font-semibold text-green-600">+{strategy.performance.returns}%</span></div>
                          <div>Sharpe: <span className="font-semibold">{strategy.performance.sharpe}</span></div>
                          <div>Win Rate: <span className="font-semibold">{strategy.performance.winRate}%</span></div>
                          <div>Max DD: <span className="font-semibold text-red-600">{strategy.performance.maxDrawdown}%</span></div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {strategy.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {strategy.downloads}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{strategy.name}</DialogTitle>
                                <DialogDescription>Strategy details and performance analysis</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">+{strategy.performance.returns}%</div>
                                    <div className="text-sm text-muted-foreground">Total Returns</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{strategy.performance.sharpe}</div>
                                    <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{strategy.performance.winRate}%</div>
                                    <div className="text-sm text-muted-foreground">Win Rate</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{strategy.performance.maxDrawdown}%</div>
                                    <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div><strong>Description:</strong> {strategy.description}</div>
                                  <div><strong>Timeframe:</strong> {strategy.timeframe}</div>
                                  <div><strong>Complexity:</strong> {strategy.complexity}</div>
                                  <div><strong>Last Updated:</strong> {new Date(strategy.lastUpdated).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            onClick={() => handlePurchase(strategy)}
                            className="flex-1"
                          >
                            {strategy.price === 0 ? (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Free
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                ${strategy.price}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="my-strategies" className="space-y-4">
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Your Strategy Collection</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage strategies you've purchased or created
                  </p>
                  <Button variant="outline">
                    View My Strategies
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish" className="space-y-4">
              <Card>
                <CardContent className="text-center py-8">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Publish Your Strategy</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your strategies with the community and earn revenue
                  </p>
                  <Button variant="outline">
                    Start Publishing
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Marketplace Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Track your published strategies' performance and earnings
                  </p>
                  <Button variant="outline">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
