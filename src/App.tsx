
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { TradingLayout } from "@/components/layout/TradingLayout";
import { DesktopIntegration } from "@/components/desktop/DesktopIntegration";

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
import TradingView from "@/pages/TradingView";
import AlgoTrading from "@/pages/AlgoTrading";
import Auth from "@/pages/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Router>
          <SidebarProvider>
            <div className="flex h-screen bg-background">
              <DesktopIntegration />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <>
                    <SignedOut>
                      <Auth />
                    </SignedOut>
                    <SignedIn>
                      <TradingLayout />
                    </SignedIn>
                  </>
                }>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tradingview" element={<TradingView />} />
                  <Route path="charts" element={<Charts />} />
                  <Route path="watchlist" element={<Watchlist />} />
                  <Route path="trading" element={<Trading />} />
                  <Route path="paper-trading" element={<PaperTrading />} />
                  <Route path="algo-trading" element={<AlgoTrading />} />
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
