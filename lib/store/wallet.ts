import { create } from "zustand";
import { storage } from "@/lib/storage/storage";
import { useAuthStore } from "./auth";
import { usePortfolioStore } from "./portfolio";
import type {
  VirtualWallet,
  VirtualTransaction,
  RewardSystem,
  TradingOrder,
} from "@/lib/types/wallet";

interface WalletState {
  // Wallet data
  wallet: VirtualWallet | null;
  transactions: VirtualTransaction[];
  orders: TradingOrder[];

  // Loading states
  isLoading: boolean;
  isProcessing: boolean;

  // Error handling
  error: string | null;

  // Actions
  initializeWallet: () => Promise<void>;
  buyCrypto: (
    cryptoId: string,
    amount: number,
    pricePerUnit: number
  ) => Promise<boolean>;
  sellCrypto: (
    cryptoId: string,
    amount: number,
    pricePerUnit: number
  ) => Promise<boolean>;
  addReward: (
    type: "daily_login" | "welcome_bonus" | "trading",
    amount: number
  ) => Promise<void>;
  getTransactionHistory: () => VirtualTransaction[];
  getTradingHistory: () => TradingOrder[];
  refreshWallet: () => Promise<void>;
  clearUserData: () => Promise<void>;
  clearError: () => void;
}

const REWARD_SYSTEM: RewardSystem = {
  dailyLoginBonus: 100,
  welcomeBonus: 1000,
  tradingRewards: 50,
  referralBonus: 500,
};

