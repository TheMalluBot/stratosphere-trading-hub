
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, Play } from "lucide-react";

interface CustomScreenerProps {
  onResults: (results: any[]) => void;
}

interface CustomFilter {
  id: string;
  metric: string;
  operator: string;
  value: string;
  category: string;
}

export function CustomScreener({ onResults }: CustomScreenerProps) {
  const [filters, setFilters] = useState<CustomFilter[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const metrics = {
    technical: [
      { value: "rsi", label: "RSI" },
      { value: "macd", label: "MACD" },
      { value: "sma_20", label: "20-day SMA" },
      { value: "sma_50", label: "50-day SMA" },
      { value: "volume", label: "Volume" },
      { value: "price_change", label: "Price Change %" }
    ],
    fundamental: [
      { value: "pe_ratio", label: "P/E Ratio" },
      { value: "pb_ratio", label: "P/B Ratio" },
      { value: "roe", label: "Return on Equity" },
      { value: "debt_equity", label: "Debt to Equity" },
      { value: "dividend_yield", label: "Dividend Yield" },
      { value: "revenue_growth", label: "Revenue Growth" },
      { value: "eps_growth", label: "EPS Growth" },
      { value: "market_cap", label: "Market Cap" }
    ],
    valuation: [
      { value: "peg_ratio", label: "PEG Ratio" },
      { value: "ev_ebitda", label: "EV/EBITDA" },
      { value: "price_sales", label: "Price/Sales" },
      { value: "book_value", label: "Book Value" }
    ]
  };

  const operators = [
    { value: "gt", label: "Greater than (>)" },
    { value: "lt", label: "Less than (<)" },
    { value: "eq", label: "Equal to (=)" },
    { value: "gte", label: "Greater or equal (≥)" },
    { value: "lte", label: "Less or equal (≤)" },
    { value: "between", label: "Between" }
  ];

  const addFilter = () => {
    const newFilter: CustomFilter = {
      id: Date.now().toString(),
      metric: "",
      operator: "",
      value: "",
      category: "technical"
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const updateFilter = (id: string, field: keyof CustomFilter, value: string) => {
    setFilters(prev => prev.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ));
  };

  const runCustomScreening = async () => {
    setIsScanning(true);
    
    // Simulate screening process
    setTimeout(() => {
      const mockResults = [
        {
          symbol: "NVDA",
          name: "NVIDIA Corp.",
          price: 875.42,
          change: 3.45,
          volume: 1850000,
          pe: 65.2,
          roe: 55.8,
          rsi: 42.1,
          score: 9.1,
          sector: "Technology"
        },
        {
          symbol: "AMD",
          name: "Advanced Micro Devices",
          price: 142.18,
          change: 2.1,
          volume: 1320000,
          pe: 45.7,
          roe: 3.2,
          rsi: 48.5,
          score: 7.6,
          sector: "Technology"
        }
      ];
      
      onResults(mockResults);
      setIsScanning(false);
    }, 2500);
  };

  const getMetricsByCategory = (category: string) => {
    return metrics[category as keyof typeof metrics] || [];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'fundamental': return 'bg-green-100 text-green-800';
      case 'valuation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Custom Screener
        </CardTitle>
        <CardDescription>
          Create custom screening criteria combining multiple factors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Screening Filters</h4>
            <Button onClick={addFilter} size="sm" variant="outline">
              <Plus className="w-3 h-3 mr-1" />
              Add Filter
            </Button>
          </div>

          {filters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Add filters to build your custom screening criteria</p>
            </div>
          )}

          {filters.map((filter, index) => (
            <div key={filter.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getCategoryColor(filter.category)}>
                  Filter {index + 1}
                </Badge>
                <Button
                  onClick={() => removeFilter(filter.id)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Category */}
                <Select
                  value={filter.category}
                  onValueChange={(value) => updateFilter(filter.id, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="fundamental">Fundamental</SelectItem>
                    <SelectItem value="valuation">Valuation</SelectItem>
                  </SelectContent>
                </Select>

                {/* Metric */}
                <Select
                  value={filter.metric}
                  onValueChange={(value) => updateFilter(filter.id, 'metric', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMetricsByCategory(filter.category).map(metric => (
                      <SelectItem key={metric.value} value={metric.value}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator */}
                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value */}
                <Input
                  placeholder="Value"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Saved Strategies */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              Growth Stocks
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Value Stocks
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Dividend Aristocrats
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Momentum Plays
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={runCustomScreening}
            disabled={isScanning || filters.length === 0}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Running Custom Screening...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Custom Screening
              </>
            )}
          </Button>

          {filters.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground text-center">
              {filters.length} filter{filters.length > 1 ? 's' : ''} configured
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
