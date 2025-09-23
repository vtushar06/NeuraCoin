import axios from "axios";
import type { CryptoData } from "@/lib/store/crypto";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

export const cryptoAPI = {
  getTopCryptos: async (limit = 20): Promise<CryptoData[]> => {
    try {
      const response = await api.get("/coins/markets", {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: "24h",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching top cryptocurrencies:", error);
      // Return mock data in case of API failure
      return getMockCryptoData();
    }
  },

  getCryptoDetails: async (id: string): Promise<CryptoData | null> => {
    try {
      const response = await api.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching crypto details:", error);
      return null;
    }
  },

  searchCryptos: async (query: string): Promise<CryptoData[]> => {
    try {
      const response = await api.get("/search", {
        params: { query },
      });
      return response.data.coins || [];
    } catch (error) {
      console.error("Error searching cryptocurrencies:", error);
      return [];
    }
  },

  getHistoricalData: async (id: string, days = 7): Promise<number[][]> => {
    try {
      const response = await api.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency: "usd",
          days,
        },
      });
      return response.data.prices || [];
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  },
};

// Mock data fallback
function getMockCryptoData(): CryptoData[] {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      current_price: 43750.21,
      price_change_percentage_24h: 2.45,
      market_cap: 857234000000,
      total_volume: 23450000000,
      image: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      current_price: 2580.75,
      price_change_percentage_24h: -1.23,
      market_cap: 310450000000,
      total_volume: 15670000000,
      image: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
    },
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      current_price: 0.43,
      price_change_percentage_24h: 5.67,
      market_cap: 15230000000,
      total_volume: 890000000,
      image: "https://assets.coingecko.com/coins/images/975/thumb/cardano.png",
    },
  ];
}
