import { create } from "zustand";
import { storage } from "@/lib/storage/storage";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  isNewUser?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterData) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  markUserAsExisting: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER: "user_data",
  AUTH_TOKEN: "auth_token",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      console.log("🔄 Registering user:", data.email);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const existingUsers =
        (await storage.getObject<User[]>("all_users")) || [];
      const userExists = existingUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (userExists) {
        throw new Error("An account with this email already exists");
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        createdAt: new Date(),
        isNewUser: true,
      };

      // Save user to all_users but DON'T log them in yet
      const allUsers = [...existingUsers, newUser];
      await storage.setObject("all_users", allUsers);

      set({ isLoading: false });
      console.log("✅ User registered successfully:", newUser.email);
      return true;
    } catch (error) {
      console.error("❌ Registration error:", error);
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log("🔑 Signing in user:", email);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const allUsers = (await storage.getObject<User[]>("all_users")) || [];
      const user = allUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        throw new Error("No account found with this email address");
      }

      // Save user session
      await storage.setObject(STORAGE_KEYS.USER, user);
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${user.id}`);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log(
        "✅ User signed in:",
        user.firstName,
        "| New user:",
        !!user.isNewUser
      );
      return true;
    } catch (error) {
      console.error("❌ Sign in error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Invalid email or password",
        isLoading: false,
      });
      return false;
    }
  },

  markUserAsExisting: async () => {
    const { user } = get();
    if (user && user.isNewUser) {
      const updatedUser = { ...user, isNewUser: false };

      set({ user: updatedUser });
      await storage.setObject(STORAGE_KEYS.USER, updatedUser);

      const allUsers = (await storage.getObject<User[]>("all_users")) || [];
      const updatedUsers = allUsers.map((u) =>
        u.id === user.id ? updatedUser : u
      );
      await storage.setObject("all_users", updatedUsers);

      console.log("✅ User marked as existing:", updatedUser.email);
    }
  },

  logout: async () => {
    console.log("🔄 Logging out...");

    // Only clear auth session, NOT user data
    await storage.removeItem(STORAGE_KEYS.USER);
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });

    console.log("✅ Logged out successfully (user data preserved)");
  },

  initialize: async () => {
    set({ isLoading: true });

    try {
      const user = await storage.getObject<User>(STORAGE_KEYS.USER);
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (user && token) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log(
          "✅ Session restored:",
          user.firstName,
          "| New user:",
          !!user.isNewUser
        );
      } else {
        set({
          isLoading: false,
        });
        console.log("ℹ️ No existing session found");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await storage.removeItem(STORAGE_KEYS.USER);
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
