export interface PortfolioHolding {
  id: string;
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  cryptoImage: string;
  amount: number; // How much user owns
  averageBuyPrice: number; // Average price paid
  currentPrice: number; // Current market price
  totalInvested: number; // Total money invested
  currentValue: number; // Current worth
  profitLoss: number; // Gain/Loss amount
  profitLossPercent: number; // Gain/Loss percentage
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  bestPerformer: PortfolioHolding | null;
  worstPerformer: PortfolioHolding | null;
  totalHoldings: number;
}

export interface PortfolioTransaction {
  id: string;
  type: "buy" | "sell";
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  timestamp: Date;
}

export interface PortfolioHistory {
  date: Date;
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
}
