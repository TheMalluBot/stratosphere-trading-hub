
import { useState, useEffect, useCallback } from 'react';
import { TradingEngine, StrategyExecutionConfig, StrategyExecution, ExecutionUpdate } from '@/lib/trading/TradingEngine';
import { toast } from 'sonner';

export interface TradingMetrics {
  totalPnL: number;
  totalTrades: number;
  averageWinRate: number;
  activeStrategies: number;
}

export function useAlgoTrading() {
  const [tradingEngine] = useState(() => new TradingEngine());
  const [activeStrategies, setActiveStrategies] = useState<StrategyExecution[]>([]);
  const [metrics, setMetrics] = useState<TradingMetrics>({
    totalPnL: 0,
    totalTrades: 0,
    averageWinRate: 0,
    activeStrategies: 0
  });

  const refreshActiveStrategies = useCallback(() => {
    const strategies = tradingEngine.getActiveExecutions();
    setActiveStrategies(strategies);
    
    // Calculate overall metrics
    const totalPnL = strategies.reduce((sum, s) => sum + s.pnl, 0);
    const totalTrades = strategies.reduce((sum, s) => sum + s.totalTrades, 0);
    const avgWinRate = strategies.length > 0 
      ? strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length 
      : 0;

    setMetrics({
      totalPnL,
      totalTrades,
      averageWinRate: avgWinRate,
      activeStrategies: strategies.length
    });
  }, [tradingEngine]);

  const startStrategy = async (config: StrategyExecutionConfig): Promise<string> => {
    try {
      const executionId = await tradingEngine.startStrategy(config);
      
      // Set up real-time updates
      tradingEngine.onExecutionUpdate(executionId, (update: ExecutionUpdate) => {
        setActiveStrategies(prev => 
          prev.map(strategy => 
            strategy.executionId === executionId 
              ? { 
                  ...strategy, 
                  pnl: update.pnl, 
                  totalTrades: update.totalTrades,
                  winRate: update.winRate,
                  lastSignal: update.lastSignal
                }
              : strategy
          )
        );
      });
      
      // Refresh the list
      setTimeout(refreshActiveStrategies, 500);
      
      toast.success(`Strategy "${config.strategyName}" started successfully`);
      return executionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to start strategy: ${errorMessage}`);
      throw error;
    }
  };

  const stopStrategy = async (executionId: string): Promise<void> => {
    try {
      await tradingEngine.stopStrategy(executionId);
      refreshActiveStrategies();
      toast.success('Strategy stopped successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to stop strategy: ${errorMessage}`);
      throw error;
    }
  };

  const pauseStrategy = async (executionId: string): Promise<void> => {
    // For now, we'll implement pause as stop
    await stopStrategy(executionId);
    toast.info('Strategy paused (currently same as stop)');
  };

  const getAvailableStrategies = useCallback(() => {
    return tradingEngine.getAvailableStrategies();
  }, [tradingEngine]);

  // Refresh active strategies every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshActiveStrategies, 5000);
    return () => clearInterval(interval);
  }, [refreshActiveStrategies]);

  return {
    activeStrategies,
    metrics,
    startStrategy,
    stopStrategy,
    pauseStrategy,
    getAvailableStrategies,
    tradingEngine
  };
}
