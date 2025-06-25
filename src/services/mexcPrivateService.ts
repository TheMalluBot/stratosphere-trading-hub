
import { MexcHttpClient } from './mexc/MexcHttpClient';
import { MexcAuth } from './mexc/MexcAuth';

export interface AccountInfo {
  balances: {
    asset: string;
    free: string;
    locked: string;
  }[];
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface MexcOrder {
  orderId: string;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  timeInForce: string;
  type: string;
  side: string;
  time: number;
  updateTime: number;
}

export class MexcPrivateService {
  private httpClient = new MexcHttpClient();

  async getAccountInfo(): Promise<AccountInfo> {
    return this.httpClient.makePrivateRequest('/account');
  }

  async placeOrder(orderRequest: OrderRequest): Promise<MexcOrder> {
    const params: any = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      type: orderRequest.type,
      quantity: orderRequest.quantity
    };

    if (orderRequest.price) {
      params.price = orderRequest.price;
    }

    if (orderRequest.stopPrice) {
      params.stopPrice = orderRequest.stopPrice;
    }

    if (orderRequest.timeInForce) {
      params.timeInForce = orderRequest.timeInForce;
    } else if (orderRequest.type === 'LIMIT') {
      params.timeInForce = 'GTC';
    }

    return this.httpClient.makePrivateRequest('/order', 'POST', params);
  }

  async cancelOrder(symbol: string, orderId: string): Promise<any> {
    return this.httpClient.makePrivateRequest('/order', 'DELETE', {
      symbol,
      orderId
    });
  }

  async getOpenOrders(symbol?: string): Promise<MexcOrder[]> {
    const params: any = {};
    if (symbol) {
      params.symbol = symbol;
    }
    return this.httpClient.makePrivateRequest('/openOrders', 'GET', params);
  }

  async getAllOrders(symbol: string, limit: number = 500): Promise<MexcOrder[]> {
    return this.httpClient.makePrivateRequest('/allOrders', 'GET', {
      symbol,
      limit
    });
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<MexcOrder> {
    return this.httpClient.makePrivateRequest('/order', 'GET', {
      symbol,
      orderId
    });
  }

  static async isConfigured(): Promise<boolean> {
    return MexcAuth.isConfigured();
  }
}
