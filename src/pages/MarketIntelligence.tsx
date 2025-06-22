
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EconomicCalendar } from "@/components/market/EconomicCalendar";
import { SectorRotation } from "@/components/market/SectorRotation";
import { NewsSentiment } from "@/components/market/NewsSentiment";
import { MarketBreadth } from "@/components/market/MarketBreadth";
import { Calendar, TrendingUp, Newspaper, BarChart3 } from "lucide-react";

const MarketIntelligence = () => {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Market Intelligence
          </h1>
          <p className="text-muted-foreground">
            Economic events, sector analysis, and market sentiment tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Economic Calendar
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sector Rotation
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News Sentiment
          </TabsTrigger>
          <TabsTrigger value="breadth" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Market Breadth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <EconomicCalendar />
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <SectorRotation />
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <NewsSentiment />
        </TabsContent>

        <TabsContent value="breadth" className="space-y-4">
          <MarketBreadth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;
