// News API configuration
const NEWS_API_KEY = "demo"; // Replace with your actual NewsAPI key from newsapi.org
const NEWS_BASE_URL = "https://newsapi.org/v2";

// Alternative free news sources
const CRYPTO_NEWS_SOURCES = [
  "coindesk",
  "the-verge",
  "techcrunch",
  "reuters",
  "bloomberg",
];

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  source: {
    id: string;
    name: string;
  };
  url: string;
  urlToImage: string;
  publishedAt: string;
  category: "crypto" | "market" | "regulatory" | "analysis" | "general";
  sentiment?: "positive" | "negative" | "neutral";
}

// Mock news data for demo purposes
const getMockNewsData = (): NewsArticle[] => [
  {
    id: "1",
    title: "Bitcoin Surges Past $44,000 as Institutional Adoption Grows",
    description:
      "Bitcoin continues its upward momentum as major institutions announce new crypto investment strategies.",
    content:
      "Bitcoin has reached new heights this week, surging past the $44,000 mark amid growing institutional adoption. Major financial institutions are increasingly integrating cryptocurrency into their investment portfolios...",
    author: "Sarah Johnson",
    source: { id: "crypto-news", name: "Crypto Daily" },
    url: "https://example.com/bitcoin-surge",
    urlToImage:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    category: "crypto",
    sentiment: "positive",
  },
  {
    id: "2",
    title: "Ethereum 2.0 Upgrade Shows Promising Network Performance",
    description:
      "The latest Ethereum upgrade demonstrates improved transaction speeds and reduced gas fees.",
    content:
      "Ethereum's recent network upgrade has shown significant improvements in transaction throughput and cost efficiency. Network validators report...",
    author: "Michael Chen",
    source: { id: "ethereum-news", name: "ETH Today" },
    url: "https://example.com/ethereum-upgrade",
    urlToImage:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    category: "crypto",
    sentiment: "positive",
  },
  {
    id: "3",
    title: "SEC Announces New Cryptocurrency Regulation Framework",
    description:
      "The Securities and Exchange Commission releases comprehensive guidelines for digital asset compliance.",
    content:
      "The Securities and Exchange Commission today announced a new regulatory framework aimed at providing clearer guidelines for cryptocurrency...",
    author: "Lisa Rodriguez",
    source: { id: "regulatory-news", name: "Financial Times" },
    url: "https://example.com/sec-regulation",
    urlToImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    category: "regulatory",
    sentiment: "neutral",
  },
  {
    id: "4",
    title: "DeFi Protocols Report Record TVL Growth in Q4",
    description:
      "Decentralized Finance platforms see unprecedented growth in total value locked.",
    content:
      "Decentralized Finance (DeFi) protocols have reported record-breaking growth in Total Value Locked (TVL) during the fourth quarter...",
    author: "David Park",
    source: { id: "defi-news", name: "DeFi Pulse" },
    url: "https://example.com/defi-growth",
    urlToImage:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    category: "analysis",
    sentiment: "positive",
  },
  {
    id: "5",
    title: "Central Bank Digital Currencies Gain Momentum Globally",
    description:
      "Major economies accelerate CBDC development and testing programs.",
    content:
      "Central banks worldwide are accelerating their digital currency initiatives, with several countries moving into advanced testing phases...",
    author: "Emma Thompson",
    source: { id: "cbdc-news", name: "Central Bank Review" },
    url: "https://example.com/cbdc-momentum",
    urlToImage:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    category: "market",
    sentiment: "neutral",
  },
  {
    id: "6",
    title: "NFT Market Shows Signs of Recovery After Bear Market",
    description:
      "Non-fungible token sales and floor prices indicate potential market recovery.",
    content:
      "The NFT market is showing early signs of recovery with increased trading volume and stabilizing floor prices across major collections...",
    author: "Alex Kim",
    source: { id: "nft-news", name: "NFT Insider" },
    url: "https://example.com/nft-recovery",
    urlToImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    category: "market",
    sentiment: "positive",
  },
  {
    id: "7",
    title: "Crypto Market Sentiment Analysis: Bulls vs Bears",
    description:
      "Technical analysis reveals mixed signals as traders remain cautiously optimistic.",
    content:
      "Market sentiment analysis shows a complex picture with bullish technical indicators competing with bearish macroeconomic concerns...",
    author: "Robert Singh",
    source: { id: "analysis-news", name: "Market Analytics Pro" },
    url: "https://example.com/sentiment-analysis",
    urlToImage:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    category: "analysis",
    sentiment: "neutral",
  },
];

const API_CONFIG = {
  timeout: 10000,
  maxRetries: 2,
};

// Utility function for API calls
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const newsAPI = {
  // Get crypto-related news
  async getCryptoNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      // For demo purposes, return mock data
      // In production, use real API:
      /*
      const url = `${NEWS_BASE_URL}/everything?q=cryptocurrency OR bitcoin OR ethereum&apiKey=${NEWS_API_KEY}&pageSize=${limit}&sortBy=publishedAt`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();
      return data.articles.map(transformNewsArticle);
      */

      return getMockNewsData()
        .filter((article) => article.category === "crypto")
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching crypto news:", error);
      return getMockNewsData().filter(
        (article) => article.category === "crypto"
      );
    }
  },

  // Get market analysis news
  async getMarketNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      return getMockNewsData()
        .filter((article) => article.category === "market")
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching market news:", error);
      return getMockNewsData().filter(
        (article) => article.category === "market"
      );
    }
  },

  // Get regulatory news
  async getRegulatoryNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      return getMockNewsData()
        .filter((article) => article.category === "regulatory")
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching regulatory news:", error);
      return getMockNewsData().filter(
        (article) => article.category === "regulatory"
      );
    }
  },

  // Get analysis and expert opinions
  async getAnalysisNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      return getMockNewsData()
        .filter((article) => article.category === "analysis")
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching analysis news:", error);
      return getMockNewsData().filter(
        (article) => article.category === "analysis"
      );
    }
  },

  // Get all news with optional category filter
  async getAllNews(
    category?: string,
    limit: number = 50
  ): Promise<NewsArticle[]> {
    try {
      let news = getMockNewsData();

      if (category && category !== "all") {
        news = news.filter((article) => article.category === category);
      }

      return news.slice(0, limit);
    } catch (error) {
      console.error("Error fetching all news:", error);
      return getMockNewsData();
    }
  },

  // Search news articles
  async searchNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const allNews = getMockNewsData();
      const filteredNews = allNews.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
      );

      return filteredNews.slice(0, limit);
    } catch (error) {
      console.error("Error searching news:", error);
      return [];
    }
  },
};

// Transform news article from API response (for real API integration)
const transformNewsArticle = (apiArticle: any): NewsArticle => {
  return {
    id: apiArticle.url || Date.now().toString(),
    title: apiArticle.title || "No Title",
    description: apiArticle.description || "",
    content: apiArticle.content || "",
    author: apiArticle.author || "Unknown",
    source: {
      id: apiArticle.source?.id || "unknown",
      name: apiArticle.source?.name || "Unknown Source",
    },
    url: apiArticle.url || "",
    urlToImage: apiArticle.urlToImage || "",
    publishedAt: apiArticle.publishedAt || new Date().toISOString(),
    category: "general",
    sentiment: "neutral",
  };
};
