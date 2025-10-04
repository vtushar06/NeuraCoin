import { create } from "zustand";
import { cryptoAPI, type CoinGeckoPrice } from "@/lib/api/crypto";

// Enhanced crypto data interface
export interface CryptoData extends CoinGeckoPrice {
  // Add any additional computed properties
  priceChangeColor?: string;
  formattedPrice?: string;
  formattedMarketCap?: string;
}

interface CryptoState {
  // Data
  topCryptos: CryptoData[];
  trendingCryptos: any[];
  globalData: any;

  // Loading states
  isLoading: boolean;
  isTrendingLoading: boolean;
  isGlobalLoading: boolean;

  // Error states
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchTopCryptos: (limit?: number) => Promise<void>;
  fetchTrendingCryptos: () => Promise<void>;
  fetchGlobalData: () => Promise<void>;
  searchCryptos: (query: string) => Promise<CryptoData[]>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

// Helper function to enhance crypto data
const enhanceCryptoData = (crypto: CoinGeckoPrice): CryptoData => {
  return {
    ...crypto,
    priceChangeColor:
      crypto.price_change_percentage_24h >= 0 ? "#10B981" : "#EF4444",
    formattedPrice: formatPrice(crypto.current_price),
    formattedMarketCap: formatMarketCap(crypto.market_cap),
  };
};

// Helper formatting functions
const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString()}`;
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

export const useCryptoStore = create<CryptoState>((set, get) => ({
  // Initial state
  topCryptos: [],
  trendingCryptos: [],
  globalData: null,
  isLoading: false,
  isTrendingLoading: false,
  isGlobalLoading: false,
  error: null,
  lastUpdated: null,

  // Fetch top cryptocurrencies
  fetchTopCryptos: async (limit = 50) => {
    set({ isLoading: true, error: null });

    try {
      console.log("Fetching top cryptos...");
      const data = await cryptoAPI.getTopCryptos(limit);

      const enhancedData = data.map(enhanceCryptoData);

      set({
        topCryptos: enhancedData,
        isLoading: false,
        lastUpdated: new Date(),
      });

      console.log(
        `Successfully fetched ${enhancedData.length} cryptocurrencies`
      );
    } catch (error) {
      console.warn("⚠️ API temporarily unavailable, using cached/fallback data");
      
      // Don't set error state if we already have data (fallback is working)
      const currentData = get().topCryptos;
      if (currentData.length === 0) {
        set({
          error: "Using demo data - API temporarily unavailable",
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  // Fetch trending cryptocurrencies
  fetchTrendingCryptos: async () => {
    set({ isTrendingLoading: true });

    try {
      const data = await cryptoAPI.getTrending();
      set({
        trendingCryptos: data,
        isTrendingLoading: false,
      });
    } catch (error) {
      console.error("Error fetching trending cryptos:", error);
      set({ isTrendingLoading: false });
    }
  },

  // Fetch global market data
  fetchGlobalData: async () => {
    set({ isGlobalLoading: true });

    try {
      const data = await cryptoAPI.getGlobalData();
      set({
        globalData: data,
        isGlobalLoading: false,
      });
    } catch (error) {
      console.error("Error fetching global ", error);
      set({ isGlobalLoading: false });
    }
  },

  // Search cryptocurrencies
  searchCryptos: async (query: string) => {
    try {
      if (!query.trim()) return [];

      const searchResults = await cryptoAPI.searchCoins(query);

      // Get detailed price data for search results
      const coinIds = searchResults.slice(0, 10).map((coin: any) => coin.id);
      const topCryptos = get().topCryptos;

      // Filter existing data or fetch new data
      const results = coinIds
        .map((id) => topCryptos.find((crypto) => crypto.id === id))
        .filter((crypto): crypto is CryptoData => crypto !== undefined);

      return results;
    } catch (error) {
      console.error("Error searching cryptos:", error);
      return [];
    }
  },

  // Refresh all data
  refreshAll: async () => {
    const { fetchTopCryptos, fetchTrendingCryptos, fetchGlobalData } = get();

    await Promise.all([
      fetchTopCryptos(),
      fetchTrendingCryptos(),
      fetchGlobalData(),
    ]);
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

// Auto-refresh functionality
let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const startAutoRefresh = (intervalMinutes: number = 5) => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(
    () => {
      console.log("Auto-refreshing crypto data...");
      useCryptoStore.getState().fetchTopCryptos();
    },
    intervalMinutes * 60 * 1000
  );
};

export const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
