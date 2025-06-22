
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyDetailsProps {
  selectedStrategy: string;
}

export const StrategyDetails = ({ selectedStrategy }: StrategyDetailsProps) => {
  const renderStrategyDetails = () => {
    switch (selectedStrategy) {
      case "linear-regression":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Linear Regression Oscillator Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Entry: When Linear Regression Oscillator crosses above 0 (bullish) or below 0 (bearish)</li>
                <li>• Exit: When oscillator reverses direction or hits threshold levels (+/- 1.5)</li>
                <li>• Stop Loss: Dynamic based on invalidation levels from 5-bar lookback</li>
                <li>• Position Size: Fixed percentage of capital per trade</li>
              </ul>
            </div>
          </div>
        );

      case "z-score-trend":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Rolling Z-Score Trend Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Entry: Z-Score momentum crossover with threshold confirmation</li>
                <li>• Exit: Mean reversion signals or opposite momentum</li>
                <li>• Risk Management: Overbought/oversold zone exits</li>
                <li>• Lookback Period: 20 bars for rolling calculation</li>
              </ul>
            </div>
          </div>
        );

      case "stop-loss-tp":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Stop Loss & Take Profit Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Entry: SMA crossover signals (14 over 28)</li>
                <li>• Stop Loss: Fixed amount in currency (₹100 default)</li>
                <li>• Take Profit: Fixed amount in currency (₹200 default)</li>
                <li>• Risk-Reward Ratio: 1:2 (configurable)</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Strategy Implementation</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Select a strategy from the configuration panel to view implementation details.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Implementation</CardTitle>
        <CardDescription>
          How your selected strategy is implemented in the backtest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStrategyDetails()}
      </CardContent>
    </Card>
  );
};
