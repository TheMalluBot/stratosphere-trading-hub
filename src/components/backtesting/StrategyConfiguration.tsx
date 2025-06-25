
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { StrategySelector, strategies } from "./StrategySelector";
import { ConfigurationForm } from "./ConfigurationForm";

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
        <StrategySelector 
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={setSelectedStrategy}
        />

        <ConfigurationForm
          symbol={symbol}
          setSymbol={setSymbol}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          initialCapital={initialCapital}
          setInitialCapital={setInitialCapital}
        />

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
