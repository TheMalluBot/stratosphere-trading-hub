
export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinGeckoPriceData {
  [coinId: string]: {
    [currency: string]: number;
  };
}

export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getMarketData(
    vsCurrency: string = 'usd',
    order: string = 'market_cap_desc',
    perPage: number = 100,
    page: number = 1
  ): Promise<CoinGeckoMarketData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=${vsCurrency}&order=${order}&per_page=${perPage}&page=${page}&sparkline=false`
      );
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('CoinGecko getMarketData error:', error);
      throw error;
    }
  }

  async getPrice(coinIds: string[], vsCurrencies: string[] = ['usd']): Promise<CoinGeckoPriceData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${vsCurrencies.join(',')}&include_24hr_change=true`
      );
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('CoinGecko getPrice error:', error);
      throw error;
    }
  }

  async getTrendingCoins(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/search/trending`);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('CoinGecko getTrendingCoins error:', error);
      throw error;
    }
  }

  async getGlobalData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/global`);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('CoinGecko getGlobalData error:', error);
      throw error;
    }
  }
}
