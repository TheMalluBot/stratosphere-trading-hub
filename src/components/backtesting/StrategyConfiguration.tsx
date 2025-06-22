
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Zap, RotateCcw } from "lucide-react";

interface StrategyConfigurationProps {
  selectedStrategy: string;
  setSelectedStrategy: (value: string) => void;
  symbol: string;
  setSymbol: (value: string) => void;
  timeframe: string;
  setTimeframe: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  initialCapital: string;
  setInitialCapital: (value: string) => void;
  onReset: () => void;
}

const strategies = [
  {
    value: "linear-regression",
    label: "Linear Regression Oscillator",
    description: "ChartPrime's mean reversion strategy with normalization",
  },
  {
    value: "z-score-trend",
    label: "Rolling Z-Score Trend",
    description: "QuantAlgo's momentum strategy with z-score analysis",
  },
  {
    value: "stop-loss-tp",
    label: "Stop Loss & Take Profit",
    description: "Risk management with fixed levels and SMA crossovers",
  },
  {
    value: "deviation-trend",
    label: "Deviation Trend Profile",
    description: "BigBeluga's trend deviation analysis with support/resistance zones",
  },
  {
    value: "volume-profile",
    label: "Multi-Layer Volume Profile",
    description: "BigBeluga's POC and value area volume analysis",
  },
  {
    value: "ultimate-combined",
    label: "🚀 Ultimate Combined Strategy",
    description: "AI-powered combination of all 5 strategies",
  },
];

export const StrategyConfiguration = ({
  selectedStrategy,
  setSelectedStrategy,
  symbol,
  setSymbol,
  timeframe,
  setTimeframe,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  initialCapital,
  setInitialCapital,
  onReset
}: StrategyConfigurationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Strategy Configuration
        </CardTitle>
        <CardDescription>Select and configure your trading strategy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Strategy</Label>
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((strategy) => (
                <SelectItem key={strategy.value} value={strategy.value}>
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-xs text-muted-foreground">{strategy.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Symbol</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
              <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
              <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
              <SelectItem value="BTCUSDT">Bitcoin/USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Minute</SelectItem>
              <SelectItem value="5m">5 Minutes</SelectItem>
              <SelectItem value="15m">15 Minutes</SelectItem>
              <SelectItem value="1H">1 Hour</SelectItem>
              <SelectItem value="1D">1 Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Initial Capital (₹)</Label>
          <Input
            type="number"
            placeholder="100000"
            value={initialCapital}
            onChange={(e) => setInitialCapital(e.target.value)}
          />
        </div>

        {selectedStrategy === "ultimate-combined" && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="text-sm font-semibold text-blue-700">🚀 Ultimate Strategy Active</div>
            <div className="text-xs text-blue-600 mt-1">
              Combining all 5 Pine Script strategies with AI optimization
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">Linear Regression</Badge>
              <Badge variant="secondary" className="text-xs">Z-Score Trend</Badge>
              <Badge variant="secondary" className="text-xs">Stop Loss/TP</Badge>
              <Badge variant="secondary" className="text-xs">Deviation Trend</Badge>
              <Badge variant="secondary" className="text-xs">Volume Profile</Badge>
            </div>
          </div>
        )}

        {selectedStrategy === "custom" && (
          <div className="space-y-2">
            <Label>Pine Script Code</Label>
            <Textarea
              placeholder="Enter your Pine Script strategy code here..."
              rows={6}
            />
          </div>
        )}

        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Selected Strategy</div>
          <div className="font-semibold">
            {strategies.find(s => s.value === selectedStrategy)?.label}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {strategies.find(s => s.value === selectedStrategy)?.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
