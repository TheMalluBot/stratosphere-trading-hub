
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, TrendingUp, Target, DollarSign } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

export function RiskDashboard() {
  const { portfolio } = usePortfolio();

  const calculatePortfolioRisk = () => {
    if (portfolio.positions.length === 0) return { score: 0, level: 'None' };
    
    // Simple risk calculation based on portfolio diversity and volatility
    const diversity = Math.min(portfolio.positions.length / 5, 1); // Max 5 for full diversity
    const avgVolatility = portfolio.positions.reduce((sum, pos) => 
      sum + Math.abs(pos.changePercent24h), 0) / portfolio.positions.length;
    
    const riskScore = Math.max(0, Math.min(100, 
      (1 - diversity) * 50 + (avgVolatility / 10) * 50
    ));
    
    let level = 'Low';
    if (riskScore > 70) level = 'High';
    else if (riskScore > 40) level = 'Medium';
    
    return { score: riskScore, level };
  };

  const portfolioRisk = calculatePortfolioRisk();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Portfolio Risk Analysis
          </CardTitle>
          <CardDescription>
            Real-time risk metrics and portfolio health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Risk Score</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{portfolioRisk.score.toFixed(0)}/100</span>
                  <Badge 
                    variant={portfolioRisk.level === 'High' ? 'destructive' : 
                           portfolioRisk.level === 'Medium' ? 'secondary' : 'default'}
                  >
                    {portfolioRisk.level}
                  </Badge>
                </div>
                <Progress value={portfolioRisk.score} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Portfolio Value</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
              <div className={`text-sm ${portfolio.totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolio.totalChange >= 0 ? '+' : ''}{formatCurrency(portfolio.totalChange)} (24h)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Diversification</span>
              </div>
              <div className="text-2xl font-bold">{portfolio.positions.length}</div>
              <div className="text-sm text-muted-foreground">Active positions</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Volatility</span>
              </div>
              <div className="text-2xl font-bold">
                {portfolio.positions.length >  0 
                  ? (portfolio.positions.reduce((sum, pos) => sum + Math.abs(pos.changePercent24h), 0) / portfolio.positions.length).toFixed(1)
                  : '0.0'
                }%
              </div>
              <div className="text-sm text-muted-foreground">Average 24h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Risk Alerts
            </CardTitle>
            <CardDescription>Active risk warnings and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioRisk.score > 70 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">High Risk Alert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Portfolio risk is elevated. Consider diversifying holdings.
                  </p>
                </div>
              )}
              
              {portfolio.positions.length < 3 && portfolio.positions.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-500">Low Diversification</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consider adding more positions to reduce concentration risk.
                  </p>
                </div>
              )}

              {portfolio.positions.some(pos => Math.abs(pos.changePercent24h) > 15) && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-500">High Volatility</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Some positions show high volatility. Monitor closely.
                  </p>
                </div>
              )}

              {portfolioRisk.score <= 30 && portfolio.positions.length > 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-500">Portfolio Healthy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Risk levels are within acceptable parameters.
                  </p>
                </div>
              )}

              {portfolio.positions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No positions to analyze</p>
                  <p className="text-xs">Start trading to see risk metrics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Breakdown</CardTitle>
            <CardDescription>Risk distribution by asset</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No positions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.positions.map((position) => {
                  const allocation = (position.value / portfolio.totalValue) * 100;
                  const riskLevel = Math.abs(position.changePercent24h) > 10 ? 'High' : 
                                   Math.abs(position.changePercent24h) > 5 ? 'Medium' : 'Low';
                  
                  return (
                    <div key={position.symbol} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{position.asset}</span>
                          <Badge variant="outline" className="text-xs">
                            {allocation.toFixed(1)}%
                          </Badge>
                        </div>
                        <Badge 
                          variant={riskLevel === 'High' ? 'destructive' : 
                                 riskLevel === 'Medium' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {riskLevel} Risk
                        </Badge>
                      </div>
                      <Progress value={allocation} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(position.value)}</span>
                        <span className={position.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {position.changePercent24h >= 0 ? '+' : ''}{position.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
