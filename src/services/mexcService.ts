
export interface MexcTickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  prevClosePrice: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  count: number;
}

export interface MexcKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export class MexcService {
  private baseUrl = 'https://api.mexc.com/api/v3';

  async getTicker24hr(symbol: string): Promise<MexcTickerData> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`MEXC API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('MEXC getTicker24hr error:', error);
      throw error;
    }
  }

  async getAllTickers(): Promise<MexcTickerData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);
      if (!response.ok) {
        throw new Error(`MEXC API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('MEXC getAllTickers error:', error);
      throw error;
    }
  }

  async getKlines(symbol: string, interval: string = '1d', limit: number = 100): Promise<MexcKlineData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`MEXC API error: ${response.status}`);
      }
      const data = await response.json();
      return data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10]
      }));
    } catch (error) {
      console.error('MEXC getKlines error:', error);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`MEXC API error: ${response.status}`);
      }
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('MEXC getCurrentPrice error:', error);
      throw error;
    }
  }
}
