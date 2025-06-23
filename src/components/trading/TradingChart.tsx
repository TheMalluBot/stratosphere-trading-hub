
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart3, Wifi, WifiOff, Settings, Maximize2 } from "lucide-react";
import { useRealTimePrice } from "@/hooks/useRealTimePrice";
import { useState, useEffect } from "react";

interface TradingChartProps {
  symbol?: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20: number;
  ma50: number;
  rsi: number;
  macd: number;
  signal: number;
}

const TradingChart = ({ symbol = "BTCUSDT" }: TradingChartProps) => {
  const { priceData, isConnected } = useRealTimePrice(symbol);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showIndicators, setShowIndicators] = useState(true);

  // Calculate technical indicators
  const calculateSMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  };

  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  // Generate realistic OHLCV data with technical indicators
  useEffect(() => {
    const generateAdvancedData = () => {
      const data: ChartDataPoint[] = [];
      let basePrice = 45000;
      const now = Date.now();
      const prices: number[] = [];
      
      for (let i = 200; i >= 0; i--) {
        const time = new Date(now - i * 60000);
        
        // Generate OHLC data
        const volatility = (Math.random() - 0.5) * 300;
        const trend = Math.sin(i / 50) * 100;
        basePrice += trend + volatility;
        
        const open = i === 200 ? basePrice : data[data.length - 1]?.close || basePrice;
        const priceRange = basePrice * 0.02;
        const high = basePrice + Math.random() * priceRange;
        const low = basePrice - Math.random() * priceRange;
        const close = low + Math.random() * (high - low);
        
        prices.push(close);
        
        // Calculate technical indicators
        const ma20 = calculateSMA(prices, 20);
        const ma50 = calculateSMA(prices, 50);
        const rsi = calculateRSI(prices);
        
        // Simple MACD calculation
        const ema12 = calculateSMA(prices, 12);
        const ema26 = calculateSMA(prices, 26);
        const macd = ema12 - ema26;
        const signal = calculateSMA(prices.slice(-9).map(() => macd), 9);
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: time.getTime(),
          price: Number(close.toFixed(2)),
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.random() * 200 + 50,
          ma20: Number(ma20.toFixed(2)),
          ma50: Number(ma50.toFixed(2)),
          rsi: Number(rsi.toFixed(2)),
          macd: Number(macd.toFixed(4)),
          signal: Number(signal.toFixed(4))
        });
      }
      
      return data;
    };

    const initialData = generateAdvancedData();
    setChartData(initialData);

    // Update data with real-time prices
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const lastPoint = newData[newData.length - 1];
        const currentPrice = priceData?.price || lastPoint.close;
        const priceChange = (Math.random() - 0.5) * 100;
        const newPrice = currentPrice + priceChange;
        
        const newPoint: ChartDataPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          price: Number(newPrice.toFixed(2)),
          open: lastPoint.close,
          high: Number((newPrice + Math.random() * 50).toFixed(2)),
          low: Number((newPrice - Math.random() * 50).toFixed(2)),
          close: Number(newPrice.toFixed(2)),
          volume: Math.random() * 200 + 50,
          ma20: Number((newPrice + (Math.random() - 0.5) * 50).toFixed(2)),
          ma50: Number((newPrice + (Math.random() - 0.5) * 100).toFixed(2)),
          rsi: Number((50 + (Math.random() - 0.5) * 40).toFixed(2)),
          macd: Number(((Math.random() - 0.5) * 10).toFixed(4)),
          signal: Number(((Math.random() - 0.5) * 8).toFixed(4))
        };
        
        newData.push(newPoint);
        if (newData.length > 200) newData.shift();
        
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [priceData]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  const formatPrice = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {symbol} Advanced Chart
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                  {isConnected ? 'LIVE' : 'DEMO'}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Professional trading chart with technical analysis
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['line', 'area'] as const).map((type) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="px-3"
                >
                  {type}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIndicators(!showIndicators)}
            >
              <Settings className="w-4 h-4 mr-1" />
              Indicators
            </Button>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
              <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className={`w-4 h-4 ${priceChange < 0 ? 'rotate-180' : ''}`} />
                <span>
                  {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} 
                  ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={priceChange >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={priceChange >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 200', 'dataMax + 200']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatPrice}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'close' || name === 'price') return [formatPrice(value), 'Price'];
                    if (name === 'ma20') return [formatPrice(value), 'MA20'];
                    if (name === 'ma50') return [formatPrice(value), 'MA50'];
                    if (name === 'rsi') return [`${value}`, 'RSI'];
                    return [value, name];
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {showIndicators && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="ma20" 
                      stroke="#3b82f6"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="2 2"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ma50" 
                      stroke="#f59e0b"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="4 2"
                    />
                  </>
                )}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 200', 'dataMax + 200']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatPrice}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'close' || name === 'price') return [formatPrice(value), 'Price'];
                    if (name === 'ma20') return [formatPrice(value), 'MA20'];
                    if (name === 'ma50') return [formatPrice(value), 'MA50'];
                    return [value, name];
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {showIndicators && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="ma20" 
                      stroke="#3b82f6"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="2 2"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ma50" 
                      stroke="#f59e0b"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="4 2"
                    />
                  </>
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <Badge variant="outline" className="text-xs">
            24h High: {formatPrice(Math.max(...chartData.map(d => d.high)))}
          </Badge>
          <Badge variant="outline" className="text-xs">
            24h Low: {formatPrice(Math.min(...chartData.map(d => d.low)))}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Volume: {(chartData.reduce((sum, d) => sum + d.volume, 0) / 1000).toFixed(1)}K
          </Badge>
          {showIndicators && (
            <>
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
                MA20: {formatPrice(chartData[chartData.length - 1]?.ma20 || 0)}
              </Badge>
              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500">
                MA50: {formatPrice(chartData[chartData.length - 1]?.ma50 || 0)}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500">
                RSI: {chartData[chartData.length - 1]?.rsi.toFixed(1) || '50.0'}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
