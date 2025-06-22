
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

  const mexcService = new MexcService();
  const coinGeckoService = new CoinGeckoService();

  const fetchCryptoData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch top cryptocurrencies from CoinGecko
      const coinGeckoData = await coinGeckoService.getMarketData('usd', 'market_cap_desc', 10);
      
      // Transform CoinGecko data to our format
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
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to fetch cryptocurrency data');
      
      // Fallback to basic MEXC data if CoinGecko fails
      try {
        const btcTicker = await mexcService.getTicker24hr('BTCUSDT');
        const ethTicker = await mexcService.getTicker24hr('ETHUSDT');
        
        const fallbackData: CryptoMarketData[] = [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: parseFloat(btcTicker.lastPrice),
            change: parseFloat(btcTicker.priceChange),
            changePercent: parseFloat(btcTicker.priceChangePercent),
            volume: parseFloat(btcTicker.volume)
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: parseFloat(ethTicker.lastPrice),
            change: parseFloat(ethTicker.priceChange),
            changePercent: parseFloat(ethTicker.priceChangePercent),
            volume: parseFloat(ethTicker.volume)
          }
        ];
        
        setMarketData(fallbackData);
        setError('Using limited data from MEXC API');
      } catch (fallbackErr) {
        console.error('Fallback API also failed:', fallbackErr);
        setError('All cryptocurrency APIs are currently unavailable');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchCryptoData();
  }, [fetchCryptoData]);

  useEffect(() => {
    // Initial fetch
    fetchCryptoData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  return {
    marketData,
    loading,
    error,
    lastUpdate,
    refreshData
  };
}
