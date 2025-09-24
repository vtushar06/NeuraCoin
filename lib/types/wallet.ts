export interface VirtualWallet {
  id: string;
  userId: string;
  balance: number; // NeuraCoins balance
  totalEarned: number; // Total NeuraCoins earned
  totalSpent: number; // Total NeuraCoins spent
  createdAt: Date;
  lastUpdated: Date;
}

export interface VirtualTransaction {
  id: string;
  userId: string;
  type: "buy" | "sell" | "reward" | "welcome_bonus";
  cryptoId?: string;
  cryptoName?: string;
  cryptoSymbol?: string;
  cryptoImage?: string;
  amount: number; // Crypto amount
  price: number; // Price per unit in NeuraCoins
  totalCost: number; // Total NeuraCoins spent/earned
  status: "pending" | "completed" | "failed";
  description: string;
  timestamp: Date;
}

export interface RewardSystem {
  dailyLoginBonus: number;
  welcomeBonus: number;
  tradingRewards: number;
  referralBonus: number;
}

export interface TradingOrder {
  id: string;
  type: "buy" | "sell";
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  amount: number;
  pricePerUnit: number;
  totalValue: number;
  fee: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  completedAt?: Date;
}
