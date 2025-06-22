
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Play, TrendingUp } from "lucide-react";

interface FundamentalScreenerProps {
  onResults: (results: any[]) => void;
}

interface FundamentalCriteria {
  pe: { enabled: boolean; min: number; max: number };
  pb: { enabled: boolean; min: number; max: number };
  roe: { enabled: boolean; min: number };
  debtToEquity: { enabled: boolean; max: number };
  marketCap: { enabled: boolean; min: string; max: string };
  sector: string;
  dividendYield: { enabled: boolean; min: number };
  revenueGrowth: { enabled: boolean; min: number };
}

export function FundamentalScreener({ onResults }: FundamentalScreenerProps) {
  const [criteria, setCriteria] = useState<FundamentalCriteria>({
    pe: { enabled: false, min: 0, max: 25 },
    pb: { enabled: false, min: 0, max: 3 },
    roe: { enabled: false, min: 15 },
    debtToEquity: { enabled: false, max: 0.5 },
    marketCap: { enabled: false, min: "1B", max: "100B" },
    sector: "all",
    dividendYield: { enabled: false, min: 2 },
    revenueGrowth: { enabled: false, min: 10 }
  });
  const [isScanning, setIsScanning] = useState(false);

  const sectors = [
    { value: "all", label: "All Sectors" },
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "financials", label: "Financials" },
    { value: "consumer_discretionary", label: "Consumer Discretionary" },
    { value: "industrials", label: "Industrials" },
    { value: "energy", label: "Energy" },
    { value: "materials", label: "Materials" },
    { value: "utilities", label: "Utilities" }
  ];

  const marketCapRanges = [
    { value: "100M", label: "$100M" },
    { value: "500M", label: "$500M" },
    { value: "1B", label: "$1B" },
    { value: "5B", label: "$5B" },
    { value: "10B", label: "$10B" },
    { value: "50B", label: "$50B" },
    { value: "100B", label: "$100B" },
    { value: "500B", label: "$500B" }
  ];

  const runScreening = async () => {
    setIsScanning(true);
    
    // Simulate screening process
    setTimeout(() => {
      const mockResults = [
        {
          symbol: "MSFT",
          name: "Microsoft Corp.",
          price: 412.18,
          marketCap: "3.1T",
          pe: 28.5,
          pb: 12.8,
          roe: 45.2,
          debtToEquity: 0.31,
          dividendYield: 0.68,
          revenueGrowth: 18.2,
          sector: "Technology",
          score: 8.7
        },
        {
          symbol: "JNJ",
          name: "Johnson & Johnson",
          price: 161.24,
          marketCap: "426.3B",
          pe: 15.8,
          pb: 6.2,
          roe: 23.1,
          debtToEquity: 0.43,
          dividendYield: 2.91,
          revenueGrowth: 6.8,
          sector: "Healthcare",
          score: 7.9
        },
        {
          symbol: "WMT",
          name: "Walmart Inc.",
          price: 167.59,
          marketCap: "545.2B",
          pe: 27.3,
          pb: 5.1,
          roe: 19.8,
          debtToEquity: 0.38,
          dividendYield: 1.34,
          revenueGrowth: 5.2,
          sector: "Consumer Discretionary",
          score: 7.2
        }
      ];
      
      onResults(mockResults);
      setIsScanning(false);
    }, 2000);
  };

  const getActiveFiltersCount = () => {
    return Object.values(criteria).filter(criterion => 
      typeof criterion === 'object' && 'enabled' in criterion && criterion.enabled
    ).length + (criteria.sector !== 'all' ? 1 : 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Fundamental Screener
        </CardTitle>
        <CardDescription>
          Screen stocks based on financial metrics and ratios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sector Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sector</label>
          <Select
            value={criteria.sector}
            onValueChange={(value) => setCriteria(prev => ({ ...prev, sector: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectors.map(sector => (
                <SelectItem key={sector.value} value={sector.value}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Market Cap Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Market Cap</label>
            <Switch
              checked={criteria.marketCap.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, marketCap: { ...prev.marketCap, enabled: checked } }))
              }
            />
          </div>
          {criteria.marketCap.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Min</label>
                <Select
                  value={criteria.marketCap.min}
                  onValueChange={(value) =>
                    setCriteria(prev => ({ ...prev, marketCap: { ...prev.marketCap, min: value } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketCapRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max</label>
                <Select
                  value={criteria.marketCap.max}
                  onValueChange={(value) =>
                    setCriteria(prev => ({ ...prev, marketCap: { ...prev.marketCap, max: value } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketCapRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* P/E Ratio Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">P/E Ratio</label>
            <Switch
              checked={criteria.pe.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, pe: { ...prev.pe, enabled: checked } }))
              }
            />
          </div>
          {criteria.pe.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Min</label>
                <Input
                  type="number"
                  value={criteria.pe.min}
                  onChange={(e) =>
                    setCriteria(prev => ({ ...prev, pe: { ...prev.pe, min: Number(e.target.value) } }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max</label>
                <Input
                  type="number"
                  value={criteria.pe.max}
                  onChange={(e) =>
                    setCriteria(prev => ({ ...prev, pe: { ...prev.pe, max: Number(e.target.value) } }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* ROE Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Return on Equity (ROE)</label>
            <Switch
              checked={criteria.roe.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, roe: { ...prev.roe, enabled: checked } }))
              }
            />
          </div>
          {criteria.roe.enabled && (
            <div>
              <label className="text-xs text-muted-foreground">Min ROE (%)</label>
              <Input
                type="number"
                value={criteria.roe.min}
                onChange={(e) =>
                  setCriteria(prev => ({ ...prev, roe: { ...prev.roe, min: Number(e.target.value) } }))
                }
              />
            </div>
          )}
        </div>

        {/* Dividend Yield Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Dividend Yield</label>
            <Switch
              checked={criteria.dividendYield.enabled}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, dividendYield: { ...prev.dividendYield, enabled: checked } }))
              }
            />
          </div>
          {criteria.dividendYield.enabled && (
            <div>
              <label className="text-xs text-muted-foreground">Min Yield (%)</label>
              <Input
                type="number"
                step="0.1"
                value={criteria.dividendYield.min}
                onChange={(e) =>
                  setCriteria(prev => ({ ...prev, dividendYield: { ...prev.dividendYield, min: Number(e.target.value) } }))
                }
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={runScreening}
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                Scanning Fundamentals...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Fundamental Screening
              </>
            )}
          </Button>
          
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Filters:</span>
            <Badge variant="secondary">
              {getActiveFiltersCount()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
