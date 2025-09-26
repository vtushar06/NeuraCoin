import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Colors, Gradients } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";
import {
  useCryptoStore,
  startAutoRefresh,
  stopAutoRefresh,
} from "@/lib/store/crypto";
import { useWalletStore } from "@/lib/store/wallet";
import { usePortfolioStore } from "@/lib/store/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import CryptoCard from "@/components/features/CryptoCard";
import QuickActions from "@/components/features/QuickActions";
import WalletSummaryCard from "@/components/wallet/WalletSummaryCard";

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    topCryptos,
    fetchTopCryptos,
    isLoading: cryptoLoading,
    error,
    lastUpdated,
    clearError,
  } = useCryptoStore();

  const {
    wallet,
    initializeWallet,
    isLoading: walletLoading,
  } = useWalletStore();
  const {
    summary,
    initializePortfolio,
    isLoading: portfolioLoading,
  } = usePortfolioStore();

  const [refreshing, setRefreshing] = useState(false);

  // Initialize user-specific data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`🔄 Initializing data for user: ${user.firstName}`);

      // Initialize wallet and portfolio for the authenticated user
      initializeWallet();
      initializePortfolio();
    }
  }, [isAuthenticated, user?.id]); // Depend on user.id to trigger when user changes

  // Fetch crypto data (independent of user)
  useEffect(() => {
    fetchTopCryptos();

    // Start auto-refresh every 5 minutes
    startAutoRefresh(5);

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopCryptos();

    // Also refresh user data if authenticated
    if (isAuthenticated && user) {
      await initializeWallet();
      await initializePortfolio();
    }

    setRefreshing(false);
  };

  // Show loading while user data is being loaded
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("@/assets/images/logo-icon-2.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.greeting}>Hello, {user?.firstName}! 👋</Text>
              <Text style={styles.subtitle}>Welcome back to NeuraCoin</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.notificationButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.text}
              />
            </Pressable>
            {lastUpdated && (
              <Text style={styles.lastUpdate}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Pressable onPress={clearError} style={styles.errorClose}>
              <Ionicons name="close" size={16} color={Colors.error} />
            </Pressable>
          </View>
        )}

        {/* Virtual Wallet Section */}
        <View>
          {wallet && !walletLoading ? (
            <WalletSummaryCard
              wallet={wallet}
              showActions={true}
              onPress={() => router.push("/(tabs)/transactions")}
            />
          ) : (
            <LinearGradient
              colors={Gradients.primary}
              style={styles.portfolioCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.loadingWallet}>
                <ActivityIndicator size="small" color={Colors.text} />
                <Text style={styles.portfolioLabel}>
                  {walletLoading
                    ? "Loading Wallet..."
                    : "Virtual Trading Wallet"}
                </Text>
              </View>
              <Text style={styles.portfolioValue}>
                {walletLoading ? "Loading..." : "Initializing..."}
              </Text>
              <Text style={styles.portfolioSubtext}>
                {walletLoading
                  ? "Retrieving your balance and transactions..."
                  : "Setting up your virtual trading account"}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Virtual Portfolio Section */}
        <View>
          {wallet && summary && !portfolioLoading ? (
            <LinearGradient
              colors={Gradients.primary}
              style={styles.portfolioCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.portfolioLabel}>Virtual Portfolio Value</Text>
              <Text style={styles.portfolioValue}>
                {formatCurrency(summary.totalValue)}
              </Text>
              <View style={styles.portfolioStats}>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Total P&L</Text>
                  <View style={styles.portfolioGain}>
                    <Ionicons
                      name={
                        summary.totalProfitLoss >= 0
                          ? "trending-up"
                          : "trending-down"
                      }
                      size={16}
                      color={
                        summary.totalProfitLoss >= 0
                          ? Colors.success
                          : Colors.error
                      }
                    />
                    <Text
                      style={[
                        styles.gainText,
                        {
                          color:
                            summary.totalProfitLoss >= 0
                              ? Colors.success
                              : Colors.error,
                        },
                      ]}
                    >
                      {summary.totalProfitLoss >= 0 ? "+" : ""}
                      {formatCurrency(summary.totalProfitLoss)} (
                      {formatPercent(summary.totalProfitLossPercent)})
                    </Text>
                  </View>
                </View>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Holdings</Text>
                  <Text style={styles.portfolioStatValue}>
                    {summary.totalHoldings} assets
                  </Text>
                </View>
              </View>
              <Text style={styles.virtualNote}>
                💡 Virtual trading with real market data
              </Text>
              <Pressable
                style={styles.portfolioButton}
                onPress={() => router.push("/(tabs)/portfolio")}
              >
                <Text style={styles.portfolioButtonText}>View Portfolio</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.text} />
              </Pressable>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={Gradients.primary}
              style={styles.portfolioCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.loadingPortfolio}>
                <ActivityIndicator size="small" color={Colors.text} />
                <Text style={styles.portfolioLabel}>
                  {portfolioLoading
                    ? "Loading Portfolio..."
                    : "Loading Portfolio"}
                </Text>
              </View>
              <Text style={styles.portfolioValue}>
                {portfolioLoading ? "Loading..." : "Initializing..."}
              </Text>
              <Text style={styles.portfolioSubtext}>
                {portfolioLoading
                  ? "Retrieving your holdings and transactions..."
                  : "Setting up your virtual portfolio"}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Quick Actions - Only show when data is loaded */}
        {wallet && !walletLoading && (
          <View>
            <QuickActions />
          </View>
        )}

        {/* Market Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <Pressable onPress={() => router.push("/(tabs)/market")}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          {cryptoLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading market data...</Text>
            </View>
          ) : (
            <View style={styles.cryptoList}>
              {topCryptos.slice(0, 10).map((crypto, index) => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  delay={index * 100}
                  onPress={() => {
                    console.log("Navigate to", crypto.symbol);
                    // TODO: Navigate to crypto details page with buy/sell options
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity - Only show when wallet is loaded */}
        {wallet && !walletLoading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Pressable onPress={() => router.push("/(tabs)/transactions")}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.activityList}>
              <ActivityItem
                type="buy"
                crypto="BTC"
                amount="0.025"
                value={1250.5}
                time="2 hours ago"
                isVirtual={true}
              />
              <ActivityItem
                type="sell"
                crypto="ETH"
                amount="1.5"
                value={2880.75}
                time="1 day ago"
                isVirtual={true}
              />
              <ActivityItem
                type="reward"
                crypto="NC"
                amount="100"
                value={100}
                time="Today"
                isVirtual={false}
              />
            </View>
          </View>
        )}

        {/* Educational Banner */}
        <View style={styles.educationalBanner}>
          <View style={styles.educationalContent}>
            <Ionicons name="school-outline" size={24} color={Colors.primary} />
            <View style={styles.educationalText}>
              <Text style={styles.educationalTitle}>Learning Mode Active</Text>
              <Text style={styles.educationalSubtitle}>
                Practice trading risk-free with virtual NeuraCoins
              </Text>
            </View>
          </View>
          <Pressable style={styles.educationalButton}>
            <Text style={styles.educationalButtonText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Activity item component (same as before)
function ActivityItem({
  type,
  crypto,
  amount,
  value,
  time,
  isVirtual = true,
}: {
  type: "buy" | "sell" | "reward";
  crypto: string;
  amount: string;
  value: number;
  time: string;
  isVirtual?: boolean;
}) {
  const getActivityIcon = () => {
    switch (type) {
      case "buy":
        return { name: "arrow-down", color: Colors.success };
      case "sell":
        return { name: "arrow-up", color: Colors.error };
      case "reward":
        return { name: "gift", color: Colors.warning };
      default:
        return { name: "swap-horizontal", color: Colors.primary };
    }
  };

  const getActivityTitle = () => {
    switch (type) {
      case "buy":
        return `Bought ${crypto}`;
      case "sell":
        return `Sold ${crypto}`;
      case "reward":
        return `Earned ${crypto}`;
      default:
        return `${type} ${crypto}`;
    }
  };

  const icon = getActivityIcon();

  return (
    <View style={styles.activityItem}>
      <View
        style={[styles.activityIcon, { backgroundColor: icon.color + "20" }]}
      >
        <Ionicons name={icon.name as any} size={16} color={icon.color} />
      </View>
      <View style={styles.activityInfo}>
        <View style={styles.activityTitleRow}>
          <Text style={styles.activityCrypto}>{getActivityTitle()}</Text>
          {isVirtual && (
            <View style={styles.virtualBadge}>
              <Text style={styles.virtualBadgeText}>VIRTUAL</Text>
            </View>
          )}
        </View>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <View style={styles.activityAmount}>
        <Text style={styles.activityValue}>
          {isVirtual && type !== "reward"
            ? formatCurrency(value)
            : `${value} ${crypto}`}
        </Text>
        <Text style={styles.activityQuantity}>
          {amount} {crypto}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Add this new loading container style
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerLogo: {
    width: 64,
    height: 64,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  lastUpdate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.error + "20",
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  errorClose: {
    padding: 4,
  },
  portfolioCard: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
  },
  loadingWallet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  loadingPortfolio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  portfolioLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  portfolioStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  portfolioStat: {
    alignItems: "center",
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  portfolioStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  portfolioGain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gainText: {
    fontSize: 14,
    fontWeight: "600",
  },
  virtualNote: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
    textAlign: "center",
  },
  portfolioSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  portfolioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  portfolioButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  cryptoList: {
    gap: 12,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  virtualBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  virtualBadgeText: {
    fontSize: 8,
    color: Colors.primary,
    fontWeight: "600",
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  activityQuantity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  educationalBanner: {
    backgroundColor: Colors.card,
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  educationalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  educationalText: {
    flex: 1,
  },
  educationalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  educationalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  educationalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary + "20",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  educationalButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
