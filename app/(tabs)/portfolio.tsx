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
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";
import {
  usePortfolioStore,
  startPortfolioAutoRefresh,
  stopPortfolioAutoRefresh,
} from "@/lib/store/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import PortfolioSummaryCard from "@/components/portfolio/PortfolioSummaryCard";
import AssetAllocationChart from "@/components/portfolio/AssetAllocationChart";
import HoldingCard from "@/components/portfolio/HoldingCard";

export default function PortfolioScreen() {
  const { user } = useAuthStore();
  const {
    holdings,
    summary,
    transactions,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    initializePortfolio,
    refreshPortfolio,
    clearError,
  } = usePortfolioStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializePortfolio();
    startPortfolioAutoRefresh(2);

    return () => {
      stopPortfolioAutoRefresh();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPortfolio();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your portfolio...</Text>
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
          <Text style={styles.title}>Portfolio</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdate}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
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
        {summary && (
          <PortfolioSummaryCard
            summary={summary}
            onPress={() => console.log("Portfolio summary pressed")}
          />
        )}

        {/* Asset Allocation Chart */}
        {holdings.length > 0 && <AssetAllocationChart holdings={holdings} />}

        {/* Holdings List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Holdings</Text>
            <Pressable>
              <Text style={styles.viewAll}>Manage</Text>
            </Pressable>
          </View>

          {holdings.length > 0 ? (
            <View style={styles.holdingsList}>
              {holdings.map((holding) => (
                <HoldingCard
                  key={holding.id}
                  holding={holding}
                  onPress={() => {
                    console.log("Navigate to", holding.cryptoName);
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="pie-chart-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Holdings Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start investing in cryptocurrencies to build your portfolio
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/(tabs)/market")}
              >
                <Text style={styles.emptyButtonText}>Explore Market</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Performance Insights */}
        {summary && holdings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>

            {/* Best Performer */}
            {summary.bestPerformer && (
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={Colors.success}
                  />
                  <Text style={styles.performanceTitle}>Best Performer</Text>
                </View>
                <Text style={styles.performanceCrypto}>
                  {summary.bestPerformer.cryptoName}
                </Text>
                <Text style={styles.performanceValue}>
                  +{formatPercent(summary.bestPerformer.profitLossPercent)}
                </Text>
              </View>
            )}

            {/* Worst Performer */}
            {summary.worstPerformer && (
              <View style={[styles.performanceCard, styles.worstPerformer]}>
                <View style={styles.performanceHeader}>
                  <Ionicons
                    name="trending-down"
                    size={20}
                    color={Colors.error}
                  />
                  <Text style={styles.performanceTitle}>Needs Attention</Text>
                </View>
                <Text style={styles.performanceCrypto}>
                  {summary.worstPerformer.cryptoName}
                </Text>
                <Text
                  style={[styles.performanceValue, { color: Colors.error }]}
                >
                  {formatPercent(summary.worstPerformer.profitLossPercent)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/(tabs)/transactions")}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={
                      transaction.type === "buy" ? "arrow-down" : "arrow-up"
                    }
                    size={16}
                    color={
                      transaction.type === "buy" ? Colors.success : Colors.error
                    }
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === "buy" ? "Bought" : "Sold"}{" "}
                    {transaction.cryptoSymbol}
                  </Text>
                  <Text style={styles.transactionTime}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.transactionValue}>
                    {formatCurrency(transaction.totalValue)}
                  </Text>
                  <Text style={styles.transactionQuantity}>
                    {transaction.amount.toFixed(8)} {transaction.cryptoSymbol}
                  </Text>
                </View>
              </View>
            ))}

            {transactions.length === 0 && (
              <View style={styles.emptyTransactions}>
                <Text style={styles.emptyTransactionsText}>
                  No transactions yet
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)/market")}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Buy Crypto</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => console.log("Sell crypto")}
            >
              <Ionicons name="remove-circle" size={24} color={Colors.error} />
              <Text style={styles.actionText}>Sell Holdings</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => console.log("Portfolio analysis")}
            >
              <Ionicons name="analytics" size={24} color={Colors.warning} />
              <Text style={styles.actionText}>Analysis</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  lastUpdate: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  holdingsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.background,
    fontWeight: "600",
  },
  performanceCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  worstPerformer: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  performanceCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.success,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  transactionQuantity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyTransactions: {
    padding: 20,
    alignItems: "center",
  },
  emptyTransactionsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    fontWeight: "500",
  },
});
