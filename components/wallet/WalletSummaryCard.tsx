import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "@/constants/Colors";
import type { VirtualWallet } from "@/lib/types/wallet";

interface WalletSummaryCardProps {
  wallet: VirtualWallet;
  onPress?: () => void;
  showActions?: boolean;
}

export default function WalletSummaryCard({
  wallet,
  onPress,
  showActions = false,
}: WalletSummaryCardProps) {
  const netGain = wallet.totalEarned - wallet.totalSpent;
  const isPositive = netGain >= 0;

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={Gradients.primary}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name="wallet"
              size={24}
              color="rgba(255, 255, 255, 0.9)"
            />
            <Text style={styles.title}>NeuraCoin Wallet</Text>
          </View>
          <Ionicons
            name="trending-up"
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            {wallet.balance.toFixed(0)} NC
          </Text>
          <Text style={styles.balanceSubtext}>NeuraCoins</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {wallet.totalEarned.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>{wallet.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text
              style={[
                styles.statValue,
                { color: isPositive ? Colors.success : Colors.error },
              ]}
            >
              {isPositive ? "+" : ""}
              {netGain.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Net Gain</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton}>
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={Colors.background}
              />
              <Text style={styles.actionButtonText}>Buy Crypto</Text>
            </Pressable>

            <Pressable style={[styles.actionButton, styles.secondaryButton]}>
              <Ionicons
                name="gift-outline"
                size={18}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.actionButtonText}>Earn More</Text>
            </Pressable>
          </View>
        )}

        {/* Last Updated */}
        <View style={styles.footerContainer}>
          <Ionicons
            name="sync-outline"
            size={12}
            color="rgba(255, 255, 255, 0.6)"
          />
          <Text style={styles.lastUpdated}>
            Updated: {new Date(wallet.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  balanceSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  lastUpdated: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
  },
});
