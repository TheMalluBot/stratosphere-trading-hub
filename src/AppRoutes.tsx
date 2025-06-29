import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import { TradingLayout } from './components/layout/TradingLayout';

// Public
import Auth from './pages/Auth';

// Private pages
import Dashboard from './pages/Dashboard';
import TradingView from './pages/TradingView';
import Charts from './pages/Charts';
import Watchlist from './pages/Watchlist';
import Trading from './pages/Trading';
import PaperTrading from './pages/PaperTrading';
import AlgoTrading from './pages/AlgoTrading';
import TradingManagement from './pages/TradingManagement';
import Backtesting from './pages/Backtesting';
import MarketIntelligence from './pages/MarketIntelligence';
import StockScreener from './pages/StockScreener';
import PortfolioAnalytics from './pages/PortfolioAnalytics';
import RiskManagement from './pages/RiskManagement';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Account from './pages/Account';

export const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public route */}
    <Route path="/auth" element={<Auth />} />

    {/* Private / Authenticated routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <TradingLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
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
      <Route path="account" element={<Account />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
