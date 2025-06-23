
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface EconomicEvent {
  id: string;
  title: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  country: string;
  previous: string;
  forecast: string;
  actual?: string;
}

export const EconomicCalendar = () => {
  // Mock economic events data
  const events: EconomicEvent[] = [
    {
      id: '1',
      title: 'US Federal Reserve Interest Rate Decision',
      time: '14:00 EDT',
      impact: 'high',
      country: 'US',
      previous: '5.25%',
      forecast: '5.50%',
      actual: '5.50%'
    },
    {
      id: '2',
      title: 'Non-Farm Payrolls',
      time: '08:30 EDT',
      impact: 'high',
      country: 'US',
      previous: '336K',
      forecast: '180K'
    },
    {
      id: '3',
      title: 'EU Consumer Price Index',
      time: '10:00 CET',
      impact: 'medium',
      country: 'EU',
      previous: '2.9%',
      forecast: '2.7%'
    },
    {
      id: '4',
      title: 'China Manufacturing PMI',
      time: '09:00 CST',
      impact: 'medium',
      country: 'CN',
      previous: '49.2',
      forecast: '49.8'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Economic Calendar
        </CardTitle>
        <CardDescription>
          Major economic events that may impact cryptocurrency markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getImpactColor(event.impact)}`} />
                {getImpactIcon(event.impact)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{event.title}</h4>
                  <Badge variant="outline">{event.country}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Previous: </span>
                  <span className="font-mono">{event.previous}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Forecast: </span>
                  <span className="font-mono">{event.forecast}</span>
                </div>
                {event.actual && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Actual: </span>
                    <span className="font-mono font-semibold">{event.actual}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Data updates every 15 minutes • Times shown in local timezone
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
