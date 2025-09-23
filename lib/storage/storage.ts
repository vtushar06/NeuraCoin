import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Regular storage for non-sensitive data
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!key || key.trim() === "") {
        throw new Error("Storage key cannot be empty");
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error storing item:", error);
      throw error;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!key || key.trim() === "") {
        console.warn("Storage key cannot be empty");
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Error retrieving item:", error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (!key || key.trim() === "") {
        console.warn("Storage key cannot be empty");
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing item:", error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },

  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      if (!key || key.trim() === "") {
        throw new Error("Storage key cannot be empty");
      }
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error storing object:", error);
      throw error;
    }
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      if (!key || key.trim() === "") {
        console.warn("Storage key cannot be empty");
        return null;
      }
      const jsonString = await AsyncStorage.getItem(key);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error("Error retrieving object:", error);
      return null;
    }
  },
};

// Validate SecureStore key format
const isValidSecureStoreKey = (key: string): boolean => {
  if (!key || key.trim() === "") return false;
  // SecureStore keys must contain only alphanumeric characters, ".", "-", and "_"
  return /^[a-zA-Z0-9._-]+$/.test(key);
};

// SecureStore for sensitive data
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!isValidSecureStoreKey(key)) {
        throw new Error("Invalid SecureStore key format");
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error storing secure item:", error);
      throw error;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!isValidSecureStoreKey(key)) {
        console.warn("Invalid SecureStore key format:", key);
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Error retrieving secure item:", error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (!isValidSecureStoreKey(key)) {
        console.warn("Invalid SecureStore key format:", key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Error removing secure item:", error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      // Clear known auth keys
      const authKeys = ["neuracoin_auth_token", "neuracoin_refresh_token"];

      const clearPromises = authKeys.map(async (key) => {
        try {
          if (isValidSecureStoreKey(key)) {
            await SecureStore.deleteItemAsync(key);
          }
        } catch (error) {
          console.log(`Key ${key} not found in secure storage`);
        }
      });

      await Promise.all(clearPromises);
    } catch (error) {
      console.error("Error clearing secure storage:", error);
      throw error;
    }
  },
};

// Legacy aliases for backward compatibility
export const mmkvStorage = storage;
