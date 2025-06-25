
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, TrendingDown, Target, Zap, RefreshCw } from 'lucide-react';
import { aiTradingEngine, AIPrediction, AIPortfolioRecommendation } from '@/lib/ai/AITradingEngine';

interface AIInsightsDashboardProps {
  symbol?: string;
  marketData?: any[];
  portfolio?: any[];
}

export default function AIInsightsDashboard({ 
  symbol = 'BTCUSDT', 
  marketData = [], 
  portfolio = [] 
}: AIInsightsDashboardProps) {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<AIPortfolioRecommendation[]>([]);
  const [models] = useState(aiTradingEngine.getModels());
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadAIInsights();
    const interval = setInterval(loadAIInsights, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  const loadAIInsights = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Generate AI predictions
      if (marketData.length > 0) {
        const newPredictions = await aiTradingEngine.generatePredictions(symbol, marketData);
        setPredictions(newPredictions);
      }

      // Generate portfolio recommendations
      if (portfolio.length > 0) {
        const marketDataMap = new Map([[symbol, marketData]]);
        const newRecommendations = await aiTradingEngine.generatePortfolioRecommendations(portfolio, marketDataMap);
        setRecommendations(newRecommendations);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrainModels = async () => {
    setIsTraining(true);
    try {
      await aiTradingEngine.retrainModels(symbol, marketData);
    } catch (error) {
      console.error('Failed to retrain models:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const getPredictionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPredictionColor = (direction: string) => {
    switch (direction) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'rebalance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold">AI Trading Insights</h2>
            <p className="text-muted-foreground">Advanced machine learning predictions and recommendations</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadAIInsights} 
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRetrainModels} 
            disabled={isTraining}
            size="sm"
          >
            <Zap className={`w-4 h-4 ${isTraining ? 'animate-pulse' : ''}`} />
            {isTraining ? 'Training...' : 'Retrain Models'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Portfolio AI</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {isLoading ? 'Generating AI predictions...' : 'No predictions available yet'}
                  </p>
                  {!isLoading && (
                    <Button variant="outline" onClick={loadAIInsights} className="mt-4">
                      Generate Predictions
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPredictionIcon(prediction.direction)}
                        <CardTitle className="text-lg">{prediction.symbol}</CardTitle>
                        <Badge className={getPredictionColor(prediction.direction)}>
                          {prediction.direction.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="font-bold">{(prediction.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Price Target</div>
                        <div className="font-semibold text-lg">
                          ${prediction.priceTarget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Time Horizon</div>
                        <div className="font-semibold">{prediction.timeHorizon}h</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">AI Reasoning</div>
                      <div className="space-y-1">
                        {prediction.reasoning.map((reason, idx) => (
                          <div key={idx} className="text-sm bg-muted p-2 rounded text-muted-foreground">
                            • {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Progress value={prediction.confidence * 100} className="h-2" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {isLoading ? 'Analyzing portfolio...' : 'No recommendations available'}
                  </p>
                  {!isLoading && (
                    <Button variant="outline" onClick={loadAIInsights} className="mt-4">
                      Generate Recommendations
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{rec.symbol}</CardTitle>
                        <Badge className={getActionColor(rec.action)}>
                          {rec.action.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="font-bold">{(rec.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Recommended Allocation</div>
                        <div className="font-semibold text-lg">
                          {(rec.allocation * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Risk Score</div>
                        <div className="font-semibold">{rec.riskScore.toFixed(1)}/100</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">AI Reasoning</div>
                      <div className="text-sm bg-muted p-3 rounded">
                        {rec.reasoning}
                      </div>
                    </div>
                    
                    <Progress value={rec.confidence * 100} className="h-2" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {models.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{model.type.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="font-semibold text-lg">
                        {model.performance.accuracy.toFixed(1)}%
                      </div>
                      <Progress value={model.performance.accuracy} className="h-1 mt-1" />
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="font-semibold text-lg">
                        {model.performance.sharpe.toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Last Trained</div>
                      <div className="font-semibold">
                        {new Date(model.performance.lastTrained).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Model Parameters</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Lookback: {model.parameters.lookbackPeriod}h</div>
                      <div>Horizon: {model.parameters.predictionHorizon}h</div>
                      <div>Features: {model.parameters.features.length}</div>
                      <div>Confidence: {(model.parameters.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
