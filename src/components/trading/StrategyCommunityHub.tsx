
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Send
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    badge: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: number;
  createdAt: string;
  strategyAttached?: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: "1",
    author: {
      name: "QuantMaster",
      avatar: "/placeholder.svg",
      reputation: 2547,
      badge: "Elite Trader"
    },
    title: "🚀 New Mean Reversion Strategy with 73% Win Rate",
    content: "Just finished backtesting my latest mean reversion strategy. Using Bollinger Bands with RSI confirmation, I'm seeing consistent results across multiple timeframes...",
    category: "Strategy Discussion",
    tags: ["mean-reversion", "bollinger-bands", "rsi"],
    upvotes: 127,
    downvotes: 8,
    replies: 23,
    createdAt: "2024-06-28T10:30:00Z",
    strategyAttached: "Mean Reversion Pro v2.1"
  },
  {
    id: "2", 
    author: {
      name: "AlgoNewbie",
      avatar: "/placeholder.svg",
      reputation: 156,
      badge: "Learning"
    },
    title: "Help: First Momentum Strategy Not Working",
    content: "Hi everyone! I'm new to algo trading and built my first momentum strategy. It works great in backtesting but fails in live trading. Any advice?",
    category: "Help & Support",
    tags: ["beginner", "momentum", "help"],
    upvotes: 45,
    downvotes: 2,
    replies: 18,
    createdAt: "2024-06-27T15:45:00Z"
  },
  {
    id: "3",
    author: {
      name: "RiskManager",
      avatar: "/placeholder.svg", 
      reputation: 1834,
      badge: "Risk Expert"
    },
    title: "📊 Position Sizing: The Most Underrated Factor",
    content: "After analyzing thousands of trades, I've found that position sizing impacts returns more than entry/exit timing. Here's my framework...",
    category: "Education",
    tags: ["risk-management", "position-sizing", "education"],
    upvotes: 89,
    downvotes: 3,
    replies: 31,
    createdAt: "2024-06-26T09:15:00Z"
  }
];

export const StrategyCommunityHub = () => {
  const [posts] = useState(mockPosts);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }
    
    toast.success("Post created successfully!");
    setNewPostTitle("");
    setNewPostContent("");
  };

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(post => post.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strategy discussion": return "bg-blue-500";
      case "help & support": return "bg-orange-500";
      case "education": return "bg-green-500";
      case "market analysis": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "elite trader": return "bg-gradient-to-r from-purple-600 to-blue-600 text-white";
      case "risk expert": return "bg-red-500 text-white";
      case "learning": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Strategy Community Hub
            <Badge variant="outline">12,847 Members</Badge>
          </CardTitle>
          <CardDescription>
            Connect with traders, share strategies, and learn from the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discussions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="create">Create Post</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="space-y-4">
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={selectedCategory === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                <Button 
                  variant={selectedCategory === "strategy" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("strategy")}
                >
                  Strategy Discussion
                </Button>
                <Button 
                  variant={selectedCategory === "help" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("help")}
                >
                  Help & Support
                </Button>
                <Button 
                  variant={selectedCategory === "education" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("education")}
                >
                  Education
                </Button>
              </div>

              {/* Posts List */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="font-semibold hover:text-blue-600 cursor-pointer">
                                  {post.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">{post.author.name}</span>
                                  <Badge className={`text-xs ${getBadgeColor(post.author.badge)}`}>
                                    {post.author.badge}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {post.author.reputation} rep
                                  </span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(post.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <Badge className={`text-xs text-white ${getCategoryColor(post.category)}`}>
                                {post.category}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>

                            {post.strategyAttached && (
                              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="text-xs text-blue-700 font-medium">
                                  📎 Strategy Attached: {post.strategyAttached}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <button className="flex items-center gap-1 hover:text-green-600">
                                  <ThumbsUp className="w-4 h-4" />
                                  {post.upvotes}
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-600">
                                  <ThumbsDown className="w-4 h-4" />
                                  {post.downvotes}
                                </button>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MessageSquare className="w-4 h-4" />
                                  {post.replies} replies
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                  <CardDescription>Share your insights with the community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Enter your post title..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Share your thoughts, strategies, or questions..."
                      rows={6}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost}>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Post
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Community Leaderboard</h3>
                  <p className="text-muted-foreground mb-4">
                    Top contributors and strategy performers
                  </p>
                  <Button variant="outline">
                    View Rankings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Learning Resources</h3>
                  <p className="text-muted-foreground mb-4">
                    Tutorials, guides, and educational content
                  </p>
                  <Button variant="outline">
                    Browse Resources
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
