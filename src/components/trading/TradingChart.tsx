
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart3, Wifi, WifiOff } from "lucide-react";
import { useRealTimePrice } from "@/hooks/useRealTimePrice";
import { useState, useEffect } from "react";

interface TradingChartProps {
  symbol?: string;
}

const TradingChart = ({ symbol = "BTCUSDT" }: TradingChartProps) => {
  const { priceData, isConnected } = useRealTimePrice(symbol);
  const [chartData, setChartData] = useState<any[]>([]);

  // Generate more realistic price data with technical indicators
  useEffect(() => {
    const generateRealisticData = () => {
      const data = [];
      let price = 45000;
      const now = Date.now();
      
      for (let i = 200; i >= 0; i--) {
        const time = new Date(now - i * 60000); // 1-minute intervals
        
        // Add some trend and volatility
        const trend = Math.sin(i / 50) * 100;
        const volatility = (Math.random() - 0.5) * 300;
        price += trend + volatility;
        
        // Calculate moving averages
        const ma20 = price + (Math.random() - 0.5) * 50;
        const ma50 = price + (Math.random() - 0.5) * 100;
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: time.getTime(),
          price: Number(price.toFixed(2)),
          volume: Math.random() * 200 + 50,
          ma20: Number(ma20.toFixed(2)),
          ma50: Number(ma50.toFixed(2)),
          high: Number((price + Math.random() * 100).toFixed(2)),
          low: Number((price - Math.random() * 100).toFixed(2))
        });
      }
      
      return data;
    };

    const initialData = generateRealisticData();
    setChartData(initialData);

    // Update data periodically
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const lastPoint = newData[newData.length - 1];
        const newPrice = lastPoint.price + (Math.random() - 0.5) * 100;
        
        // Add new point and remove oldest
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          price: Number(newPrice.toFixed(2)),
          volume: Math.random() * 200 + 50,
          ma20: Number((newPrice + (Math.random() - 0.5) * 50).toFixed(2)),
          ma50: Number((newPrice + (Math.random() - 0.5) * 100).toFixed(2)),
          high: Number((newPrice + Math.random() * 100).toFixed(2)),
          low: Number((newPrice - Math.random() * 100).toFixed(2))
        });
        
        if (newData.length > 200) {
          newData.shift();
        }
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentPrice = priceData?.price || (chartData.length > 0 ? chartData[chartData.length - 1].price : 0);
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
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
              Real-time price chart with technical indicators
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
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
                  if (name === 'price') return [formatPrice(value), 'Price'];
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
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4 }}
              />
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
            </AreaChart>
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
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
            MA20: {formatPrice(chartData[chartData.length - 1]?.ma20 || 0)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500">
            MA50: {formatPrice(chartData[chartData.length - 1]?.ma50 || 0)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
