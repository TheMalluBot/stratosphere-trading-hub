
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TradingLayout } from "@/components/layout/TradingLayout";

// Import pages
import Dashboard from "@/pages/Dashboard";
import Charts from "@/pages/Charts";
import Watchlist from "@/pages/Watchlist";
import Trading from "@/pages/Trading";
import PaperTrading from "@/pages/PaperTrading";
import TradingManagement from "@/pages/TradingManagement";
import Backtesting from "@/pages/Backtesting";
import MarketIntelligence from "@/pages/MarketIntelligence";
import StockScreener from "@/pages/StockScreener";
import PortfolioAnalytics from "@/pages/PortfolioAnalytics";
import RiskManagement from "@/pages/RiskManagement";
import Journal from "@/pages/Journal";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Router>
          <SidebarProvider>
            <div className="flex h-screen bg-background">
              <Routes>
                <Route path="/" element={<TradingLayout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="charts" element={<Charts />} />
                  <Route path="watchlist" element={<Watchlist />} />
                  <Route path="trading" element={<Trading />} />
                  <Route path="paper-trading" element={<PaperTrading />} />
                  <Route path="trading-management" element={<TradingManagement />} />
                  <Route path="backtesting" element={<Backtesting />} />
                  <Route path="market-intelligence" element={<MarketIntelligence />} />
                  <Route path="screener" element={<StockScreener />} />
                  <Route path="portfolio-analytics" element={<PortfolioAnalytics />} />
                  <Route path="risk-management" element={<RiskManagement />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
          </SidebarProvider>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
