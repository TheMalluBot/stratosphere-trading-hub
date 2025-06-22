
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicalScreener } from "@/components/screening/TechnicalScreener";
import { FundamentalScreener } from "@/components/screening/FundamentalScreener";
import { CustomScreener } from "@/components/screening/CustomScreener";
import { ScreenerResults } from "@/components/screening/ScreenerResults";
import { Search, TrendingUp, DollarSign, Settings } from "lucide-react";

const StockScreener = () => {
  const [screeningResults, setScreeningResults] = useState<any[]>([]);

  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="w-8 h-8 text-green-500" />
            Stock Screener
          </h1>
          <p className="text-muted-foreground">
            Advanced stock screening with technical and fundamental filters
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="technical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="fundamental" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fundamental
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="space-y-4">
              <TechnicalScreener onResults={setScreeningResults} />
            </TabsContent>

            <TabsContent value="fundamental" className="space-y-4">
              <FundamentalScreener onResults={setScreeningResults} />
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <CustomScreener onResults={setScreeningResults} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <ScreenerResults results={screeningResults} />
        </div>
      </div>
    </div>
  );
};

export default StockScreener;
