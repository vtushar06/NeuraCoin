import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoHolding {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "buy" | "sell";
  symbol: string;
  name: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  PORTFOLIOS: "@neuracoin:portfolios",
  HOLDINGS: "@neuracoin:holdings",
  TRANSACTIONS: "@neuracoin:transactions",
};

export const portfolioService = {
  // Portfolio operations
  async createPortfolio(userId: string): Promise<string> {
    try {
      const portfolios = await this.getPortfolios();
      const portfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const now = new Date().toISOString();

      const newPortfolio: Portfolio = {
        id: portfolioId,
        userId,
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        createdAt: now,
        updatedAt: now,
      };

      portfolios.push(newPortfolio);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PORTFOLIOS,
        JSON.stringify(portfolios)
      );
      return portfolioId;
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  },

  async getPortfolios(): Promise<Portfolio[]> {
    try {
      const portfolios = await AsyncStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      return portfolios ? JSON.parse(portfolios) : [];
    } catch (error) {
      console.error("Error getting portfolios:", error);
      return [];
    }
  },

  async getPortfolio(userId: string): Promise<Portfolio | null> {
    try {
      const portfolios = await this.getPortfolios();
      return portfolios.find((p) => p.userId === userId) || null;
    } catch (error) {
      console.error("Error getting portfolio:", error);
      return null;
    }
  },

  // Holdings operations
  async addHolding(portfolioId: string, cryptoData: any): Promise<void> {
    try {
      const holdings = await this.getHoldings();
      const holdingId = `holding_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const now = new Date().toISOString();

      const newHolding: CryptoHolding = {
        id: holdingId,
        portfolioId,
        symbol: cryptoData.symbol,
        name: cryptoData.name,
        amount: cryptoData.amount,
        averageBuyPrice: cryptoData.price,
        currentPrice: cryptoData.price,
        totalValue: cryptoData.amount * cryptoData.price,
        gain: 0,
        gainPercent: 0,
        createdAt: now,
        updatedAt: now,
      };

      holdings.push(newHolding);
      await AsyncStorage.setItem(
        STORAGE_KEYS.HOLDINGS,
        JSON.stringify(holdings)
      );
    } catch (error) {
      console.error("Error adding holding:", error);
      throw error;
    }
  },

  async getHoldings(portfolioId?: string): Promise<CryptoHolding[]> {
    try {
      const holdings = await AsyncStorage.getItem(STORAGE_KEYS.HOLDINGS);
      const allHoldings = holdings ? JSON.parse(holdings) : [];

      if (portfolioId) {
        return allHoldings.filter(
          (h: CryptoHolding) => h.portfolioId === portfolioId
        );
      }

      return allHoldings;
    } catch (error) {
      console.error("Error getting holdings:", error);
      return [];
    }
  },

  // Transaction operations
  async addTransaction(userId: string, transactionData: any): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const now = new Date().toISOString();

      const newTransaction: Transaction = {
        id: transactionId,
        userId,
        type: transactionData.type,
        symbol: transactionData.symbol,
        name: transactionData.name,
        amount: transactionData.amount,
        price: transactionData.price,
        total: transactionData.total,
        fee: transactionData.fee || 0,
        status: "completed",
        createdAt: now,
        updatedAt: now,
      };

      transactions.push(newTransaction);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  async getTransactions(userId?: string): Promise<Transaction[]> {
    try {
      const transactions = await AsyncStorage.getItem(
        STORAGE_KEYS.TRANSACTIONS
      );
      const allTransactions = transactions ? JSON.parse(transactions) : [];

      if (userId) {
        return allTransactions
          .filter((t: Transaction) => t.userId === userId)
          .sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }

      return allTransactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },
};
