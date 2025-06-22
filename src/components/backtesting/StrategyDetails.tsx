
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
                <li>• Stop Loss: Fixed amount in currency (₹100 default) or percentage (2%)</li>
                <li>• Take Profit: Fixed amount in currency (₹200 default) or percentage (4%)</li>
                <li>• Risk-Reward Ratio: 1:2 (configurable)</li>
                <li>• Position Sizing: Based on risk percentage of capital</li>
              </ul>
            </div>
          </div>
        );

      case "deviation-trend":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Deviation Trend Profile Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Entry: Price breakout from support/resistance with trend confirmation</li>
                <li>• Trend Analysis: Linear regression over 50-period lookback</li>
                <li>• Volume Confirmation: Above-average volume for signal validation</li>
                <li>• Exit: Return to trend line or extreme deviation levels</li>
                <li>• Support/Resistance: Dynamic levels based on recent price action</li>
              </ul>
            </div>
          </div>
        );

      case "volume-profile":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Multi-Layer Volume Profile Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Strategy Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Entry: Point of Control (POC) breakouts with volume confirmation</li>
                <li>• Value Area: 70% of volume concentration for key levels</li>
                <li>• Volume Intensity: Current vs average volume analysis</li>
                <li>• Exit: Return to POC or value area boundaries</li>
                <li>• Profile Period: 100-bar rolling volume distribution</li>
              </ul>
            </div>
          </div>
        );

      case "ultimate-combined":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Ultimate Combined Strategy</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Combination Rules:</p>
              <ul className="text-sm space-y-1">
                <li>• Weighted Signals: Each strategy contributes 20% to final signal</li>
                <li>• Consensus Method: Requires 3+ strategies to agree</li>
                <li>• Signal Threshold: Minimum 60% strength for execution</li>
                <li>• Risk Management: Portfolio-level position sizing and stops</li>
                <li>• Performance: Enhanced Sharpe ratio through diversification</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                <strong>Strategy Weights:</strong> Linear Regression (20%), Z-Score Trend (20%), 
                Stop Loss/TP (20%), Deviation Trend (20%), Volume Profile (20%)
              </p>
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
