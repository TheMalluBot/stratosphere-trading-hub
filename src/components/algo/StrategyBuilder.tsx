
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Code, Settings, TrendingUp } from "lucide-react";
import { StrategySelector } from "@/components/trading/StrategySelector";
import { toast } from "sonner";

export const StrategyBuilder = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");

  const handleStrategySelect = (strategy: any) => {
    toast.success(`Strategy "${strategy.label}" selected for configuration`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Algorithmic Strategy Builder
            <Badge variant="outline">ADVANCED</Badge>
          </CardTitle>
          <CardDescription>
            Build, test, and deploy sophisticated algorithmic trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strategies" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strategies">Strategy Library</TabsTrigger>
              <TabsTrigger value="builder">Custom Builder</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies">
              <StrategySelector 
                symbol={selectedSymbol}
                onStrategySelect={handleStrategySelect}
              />
            </TabsContent>

            <TabsContent value="builder" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Custom Strategy Builder
                  </CardTitle>
                  <CardDescription>
                    Create your own algorithmic trading strategies using our visual builder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Custom Strategy Builder</h3>
                    <p className="text-muted-foreground mb-4">
                      Visual strategy builder coming soon. For now, you can use the pre-built strategies from the library.
                    </p>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Parameters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Live Strategy Monitoring
                  </CardTitle>
                  <CardDescription>
                    Monitor your active algorithmic strategies in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Strategy Monitoring Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time monitoring of your active strategies. Start a strategy to see live data here.
                    </p>
                    <Button variant="outline">
                      View Active Strategies
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
