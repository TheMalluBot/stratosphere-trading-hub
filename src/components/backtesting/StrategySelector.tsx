
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface StrategySelectorProps {
  selectedStrategy: string;
  setSelectedStrategy: (value: string) => void;
}

export const StrategySelector = ({ selectedStrategy, setSelectedStrategy }: StrategySelectorProps) => {
  return (
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
  );
};

export { strategies };
