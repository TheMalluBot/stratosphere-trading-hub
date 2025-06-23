
import { useState, useEffect } from 'react';
import { portfolioManager, Portfolio } from '@/services/portfolioManager';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => portfolioManager.getPortfolio());

  useEffect(() => {
    const handleUpdate = (updatedPortfolio: Portfolio) => {
      setPortfolio(updatedPortfolio);
    };

    portfolioManager.subscribe(handleUpdate);

    return () => {
      portfolioManager.unsubscribe(handleUpdate);
    };
  }, []);

  const refreshPortfolio = () => {
    portfolioManager.refreshPortfolio();
  };

  return {
    portfolio,
    refreshPortfolio,
    isLoading: portfolio.isLoading,
    lastUpdate: portfolio.lastUpdate
  };
};
