import React, { useState, useEffect, useCallback } from "react";
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
import { useWalletStore } from "@/lib/store/wallet";
import { Colors } from "@/constants/Colors";
import TransactionCard from "@/components/wallet/TransactionCard";
import TradingOrderCard from "@/components/wallet/TradingOrderCard";
import WalletSummaryCard from "@/components/wallet/WalletSummaryCard";

type TransactionFilter = "all" | "buy" | "sell" | "reward";

export default function TransactionsScreen() {
  const {
    wallet,
    transactions,
    orders,
    isLoading,
    error,
    initializeWallet,
    refreshWallet,
    clearError,
  } = useWalletStore();

  const [selectedFilter, setSelectedFilter] =
    useState<TransactionFilter>("all");
  const [showOrders, setShowOrders] = useState(false);

  // Initialize wallet on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === "all") return true;
    return transaction.type === selectedFilter;
  });

  // Refresh handler
  const onRefresh = useCallback(async () => {
    await refreshWallet();
  }, [refreshWallet]);

  // Loading state
  if (isLoading && !wallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => setShowOrders(!showOrders)}
            >
              <Ionicons
                name={showOrders ? "receipt" : "swap-horizontal"}
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.actionButtonText}>
                {showOrders ? "Transactions" : "Orders"}
              </Text>
            </Pressable>
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

        {/* Wallet Summary */}
        {wallet && <WalletSummaryCard wallet={wallet} />}

        {/* Filter Tabs */}
        {!showOrders && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterTabs}>
                {[
                  { key: "all", label: "All", count: transactions.length },
                  {
                    key: "buy",
                    label: "Buy",
                    count: transactions.filter((t) => t.type === "buy").length,
                  },
                  {
                    key: "sell",
                    label: "Sell",
                    count: transactions.filter((t) => t.type === "sell").length,
                  },
                  {
                    key: "reward",
                    label: "Rewards",
                    count: transactions.filter((t) => t.type === "reward")
                      .length,
                  },
                ].map((filter) => (
                  <Pressable
                    key={filter.key}
                    style={[
                      styles.filterTab,
                      selectedFilter === filter.key && styles.filterTabActive,
                    ]}
                    onPress={() =>
                      setSelectedFilter(filter.key as TransactionFilter)
                    }
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        selectedFilter === filter.key &&
                          styles.filterTabTextActive,
                      ]}
                    >
                      {filter.label} ({filter.count})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          {showOrders ? (
            // Trading Orders View
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trading Orders</Text>
                <Text style={styles.sectionCount}>{orders.length} orders</Text>
              </View>

              {orders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="receipt-outline"
                    size={48}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>No trading orders yet</Text>
                  <Text style={styles.emptySubtext}>
                    Your buy and sell orders will appear here
                  </Text>
                </View>
              ) : (
                <View style={styles.itemsList}>
                  {orders.map((order) => (
                    <TradingOrderCard key={order.id} order={order} />
                  ))}
                </View>
              )}
            </>
          ) : (
            // Transactions View
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <Text style={styles.sectionCount}>
                  {filteredTransactions.length} transactions
                </Text>
              </View>

              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="wallet-outline"
                    size={48}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>
                    {selectedFilter === "all"
                      ? "No transactions yet"
                      : `No ${selectedFilter} transactions`}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Start trading to see your transaction history
                  </Text>
                </View>
              ) : (
                <View style={styles.itemsList}>
                  {filteredTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Statistics Summary */}
        {wallet && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {wallet.totalEarned.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Total Earned</Text>
                <Text style={styles.statUnit}>NeuraCoins</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {wallet.totalSpent.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
                <Text style={styles.statUnit}>NeuraCoins</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statUnit}>Count</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Orders</Text>
                <Text style={styles.statUnit}>Executed</Text>
              </View>
            </View>
          </View>
        )}
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
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "500",
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
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: "row",
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
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
  sectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  itemsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
