
import { useState, useEffect, useCallback } from 'react';
import { MexcService } from '@/services/mexcService';
import { CoinGeckoService } from '@/services/coinGeckoService';

export interface CryptoMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

export function useCryptoData() {
  const [marketData, setMarketData] = useState<CryptoMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [apiSource, setApiSource] = useState<'coingecko' | 'mexc' | 'demo'>('coingecko');

  const mexcService = new MexcService();
  const coinGeckoService = new CoinGeckoService();

  const fetchCryptoData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching cryptocurrency data...');

      // Try CoinGecko first (more reliable)
      try {
        const coinGeckoData = await coinGeckoService.getMarketData('usd', 'market_cap_desc', 20);
        
        const transformedData: CryptoMarketData[] = coinGeckoData.map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_24h,
          changePercent: coin.price_change_percentage_24h,
          volume: coin.total_volume,
          marketCap: coin.market_cap,
          high24h: coin.high_24h,
          low24h: coin.low_24h
        }));

        setMarketData(transformedData);
        setApiSource('coingecko');
        setLastUpdate(new Date());
        console.log('Successfully fetched data from CoinGecko');
        
      } catch (coinGeckoError) {
        console.warn('CoinGecko failed, trying MEXC:', coinGeckoError);
        
        // Fallback to MEXC
        try {
          const mexcTickers = await mexcService.getAllTickers();
          const popularPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT'];
          
          const mexcData: CryptoMarketData[] = mexcTickers
            .filter(ticker => popularPairs.includes(ticker.symbol))
            .map(ticker => ({
              symbol: ticker.symbol.replace('USDT', ''),
              name: ticker.symbol.replace('USDT', ''),
              price: parseFloat(ticker.lastPrice),
              change: parseFloat(ticker.priceChange),
              changePercent: parseFloat(ticker.priceChangePercent),
              volume: parseFloat(ticker.volume),
              high24h: parseFloat(ticker.highPrice),
              low24h: parseFloat(ticker.lowPrice)
            }));

          setMarketData(mexcData);
          setApiSource('mexc');
          setLastUpdate(new Date());
          console.log('Successfully fetched data from MEXC');
          
        } catch (mexcError) {
          console.warn('MEXC also failed, using demo data:', mexcError);
          
          // Ultimate fallback to demo data
          const demoData: CryptoMarketData[] = [
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              price: 45000 + (Math.random() - 0.5) * 2000,
              change: (Math.random() - 0.5) * 1000,
              changePercent: (Math.random() - 0.5) * 10,
              volume: 25000000000,
              marketCap: 900000000000,
              high24h: 46000,
              low24h: 44000
            },
            {
              symbol: 'ETH',
              name: 'Ethereum',
              price: 2500 + (Math.random() - 0.5) * 200,
              change: (Math.random() - 0.5) * 100,
              changePercent: (Math.random() - 0.5) * 8,
              volume: 15000000000,
              marketCap: 300000000000,
              high24h: 2600,
              low24h: 2400
            },
            {
              symbol: 'BNB',
              name: 'BNB',
              price: 300 + (Math.random() - 0.5) * 30,
              change: (Math.random() - 0.5) * 20,
              changePercent: (Math.random() - 0.5) * 6,
              volume: 800000000,
              marketCap: 50000000000,
              high24h: 315,
              low24h: 285
            },
            {
              symbol: 'SOL',
              name: 'Solana',
              price: 100 + (Math.random() - 0.5) * 20,
              change: (Math.random() - 0.5) * 10,
              changePercent: (Math.random() - 0.5) * 12,
              volume: 2000000000,
              marketCap: 40000000000,
              high24h: 110,
              low24h: 90
            },
            {
              symbol: 'XRP',
              name: 'XRP',
              price: 0.5 + (Math.random() - 0.5) * 0.1,
              change: (Math.random() - 0.5) * 0.05,
              changePercent: (Math.random() - 0.5) * 8,
              volume: 1500000000,
              marketCap: 25000000000,
              high24h: 0.55,
              low24h: 0.45
            },
            {
              symbol: 'ADA',
              name: 'Cardano',
              price: 0.35 + (Math.random() - 0.5) * 0.05,
              change: (Math.random() - 0.5) * 0.02,
              changePercent: (Math.random() - 0.5) * 6,
              volume: 500000000,
              marketCap: 12000000000,
              high24h: 0.38,
              low24h: 0.32
            }
          ];

          setMarketData(demoData);
          setApiSource('demo');
          setError('Using demo data - APIs unavailable');
          setLastUpdate(new Date());
        }
      }
      
    } catch (error) {
      console.error('All data sources failed:', error);
      setError('Failed to fetch cryptocurrency data from all sources');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    console.log('Manual refresh requested');
    fetchCryptoData();
  }, [fetchCryptoData]);

  useEffect(() => {
    // Initial fetch
    fetchCryptoData();

    // Set up periodic updates based on API source
    const updateInterval = apiSource === 'demo' ? 5000 : 30000; // Demo updates faster
    const interval = setInterval(() => {
      fetchCryptoData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fetchCryptoData, apiSource]);

  // Update demo data more frequently for realistic feel
  useEffect(() => {
    if (apiSource === 'demo' && marketData.length > 0) {
      const demoInterval = setInterval(() => {
        setMarketData(prevData => 
          prevData.map(coin => ({
            ...coin,
            price: coin.price * (1 + (Math.random() - 0.5) * 0.02),
            change: coin.change + (Math.random() - 0.5) * 5,
            changePercent: coin.changePercent + (Math.random() - 0.5) * 0.5
          }))
        );
        setLastUpdate(new Date());
      }, 3000);

      return () => clearInterval(demoInterval);
    }
  }, [apiSource, marketData.length]);

  return {
    marketData,
    loading,
    error,
    lastUpdate,
    refreshData,
    apiSource
  };
}
