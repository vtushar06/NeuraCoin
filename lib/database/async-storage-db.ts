import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  USERS: "@neuracoin:users",
};

export const asyncDB = {
  async getUsers(): Promise<User[]> {
    try {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  },

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return (
        users.find(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        ) || null
      );
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },

  async findUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find((user) => user.id === id) || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  },

  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    try {
      const users = await this.getUsers();
      const now = new Date().toISOString();

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex((user) => user.id === id);

      if (userIndex === -1) return null;

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[userIndex];
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  },
};
