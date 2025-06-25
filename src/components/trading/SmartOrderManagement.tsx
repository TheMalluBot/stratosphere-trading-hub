
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Target, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { smartOrderRouter, SmartOrderConfig, SmartOrderStatus } from '@/lib/algo/SmartOrderRouter';
import { toast } from 'sonner';

interface SmartOrderManagementProps {
  symbol?: string;
  currentPrice?: number;
}

export default function SmartOrderManagement({ 
  symbol = 'BTCUSDT', 
  currentPrice = 45234 
}: SmartOrderManagementProps) {
  const [activeOrders, setActiveOrders] = useState<SmartOrderStatus[]>([]);
  const [completedOrders, setCompletedOrders] = useState<SmartOrderStatus[]>([]);
  const [performanceStats, setPerformanceStats] = useState(smartOrderRouter.getPerformanceStats());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state
  const [orderConfig, setOrderConfig] = useState<Partial<SmartOrderConfig>>({
    symbol,
    quantity: 1,
    side: 'buy',
    strategy: 'twap',
    timeWindow: 30,
    maxSlippage: 0.5,
    minFillSize: 0.1,
    aggressiveness: 'neutral'
  });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    setActiveOrders(smartOrderRouter.getAllActiveOrders());
    setCompletedOrders(smartOrderRouter.getCompletedOrders().slice(-10)); // Last 10
    setPerformanceStats(smartOrderRouter.getPerformanceStats());
  };

  const handleCreateSmartOrder = async () => {
    try {
      if (!orderConfig.quantity || !orderConfig.timeWindow) {
        toast.error('Please fill in all required fields');
        return;
      }

      const config: SmartOrderConfig = {
        symbol: orderConfig.symbol || symbol,
        quantity: orderConfig.quantity,
        side: orderConfig.side || 'buy',
        strategy: orderConfig.strategy || 'twap',
        timeWindow: orderConfig.timeWindow,
        maxSlippage: orderConfig.maxSlippage || 0.5,
        minFillSize: orderConfig.minFillSize || 0.1,
        aggressiveness: orderConfig.aggressiveness || 'neutral'
      };

      const orderId = await smartOrderRouter.executeSmartOrder(config);
      
      toast.success(`Smart order created: ${orderId}`);
      setIsCreateDialogOpen(false);
      loadOrders();
    } catch (error) {
      toast.error('Failed to create smart order');
      console.error(error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const success = await smartOrderRouter.cancelSmartOrder(orderId);
      if (success) {
        toast.success('Smart order cancelled');
        loadOrders();
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getCompletionPercentage = (order: SmartOrderStatus) => {
    return (order.totalFilled / order.config.quantity) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">Smart Order Management</h2>
            <p className="text-muted-foreground">Advanced algorithmic order execution</p>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Target className="w-4 h-4 mr-2" />
              Create Smart Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Smart Order</DialogTitle>
              <DialogDescription>
                Configure your algorithmic order execution strategy
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={orderConfig.symbol}
                    onChange={(e) => setOrderConfig(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={orderConfig.quantity}
                    onChange={(e) => setOrderConfig(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="side">Side</Label>
                  <Select value={orderConfig.side} onValueChange={(value: 'buy' | 'sell') => setOrderConfig(prev => ({ ...prev, side: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select value={orderConfig.strategy} onValueChange={(value: any) => setOrderConfig(prev => ({ ...prev, strategy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twap">TWAP</SelectItem>
                      <SelectItem value="vwap">VWAP</SelectItem>
                      <SelectItem value="implementation-shortfall">Implementation Shortfall</SelectItem>
                      <SelectItem value="arrival-price">Arrival Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeWindow">Time Window (min)</Label>
                  <Input
                    id="timeWindow"
                    type="number"
                    value={orderConfig.timeWindow}
                    onChange={(e) => setOrderConfig(prev => ({ ...prev, timeWindow: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSlippage">Max Slippage (%)</Label>
                  <Input
                    id="maxSlippage"
                    type="number"
                    step="0.1"
                    value={orderConfig.maxSlippage}
                    onChange={(e) => setOrderConfig(prev => ({ ...prev, maxSlippage: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="aggressiveness">Aggressiveness</Label>
                <Select value={orderConfig.aggressiveness} onValueChange={(value: any) => setOrderConfig(prev => ({ ...prev, aggressiveness: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passive">Passive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateSmartOrder} className="w-full">
                Create Smart Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{performanceStats.totalOrders}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{performanceStats.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Slippage</p>
                <p className="text-2xl font-bold">{performanceStats.avgSlippage.toFixed(3)}%</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{performanceStats.avgExecutionTime.toFixed(1)}m</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Orders ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active smart orders</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <CardTitle className="text-lg">{order.config.symbol}</CardTitle>
                      <Badge className={getSideColor(order.config.side)}>
                        {order.config.side.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{order.config.strategy.toUpperCase()}</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCancelOrder(order.orderId)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Quantity</div>
                      <div className="font-semibold">{order.config.quantity}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Filled</div>
                      <div className="font-semibold">{order.totalFilled.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Price</div>
                      <div className="font-semibold">
                        ${order.avgFillPrice > 0 ? order.avgFillPrice.toLocaleString() : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Runtime</div>
                      <div className="font-semibold">{formatDuration(order.startTime)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Execution Progress</span>
                      <span>{getCompletionPercentage(order).toFixed(1)}%</span>
                    </div>
                    <Progress value={getCompletionPercentage(order)} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Slices: {order.slices.filter(s => s.filled).length}/{order.slices.length}</span>
                    <span>Slippage: {order.slippage.toFixed(3)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed smart orders</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => (
              <Card key={order.orderId} className="opacity-80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <CardTitle className="text-lg">{order.config.symbol}</CardTitle>
                      <Badge className={getSideColor(order.config.side)}>
                        {order.config.side.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{order.config.strategy.toUpperCase()}</Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Quantity</div>
                      <div className="font-semibold">{order.config.quantity}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Filled</div>
                      <div className="font-semibold">{order.totalFilled.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Price</div>
                      <div className="font-semibold">${order.avgFillPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-semibold">
                        {formatDuration(order.startTime, order.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Completion: {getCompletionPercentage(order).toFixed(1)}%</span>
                    <span>Slippage: {order.slippage.toFixed(3)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
