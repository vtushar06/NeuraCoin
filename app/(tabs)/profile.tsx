import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";
import { useWalletStore } from "@/lib/store/wallet";
import { usePortfolioStore } from "@/lib/store/portfolio";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { wallet } = useWalletStore();
  const { summary } = usePortfolioStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    console.log("🔘 Sign out button pressed");
    setIsSigningOut(true);

    try {
      await logout();

      Toast.show({
        type: "success",
        text1: "Signed Out Successfully",
        text2: "See you next time!",
        visibilityTime: 2000,
      });

      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("❌ Sign out failed:", error);

      Toast.show({
        type: "error",
        text1: "Sign Out Error",
        text2: "Please try again",
        visibilityTime: 2000,
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEditProfile = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Profile editing will be available soon",
      visibilityTime: 2000,
    });
  };

  const handleSettings = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Settings will be available soon",
      visibilityTime: 2000,
    });
  };

  const handleHelp = () => {
    Toast.show({
      type: "info",
      text1: "Help & Support",
      text2: "NeuraCoin is a virtual trading platform for learning",
      visibilityTime: 3000,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.content}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]?.toUpperCase() || "U"}
                {user?.lastName?.[0]?.toUpperCase() || "S"}
              </Text>
            </View>
            <Text style={styles.name}>
              {user?.firstName || "Unknown"} {user?.lastName || "User"}
            </Text>
            <Text style={styles.email}>{user?.email || "No email"}</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                {wallet?.balance?.toFixed(0) || "0"} NC
              </Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="pie-chart" size={20} color={Colors.success} />
              <Text style={styles.statValue}>
                {summary?.totalHoldings || 0}
              </Text>
              <Text style={styles.statLabel}>Holdings</Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.options}>
            <OptionItem
              icon="person-outline"
              title="Edit Profile"
              onPress={handleEditProfile}
            />
            <OptionItem
              icon="settings-outline"
              title="Settings"
              onPress={handleSettings}
            />
            <OptionItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={handleHelp}
            />
          </View>

          {/* Sign Out Button */}
          <Pressable
            style={[
              styles.signOutButton,
              isSigningOut && styles.signOutButtonDisabled,
            ]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Ionicons
              name={isSigningOut ? "sync" : "log-out-outline"}
              size={20}
              color={Colors.error}
            />
            <Text style={styles.signOutText}>
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionItem({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <Ionicons name={icon} size={24} color={Colors.text} />
      <Text style={styles.optionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  options: {
    gap: 8,
    marginBottom: 32,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error + "20",
    borderWidth: 1,
    borderColor: Colors.error + "30",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
  },
});
