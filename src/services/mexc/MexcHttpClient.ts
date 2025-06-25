
import { MexcAuth } from './MexcAuth';

export class MexcHttpClient {
  private baseUrl = 'https://api.mexc.com/api/v3';
  private auth = new MexcAuth();

  async makePrivateRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE' = 'GET', 
    params: Record<string, any> = {}
  ): Promise<any> {
    await this.auth.ensureInitialized();
    
    const timestamp = Date.now();
    const requestParams = { ...params, timestamp };
    
    const signature = await this.auth.createSignature(requestParams);
    const finalParams = { ...requestParams, signature };

    const headers: HeadersInit = {
      'X-MEXC-APIKEY': this.auth.getApiKey(),
      'Content-Type': 'application/json'
    };

    let url = `${this.baseUrl}${endpoint}`;
    let body: string | undefined;

    if (method === 'GET') {
      const query = new URLSearchParams();
      Object.keys(finalParams).forEach(key => {
        query.append(key, finalParams[key].toString());
      });
      url += `?${query.toString()}`;
    } else {
      body = JSON.stringify(finalParams);
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`MEXC API Error: ${response.status} - ${errorData.msg || response.statusText}`);
    }

    return response.json();
  }
}
