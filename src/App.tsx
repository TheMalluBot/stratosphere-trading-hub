
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { TradingLayout } from "@/components/layout/TradingLayout";
import { DesktopIntegration } from "@/components/desktop/DesktopIntegration";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import { useSecurityAuditLogger } from "@/components/security/SecurityAuditLogger";
import { useEffect } from "react";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const { logEvent } = useSecurityAuditLogger();

  useEffect(() => {
    // Log app initialization
    logEvent('login', { action: 'app_initialized' });

    // Setup global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      logEvent('error', {
        type: 'global_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logEvent('error', {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logEvent]);

  return (
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
      <PerformanceMonitor />
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
