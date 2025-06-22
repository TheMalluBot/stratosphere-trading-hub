
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calculator, Target, TrendingUp, AlertTriangle, DollarSign, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

interface PositionData {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskAmount: number;
  positionSize: number;
  positionValue: number;
  riskRewardRatio: number;
  probabilitySuccess: number;
}

const samplePositions: PositionData[] = [
  {
    symbol: 'AAPL',
    currentPrice: 185.50,
    targetPrice: 210.00,
    stopLoss: 170.00,
    riskAmount: 2500,
    positionSize: 161,
    positionValue: 29865.50,
    riskRewardRatio: 1.58,
    probabilitySuccess: 65
  },
  {
    symbol: 'MSFT',
    currentPrice: 378.25,
    targetPrice: 420.00,
    stopLoss: 355.00,
    riskAmount: 2500,
    positionSize: 107,
    positionValue: 40472.75,
    riskRewardRatio: 1.79,
    probabilitySuccess: 72
  },
  {
    symbol: 'GOOGL',
    currentPrice: 142.80,
    targetPrice: 165.00,
    stopLoss: 130.00,
    riskAmount: 2500,
    positionSize: 195,
    positionValue: 27846.00,
    riskRewardRatio: 1.73,
    probabilitySuccess: 68
  }
];

const riskModels = [
  { name: 'Fixed Dollar', value: 'fixed_dollar', description: 'Risk fixed dollar amount per trade' },
  { name: 'Fixed Percentage', value: 'fixed_percent', description: 'Risk fixed percentage of portfolio' },
  { name: 'Kelly Criterion', value: 'kelly', description: 'Optimal position size based on edge' },
  { name: 'ATR Based', value: 'atr', description: 'Position size based on volatility' },
  { name: 'Volatility Parity', value: 'vol_parity', description: 'Risk parity across positions' }
];

const portfolioAllocation = [
  { name: 'Technology', value: 35, color: '#3b82f6' },
  { name: 'Healthcare', value: 20, color: '#10b981' },
  { name: 'Financial', value: 15, color: '#f59e0b' },
  { name: 'Consumer', value: 15, color: '#ef4444' },
  { name: 'Energy', value: 10, color: '#8b5cf6' },
  { name: 'Cash', value: 5, color: '#6b7280' }
];

export function PositionSizing() {
  const [portfolioValue, setPortfolioValue] = useState("1250000");
  const [riskPerTrade, setRiskPerTrade] = useState([2]);
  const [riskModel, setRiskModel] = useState("fixed_percent");
  const [currentPrice, setCurrentPrice] = useState("185.50");
  const [targetPrice, setTargetPrice] = useState("210.00");
  const [stopLoss, setStopLoss] = useState("170.00");
  const [winRate, setWinRate] = useState([65]);

  const portfolioVal = parseFloat(portfolioValue) || 0;
  const riskAmount = portfolioVal * (riskPerTrade[0] / 100);
  const price = parseFloat(currentPrice) || 0;
  const target = parseFloat(targetPrice) || 0;
  const stop = parseFloat(stopLoss) || 0;
  
  const riskPerShare = price - stop;
  const rewardPerShare = target - price;
  const riskRewardRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const positionValue = positionSize * price;

  // Kelly Criterion calculation
  const winRateDecimal = winRate[0] / 100;
  const kellyPercentage = winRateDecimal - ((1 - winRateDecimal) / riskRewardRatio);
  const kellyPosition = Math.max(0, kellyPercentage * portfolioVal);

  const expectedReturn = (winRateDecimal * rewardPerShare) - ((1 - winRateDecimal) * riskPerShare);
  const expectedReturnPercent = price > 0 ? (expectedReturn / price) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Position Sizing Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Position Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positionSize.toLocaleString()} shares
            </div>
            <p className="text-xs text-muted-foreground">
              ${positionValue.toLocaleString()} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Risk/Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              1:{riskRewardRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk to reward ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Risk Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${riskAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {riskPerTrade[0]}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Expected Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expectedReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expectedReturnPercent >= 0 ? '+' : ''}{expectedReturnPercent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Per trade expectancy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Position Size Calculator
          </CardTitle>
          <CardDescription>
            Calculate optimal position sizes based on risk management rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Portfolio Settings */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Portfolio Value ($)</Label>
                <Input
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  placeholder="1250000"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Risk Model</Label>
                <Select value={riskModel} onValueChange={setRiskModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Risk Per Trade: {riskPerTrade[0]}%</Label>
                <Slider
                  value={riskPerTrade}
                  onValueChange={setRiskPerTrade}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Trade Parameters */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Current Price ($)</Label>
                <Input
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="185.50"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Price ($)</Label>
                <Input
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="210.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Stop Loss ($)</Label>
                <Input
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="170.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Win Rate: {winRate[0]}%</Label>
                <Slider
                  value={winRate}
                  onValueChange={setWinRate}
                  max={90}
                  min={30}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Calculation Results</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk per share:</span>
                    <span>${riskPerShare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward per share:</span>
                    <span>${rewardPerShare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position size:</span>
                    <span className="font-medium">{positionSize} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position value:</span>
                    <span className="font-medium">${positionValue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk/Reward ratio:</span>
                    <span>1:{riskRewardRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected return:</span>
                    <span className={expectedReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {expectedReturnPercent >= 0 ? '+' : ''}{expectedReturnPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kelly position:</span>
                    <span>${kellyPosition.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kelly percentage:</span>
                    <span>{(kellyPercentage * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Positions</CardTitle>
            <CardDescription>
              Active positions and their risk metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {samplePositions.map((position) => (
                <div key={position.symbol} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{position.symbol}</h4>
                      <p className="text-sm text-muted-foreground">
                        {position.positionSize} shares @ ${position.currentPrice}
                      </p>
                    </div>
                    <Badge variant={position.riskRewardRatio >= 2 ? "default" : "secondary"}>
                      1:{position.riskRewardRatio.toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Value</div>
                      <div className="font-medium">${position.positionValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Risk</div>
                      <div className="font-medium text-red-600">${position.riskAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Win Rate</div>
                      <div className="font-medium">{position.probabilitySuccess}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>
              Current asset allocation and risk distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {portfolioAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {portfolioAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Management Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Management Rules
          </CardTitle>
          <CardDescription>
            Automated position sizing rules and compliance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold">Position Size Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Maximum position size:</span>
                  <span className="font-medium">10% of portfolio</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Maximum sector allocation:</span>
                  <span className="font-medium">40% of portfolio</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Minimum R:R ratio:</span>
                  <span className="font-medium">1:1.5</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Maximum correlation:</span>
                  <span className="font-medium">0.7</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Risk Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Total portfolio risk:</span>
                  <span className="font-medium text-yellow-600">8.5%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Max drawdown limit:</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Current drawdown:</span>
                  <span className="font-medium text-green-600">2.3%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Kelly optimal:</span>
                  <span className="font-medium">{(kellyPercentage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
