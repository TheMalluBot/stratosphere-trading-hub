
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TradingLayout } from "@/components/layout/TradingLayout";
import Dashboard from "@/pages/Dashboard";
import Charts from "@/pages/Charts";
import Watchlist from "@/pages/Watchlist";
import Trading from "@/pages/Trading";
import PaperTrading from "@/pages/PaperTrading";
import Backtesting from "@/pages/Backtesting";
import Journal from "@/pages/Journal";
import Analysis from "@/pages/Analysis";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen flex w-full bg-background">
            <Routes>
              <Route path="/" element={<TradingLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="charts" element={<Charts />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="trading" element={<Trading />} />
                <Route path="paper-trading" element={<PaperTrading />} />
                <Route path="backtesting" element={<Backtesting />} />
                <Route path="journal" element={<Journal />} />
                <Route path="analysis" element={<Analysis />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
