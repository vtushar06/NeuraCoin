import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatTimeAgo } from "@/lib/utils/format";
import type { VirtualTransaction } from "@/lib/types/wallet";

interface TransactionCardProps {
  transaction: VirtualTransaction;
  onPress?: () => void;
}

export default function TransactionCard({
  transaction,
  onPress,
}: TransactionCardProps) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "buy":
        return { name: "arrow-down-circle", color: Colors.success };
      case "sell":
        return { name: "arrow-up-circle", color: Colors.error };
      case "reward":
        return { name: "gift", color: Colors.warning };
      default:
        return { name: "swap-horizontal", color: Colors.primary };
    }
  };

  const getTransactionTitle = () => {
    switch (transaction.type) {
      case "buy":
        return `Buy ${transaction.cryptoSymbol?.toUpperCase()}`;
      case "sell":
        return `Sell ${transaction.cryptoSymbol?.toUpperCase()}`;
      case "reward":
        return "Reward Earned";
      default:
        return "Transaction";
    }
  };

  const getAmountDisplay = () => {
    if (transaction.type === "reward") {
      return {
        primary: `+${transaction.totalCost.toFixed(0)} NC`,
        secondary: "NeuraCoins earned",
        color: Colors.success,
      };
    }

    const isPositive = transaction.type === "sell";
    return {
      primary: `${isPositive ? "+" : "-"}${transaction.totalCost.toFixed(0)} NC`,
      secondary: `${transaction.amount?.toFixed(4)} ${transaction.cryptoSymbol?.toUpperCase()}`,
      color: isPositive ? Colors.success : Colors.error,
    };
  };

  const icon = getTransactionIcon();
  const amount = getAmountDisplay();

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Left Section - Icon and Crypto Image */}
      <View style={styles.leftSection}>
        <View
          style={[styles.iconContainer, { backgroundColor: icon.color + "20" }]}
        >
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>

        {transaction.cryptoImage && (
          <Image
            source={{ uri: transaction.cryptoImage }}
            style={styles.cryptoImage}
            defaultSource={{
              uri: `https://via.placeholder.com/24x24.png?text=${transaction.cryptoSymbol}`,
            }}
          />
        )}
      </View>

      {/* Middle Section - Transaction Details */}
      <View style={styles.middleSection}>
        <Text style={styles.transactionTitle}>{getTransactionTitle()}</Text>
        <Text style={styles.transactionDescription} numberOfLines={2}>
          {transaction.description}
        </Text>
        <View style={styles.timestampContainer}>
          <Ionicons
            name="time-outline"
            size={12}
            color={Colors.textSecondary}
          />
          <Text style={styles.timestamp}>
            {formatTimeAgo(transaction.timestamp)}
          </Text>
        </View>
      </View>

      {/* Right Section - Amount */}
      <View style={styles.rightSection}>
        <Text style={[styles.primaryAmount, { color: amount.color }]}>
          {amount.primary}
        </Text>
        <Text style={styles.secondaryAmount}>{amount.secondary}</Text>

        {/* Status Indicator */}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor:
                transaction.status === "completed"
                  ? Colors.success
                  : transaction.status === "pending"
                    ? Colors.warning
                    : Colors.error,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {transaction.status.toUpperCase()}
          </Text>
        </View>
      </View>
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cryptoImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  middleSection: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rightSection: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  primaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  secondaryAmount: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "600",
    color: Colors.background,
  },
});
