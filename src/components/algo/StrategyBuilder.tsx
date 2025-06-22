
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Code, Eye, Save, Play, Settings, Plus, Trash2 } from "lucide-react";

export const StrategyBuilder = () => {
  const [strategyName, setStrategyName] = useState("");
  const [strategyDescription, setStrategyDescription] = useState("");
  const [strategyCode, setStrategyCode] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const strategyTemplates = [
    {
      id: "sma-crossover",
      name: "SMA Crossover",
      description: "Simple Moving Average crossover strategy",
      code: `// SMA Crossover Strategy
export class SMACrossoverStrategy {
  calculate(data) {
    const fastSMA = calculateSMA(data, 10);
    const slowSMA = calculateSMA(data, 20);
    
    if (fastSMA > slowSMA) {
      return { signal: 'BUY', strength: 0.8 };
    } else if (fastSMA < slowSMA) {
      return { signal: 'SELL', strength: 0.8 };
    }
    
    return { signal: 'HOLD', strength: 0 };
  }
}`
    },
    {
      id: "rsi-oversold",
      name: "RSI Oversold/Overbought",
      description: "RSI-based mean reversion strategy",
      code: `// RSI Strategy
export class RSIStrategy {
  calculate(data) {
    const rsi = calculateRSI(data, 14);
    
    if (rsi < 30) {
      return { signal: 'BUY', strength: (30 - rsi) / 30 };
    } else if (rsi > 70) {
      return { signal: 'SELL', strength: (rsi - 70) / 30 };
    }
    
    return { signal: 'HOLD', strength: 0 };
  }
}`
    },
    {
      id: "custom",
      name: "Custom Strategy",
      description: "Build your own strategy from scratch",
      code: `// Custom Strategy Template
export class CustomStrategy {
  constructor(config) {
    this.config = config;
  }
  
  calculate(data) {
    // Your strategy logic here
    const signal = 'HOLD';
    const strength = 0;
    
    return { signal, strength };
  }
}`
    }
  ];

  const [parameters, setParameters] = useState([
    { name: "period", value: "14", type: "number", description: "Period for calculations" },
    { name: "threshold", value: "0.5", type: "number", description: "Signal threshold" }
  ]);

  const addParameter = () => {
    setParameters([...parameters, { name: "", value: "", type: "number", description: "" }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: string, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const loadTemplate = () => {
    const template = strategyTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setStrategyName(template.name);
      setStrategyDescription(template.description);
      setStrategyCode(template.code);
      toast.success(`Loaded ${template.name} template`);
    }
  };

  const saveStrategy = () => {
    if (!strategyName || !strategyCode) {
      toast.error("Please provide strategy name and code");
      return;
    }
    toast.success(`Strategy "${strategyName}" saved successfully`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Strategy Builder
          </CardTitle>
          <CardDescription>Create and customize trading algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="code">Strategy Code</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="test">Backtest</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label>Strategy Template</Label>
                <div className="flex gap-2">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategyTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={loadTemplate} disabled={!selectedTemplate}>
                    Load
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Strategy Name</Label>
                <Input
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="Enter strategy name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={strategyDescription}
                  onChange={(e) => setStrategyDescription(e.target.value)}
                  placeholder="Describe your strategy"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label>Strategy Code</Label>
                <Textarea
                  value={strategyCode}
                  onChange={(e) => setStrategyCode(e.target.value)}
                  placeholder="Enter your strategy code here..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Validate Syntax
                </Button>
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Test Run
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Strategy Parameters</Label>
                <Button variant="outline" size="sm" onClick={addParameter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <Input
                        placeholder="Name"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                      />
                      <Select
                        value={param.type}
                        onValueChange={(value) => updateParameter(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeParameter(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Description"
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Backtest Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Select defaultValue="RELIANCE">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
                        <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
                        <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Select defaultValue="1D">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1 Minute</SelectItem>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="1H">1 Hour</SelectItem>
                        <SelectItem value="1D">1 Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Run Backtest
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={saveStrategy}>
              <Save className="w-4 h-4 mr-2" />
              Save Strategy
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
