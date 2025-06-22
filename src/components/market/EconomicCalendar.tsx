
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  forecast: string;
  previous: string;
  actual?: string;
}

export function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedImpact, setSelectedImpact] = useState("ALL");

  // Mock data - replace with real API integration
  useEffect(() => {
    const mockEvents: EconomicEvent[] = [
      {
        id: "1",
        time: "09:30",
        currency: "USD",
        event: "Non-Farm Payrolls",
        impact: "High",
        forecast: "180K",
        previous: "175K"
      },
      {
        id: "2", 
        time: "10:00",
        currency: "EUR",
        event: "ECB Interest Rate Decision",
        impact: "High",
        forecast: "4.50%",
        previous: "4.50%"
      },
      {
        id: "3",
        time: "14:30",
        currency: "USD",
        event: "Consumer Price Index",
        impact: "Medium",
        forecast: "3.2%",
        previous: "3.1%"
      },
      {
        id: "4",
        time: "16:00",
        currency: "GBP",
        event: "GDP Growth Rate",
        impact: "Medium",
        forecast: "0.1%",
        previous: "0.2%"
      }
    ];
    setEvents(mockEvents);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'High': return <AlertTriangle className="w-3 h-3" />;
      case 'Medium': return <TrendingUp className="w-3 h-3" />;
      case 'Low': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const currencyMatch = selectedCurrency === "ALL" || event.currency === selectedCurrency;
    const impactMatch = selectedImpact === "ALL" || event.impact === selectedImpact;
    return currencyMatch && impactMatch;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Economic Calendar
          </CardTitle>
          <CardDescription>
            Track important economic events and their market impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono text-muted-foreground">
                    {event.time}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.currency}
                  </Badge>
                  <Badge variant={getImpactColor(event.impact)} className="flex items-center gap-1">
                    {getImpactIcon(event.impact)}
                    {event.impact}
                  </Badge>
                  <div className="font-medium">
                    {event.event}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Previous</div>
                    <div className="font-medium">{event.previous}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Forecast</div>
                    <div className="font-medium">{event.forecast}</div>
                  </div>
                  {event.actual && (
                    <div className="text-center">
                      <div className="text-muted-foreground">Actual</div>
                      <div className="font-medium text-green-600">{event.actual}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
