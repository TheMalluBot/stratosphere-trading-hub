
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, Plus, TrendingUp, TrendingDown, Calendar, DollarSign, Target } from "lucide-react";

interface JournalEntry {
  id: number;
  date: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  pnl: number;
  strategy: string;
  emotion: 'confident' | 'fearful' | 'greedy' | 'neutral';
  notes: string;
  lessons: string;
}

const Journal = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: 1,
      date: "2024-01-20",
      symbol: "RELIANCE",
      action: "buy",
      quantity: 50,
      price: 2420.50,
      pnl: 1812.5,
      strategy: "Linear Regression Oscillator",
      emotion: "confident",
      notes: "Strong bullish signal on LRO. Market sentiment positive after earnings.",
      lessons: "Patience paid off waiting for the right entry signal."
    },
    {
      id: 2,
      date: "2024-01-19",
      symbol: "TCS",
      action: "sell",
      quantity: 25,
      price: 3950.00,
      pnl: -1487.5,
      strategy: "Z-Score Mean Reversion",
      emotion: "fearful",
      notes: "Stopped out due to unexpected sector news. Should have monitored news flow better.",
      lessons: "Need to incorporate fundamental analysis with technical signals."
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    symbol: "",
    action: "buy" as 'buy' | 'sell',
    quantity: "",
    price: "",
    pnl: "",
    strategy: "",
    emotion: "neutral" as JournalEntry['emotion'],
    notes: "",
    lessons: ""
  });

  const [filter, setFilter] = useState("all");

  const addJournalEntry = () => {
    if (!newEntry.symbol || !newEntry.quantity || !newEntry.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const entry: JournalEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      symbol: newEntry.symbol,
      action: newEntry.action,
      quantity: parseInt(newEntry.quantity),
      price: parseFloat(newEntry.price),
      pnl: parseFloat(newEntry.pnl) || 0,
      strategy: newEntry.strategy,
      emotion: newEntry.emotion,
      notes: newEntry.notes,
      lessons: newEntry.lessons
    };

    setJournalEntries(prev => [entry, ...prev]);
    setNewEntry({
      symbol: "",
      action: "buy",
      quantity: "",
      price: "",
      pnl: "",
      strategy: "",
      emotion: "neutral",
      notes: "",
      lessons: ""
    });

    toast.success("Journal entry added successfully!");
  };

  const filteredEntries = journalEntries.filter(entry => {
    if (filter === "all") return true;
    if (filter === "profitable") return entry.pnl > 0;
    if (filter === "losses") return entry.pnl < 0;
    return entry.action === filter;
  });

  const totalPnL = journalEntries.reduce((sum, entry) => sum + entry.pnl, 0);
  const winningTrades = journalEntries.filter(entry => entry.pnl > 0).length;
  const winRate = journalEntries.length > 0 ? (winningTrades / journalEntries.length) * 100 : 0;
  const avgPnL = journalEntries.length > 0 ? totalPnL / journalEntries.length : 0;

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'confident': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'fearful': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'greedy': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">
            Track your trades, emotions, and learn from your experiences
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
              <DialogDescription>
                Record your trade details and reflections
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input
                    placeholder="e.g., RELIANCE"
                    value={newEntry.symbol}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={newEntry.action} onValueChange={(value: 'buy' | 'sell') => setNewEntry(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newEntry.price}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>P&L (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newEntry.pnl}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, pnl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Input
                    placeholder="e.g., Linear Regression Oscillator"
                    value={newEntry.strategy}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, strategy: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emotion</Label>
                  <Select value={newEntry.emotion} onValueChange={(value: JournalEntry['emotion']) => setNewEntry(prev => ({ ...prev, emotion: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="fearful">Fearful</SelectItem>
                      <SelectItem value="greedy">Greedy</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trade Notes</Label>
                <Textarea
                  placeholder="What happened during this trade? Market conditions, news, etc."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Lessons Learned</Label>
                <Textarea
                  placeholder="What did you learn from this trade? What would you do differently?"
                  value={newEntry.lessons}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, lessons: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={addJournalEntry} className="w-full">
                Add Journal Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {journalEntries.length} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades} of {journalEntries.length} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgPnL >= 0 ? '+' : ''}₹{avgPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Total recorded trades
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="emotions">Emotion Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trade Journal</CardTitle>
                  <CardDescription>Your trading history and reflections</CardDescription>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    <SelectItem value="buy">Buy Orders</SelectItem>
                    <SelectItem value="sell">Sell Orders</SelectItem>
                    <SelectItem value="profitable">Profitable</SelectItem>
                    <SelectItem value="losses">Losses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold">{entry.symbol}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {entry.date}
                          </div>
                        </div>
                        <Badge variant={entry.action === 'buy' ? 'default' : 'destructive'}>
                          {entry.action.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getEmotionColor(entry.emotion)}>
                          {entry.emotion}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${entry.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.pnl >= 0 ? '+' : ''}₹{entry.pnl.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.quantity} @ ₹{entry.price}
                        </div>
                      </div>
                    </div>

                    {entry.strategy && (
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Strategy: </span>
                        <span className="text-sm font-medium">{entry.strategy}</span>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Notes:</div>
                        <div className="text-sm text-muted-foreground">{entry.notes}</div>
                      </div>
                    )}

                    {entry.lessons && (
                      <div>
                        <div className="text-sm font-medium mb-1">Lessons:</div>
                        <div className="text-sm text-muted-foreground">{entry.lessons}</div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredEntries.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No journal entries found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Insights</CardTitle>
              <CardDescription>Patterns and lessons from your journal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Most Profitable Strategy</h4>
                  <p className="text-sm text-muted-foreground">Linear Regression Oscillator</p>
                  <p className="text-sm text-green-400">+₹1,812.50 average</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Best Performing Symbol</h4>
                  <p className="text-sm text-muted-foreground">RELIANCE</p>
                  <p className="text-sm text-green-400">100% win rate</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Emotional Pattern</h4>
                  <p className="text-sm text-muted-foreground">Confident trades perform better</p>
                  <p className="text-sm text-blue-400">+25% higher returns</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Key Lesson</h4>
                  <p className="text-sm text-muted-foreground">Risk management is crucial</p>
                  <p className="text-sm text-orange-400">Set stop losses consistently</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Analysis</CardTitle>
              <CardDescription>How emotions affect your trading performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Emotion Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confident</span>
                      <Badge className="bg-green-500/10 text-green-400">50%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fearful</span>
                      <Badge className="bg-red-500/10 text-red-400">25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Neutral</span>
                      <Badge className="bg-blue-500/10 text-blue-400">25%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance by Emotion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confident</span>
                      <span className="text-sm text-green-400">+₹1,812 avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fearful</span>
                      <span className="text-sm text-red-400">-₹1,487 avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Neutral</span>
                      <span className="text-sm text-muted-foreground">₹0 avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal;
