
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const strategies = [
  {
    value: "ultimate-combined",
    label: "🚀 Ultimate Strategy",
    description: "Combined 5 Pine Script strategies with AI optimization",
    category: "premium"
  },
  // Elite Quantitative Strategies
  {
    value: "statistical-arbitrage",
    label: "📊 Statistical Arbitrage",
    description: "Renaissance Technologies style mean reversion with Ornstein-Uhlenbeck process",
    category: "elite"
  },
  {
    value: "cross-asset-arbitrage",
    label: "🔄 Cross-Asset Arbitrage",
    description: "Jane Street style ETF vs basket arbitrage with correlation analysis",
    category: "elite"
  },
  {
    value: "ml-momentum",
    label: "🧠 ML Momentum",
    description: "Two Sigma/Citadel style machine learning momentum with 15+ features",
    category: "elite"
  },
  {
    value: "pairs-trading",
    label: "👥 Pairs Trading",
    description: "Cointegration-based pairs trading with dynamic hedge ratios",
    category: "elite"
  },
  {
    value: "volatility-arbitrage",
    label: "📈 Volatility Arbitrage",
    description: "Options implied vs realized volatility trading with GARCH models",
    category: "elite"
  },
  {
    value: "regime-detection",
    label: "🎯 Regime Detection",
    description: "Market regime classification with adaptive strategy selection",
    category: "elite"
  },
  // Original Strategies
  {
    value: "linear-regression",
    label: "📈 Linear Regression",
    description: "Statistical trend analysis with linear regression channels",
    category: "technical"
  },
  {
    value: "z-score-trend",
    label: "📊 Z-Score Trend",
    description: "Mean reversion strategy using statistical z-score analysis",
    category: "technical"
  },
  {
    value: "stop-loss-tp",
    label: "🛡️ Stop Loss/Take Profit",
    description: "Risk management with dynamic stop loss and take profit levels",
    category: "risk"
  },
  {
    value: "deviation-trend",
    label: "📉 Deviation Trend",
    description: "Trend following with price deviation analysis",
    category: "technical"
  },
  {
    value: "volume-profile",
    label: "📊 Volume Profile",
    description: "Volume-based price action analysis and support/resistance",
    category: "volume"
  },
  {
    value: "custom",
    label: "⚙️ Custom Strategy",
    description: "Build your own Pine Script strategy",
    category: "custom"
  }
];

interface StrategySelectorProps {
  selectedStrategy: string;
  setSelectedStrategy: (value: string) => void;
}

export const StrategySelector = ({ selectedStrategy, setSelectedStrategy }: StrategySelectorProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "elite": return "bg-gradient-to-r from-purple-600 to-blue-600 text-white";
      case "premium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "technical": return "bg-blue-500 text-white";
      case "risk": return "bg-red-500 text-white";
      case "volume": return "bg-green-500 text-white";
      case "custom": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "elite": return "ELITE";
      case "premium": return "PREMIUM";
      case "technical": return "TECHNICAL";
      case "risk": return "RISK";
      case "volume": return "VOLUME";
      case "custom": return "CUSTOM";
      default: return "STRATEGY";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Trading Strategy</label>
        <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
          <SelectTrigger>
            <SelectValue placeholder="Select a strategy" />
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {/* Elite Strategies Section */}
            <div className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-sm">
              🏆 ELITE QUANTITATIVE STRATEGIES
            </div>
            {strategies.filter(s => s.category === "elite").map((strategy) => (
              <SelectItem key={strategy.value} value={strategy.value} className="py-3">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {strategy.description}
                    </div>
                  </div>
                  <Badge className={`ml-2 text-xs ${getCategoryColor(strategy.category)}`}>
                    {getCategoryLabel(strategy.category)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
            
            {/* Premium Strategies Section */}
            <div className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-sm mt-2">
              ⭐ PREMIUM STRATEGIES
            </div>
            {strategies.filter(s => s.category === "premium").map((strategy) => (
              <SelectItem key={strategy.value} value={strategy.value} className="py-3">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {strategy.description}
                    </div>
                  </div>
                  <Badge className={`ml-2 text-xs ${getCategoryColor(strategy.category)}`}>
                    {getCategoryLabel(strategy.category)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
            
            {/* Standard Strategies Section */}
            <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-sm mt-2">
              📊 STANDARD STRATEGIES
            </div>
            {strategies.filter(s => !["elite", "premium"].includes(s.category)).map((strategy) => (
              <SelectItem key={strategy.value} value={strategy.value} className="py-3">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {strategy.description}
                    </div>
                  </div>
                  <Badge className={`ml-2 text-xs ${getCategoryColor(strategy.category)}`}>
                    {getCategoryLabel(strategy.category)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Strategy Info Panel */}
      {selectedStrategy && (
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">
              {strategies.find(s => s.value === selectedStrategy)?.label}
            </div>
            <Badge className={`text-xs ${getCategoryColor(strategies.find(s => s.value === selectedStrategy)?.category || '')}`}>
              {getCategoryLabel(strategies.find(s => s.value === selectedStrategy)?.category || '')}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {strategies.find(s => s.value === selectedStrategy)?.description}
          </div>
          
          {/* Elite Strategy Features */}
          {strategies.find(s => s.value === selectedStrategy)?.category === "elite" && (
            <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200">
              <div className="text-xs font-semibold text-purple-700 mb-1">
                🏆 Elite Features:
              </div>
              <div className="text-xs text-purple-600 space-y-1">
                {selectedStrategy === "statistical-arbitrage" && (
                  <>
                    <div>• Ornstein-Uhlenbeck mean reversion process</div>
                    <div>• Half-life estimation for optimal timing</div>
                    <div>• Advanced statistical significance testing</div>
                  </>
                )}
                {selectedStrategy === "cross-asset-arbitrage" && (
                  <>
                    <div>• ETF vs constituent basket analysis</div>
                    <div>• Dynamic correlation matrix calculation</div>
                    <div>• Risk-adjusted arbitrage scoring</div>
                  </>
                )}
                {selectedStrategy === "ml-momentum" && (
                  <>
                    <div>• 15+ engineered technical features</div>
                    <div>• Market regime detection algorithms</div>
                    <div>• Ensemble prediction with confidence scoring</div>
                  </>
                )}
                {selectedStrategy === "pairs-trading" && (
                  <>
                    <div>• Cointegration testing with Engle-Granger</div>
                    <div>• Dynamic hedge ratio calculation</div>
                    <div>• Mean reversion signal optimization</div>
                  </>
                )}
                {selectedStrategy === "volatility-arbitrage" && (
                  <>
                    <div>• Implied vs realized volatility analysis</div>
                    <div>• GARCH volatility forecasting</div>
                    <div>• Options pricing model integration</div>
                  </>
                )}
                {selectedStrategy === "regime-detection" && (
                  <>
                    <div>• Hidden Markov Model regime classification</div>
                    <div>• Adaptive strategy parameter adjustment</div>
                    <div>• Real-time regime transition detection</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
