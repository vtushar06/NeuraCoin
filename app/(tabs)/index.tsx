import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
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
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import CryptoCard from "@/components/features/CryptoCard";
import QuickActions from "@/components/features/QuickActions";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    topCryptos,
    fetchTopCryptos,
    isLoading,
    error,
    lastUpdated,
    clearError,
  } = useCryptoStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopCryptos();
    setRefreshing(false);
  };

  useEffect(() => {
    // Initial data fetch
    fetchTopCryptos();

    // Start auto-refresh every 5 minutes
    startAutoRefresh(5);

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Calculate portfolio value from top cryptos (simulated)
  const simulatePortfolioValue = () => {
    if (topCryptos.length === 0) return 25847.92;

    // Simulate holdings: 0.5 BTC, 5 ETH, 100 BNB
    const btc = topCryptos.find((c) => c.symbol === "btc");
    const eth = topCryptos.find((c) => c.symbol === "eth");
    const bnb = topCryptos.find((c) => c.symbol === "bnb");

    let total = 0;
    if (btc) total += btc.current_price * 0.5;
    if (eth) total += eth.current_price * 5;
    if (bnb) total += bnb.current_price * 100;

    return total || 25847.92;
  };

  const portfolioValue = simulatePortfolioValue();

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
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName}! 👋</Text>
            <Text style={styles.subtitle}>Welcome back to NeuraCoin</Text>
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

        {/* Portfolio Summary */}
        <View>
          <LinearGradient
            colors={Gradients.primary}
            style={styles.portfolioCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
            <Text style={styles.portfolioValue}>
              {formatCurrency(portfolioValue)}
            </Text>
            <View style={styles.portfolioGain}>
              <Ionicons name="trending-up" size={16} color={Colors.success} />
              <Text style={styles.gainText}>+{formatPercent(12.45)} Today</Text>
            </View>
            <Pressable
              style={styles.portfolioButton}
              onPress={() => router.push("/(tabs)/portfolio")}
            >
              <Text style={styles.portfolioButtonText}>View Details</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View>
          <QuickActions />
        </View>

        {/* Market Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <Pressable onPress={() => router.push("/(tabs)/market")}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
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
                    // TODO: Navigate to crypto details page
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
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
            />
            <ActivityItem
              type="sell"
              crypto="ETH"
              amount="1.5"
              value={2880.75}
              time="1 day ago"
            />
            <ActivityItem
              type="buy"
              crypto="ADA"
              amount="500"
              value={215.0}
              time="3 days ago"
            />
          </View>
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
}: {
  type: "buy" | "sell";
  crypto: string;
  amount: string;
  value: number;
  time: string;
}) {
  return (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          {
            backgroundColor:
              type === "buy" ? Colors.success + "20" : Colors.error + "20",
          },
        ]}
      >
        <Ionicons
          name={type === "buy" ? "add" : "remove"}
          size={16}
          color={type === "buy" ? Colors.success : Colors.error}
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityCrypto}>
          {type === "buy" ? "Bought" : "Sold"} {crypto}
        </Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <View style={styles.activityAmount}>
        <Text style={styles.activityValue}>{formatCurrency(value)}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
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
  portfolioGain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  gainText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: "600",
  },
  portfolioButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "flex-start",
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
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
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
  activityCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
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
});
