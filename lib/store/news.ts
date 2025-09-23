import { create } from "zustand";
import { newsAPI, type NewsArticle } from "@/lib/api/news";

interface NewsState {
  // Data
  allNews: NewsArticle[];
  cryptoNews: NewsArticle[];
  marketNews: NewsArticle[];
  regulatoryNews: NewsArticle[];
  analysisNews: NewsArticle[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error and meta
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchAllNews: (category?: string) => Promise<void>;
  fetchCryptoNews: () => Promise<void>;
  fetchMarketNews: () => Promise<void>;
  fetchRegulatoryNews: () => Promise<void>;
  fetchAnalysisNews: () => Promise<void>;
  searchNews: (query: string) => Promise<NewsArticle[]>;
  refreshNews: () => Promise<void>;
  clearError: () => void;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  // Initial state
  allNews: [],
  cryptoNews: [],
  marketNews: [],
  regulatoryNews: [],
  analysisNews: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,

  // Fetch all news
  fetchAllNews: async (category?: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log("Fetching all news...");
      const news = await newsAPI.getAllNews(category, 50);

      set({
        allNews: news,
        isLoading: false,
        lastUpdated: new Date(),
      });

      console.log(`Successfully fetched ${news.length} news articles`);
    } catch (error) {
      console.error("Error fetching all news:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch news",
        isLoading: false,
      });
    }
  },

  // Fetch crypto news
  fetchCryptoNews: async () => {
    try {
      const news = await newsAPI.getCryptoNews(20);
      set({ cryptoNews: news });
    } catch (error) {
      console.error("Error fetching crypto news:", error);
    }
  },

  // Fetch market news
  fetchMarketNews: async () => {
    try {
      const news = await newsAPI.getMarketNews(20);
      set({ marketNews: news });
    } catch (error) {
      console.error("Error fetching market news:", error);
    }
  },

  // Fetch regulatory news
  fetchRegulatoryNews: async () => {
    try {
      const news = await newsAPI.getRegulatoryNews(20);
      set({ regulatoryNews: news });
    } catch (error) {
      console.error("Error fetching regulatory news:", error);
    }
  },

  // Fetch analysis news
  fetchAnalysisNews: async () => {
    try {
      const news = await newsAPI.getAnalysisNews(20);
      set({ analysisNews: news });
    } catch (error) {
      console.error("Error fetching analysis news:", error);
    }
  },

  // Search news
  searchNews: async (query: string) => {
    try {
      return await newsAPI.searchNews(query, 20);
    } catch (error) {
      console.error("Error searching news:", error);
      return [];
    }
  },

  // Refresh all news
  refreshNews: async () => {
    set({ isRefreshing: true });

    const {
      fetchAllNews,
      fetchCryptoNews,
      fetchMarketNews,
      fetchRegulatoryNews,
      fetchAnalysisNews,
    } = get();

    try {
      await Promise.all([
        fetchAllNews(),
        fetchCryptoNews(),
        fetchMarketNews(),
        fetchRegulatoryNews(),
        fetchAnalysisNews(),
      ]);
    } finally {
      set({ isRefreshing: false });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

// Auto-refresh functionality
let newsRefreshInterval: NodeJS.Timeout | null = null;

export const startNewsAutoRefresh = (intervalMinutes: number = 15) => {
  if (newsRefreshInterval) {
    clearInterval(newsRefreshInterval);
  }

  newsRefreshInterval = setInterval(
    () => {
      console.log("Auto-refreshing news...");
      useNewsStore.getState().refreshNews();
    },
    intervalMinutes * 60 * 1000
  );
};

export const stopNewsAutoRefresh = () => {
  if (newsRefreshInterval) {
    clearInterval(newsRefreshInterval);
    newsRefreshInterval = null;
  }
};
