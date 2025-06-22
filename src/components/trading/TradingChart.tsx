
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface TradingChartProps {
  symbol?: string;
}

const TradingChart = ({ symbol = "BTCUSDT" }: TradingChartProps) => {
  // Mock price data for demonstration
  const generatePriceData = () => {
    const data = [];
    let price = 45000;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now - i * 300000); // 5-minute intervals
      price += (Math.random() - 0.5) * 200;
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Number(price.toFixed(2)),
        volume: Math.random() * 100 + 50
      });
    }
    
    return data;
  };

  const priceData = generatePriceData();
  const currentPrice = priceData[priceData.length - 1].price;
  const previousPrice = priceData[priceData.length - 2].price;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {symbol} Price Chart
            </CardTitle>
            <CardDescription>
              5-minute candlestick chart with live price updates
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className={`w-4 h-4 ${priceChange < 0 ? 'rotate-180' : ''}`} />
              <span>{priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 100', 'dataMax + 100']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline">24h High: $45,890</Badge>
          <Badge variant="outline">24h Low: $44,120</Badge>
          <Badge variant="outline">Volume: 12,456 BTC</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
