import { create } from "zustand";
import * as Crypto from "expo-crypto";
import { asyncDB, type User } from "@/lib/database/async-storage-db";
import { secureStorage, storage } from "@/lib/storage/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: { firstName: string; lastName: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearAllData: () => Promise<void>; // Add this for debugging
}

const STORAGE_KEYS = {
  CURRENT_USER_ID: "neuracoin_current_user_id",
  AUTH_TOKEN: "neuracoin_auth_token",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Add this method for debugging
  clearAllData: async () => {
    try {
      await AsyncStorage.clear();
      await secureStorage.clear();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("All data cleared successfully");
    } catch (error) {
      console.error("Error clearing all ", error);
    }
  },

  initialize: async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      // Only try to get token if we have a valid userId
      let token = null;
      if (userId) {
        token = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      }

      if (userId && token) {
        const user = await asyncDB.findUserById(userId);

        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const user = await asyncDB.findUserByEmail(email);

      if (!user) {
        throw new Error("User not found. Please register first.");
      }

      // Generate auth token
      const token = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${email}${Date.now()}`
      );

      // Store auth data
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Sign in failed"
      );
    }
  },

  signUp: async (
    email: string,
    password: string,
    userData: { firstName: string; lastName: string }
  ) => {
    try {
      // Check if user exists
      const existingUser = await asyncDB.findUserByEmail(email);
      if (existingUser) {
        throw new Error(
          `User with email ${email} already exists. Please sign in instead.`
        );
      }

      // Create user
      const user = await asyncDB.createUser({
        email: email.toLowerCase().trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        isVerified: false,
      });

      // Generate auth token
      const token = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${email}${Date.now()}`
      );

      // Store auth data
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Sign up error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Sign up failed"
      );
    }
  },

  signOut: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },

  updateProfile: async (userData: Partial<User>) => {
    try {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser = await asyncDB.updateUser(currentUser.id, userData);

      if (updatedUser) {
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error("Profile update failed");
    }
  },
}));
