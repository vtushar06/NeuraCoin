import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { PortfolioHolding } from "@/lib/types/portfolio";

interface HoldingCardProps {
  holding: PortfolioHolding;
  onPress?: () => void;
}

export default function HoldingCard({ holding, onPress }: HoldingCardProps) {
  const isProfit = holding.profitLoss >= 0;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        <Image
          source={{ uri: holding.cryptoImage }}
          style={styles.cryptoImage}
          defaultSource={{
            uri: `https://via.placeholder.com/40x40.png?text=${holding.cryptoSymbol}`,
          }}
        />
        <View style={styles.cryptoInfo}>
          <Text style={styles.cryptoName}>{holding.cryptoName}</Text>
          <Text style={styles.cryptoSymbol}>
            {holding.amount.toFixed(4)} {holding.cryptoSymbol}
          </Text>
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        <Text style={styles.currentValue}>
          {formatCurrency(holding.currentValue)}
        </Text>
        <View style={styles.profitLossContainer}>
          <Ionicons
            name={isProfit ? "trending-up" : "trending-down"}
            size={12}
            color={isProfit ? Colors.success : Colors.error}
          />
          <Text
            style={[
              styles.profitLossText,
              { color: isProfit ? Colors.success : Colors.error },
            ]}
          >
            {formatPercent(Math.abs(holding.profitLossPercent))}
          </Text>
        </View>
      </View>

      {/* Performance Indicator */}
      <View
        style={[
          styles.performanceBar,
          {
            backgroundColor: isProfit ? Colors.success : Colors.error,
            opacity: Math.min(Math.abs(holding.profitLossPercent) / 20, 1),
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cryptoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  cryptoSymbol: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  profitLossContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  profitLossText: {
    fontSize: 12,
    fontWeight: "500",
  },
  performanceBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
});
