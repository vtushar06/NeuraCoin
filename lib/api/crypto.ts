// Base API configuration
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Free tier API limits (no key needed for basic usage)
const API_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
};

// Types for API responses
export interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinDetails {
  id: string;
  name: string;
  symbol: string;
  description: {
    en: string;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
  };
}

// API utility functions
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = API_CONFIG.maxRetries): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`API call failed, retrying... (${retries} attempts left)`);
      await wait(API_CONFIG.retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Main API functions
export const cryptoAPI = {
  // Get top cryptocurrencies by market cap
  async getTopCryptos(limit: number = 50, currency: string = 'usd'): Promise<CoinGeckoPrice[]> {
    try {
      const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&locale=en`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching top cryptos:', error);
      return getFallbackData();
    }
  },

  // Get specific coin details
  async getCoinDetails(coinId: string): Promise<CoinDetails | null> {
    try {
      const url = `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error(`Error fetching details for ${coinId}:`, error);
      return null;
    }
  },

  // Search cryptocurrencies
  async searchCoins(query: string): Promise<any[]> {
    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      return data.coins || [];
    } catch (error) {
      console.error('Error searching coins:', error);
      return [];
    }
  },

  // Get price for specific coins
  async getPrices(coinIds: string[], currency: string = 'usd'): Promise<Record<string, number>> {
    try {
      const ids = coinIds.join(',');
      const url = `${COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=${currency}`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      // Transform response to simple price mapping
      const prices: Record<string, number> = {};
      for (const [coinId, priceData] of Object.entries(data)) {
        prices[coinId] = (priceData as any)[currency];
      }

      return prices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
    }
  },

  // Get global market data
  async getGlobalData(): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/global`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      return data.data;
    } catch (error) {
      console.error('Error fetching global data:', error);
      return null;
    }
  },

  // Get trending coins
  async getTrending(): Promise<any[]> {
    try {
      const url = `${COINGECKO_BASE_URL}/search/trending`;
      
      const response = await fetchWithRetry(url);
      const data = await response.json();

      return data.coins || [];
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return [];
    }
  },
};

// Fallback data when API fails
function getFallbackData(): CoinGeckoPrice[] {
  return [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 43750.21,
      market_cap: 857234000000,
      market_cap_rank: 1,
      fully_diluted_valuation: null,
      total_volume: 23450000000,
      high_24h: 44200,
      low_24h: 43100,
      price_change_24h: 1250.21,
      price_change_percentage_24h: 2.94,
      market_cap_change_24h: 24500000000,
      market_cap_change_percentage_24h: 2.94,
      circulating_supply: 19000000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 69045,
      ath_change_percentage: -36.65,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: 67.81,
      atl_change_percentage: 64404.86,
      atl_date: '2013-07-06T00:00:00.000Z',
      last_updated: new Date().toISOString(),
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 2580.75,
      market_cap: 310450000000,
      market_cap_rank: 2,
      fully_diluted_valuation: null,
      total_volume: 15670000000,
      high_24h: 2650,
      low_24h: 2520,
      price_change_24h: -31.25,
      price_change_percentage_24h: -1.19,
      market_cap_change_24h: -3800000000,
      market_cap_change_percentage_24h: -1.21,
      circulating_supply: 120000000,
      total_supply: null,
      max_supply: null,
      ath: 4878.26,
      ath_change_percentage: -47.08,
      ath_date: '2021-11-10T14:24:19.604Z',
      atl: 0.432979,
      atl_change_percentage: 595672.44,
      atl_date: '2015-10-20T00:00:00.000Z',
      last_updated: new Date().toISOString(),
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      current_price: 315.42,
      market_cap: 47234000000,
      market_cap_rank: 3,
      fully_diluted_valuation: null,
      total_volume: 890000000,
      high_24h: 325,
      low_24h: 310,
      price_change_24h: 8.15,
      price_change_percentage_24h: 2.65,
      market_cap_change_24h: 1200000000,
      market_cap_change_percentage_24h: 2.61,
      circulating_supply: 150000000,
      total_supply: 200000000,
      max_supply: 200000000,
      ath: 686.31,
      ath_change_percentage: -54.05,
      ath_date: '2021-05-10T07:24:17.097Z',
      atl: 0.0398177,
      atl_change_percentage: 792113.78,
      atl_date: '2017-10-19T00:00:00.000Z',
      last_updated: new Date().toISOString(),
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      current_price: 0.45,
      market_cap: 16000000000,
      market_cap_rank: 4,
      fully_diluted_valuation: null,
      total_volume: 450000000,
      high_24h: 0.48,
      low_24h: 0.43,
      price_change_24h: 0.02,
      price_change_percentage_24h: 4.65,
      market_cap_change_24h: 700000000,
      market_cap_change_percentage_24h: 4.58,
      circulating_supply: 35000000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      ath: 3.09,
      ath_change_percentage: -85.44,
      ath_date: '2021-09-02T06:00:10.474Z',
      atl: 0.01925275,
      atl_change_percentage: 2238.77,
      atl_date: '2020-03-13T02:22:55.391Z',
      last_updated: new Date().toISOString(),
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      current_price: 95.82,
      market_cap: 45000000000,
      market_cap_rank: 5,
      fully_diluted_valuation: null,
      total_volume: 2100000000,
      high_24h: 98.5,
      low_24h: 92.1,
      price_change_24h: 3.72,
      price_change_percentage_24h: 4.04,
      market_cap_change_24h: 1800000000,
      market_cap_change_percentage_24h: 4.17,
      circulating_supply: 470000000,
      total_supply: 580000000,
      max_supply: null,
      ath: 259.96,
      ath_change_percentage: -63.12,
      ath_date: '2021-11-06T21:54:35.825Z',
      atl: 0.500801,
      atl_change_percentage: 19036.28,
      atl_date: '2020-05-11T19:35:23.449Z',
      last_updated: new Date().toISOString(),
    },
  ];
}
