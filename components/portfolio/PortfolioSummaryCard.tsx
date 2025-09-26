import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "@/constants/Colors";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { PortfolioSummary } from "@/lib/types/portfolio";

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  onPress?: () => void;
}

export default function PortfolioSummaryCard({
  summary,
  onPress,
}: PortfolioSummaryCardProps) {
  const isProfit = summary.totalProfitLoss >= 0;

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
          <Text style={styles.title}>Portfolio Value</Text>
          <Ionicons
            name="trending-up"
            size={24}
            color="rgba(255, 255, 255, 0.8)"
          />
        </View>

        {/* Main Value */}
        <Text style={styles.totalValue}>
          {formatCurrency(summary.totalValue)}
        </Text>

        {/* Profit/Loss */}
        <View style={styles.profitLossContainer}>
          <Ionicons
            name={isProfit ? "arrow-up" : "arrow-down"}
            size={16}
            color={isProfit ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.profitLossText,
              { color: isProfit ? Colors.success : Colors.error },
            ]}
          >
            {formatCurrency(Math.abs(summary.totalProfitLoss))} (
            {formatPercent(summary.totalProfitLossPercent)})
          </Text>
        </View>

        {/* Day Change */}
        <Text style={styles.dayChange}>
          Today: {formatPercent(summary.dayChangePercent)} (
          {formatCurrency(summary.dayChange)})
        </Text>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Invested</Text>
            <Text style={styles.statValue}>
              {formatCurrency(summary.totalInvested)}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>Holdings</Text>
            <Text style={styles.statValue}>{summary.totalHoldings}</Text>
          </View>
        </View>

        {/* View Details Button */}
        <Pressable style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255, 255, 255, 0.8)"
          />
        </Pressable>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  profitLossContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  profitLossText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dayChange: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  detailsButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
