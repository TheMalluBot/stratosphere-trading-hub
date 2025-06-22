
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, DollarSign, Activity, Zap, TrendingUp, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Access key trading features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/watchlist">
              <List className="w-6 h-6 mb-2" />
              Watchlist
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/trading">
              <DollarSign className="w-6 h-6 mb-2" />
              Live Trading
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/paper-trading">
              <Activity className="w-6 h-6 mb-2" />
              Paper Trade
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/backtesting">
              <Zap className="w-6 h-6 mb-2" />
              Backtest
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/analysis">
              <TrendingUp className="w-6 h-6 mb-2" />
              Analysis
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link to="/journal">
              <FileText className="w-6 h-6 mb-2" />
              Journal
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
