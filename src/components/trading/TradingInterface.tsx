import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MarketWatch } from './MarketWatch';
import { OrderPanel } from './OrderPanel';
import { PositionTracker } from './PositionTracker';
import { OrderBook } from './OrderBook';
import { AlertManager } from './AlertManager';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { 
  TradingInterfaceState, 
  TradingPreferences, 
  MarketData,
  Order,
  Position,
  Alert as TradingAlert,
  TradingError
} from '@/types/trading.types';
import { 
  Activity, 
  BarChart3, 
  Bell, 
  BookOpen, 
  DollarSign, 
  Settings, 
  TrendingUp,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

interface TradingInterfaceProps {
  initialSymbols?: string[];
  preferences?: Partial<TradingPreferences>;
  paperTrading?: boolean;
  onError?: (error: TradingError) => void;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({
  initialSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
  preferences = {},
  paperTrading = false,
  onError
}) => {
  // State management
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbols[0] || 'BTCUSDT');
  const [watchlist, setWatchlist] = useState<string[]>(initialSymbols);
  const [activeTab, setActiveTab] = useState<string>('trading');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Trading preferences with defaults
  const tradingPrefs = useMemo<TradingPreferences>(() => ({
    theme: 'dark',
    layout: 'professional',
    panels: {
      marketWatch: true,
      orderBook: true,
      positions: true,
      alerts: true,
      news: false
    },
    notifications: {
      orders: true,
      positions: true,
      alerts: true,
      sounds: true
    },
    quickTrade: {
      defaultQuantity: 100,
      presetSizes: [25, 50, 100, 250, 500],
      autoStopLoss: false,
      stopLossPercent: 2,
      autoTakeProfit: false,
      takeProfitPercent: 5,
      confirmationRequired: true,
      hotkeysEnabled: true,
      soundEnabled: true
    },
    riskLimits: {
      maxPositionSize: 10000,
      maxDailyLoss: 1000,
      maxLeverage: 10,
      maxOrderValue: 50000,
      maxOpenOrders: 20
    },
    ...preferences
  }), [preferences]);

  // Real-time data hook
  const {
    marketData,
    orderBooks,
    trades,
    isConnected,
    latency,
    error: dataError,
    addSymbol,
    removeSymbol,
    getMarketData,
    getOrderBook,
    getTrades,
    getConnectionHealth
  } = useRealtimeData({
    symbols: watchlist,
    exchanges: ['mexc'],
    enableOrderBook: tradingPrefs.panels.orderBook,
    enableTrades: true,
    reconnectOnError: true
  });

  // Order management hook (placeholder - would be implemented)
  const orders: Order[] = [];
  const positions: Position[] = [];
  const portfolio = { totalValue: 0, totalPnL: 0 };
  
  const createOrder = useCallback(async (orderRequest: any) => {
    console.log('Creating order:', orderRequest);
  }, []);
  
  const cancelOrder = useCallback(async (orderId: string) => {
    console.log('Canceling order:', orderId);
  }, []);
  
  const createBracketOrder = useCallback(async (bracketOrder: any) => {
    console.log('Creating bracket order:', bracketOrder);
  }, []);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = () => {
      const health = getConnectionHealth();
      setConnectionStatus(health.healthy ? 'connected' : 'disconnected');
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [getConnectionHealth]);

  // Error handling
  useEffect(() => {
    if (dataError) {
      onError?.(dataError);
    }
  }, [dataError, onError]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!tradingPrefs.quickTrade.hotkeysEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            handleQuickBuy();
            break;
          case 's':
            event.preventDefault();
            handleQuickSell();
            break;
          case 'c':
            event.preventDefault();
            handleCancelAllOrders();
            break;
          case 'f':
            event.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tradingPrefs.quickTrade.hotkeysEnabled, isFullscreen]);

  // Trading actions
  const handleQuickBuy = useCallback(async () => {
    const currentPrice = getMarketData(selectedSymbol)?.price;
    if (!currentPrice) return;

    try {
      await createOrder({
        symbol: selectedSymbol,
        side: 'BUY',
        type: 'MARKET',
        quantity: tradingPrefs.quickTrade.defaultQuantity
      });
    } catch (error) {
      console.error('Quick buy failed:', error);
    }
  }, [selectedSymbol, getMarketData, createOrder, tradingPrefs.quickTrade.defaultQuantity]);

  const handleQuickSell = useCallback(async () => {
    const currentPrice = getMarketData(selectedSymbol)?.price;
    if (!currentPrice) return;

    try {
      await createOrder({
        symbol: selectedSymbol,
        side: 'SELL',
        type: 'MARKET',
        quantity: tradingPrefs.quickTrade.defaultQuantity
      });
    } catch (error) {
      console.error('Quick sell failed:', error);
    }
  }, [selectedSymbol, getMarketData, createOrder, tradingPrefs.quickTrade.defaultQuantity]);

  const handleCancelAllOrders = useCallback(async () => {
    const activeOrders = orders.filter(order => 
      order.status === 'NEW' || order.status === 'PARTIALLY_FILLED'
    );

    try {
      await Promise.all(activeOrders.map(order => cancelOrder(order.orderId)));
    } catch (error) {
      console.error('Cancel all orders failed:', error);
    }
  }, [orders, cancelOrder]);

  const handleSymbolSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const handleAddToWatchlist = useCallback((symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist(prev => [...prev, symbol]);
      addSymbol(symbol);
    }
  }, [watchlist, addSymbol]);

  const handleRemoveFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    removeSymbol(symbol);
    
    // Switch to another symbol if removing the selected one
    if (symbol === selectedSymbol && watchlist.length > 1) {
      const remainingSymbols = watchlist.filter(s => s !== symbol);
      setSelectedSymbol(remainingSymbols[0]);
    }
  }, [watchlist, selectedSymbol, removeSymbol]);

  // Get current market data for selected symbol
  const currentMarketData = useMemo(() => 
    getMarketData(selectedSymbol), [selectedSymbol, getMarketData]
  );

  const currentOrderBook = useMemo(() => 
    getOrderBook(selectedSymbol), [selectedSymbol, getOrderBook]
  );

  const currentTrades = useMemo(() => 
    getTrades(selectedSymbol), [selectedSymbol, getTrades]
  );

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalValue = positions.reduce((sum, pos) => sum + (pos.size * pos.markPrice), 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnl + pos.realizedPnl, 0);
    const dailyPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
    
    return {
      totalValue,
      totalPnL,
      dailyPnL,
      positionCount: positions.length,
      activeOrders: orders.filter(o => o.status === 'NEW' || o.status === 'PARTIALLY_FILLED').length
    };
  }, [positions, orders]);

  return (
    <div className={`h-screen flex flex-col bg-background ${tradingPrefs.theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Stratosphere Trading</h1>
          <Badge variant={paperTrading ? "secondary" : "default"}>
            {paperTrading ? 'Paper Trading' : 'Live Trading'}
          </Badge>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {connectionStatus} {latency && `(${Math.round(Array.from(latency.values()).reduce((a, b) => a + b, 0) / latency.size)}ms)`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Portfolio Summary */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Balance: ${portfolioSummary.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span className={portfolioSummary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
                P&L: ${portfolioSummary.totalPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Positions: {portfolioSummary.positionCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>Orders: {portfolioSummary.activeOrders}</span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {dataError && (
        <Alert className="m-4 border-destructive">
          <AlertDescription>
            {dataError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Trading Interface */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Market Watch */}
          {tradingPrefs.panels.marketWatch && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <MarketWatch
                  symbols={watchlist}
                  selectedSymbol={selectedSymbol}
                  marketData={marketData}
                  onSymbolSelect={handleSymbolSelect}
                  onAddSymbol={handleAddToWatchlist}
                  onRemoveSymbol={handleRemoveFromWatchlist}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Center Panel - Chart and Trading */}
          <ResizablePanel defaultSize={50} minSize={40}>
            <div className="h-full flex flex-col">
              {/* Symbol Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">{selectedSymbol}</h2>
                    {currentMarketData && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-2xl font-bold">
                          ${currentMarketData.price.toFixed(4)}
                        </span>
                        <span className={`flex items-center space-x-1 ${
                          currentMarketData.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <TrendingUp className="h-4 w-4" />
                          {currentMarketData.changePercent >= 0 ? '+' : ''}
                          {currentMarketData.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-muted-foreground">
                          24h Vol: {currentMarketData.volume24h.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Trade Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleQuickBuy}
                    >
                      Quick Buy
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleQuickSell}
                    >
                      Quick Sell
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content Tabs */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trading">Trading</TabsTrigger>
                    <TabsTrigger value="positions">Positions</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                  </TabsList>

                  <TabsContent value="trading" className="flex-1 overflow-hidden">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                      {/* Chart Area (placeholder) */}
                      <ResizablePanel defaultSize={60} minSize={40}>
                        <Card className="h-full m-2">
                          <CardHeader>
                            <CardTitle className="text-sm">Price Chart</CardTitle>
                          </CardHeader>
                          <CardContent className="flex items-center justify-center h-full">
                            <div className="text-center text-muted-foreground">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                              <p>Chart component would be integrated here</p>
                              <p className="text-xs">TradingView, Chart.js, or custom chart</p>
                            </div>
                          </CardContent>
                        </Card>
                      </ResizablePanel>
                      
                      <ResizableHandle />
                      
                      {/* Order Panel */}
                      <ResizablePanel defaultSize={40} minSize={30}>
                        <OrderPanel
                          symbol={selectedSymbol}
                          marketData={currentMarketData}
                          onCreateOrder={createOrder}
                          onCreateBracketOrder={createBracketOrder}
                          preferences={tradingPrefs.quickTrade}
                          paperTrading={paperTrading}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </TabsContent>

                  <TabsContent value="positions" className="flex-1 overflow-hidden p-2">
                    <PositionTracker
                      positions={positions}
                      marketData={marketData}
                      onClosePosition={(symbol) => console.log('Close position:', symbol)}
                      onModifyPosition={(symbol) => console.log('Modify position:', symbol)}
                    />
                  </TabsContent>

                  <TabsContent value="orders" className="flex-1 overflow-hidden p-2">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Active Orders
                          <Badge variant="outline">{orders.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {orders.map(order => (
                            <div key={order.orderId} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <Badge variant={order.side === 'BUY' ? 'default' : 'destructive'}>
                                  {order.side}
                                </Badge>
                                <span className="font-medium">{order.symbol}</span>
                                <span className="text-sm text-muted-foreground">
                                  {order.quantity} @ ${order.price}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{order.status}</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelOrder(order.orderId)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ))}
                          {orders.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No active orders
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Order Book */}
          {tradingPrefs.panels.orderBook && (
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <div className="h-full flex flex-col">
                <OrderBook
                  symbol={selectedSymbol}
                  orderBook={currentOrderBook}
                  trades={currentTrades}
                  onPriceClick={(price) => console.log('Price clicked:', price)}
                />
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Alert Manager Overlay */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <AlertManager
              alerts={[]} // Would be populated from alert system
              onClose={() => setShowAlerts(false)}
              onCreateAlert={(alert) => console.log('Create alert:', alert)}
              onDeleteAlert={(id) => console.log('Delete alert:', id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 