const getUserStorageKeys = (userId: string) => ({
  WALLET: `virtual_wallet_${userId}`,
  TRANSACTIONS: `virtual_transactions_${userId}`,
  ORDERS: `trading_orders_${userId}`,
  LAST_LOGIN: `last_daily_login_${userId}`,
});

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  wallet: null,
  transactions: [],
  orders: [],
  isLoading: false,
  isProcessing: false,
  error: null,

  // Clear user-specific data
  clearUserData: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const storageKeys = getUserStorageKeys(user.id);

      await storage.removeItem(storageKeys.WALLET);
      await storage.removeItem(storageKeys.TRANSACTIONS);
      await storage.removeItem(storageKeys.ORDERS);
      await storage.removeItem(storageKeys.LAST_LOGIN);

      set({
        wallet: null,
        transactions: [],
        orders: [],
        error: null,
      });

      console.log("✅ User wallet data cleared");
    } catch (error) {
      console.error("Error clearing user wallet ", error);
    }
  },

  initializeWallet: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.log("❌ No user found for wallet initialization");
      return;
    }

    set({ isLoading: true });

    try {
      const walletKey = `virtual_wallet_${user.id}`;
      const transactionsKey = `virtual_transactions_${user.id}`;
      const ordersKey = `trading_orders_${user.id}`;
      const lastLoginKey = `last_daily_login_${user.id}`;

      // Try to load existing wallet data
      const existingWallet = await storage.getObject<VirtualWallet>(walletKey);
      const existingTransactions =
        (await storage.getObject<VirtualTransaction[]>(transactionsKey)) || [];
      const existingOrders =
        (await storage.getObject<TradingOrder[]>(ordersKey)) || [];

      console.log(`🔍 Debug wallet keys for user ${user.id}:`);
      console.log(`📦 WalletKey: ${walletKey}`);
      console.log(`📦 TransactionsKey: ${transactionsKey}`);
      console.log(`💾 Existing wallet found:`, !!existingWallet);
      console.log(
        `💾 Existing transactions count:`,
        existingTransactions.length
      );
      console.log(`💾 Existing orders count:`, existingOrders.length);
        
      if (existingWallet) {
        // EXISTING USER - Load their data
        console.log(`🔄 Loading existing wallet for user ${user.firstName}...`);

        // Check for daily login bonus
        const lastLoginDate = await storage.getItem(lastLoginKey);
        const today = new Date().toDateString();

        let updatedWallet = existingWallet;

        if (lastLoginDate !== today) {
          // Give daily login bonus
          const dailyBonus = 50;
          updatedWallet = {
            ...existingWallet,
            balance: existingWallet.balance + dailyBonus,
            lastUpdated: new Date(),
          };

          // Log the daily bonus transaction
          const dailyBonusTransaction: VirtualTransaction = {
            id: `daily_${Date.now()}`,
            userId: user.id,
            type: "reward",
            amount: dailyBonus,
            price: 0,
            totalCost: dailyBonus,
            status: "completed",
            description: "Daily Login Bonus",
            timestamp: new Date(),
          };

          existingTransactions.unshift(dailyBonusTransaction);

          // Save updated data
          await storage.setObject(walletKey, updatedWallet);
          await storage.setObject(transactionsKey, existingTransactions);
          await storage.setItem(lastLoginKey, today);

          console.log(`🎁 Daily login bonus given: ${dailyBonus} NC`);
        }

        set({
          wallet: updatedWallet,
          transactions: existingTransactions,
          orders: existingOrders,
          isLoading: false,
        });

        console.log(
          `✅ Wallet loaded for existing user ${user.firstName}: ${updatedWallet.balance.toFixed(2)} NC`
        );
      } else {
        // NEW USER - Create fresh wallet
        console.log(`🆕 Creating new wallet for user ${user.firstName}...`);

        const newWallet: VirtualWallet = {
          id: `wallet_${user.id}`,
          userId: user.id,
          balance: 1000,
          totalSpent: 0,
          totalEarned: 1000,
          createdAt: new Date(),
          lastUpdated: new Date(),
        };

        // Welcome transaction
        const welcomeTransaction: VirtualTransaction = {
          id: `welcome_${Date.now()}`,
          userId: user.id,
          type: "reward",
          amount: 1000,
          price: 0,
          totalCost: 1000,
          status: "completed",
          description: "Welcome Bonus",
          timestamp: new Date(),
        };

        const newTransactions = [welcomeTransaction];

        // Save to storage
        await storage.setObject(walletKey, newWallet);
        await storage.setObject(transactionsKey, newTransactions);
        await storage.setItem(lastLoginKey, new Date().toDateString());

        set({
          wallet: newWallet,
          transactions: newTransactions,
          orders: [],
          isLoading: false,
        });

        console.log(
          `✅ New wallet created for user ${user.firstName}: ${newWallet.balance.toFixed(2)} NC`
        );
      }
    } catch (error) {
      console.error("❌ Error initializing wallet:", error);
      set({ isLoading: false, error: "Failed to initialize wallet" });
    }
  },

  // Buy crypto with NeuraCoins
  buyCrypto: async (cryptoId: string, amount: number, pricePerUnit: number) => {
    set({ isProcessing: true, error: null });

    try {
      const { wallet } = get();
      const { user } = useAuthStore.getState();
      if (!wallet || !user) {
        throw new Error("Wallet not initialized");
      }

      const storageKeys = getUserStorageKeys(user.id);
      const totalCost = amount * pricePerUnit;
      const fee = totalCost * 0.001; // 0.1% fee
      const totalWithFee = totalCost + fee;

      if (wallet.balance < totalWithFee) {
        throw new Error(
          `Insufficient NeuraCoins balance. You need ${totalWithFee.toFixed(2)} NC but only have ${wallet.balance.toFixed(2)} NC.`
        );
      }

      // Get crypto details from market data
      const { topCryptos } = await import("./crypto").then((m) =>
        m.useCryptoStore.getState()
      );
      const crypto = topCryptos.find((c) => c.id === cryptoId);

      if (!crypto) {
        throw new Error("Cryptocurrency not found in market data");
      }

      console.log(
        `Buying ${amount} ${crypto.symbol.toUpperCase()} for ${totalWithFee.toFixed(2)} NC...`
      );

      // Create virtual transaction
      const transaction: VirtualTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: wallet.userId,
        type: "buy",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol,
        cryptoImage: crypto.image,
        amount,
        price: pricePerUnit,
        totalCost: totalWithFee,
        status: "completed",
        description: `Bought ${amount.toFixed(8)} ${crypto.symbol.toUpperCase()} for ${totalWithFee.toFixed(2)} NeuraCoins`,
        timestamp: new Date(),
      };

      // Create trading order
      const order: TradingOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "buy",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol,
        amount,
        pricePerUnit,
        totalValue: totalCost,
        fee,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      // Update wallet balance
      const updatedWallet: VirtualWallet = {
        ...wallet,
        balance: wallet.balance - totalWithFee,
        totalSpent: (wallet.totalSpent || 0) + totalWithFee,
        lastUpdated: new Date(),
      };

      // Update portfolio holdings
      console.log("Adding to portfolio...");
      const portfolioStore = usePortfolioStore.getState();
      await portfolioStore.addHolding(crypto.id, amount, pricePerUnit);

      // Add portfolio transaction (using correct interface)
      await portfolioStore.addTransaction({
        type: "buy",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol.toUpperCase(),
        amount,
        price: pricePerUnit,
        totalValue: totalCost,
        fee,
      });

      // Save wallet data to user-specific storage
      const updatedTransactions = [transaction, ...get().transactions];
      const updatedOrders = [order, ...get().orders];

      await storage.setObject(storageKeys.WALLET, updatedWallet);
      await storage.setObject(storageKeys.TRANSACTIONS, updatedTransactions);
      await storage.setObject(storageKeys.ORDERS, updatedOrders);

      set({
        wallet: updatedWallet,
        transactions: updatedTransactions,
        orders: updatedOrders,
        isProcessing: false,
      });

      // Add small trading reward after a delay
      setTimeout(() => {
        get().addReward("trading", REWARD_SYSTEM.tradingRewards);
      }, 2000);

      console.log(
        `✅ Purchase successful! New balance: ${updatedWallet.balance.toFixed(2)} NC`
      );
      return true;
    } catch (error) {
      console.error("Error buying crypto:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to buy cryptocurrency",
        isProcessing: false,
      });
      return false;
    }
  },

  // Sell crypto for NeuraCoins
  sellCrypto: async (
    cryptoId: string,
    amount: number,
    pricePerUnit: number
  ) => {
    set({ isProcessing: true, error: null });

    try {
      const { wallet } = get();
      const { user } = useAuthStore.getState();
      if (!wallet || !user) {
        throw new Error("Wallet not initialized");
      }

      const storageKeys = getUserStorageKeys(user.id);

      // Check if user has enough crypto to sell
      const portfolioStore = usePortfolioStore.getState();
      const holding = portfolioStore.holdings.find(
        (h) => h.cryptoId === cryptoId
      );

      if (!holding || holding.amount < amount) {
        throw new Error(
          `Insufficient ${cryptoId} balance. You have ${holding?.amount.toFixed(8) || "0"} but trying to sell ${amount.toFixed(8)}.`
        );
      }

      const totalValue = amount * pricePerUnit;
      const fee = totalValue * 0.001; // 0.1% fee
      const totalAfterFee = totalValue - fee;

      // Get crypto details
      const { topCryptos } = await import("./crypto").then((m) =>
        m.useCryptoStore.getState()
      );
      const crypto = topCryptos.find((c) => c.id === cryptoId);

      if (!crypto) {
        throw new Error("Cryptocurrency not found in market data");
      }

      console.log(
        `Selling ${amount} ${crypto.symbol.toUpperCase()} for ${totalAfterFee.toFixed(2)} NC...`
      );

      // Create transaction
      const transaction: VirtualTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: wallet.userId,
        type: "sell",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol,
        cryptoImage: crypto.image,
        amount,
        price: pricePerUnit,
        totalCost: totalAfterFee,
        status: "completed",
        description: `Sold ${amount.toFixed(8)} ${crypto.symbol.toUpperCase()} for ${totalAfterFee.toFixed(2)} NeuraCoins`,
        timestamp: new Date(),
      };

      // Create trading order
      const order: TradingOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "sell",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol,
        amount,
        pricePerUnit,
        totalValue,
        fee,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      // Update wallet balance
      const updatedWallet: VirtualWallet = {
        ...wallet,
        balance: wallet.balance + totalAfterFee,
        totalEarned: (wallet.totalEarned || 0) + totalAfterFee,
        lastUpdated: new Date(),
      };

      // Update portfolio holdings
      await portfolioStore.updateHolding(
        crypto.id,
        amount,
        pricePerUnit,
        "sell"
      );

      // Add portfolio transaction (using correct interface)
      await portfolioStore.addTransaction({
        type: "sell",
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol.toUpperCase(),
        amount,
        price: pricePerUnit,
        totalValue: totalAfterFee,
        fee,
      });

      // Save wallet data to user-specific storage
      const updatedTransactions = [transaction, ...get().transactions];
      const updatedOrders = [order, ...get().orders];

      await storage.setObject(storageKeys.WALLET, updatedWallet);
      await storage.setObject(storageKeys.TRANSACTIONS, updatedTransactions);
      await storage.setObject(storageKeys.ORDERS, updatedOrders);

      set({
        wallet: updatedWallet,
        transactions: updatedTransactions,
        orders: updatedOrders,
        isProcessing: false,
      });

      console.log(
        `✅ Sale successful! New balance: ${updatedWallet.balance.toFixed(2)} NC`
      );
      return true;
    } catch (error) {
      console.error("Error selling crypto:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to sell cryptocurrency",
        isProcessing: false,
      });
      return false;
    }
  },

  // Add reward to wallet
  addReward: async (
    type: "daily_login" | "welcome_bonus" | "trading",
    amount: number
  ) => {
    try {
      const { wallet } = get();
      const { user } = useAuthStore.getState();
      if (!wallet || !user) {
        console.log("No wallet found, skipping reward");
        return;
      }

      const storageKeys = getUserStorageKeys(user.id);

      const transaction: VirtualTransaction = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: wallet.userId,
        type: "reward",
        amount: 0,
        price: 0,
        totalCost: amount,
        status: "completed",
        description: getRewardDescription(type, amount),
        timestamp: new Date(),
      };

      const updatedWallet: VirtualWallet = {
        ...wallet,
        balance: wallet.balance + amount,
        totalEarned: (wallet.totalEarned || 0) + amount,
        lastUpdated: new Date(),
      };

      const updatedTransactions = [transaction, ...get().transactions];

      await storage.setObject(storageKeys.WALLET, updatedWallet);
      await storage.setObject(storageKeys.TRANSACTIONS, updatedTransactions);

      set({
        wallet: updatedWallet,
        transactions: updatedTransactions,
      });

      console.log(
        `🎁 Reward added: ${amount} NeuraCoins for ${type}. New balance: ${updatedWallet.balance.toFixed(2)} NC`
      );
    } catch (error) {
      console.error("Error adding reward:", error);
    }
  },

  // Get transaction history
  getTransactionHistory: () => {
    return get().transactions;
  },

  // Get trading history
  getTradingHistory: () => {
    return get().orders;
  },

  // Refresh wallet data
  refreshWallet: async () => {
    await get().initializeWallet();
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

// Helper function for reward descriptions
function getRewardDescription(type: string, amount: number): string {
  switch (type) {
    case "welcome_bonus":
      return `🎉 Welcome bonus: ${amount} NeuraCoins for joining NeuraCoin!`;
    case "daily_login":
      return `📅 Daily login bonus: ${amount} NeuraCoins`;
    case "trading":
      return `💰 Trading reward: ${amount} NeuraCoins for completing a trade`;
    default:
      return `🎁 Reward: ${amount} NeuraCoins`;
  }
}

// Auto-initialize wallet when user logs in
export const initializeWalletOnLogin = () => {
  const { user } = useAuthStore.getState();
  if (user) {
    console.log("Auto-initializing wallet for user:", user.email);
    useWalletStore.getState().initializeWallet();
  }
};
