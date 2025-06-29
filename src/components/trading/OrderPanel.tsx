import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MarketData, 
  OrderRequest, 
  BracketOrder, 
  OrderType, 
  OrderSide, 
  TimeInForce,
  QuickTradeSettings 
} from '@/types/trading.types';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap, 
  Calculator,
  AlertTriangle,
  DollarSign,
  Percent
} from 'lucide-react';

interface OrderPanelProps {
  symbol: string;
  marketData?: MarketData;
  onCreateOrder: (order: OrderRequest) => Promise<void>;
  onCreateBracketOrder: (bracketOrder: BracketOrder) => Promise<void>;
  preferences: QuickTradeSettings;
  paperTrading?: boolean;
}

interface OrderFormData {
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  stopPrice: number;
  timeInForce: TimeInForce;
  reduceOnly: boolean;
  postOnly: boolean;
}

interface BracketOrderData {
  entry: OrderFormData;
  stopLoss?: {
    enabled: boolean;
    price: number;
    percentage: number;
  };
  takeProfit?: {
    enabled: boolean;
    price: number;
    percentage: number;
  };
  trailingStop?: {
    enabled: boolean;
    percentage: number;
    activationPrice: number;
  };
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  symbol,
  marketData,
  onCreateOrder,
  onCreateBracketOrder,
  preferences,
  paperTrading = false
}) => {
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced' | 'bracket'>('simple');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple order form
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    side: 'BUY',
    type: 'MARKET',
    quantity: preferences.defaultQuantity,
    price: marketData?.price || 0,
    stopPrice: 0,
    timeInForce: 'GTC',
    reduceOnly: false,
    postOnly: false
  });

  // Bracket order form
  const [bracketForm, setBracketForm] = useState<BracketOrderData>({
    entry: { ...orderForm },
    stopLoss: {
      enabled: preferences.autoStopLoss,
      price: 0,
      percentage: preferences.stopLossPercent
    },
    takeProfit: {
      enabled: preferences.autoTakeProfit,
      price: 0,
      percentage: preferences.takeProfitPercent
    },
    trailingStop: {
      enabled: false,
      percentage: 2,
      activationPrice: 0
    }
  });

  // Update prices when market data changes
  useEffect(() => {
    if (marketData) {
      setOrderForm(prev => ({
        ...prev,
        price: marketData.price
      }));
      
      setBracketForm(prev => ({
        ...prev,
        entry: { ...prev.entry, price: marketData.price }
      }));
      
      updateBracketPrices(marketData.price);
    }
  }, [marketData]);

  // Calculate bracket order prices
  const updateBracketPrices = useCallback((entryPrice: number) => {
    setBracketForm(prev => {
      const newForm = { ...prev };
      
      if (newForm.stopLoss?.enabled) {
        const stopLossPrice = prev.entry.side === 'BUY'
          ? entryPrice * (1 - newForm.stopLoss.percentage / 100)
          : entryPrice * (1 + newForm.stopLoss.percentage / 100);
        newForm.stopLoss.price = stopLossPrice;
      }
      
      if (newForm.takeProfit?.enabled) {
        const takeProfitPrice = prev.entry.side === 'BUY'
          ? entryPrice * (1 + newForm.takeProfit.percentage / 100)
          : entryPrice * (1 - newForm.takeProfit.percentage / 100);
        newForm.takeProfit.price = takeProfitPrice;
      }
      
      return newForm;
    });
  }, []);

  // Calculate order value and fees
  const orderCalculations = useMemo(() => {
    const price = orderForm.type === 'MARKET' 
      ? (marketData?.price || 0)
      : orderForm.price;
    
    const orderValue = price * orderForm.quantity;
    const estimatedFee = orderValue * 0.001; // 0.1% fee
    const total = orderForm.side === 'BUY' 
      ? orderValue + estimatedFee
      : orderValue - estimatedFee;
    
    return {
      orderValue,
      estimatedFee,
      total,
      price
    };
  }, [orderForm, marketData]);

  // Risk calculations for bracket orders
  const bracketCalculations = useMemo(() => {
    const entryPrice = bracketForm.entry.price;
    const quantity = bracketForm.entry.quantity;
    
    let maxLoss = 0;
    let maxGain = 0;
    let riskRewardRatio = 0;
    
    if (bracketForm.stopLoss?.enabled && bracketForm.takeProfit?.enabled) {
      const stopLossPrice = bracketForm.stopLoss.price;
      const takeProfitPrice = bracketForm.takeProfit.price;
      
      if (bracketForm.entry.side === 'BUY') {
        maxLoss = (entryPrice - stopLossPrice) * quantity;
        maxGain = (takeProfitPrice - entryPrice) * quantity;
      } else {
        maxLoss = (stopLossPrice - entryPrice) * quantity;
        maxGain = (entryPrice - takeProfitPrice) * quantity;
      }
      
      riskRewardRatio = maxLoss > 0 ? maxGain / maxLoss : 0;
    }
    
    return { maxLoss, maxGain, riskRewardRatio };
  }, [bracketForm]);

  // Handle simple order submission
  const handleSubmitOrder = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const orderRequest: OrderRequest = {
        symbol,
        side: orderForm.side,
        type: orderForm.type,
        quantity: orderForm.quantity,
        price: orderForm.type !== 'MARKET' ? orderForm.price : undefined,
        stopPrice: orderForm.type.includes('STOP') ? orderForm.stopPrice : undefined,
        timeInForce: orderForm.timeInForce,
        reduceOnly: orderForm.reduceOnly,
        postOnly: orderForm.postOnly
      };
      
      await onCreateOrder(orderRequest);
      
      // Reset form after successful submission
      if (!preferences.confirmationRequired) {
        setOrderForm(prev => ({
          ...prev,
          quantity: preferences.defaultQuantity
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  }, [symbol, orderForm, onCreateOrder, preferences]);

  // Handle bracket order submission
  const handleSubmitBracketOrder = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const entryOrder: OrderRequest = {
        symbol,
        side: bracketForm.entry.side,
        type: bracketForm.entry.type,
        quantity: bracketForm.entry.quantity,
        price: bracketForm.entry.type !== 'MARKET' ? bracketForm.entry.price : undefined,
        timeInForce: bracketForm.entry.timeInForce
      };
      
      const bracketOrder: BracketOrder = {
        entryOrder
      };
      
      if (bracketForm.stopLoss?.enabled) {
        bracketOrder.stopLoss = {
          symbol,
          side: bracketForm.entry.side === 'BUY' ? 'SELL' : 'BUY',
          type: 'STOP_LOSS',
          quantity: bracketForm.entry.quantity,
          stopPrice: bracketForm.stopLoss.price,
          reduceOnly: true
        };
      }
      
      if (bracketForm.takeProfit?.enabled) {
        bracketOrder.takeProfit = {
          symbol,
          side: bracketForm.entry.side === 'BUY' ? 'SELL' : 'BUY',
          type: 'LIMIT',
          quantity: bracketForm.entry.quantity,
          price: bracketForm.takeProfit.price,
          reduceOnly: true
        };
      }
      
      if (bracketForm.trailingStop?.enabled) {
        bracketOrder.trailingStop = {
          activationPrice: bracketForm.trailingStop.activationPrice,
          callbackRate: bracketForm.trailingStop.percentage
        };
      }
      
      await onCreateBracketOrder(bracketOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bracket order');
    } finally {
      setIsSubmitting(false);
    }
  }, [symbol, bracketForm, onCreateBracketOrder]);

  // Quick trade buttons
  const handleQuickTrade = useCallback(async (side: OrderSide, percentage: number) => {
    const quantity = preferences.presetSizes[percentage] || preferences.defaultQuantity;
    
    setOrderForm(prev => ({
      ...prev,
      side,
      quantity,
      type: 'MARKET'
    }));
    
    if (!preferences.confirmationRequired) {
      await handleSubmitOrder();
    }
  }, [preferences, handleSubmitOrder]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Order Panel - {symbol}
          {paperTrading && (
            <Badge variant="secondary" className="text-xs">Paper</Badge>
          )}
        </CardTitle>
        
        {marketData && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-bold">${marketData.price.toFixed(4)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Spread:</span>
              <span className="text-xs">
                ${(marketData.ask - marketData.bid).toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-3 mb-3">
            <TabsTrigger value="simple" className="text-xs">Simple</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
            <TabsTrigger value="bracket" className="text-xs">Bracket</TabsTrigger>
          </TabsList>

          {/* Error Display */}
          {error && (
            <Alert className="mx-3 mb-3 border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Simple Order Tab */}
          <TabsContent value="simple" className="flex-1 overflow-auto px-3 space-y-4">
            {/* Quick Trade Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleQuickTrade('BUY', 0)}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Quick Buy
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleQuickTrade('SELL', 0)}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Quick Sell
              </Button>
            </div>

            {/* Preset Sizes */}
            <div>
              <Label className="text-xs text-muted-foreground">Quick Sizes</Label>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {preferences.presetSizes.map((size, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setOrderForm(prev => ({ ...prev, quantity: size }))}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Form */}
            <div className="space-y-3">
              {/* Side and Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Side</Label>
                  <Select
                    value={orderForm.side}
                    onValueChange={(value: OrderSide) => 
                      setOrderForm(prev => ({ ...prev, side: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={orderForm.type}
                    onValueChange={(value: OrderType) => 
                      setOrderForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKET">Market</SelectItem>
                      <SelectItem value="LIMIT">Limit</SelectItem>
                      <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                      <SelectItem value="STOP_LOSS_LIMIT">Stop Loss Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm(prev => ({ 
                    ...prev, 
                    quantity: parseFloat(e.target.value) || 0 
                  }))}
                  className="h-8"
                  step="0.01"
                />
              </div>

              {/* Price (for non-market orders) */}
              {orderForm.type !== 'MARKET' && (
                <div>
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm(prev => ({ 
                      ...prev, 
                      price: parseFloat(e.target.value) || 0 
                    }))}
                    className="h-8"
                    step="0.0001"
                  />
                </div>
              )}

              {/* Stop Price (for stop orders) */}
              {orderForm.type.includes('STOP') && (
                <div>
                  <Label className="text-xs">Stop Price</Label>
                  <Input
                    type="number"
                    value={orderForm.stopPrice}
                    onChange={(e) => setOrderForm(prev => ({ 
                      ...prev, 
                      stopPrice: parseFloat(e.target.value) || 0 
                    }))}
                    className="h-8"
                    step="0.0001"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-muted/20 p-3 rounded space-y-2">
              <div className="flex justify-between text-sm">
                <span>Order Value:</span>
                <span>${orderCalculations.orderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Est. Fee:</span>
                <span>${orderCalculations.estimatedFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span>Total:</span>
                <span>${orderCalculations.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !orderForm.quantity}
              className={`w-full ${orderForm.side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              variant={orderForm.side === 'SELL' ? 'destructive' : 'default'}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                `${orderForm.side} ${orderForm.quantity} ${symbol}`
              )}
            </Button>
          </TabsContent>

          {/* Advanced Order Tab */}
          <TabsContent value="advanced" className="flex-1 overflow-auto px-3 space-y-4">
            <div className="text-center text-muted-foreground text-sm py-8">
              <Calculator className="h-8 w-8 mx-auto mb-2" />
              <p>Advanced order features</p>
              <p className="text-xs">OCO, Iceberg, TWAP orders</p>
            </div>
          </TabsContent>

          {/* Bracket Order Tab */}
          <TabsContent value="bracket" className="flex-1 overflow-auto px-3 space-y-4">
            <div className="space-y-4">
              {/* Entry Order */}
              <div>
                <Label className="text-sm font-medium">Entry Order</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Side</Label>
                    <Select
                      value={bracketForm.entry.side}
                      onValueChange={(value: OrderSide) => 
                        setBracketForm(prev => ({
                          ...prev,
                          entry: { ...prev.entry, side: value }
                        }))
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={bracketForm.entry.quantity}
                      onChange={(e) => setBracketForm(prev => ({
                        ...prev,
                        entry: { 
                          ...prev.entry, 
                          quantity: parseFloat(e.target.value) || 0 
                        }
                      }))}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Stop Loss */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Stop Loss</span>
                  </Label>
                  <Switch
                    checked={bracketForm.stopLoss?.enabled || false}
                    onCheckedChange={(checked) => 
                      setBracketForm(prev => ({
                        ...prev,
                        stopLoss: { ...prev.stopLoss!, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                {bracketForm.stopLoss?.enabled && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Percentage</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[bracketForm.stopLoss.percentage]}
                          onValueChange={([value]) => {
                            setBracketForm(prev => ({
                              ...prev,
                              stopLoss: { ...prev.stopLoss!, percentage: value }
                            }));
                            updateBracketPrices(bracketForm.entry.price);
                          }}
                          max={10}
                          min={0.1}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs w-12">{bracketForm.stopLoss.percentage}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        value={bracketForm.stopLoss.price.toFixed(4)}
                        onChange={(e) => setBracketForm(prev => ({
                          ...prev,
                          stopLoss: { 
                            ...prev.stopLoss!, 
                            price: parseFloat(e.target.value) || 0 
                          }
                        }))}
                        className="h-8"
                        step="0.0001"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Take Profit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Take Profit</span>
                  </Label>
                  <Switch
                    checked={bracketForm.takeProfit?.enabled || false}
                    onCheckedChange={(checked) => 
                      setBracketForm(prev => ({
                        ...prev,
                        takeProfit: { ...prev.takeProfit!, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                {bracketForm.takeProfit?.enabled && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Percentage</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[bracketForm.takeProfit.percentage]}
                          onValueChange={([value]) => {
                            setBracketForm(prev => ({
                              ...prev,
                              takeProfit: { ...prev.takeProfit!, percentage: value }
                            }));
                            updateBracketPrices(bracketForm.entry.price);
                          }}
                          max={20}
                          min={0.1}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs w-12">{bracketForm.takeProfit.percentage}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        value={bracketForm.takeProfit.price.toFixed(4)}
                        onChange={(e) => setBracketForm(prev => ({
                          ...prev,
                          takeProfit: { 
                            ...prev.takeProfit!, 
                            price: parseFloat(e.target.value) || 0 
                          }
                        }))}
                        className="h-8"
                        step="0.0001"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Risk/Reward Summary */}
              {bracketForm.stopLoss?.enabled && bracketForm.takeProfit?.enabled && (
                <div className="bg-muted/20 p-3 rounded space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max Loss:</span>
                    <span className="text-red-500">-${bracketCalculations.maxLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Gain:</span>
                    <span className="text-green-500">+${bracketCalculations.maxGain.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Risk/Reward:</span>
                    <span>1:{bracketCalculations.riskRewardRatio.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Submit Bracket Order */}
              <Button
                onClick={handleSubmitBracketOrder}
                disabled={isSubmitting || !bracketForm.entry.quantity}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Bracket Order...</span>
                  </div>
                ) : (
                  'Create Bracket Order'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 