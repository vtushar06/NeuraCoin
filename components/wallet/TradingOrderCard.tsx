import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatTimeAgo } from "@/lib/utils/format";
import type { TradingOrder } from "@/lib/types/wallet";

interface TradingOrderCardProps {
  order: TradingOrder;
  onPress?: () => void;
}

export default function TradingOrderCard({
  order,
  onPress,
}: TradingOrderCardProps) {
  const getOrderTypeStyle = () => {
    return order.type === "buy"
      ? { color: Colors.success, backgroundColor: Colors.success + "20" }
      : { color: Colors.error, backgroundColor: Colors.error + "20" };
  };

  const getStatusColor = () => {
    switch (order.status) {
      case "completed":
        return Colors.success;
      case "pending":
        return Colors.warning;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const orderTypeStyle = getOrderTypeStyle();

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Order Type Badge */}
      <View
        style={[
          styles.orderTypeBadge,
          { backgroundColor: orderTypeStyle.backgroundColor },
        ]}
      >
        <Ionicons
          name={order.type === "buy" ? "arrow-down" : "arrow-up"}
          size={16}
          color={orderTypeStyle.color}
        />
        <Text style={[styles.orderTypeText, { color: orderTypeStyle.color }]}>
          {order.type.toUpperCase()}
        </Text>
      </View>

      {/* Order Details */}
      <View style={styles.detailsSection}>
        <View style={styles.mainInfo}>
          <Text style={styles.cryptoName}>
            {order.cryptoName} ({order.cryptoSymbol.toUpperCase()})
          </Text>
          <Text style={styles.orderAmount}>
            {order.amount.toFixed(6)} {order.cryptoSymbol.toUpperCase()}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per unit:</Text>
            <Text style={styles.priceValue}>
              {order.pricePerUnit.toFixed(2)} NC
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total value:</Text>
            <Text style={styles.totalValue}>
              {order.totalValue.toFixed(2)} NC
            </Text>
          </View>

          {order.fee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Fee:</Text>
              <Text style={styles.feeValue}>{order.fee.toFixed(2)} NC</Text>
            </View>
          )}
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.timestampContainer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.timestamp}>
              {formatTimeAgo(order.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  orderTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsSection: {
    gap: 8,
  },
  mainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  priceInfo: {
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  feeValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
