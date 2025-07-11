
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TradingLayout } from "@/components/layout/TradingLayout";
import { DesktopIntegration } from "@/components/desktop/DesktopIntegration";
import ErrorBoundary from "@/components/error/ErrorBoundary";

// Import pages
import Dashboard from "@/pages/Dashboard";
import Charts from "@/pages/Charts";
import Watchlist from "@/pages/Watchlist";
import Trading from "@/pages/Trading";
import TradingManagement from "@/pages/TradingManagement";
import MarketIntelligence from "@/pages/MarketIntelligence";
import StockScreener from "@/pages/StockScreener";
import PortfolioAnalytics from "@/pages/PortfolioAnalytics";
import RiskManagement from "@/pages/RiskManagement";
import Journal from "@/pages/Journal";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import TradingView from "@/pages/TradingView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Router>
            <SidebarProvider>
              <div className="flex h-screen w-full bg-background overflow-hidden">
                <DesktopIntegration />
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/*" element={<TradingLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="tradingview" element={<TradingView />} />
                    <Route path="charts" element={<Charts />} />
                    <Route path="watchlist" element={<Watchlist />} />
                    <Route path="trading" element={<Trading />} />
                    <Route path="trading-management" element={<TradingManagement />} />
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
    </ErrorBoundary>
  );
}

export default App;
