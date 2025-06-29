
import { Outlet } from "react-router-dom";
import { TradingSidebar } from "./TradingSidebar";
import { TrendingUp } from "lucide-react";

export function TradingLayout() {
  return (
    <>
      <TradingSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header bar */}
          <div className="border-b bg-muted/50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">
                    AlgoTrade Pro - Advanced Trading Platform
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Real-time trading and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Market Open</span>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
