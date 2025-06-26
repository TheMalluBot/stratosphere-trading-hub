import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Target, AlertTriangle } from 'lucide-react';
import { analysisEngine } from '@/lib/analysis/AnalysisEngine';
import { useCryptoData } from '@/hooks/useCryptoData';

interface TradingChartProps {
  symbol: string;
}

const TradingChart = ({ symbol }: TradingChartProps) => {
  const { marketData, loading, error } = useCryptoData();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('area');
  const [selectedIndicator, setSelectedIndicator] = useState<'price' | 'rsi' | 'macd' | 'volume'>('price');
  const analysisRef = useRef<any>(null);

  // Create historical data from current market data for the selected symbol
  const getHistoricalData = () => {
    if (!marketData || marketData.length === 0) return [];
    
    const symbolData = marketData.find(item => item.symbol === symbol.replace('USDT', ''));
    if (!symbolData) return [];

    // Generate sample historical data based on current price
    const basePrice = symbolData.price;
    const historicalData = [];
    
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (100 - i));
      
      const volatility = 0.02; // 2% daily volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + randomChange * (i / 100));
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        close: price,
        open: price * (1 + (Math.random() - 0.5) * 0.01),
        high: price * (1 + Math.random() * 0.015),
        low: price * (1 - Math.random() * 0.015),
        volume: symbolData.volume * (0.8 + Math.random() * 0.4)
      });
    }
    
    return historicalData;
  };

  useEffect(() => {
    const historicalData = getHistoricalData();
    if (historicalData && historicalData.length >= 50) {
      runAnalysis();
    }
  }, [marketData, symbol]);

  const runAnalysis = async () => {
    const historicalData = getHistoricalData();
    if (!historicalData || historicalData.length < 50) return;
    
    setIsAnalyzing(true);
    try {
      // Convert market data to analysis format
      const analysisData = historicalData.map(item => ({
        timestamp: new Date(item.date).getTime(),
        open: item.open || item.close,
        high: item.high || item.close * 1.02,
        low: item.low || item.close * 0.98,
        close: item.close,
        volume: item.volume || Math.random() * 1000000
      }));

      const result = await analysisEngine.analyzeMarketData(analysisData);
      setAnalysisResult(result);
      analysisRef.current = result;
      
      console.log('📊 Analysis completed:', {
        patterns: result.patterns.chart.length,
        signals: result.signals,
        trend: result.trend
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getChartData = () => {
    const historicalData = getHistoricalData();
    if (!historicalData) return [];
    
    return historicalData.map((item, index) => {
      const baseData = {
        date: item.date,
        price: item.close,
        volume: item.volume || Math.random() * 1000000,
        timestamp: new Date(item.date).getTime()
      };

      // Add technical indicators if analysis is available
      if (analysisResult && analysisResult.indicators) {
        const indicators = analysisResult.indicators;
        
        return {
          ...baseData,
          rsi: indicators.rsi[index] || null,
          macd: indicators.macd.macd[index] || null,
          signal: indicators.macd.signal[index] || null,
          ema20: indicators.ema20[index] || null,
          ema50: indicators.ema50[index] || null,
          upperBB: indicators.bollingerBands.upper[index] || null,
          lowerBB: indicators.bollingerBands.lower[index] || null,
          middleBB: indicators.bollingerBands.middle[index] || null
        };
      }

      return baseData;
    });
  };

  const renderMainChart = () => {
    const data = getChartData();
    
    switch (selectedIndicator) {
      case 'rsi':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis domain={[0, 100]} stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey={70} stroke="#EF4444" strokeDasharray="5 5" />
            <Line type="monotone" dataKey={30} stroke="#10B981" strokeDasharray="5 5" />
          </LineChart>
        );
      
      case 'macd':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="macd" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="signal" stroke="#EF4444" strokeWidth={2} dot={false} />
          </LineChart>
        );
      
      case 'volume':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Area type="monotone" dataKey="volume" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
          </AreaChart>
        );
      
      default:
        if (chartType === 'area') {
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Area type="monotone" dataKey="price" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              {analysisResult && (
                <>
                  <Line type="monotone" dataKey="ema20" stroke="#10B981" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="ema50" stroke="#F59E0B" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="upperBB" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="lowerBB" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                </>
              )}
            </AreaChart>
          );
        } else {
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} />
              {analysisResult && (
                <>
                  <Line type="monotone" dataKey="ema20" stroke="#10B981" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="ema50" stroke="#F59E0B" strokeWidth={1} dot={false} />
                </>
              )}
            </LineChart>
          );
        }
    }
  };

  const renderAnalysisInsights = () => {
    if (!analysisResult) return null;

    const { signals, trend, patterns } = analysisResult;

    return (
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {/* Trading Signals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Trading Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.buy && (
                <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  BUY SIGNAL
                </Badge>
              )}
              {signals.sell && (
                <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  SELL SIGNAL
                </Badge>
              )}
              {!signals.buy && !signals.sell && (
                <Badge variant="secondary">
                  <Activity className="w-3 h-3 mr-1" />
                  HOLD
                </Badge>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                Strength: {(signals.strength * 100).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge 
                variant="outline" 
                className={
                  trend.direction === 'bullish' ? 'text-green-400 border-green-500/20' :
                  trend.direction === 'bearish' ? 'text-red-400 border-red-500/20' :
                  'text-yellow-400 border-yellow-500/20'
                }
              >
                {trend.direction.toUpperCase()}
              </Badge>
              <div className="text-xs text-muted-foreground">
                <div>Strength: {(trend.strength * 100).toFixed(0)}%</div>
                <div>Duration: {trend.duration} periods</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Detection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Patterns Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {patterns.chart.length > 0 ? (
                patterns.chart.slice(0, 2).map((pattern: any, index: number) => (
                  <div key={index} className="text-xs">
                    <Badge variant="outline" className="text-xs">
                      {pattern.type.replace('_', ' ')}
                    </Badge>
                    <div className="text-muted-foreground mt-1">
                      Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">
                  No significant patterns detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {symbol} Advanced Chart
            {isAnalyzing && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 animate-pulse text-yellow-500" />
                <span className="text-sm text-muted-foreground">Analyzing...</span>
              </div>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIndicator(selectedIndicator === 'price' ? 'rsi' : 
                                                 selectedIndicator === 'rsi' ? 'macd' : 
                                                 selectedIndicator === 'macd' ? 'volume' : 'price')}
            >
              {selectedIndicator.toUpperCase()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? 'Area' : 'Line'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={isAnalyzing || !marketData || marketData.length === 0}
            >
              <Zap className="w-4 h-4 mr-1" />
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {renderMainChart()}
        </ResponsiveContainer>
        
        {/* Signal Reasons */}
        {analysisResult && analysisResult.signals.reasons.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Analysis Reasons:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {analysisResult.signals.reasons.map((reason: string, index: number) => (
                <div key={index}>• {reason}</div>
              ))}
            </div>
          </div>
        )}

        {renderAnalysisInsights()}
      </CardContent>
    </Card>
  );
};

export default TradingChart;
