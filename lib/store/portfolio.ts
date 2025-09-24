import { create } from "zustand";
import { useCryptoStore } from "./crypto";
import { useAuthStore } from "./auth";
import { storage } from "@/lib/storage/storage";
import type {
  PortfolioHolding,
  PortfolioSummary,
  PortfolioTransaction,
  PortfolioHistory,
} from "@/lib/types/portfolio";

interface PortfolioState {
  // Data
  holdings: PortfolioHolding[];
  summary: PortfolioSummary | null;
  transactions: PortfolioTransaction[];
  history: PortfolioHistory[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error handling
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  initializePortfolio: () => Promise<void>;
  updatePortfolioPrices: () => Promise<void>;
  addTransaction: (
    transaction: Omit<PortfolioTransaction, "id" | "timestamp">
  ) => Promise<void>;
  addHolding: (
    cryptoId: string,
    amount: number,
    averageBuyPrice: number
  ) => Promise<void>;
  updateHolding: (
    cryptoId: string,
    amount: number,
    price: number,
    type: "buy" | "sell"
  ) => Promise<void>;
  calculateSummary: () => void;
  refreshPortfolio: () => Promise<void>;
  clearUserData: () => Promise<void>;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Initial state
  holdings: [],
  summary: null,
  transactions: [],
  history: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,

  // Clear user-specific data
  clearUserData: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const holdingsKey = `portfolio_holdings_${user.id}`;
      const transactionsKey = `portfolio_transactions_${user.id}`;
      const historyKey = `portfolio_history_${user.id}`;
      const initKey = `portfolio_initialized_${user.id}`;

      await storage.removeItem(holdingsKey);
      await storage.removeItem(transactionsKey);
      await storage.removeItem(historyKey);
      await storage.removeItem(initKey);

      set({
        holdings: [],
        summary: null,
        transactions: [],
        history: [],
        error: null,
      });

      console.log("✅ User portfolio data cleared");
    } catch (error) {
      console.error("Error clearing user portfolio ", error);
    }
  },

  // Initialize portfolio
  initializePortfolio: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.log("❌ No user found for portfolio initialization");
      return;
    }

    set({ isLoading: true });

    try {
      const holdingsKey = `portfolio_holdings_${user.id}`;
      const transactionsKey = `portfolio_transactions_${user.id}`;
      const historyKey = `portfolio_history_${user.id}`;
      const initKey = `portfolio_initialized_${user.id}`;

      // Try to load existing portfolio data
      const existingHoldings =
        await storage.getObject<PortfolioHolding[]>(holdingsKey);
      const existingTransactions =
        await storage.getObject<PortfolioTransaction[]>(transactionsKey);
      const existingHistory =
        await storage.getObject<PortfolioHistory[]>(historyKey);
      const wasInitialized = await storage.getItem(initKey);

      console.log(`🔍 Debug portfolio keys for user ${user.id}:`);
      console.log(`📦 HoldingsKey: ${holdingsKey}`);
      console.log(`📦 TransactionsKey: ${transactionsKey}`);
      console.log(`📦 InitKey: ${initKey}`);
      console.log(`💾 Existing holdings found:`, !!existingHoldings);
      console.log(
        `💾 Existing transactions count:`,
        existingTransactions?.length || 0
      );
      console.log(`💾 Was initialized:`, wasInitialized);

      if (existingHoldings && existingTransactions && wasInitialized) {
        // EXISTING USER - Load their data
        console.log(
          `🔄 Loading existing portfolio for user ${user.firstName}...`
        );

        set({
          holdings: existingHoldings,
          transactions: existingTransactions,
          history: existingHistory || [],
          isLoading: false,
        });

        // Calculate summary from existing data
        get().calculateSummary();

        console.log(
          `✅ Portfolio loaded for existing user ${user.firstName}: ${existingHoldings.length} holdings`
        );
      } else {
        // NEW USER - Create starter portfolio
        console.log(
          `🆕 Creating starter portfolio for user ${user.firstName}...`
        );

        const starterHolding: PortfolioHolding = {
          id: `holding_${Date.now()}`,
          cryptoId: "bitcoin",
          cryptoName: "Bitcoin",
          cryptoSymbol: "BTC",
          cryptoImage:
            "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          amount: 0.1,
          averageBuyPrice: 45000,
          currentPrice: 45000,
          totalInvested: 4500,
          currentValue: 4500,
          profitLoss: 0,
          profitLossPercent: 0,
          lastUpdated: new Date(),
        };

        const starterTransaction: PortfolioTransaction = {
          id: `portfolio_tx_${Date.now()}`,
          type: "buy",
          cryptoId: "bitcoin",
          cryptoName: "Bitcoin",
          cryptoSymbol: "BTC",
          amount: 0.1,
          price: 45000,
          totalValue: 4500,
          fee: 0,
          timestamp: new Date(),
        };

        const newHoldings = [starterHolding];
        const newTransactions = [starterTransaction];

        // Save to storage
        await storage.setObject(holdingsKey, newHoldings);
        await storage.setObject(transactionsKey, newTransactions);
        await storage.setObject(historyKey, []);
        await storage.setItem(initKey, "true");

        set({
          holdings: newHoldings,
          transactions: newTransactions,
          history: [],
          isLoading: false,
        });

        // Calculate summary
        get().calculateSummary();

        console.log(
          `✅ Starter portfolio created for user ${user.firstName}: 1 holdings`
        );
      }
    } catch (error) {
      console.error("❌ Error initializing portfolio:", error);
      set({ isLoading: false, error: "Failed to initialize portfolio" });
    }
  },

  // Add new holding to portfolio
  addHolding: async (
    cryptoId: string,
    amount: number,
    averageBuyPrice: number
  ) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { topCryptos } = useCryptoStore.getState();
      const crypto = topCryptos.find((c) => c.id === cryptoId);

      if (!crypto) {
        throw new Error("Cryptocurrency not found");
      }

      const { holdings } = get();
      const existingHoldingIndex = holdings.findIndex(
        (h) => h.cryptoId === cryptoId
      );

      let updatedHoldings: PortfolioHolding[];

      if (existingHoldingIndex !== -1) {
        // Update existing holding
        const existingHolding = holdings[existingHoldingIndex];
        const totalAmount = existingHolding.amount + amount;
        const totalInvested =
          existingHolding.totalInvested + amount * averageBuyPrice;
        const newAveragePrice = totalInvested / totalAmount;
        const currentValue = totalAmount * crypto.current_price;

        const updatedHolding: PortfolioHolding = {
          ...existingHolding,
          amount: totalAmount,
          averageBuyPrice: newAveragePrice,
          currentPrice: crypto.current_price,
          totalInvested,
          currentValue,
          profitLoss: currentValue - totalInvested,
          profitLossPercent:
            totalInvested > 0
              ? ((currentValue - totalInvested) / totalInvested) * 100
              : 0,
          lastUpdated: new Date(),
        };

        updatedHoldings = holdings.map((holding, index) =>
          index === existingHoldingIndex ? updatedHolding : holding
        );
      } else {
        // Create new holding
        const totalInvested = amount * averageBuyPrice;
        const currentValue = amount * crypto.current_price;

        const newHolding: PortfolioHolding = {
          id: `holding_${cryptoId}_${Date.now()}`,
          cryptoId: crypto.id,
          cryptoName: crypto.name,
          cryptoSymbol: crypto.symbol.toUpperCase(),
          cryptoImage: crypto.image,
          amount,
          averageBuyPrice,
          currentPrice: crypto.current_price,
          totalInvested,
          currentValue,
          profitLoss: currentValue - totalInvested,
          profitLossPercent:
            totalInvested > 0
              ? ((currentValue - totalInvested) / totalInvested) * 100
              : 0,
          lastUpdated: new Date(),
        };

        updatedHoldings = [...holdings, newHolding];
      }

      // Save to user-specific storage
      const holdingsKey = `portfolio_holdings_${user.id}`;
      await storage.setObject(holdingsKey, updatedHoldings);

      set({
        holdings: updatedHoldings,
        lastUpdated: new Date(),
      });

      // Recalculate summary
      get().calculateSummary();

      console.log("✅ Holding added/updated:", cryptoId, amount);
    } catch (error) {
      console.error("❌ Error adding holding:", error);
      throw error;
    }
  },

  // Update existing holding (for buy/sell operations)
  updateHolding: async (
    cryptoId: string,
    amount: number,
    price: number,
    type: "buy" | "sell"
  ) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (type === "buy") {
        await get().addHolding(cryptoId, amount, price);
      } else {
        // Handle sell logic
        const { holdings } = get();
        const holdingIndex = holdings.findIndex((h) => h.cryptoId === cryptoId);

        if (holdingIndex === -1) {
          throw new Error("No holding found to sell");
        }

        const holding = holdings[holdingIndex];
        if (holding.amount < amount) {
          throw new Error("Insufficient cryptocurrency to sell");
        }

        const updatedAmount = holding.amount - amount;
        const holdingsKey = `portfolio_holdings_${user.id}`;

        if (updatedAmount === 0) {
          // Remove holding completely
          const updatedHoldings = holdings.filter(
            (_, index) => index !== holdingIndex
          );
          await storage.setObject(holdingsKey, updatedHoldings);
          set({ holdings: updatedHoldings });
        } else {
          // Update holding - maintain the same average buy price
          const remainingInvestment =
            (holding.totalInvested / holding.amount) * updatedAmount;
          const currentValue = updatedAmount * holding.currentPrice;

          const updatedHolding: PortfolioHolding = {
            ...holding,
            amount: updatedAmount,
            totalInvested: remainingInvestment,
            currentValue,
            profitLoss: currentValue - remainingInvestment,
            profitLossPercent:
              remainingInvestment > 0
                ? ((currentValue - remainingInvestment) / remainingInvestment) *
                  100
                : 0,
            lastUpdated: new Date(),
          };

          const updatedHoldings = holdings.map((h, index) =>
            index === holdingIndex ? updatedHolding : h
          );

          await storage.setObject(holdingsKey, updatedHoldings);
          set({ holdings: updatedHoldings });
        }

        get().calculateSummary();
      }
    } catch (error) {
      console.error("❌ Error updating holding:", error);
      throw error;
    }
  },

  // Update portfolio prices with real-time data
  updatePortfolioPrices: async () => {
    const { holdings } = get();
    const { topCryptos } = useCryptoStore.getState();

    if (holdings.length === 0 || topCryptos.length === 0) return;

    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const holdingsKey = `portfolio_holdings_${user.id}`;

      const updatedHoldings = holdings.map((holding) => {
        const marketData = topCryptos.find(
          (crypto) => crypto.id === holding.cryptoId
        );

        if (marketData) {
          const currentValue = holding.amount * marketData.current_price;
          const profitLoss = currentValue - holding.totalInvested;
          const profitLossPercent =
            holding.totalInvested > 0
              ? (profitLoss / holding.totalInvested) * 100
              : 0;

          return {
            ...holding,
            currentPrice: marketData.current_price,
            currentValue,
            profitLoss,
            profitLossPercent,
            lastUpdated: new Date(),
          };
        }

        return holding;
      });

      set({
        holdings: updatedHoldings,
        lastUpdated: new Date(),
      });

      // Save updated holdings to user-specific storage
      await storage.setObject(holdingsKey, updatedHoldings);

      // Recalculate summary
      get().calculateSummary();
    } catch (error) {
      console.error("❌ Error updating portfolio prices:", error);
    }
  },

  // Add transaction to portfolio
  addTransaction: async (transaction) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const transactionsKey = `portfolio_transactions_${user.id}`;

      const newTransaction: PortfolioTransaction = {
        ...transaction,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      const updatedTransactions = [newTransaction, ...get().transactions];

      await storage.setObject(transactionsKey, updatedTransactions);

      set({
        transactions: updatedTransactions,
      });

      console.log("✅ Portfolio transaction added:", newTransaction);
    } catch (error) {
      console.error("❌ Error adding portfolio transaction:", error);
    }
  },

  // Calculate portfolio summary with best/worst performers
  calculateSummary: () => {
    const { holdings } = get();

    if (holdings.length === 0) {
      set({
        summary: {
          totalValue: 0,
          totalInvested: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          bestPerformer: null,
          worstPerformer: null,
          totalHoldings: 0,
        },
      });
      return;
    }

    const totalValue = holdings.reduce(
      (sum, holding) => sum + holding.currentValue,
      0
    );
    const totalInvested = holdings.reduce(
      (sum, holding) => sum + holding.totalInvested,
      0
    );
    const totalProfitLoss = totalValue - totalInvested;
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Find best and worst performers
    const sortedByPerformance = [...holdings].sort(
      (a, b) => b.profitLossPercent - a.profitLossPercent
    );
    const bestPerformer = sortedByPerformance[0] || null;
    const worstPerformer =
      sortedByPerformance[sortedByPerformance.length - 1] || null;

    // Mock day change (in real app, calculate from price changes)
    const dayChange = totalValue * 0.025; // 2.5% mock change
    const dayChangePercent = 2.5;

    set({
      summary: {
        totalValue,
        totalInvested,
        totalProfitLoss,
        totalProfitLossPercent,
        dayChange,
        dayChangePercent,
        bestPerformer,
        worstPerformer,
        totalHoldings: holdings.length,
      },
    });
  },

  // Refresh entire portfolio
  refreshPortfolio: async () => {
    set({ isRefreshing: true });

    try {
      await get().updatePortfolioPrices();
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
let portfolioRefreshInterval: ReturnType<typeof setInterval> | null = null;

export const startPortfolioAutoRefresh = (intervalMinutes: number = 2) => {
  if (portfolioRefreshInterval) {
    clearInterval(portfolioRefreshInterval);
  }

  portfolioRefreshInterval = setInterval(
    () => {
      console.log("🔄 Auto-refreshing portfolio...");
      usePortfolioStore.getState().updatePortfolioPrices();
    },
    intervalMinutes * 60 * 1000
  );
};

export const stopPortfolioAutoRefresh = () => {
  if (portfolioRefreshInterval) {
    clearInterval(portfolioRefreshInterval);
    portfolioRefreshInterval = null;
  }
};
