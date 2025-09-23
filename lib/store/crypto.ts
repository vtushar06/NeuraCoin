import { create } from "zustand";

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface CryptoState {
  topCryptos: CryptoData[];
  isLoading: boolean;
  error: string | null;
  fetchTopCryptos: () => Promise<void>;
}

// Mock data for development
const mockCryptoData: CryptoData[] = [
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
];

export const useCryptoStore = create<CryptoState>((set) => ({
  topCryptos: [],
  isLoading: false,
  error: null,

  fetchTopCryptos: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ topCryptos: mockCryptoData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch data",
        isLoading: false,
      });
    }
  },
}));
