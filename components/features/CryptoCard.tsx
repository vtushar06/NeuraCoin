import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { CryptoData } from "@/lib/store/crypto";

interface CryptoCardProps {
  crypto: CryptoData;
  onPress: () => void;
  delay?: number; // Keep this for future use, but won't use it now
}

export default function CryptoCard({
  crypto,
  onPress,
  delay = 0,
}: CryptoCardProps) {
  const isPositive = crypto.price_change_percentage_24h >= 0;

  return (
    <View>
      <Pressable style={styles.container} onPress={onPress}>
        <View style={styles.leftSection}>
          <Image
            source={{ uri: crypto.image }}
            style={styles.cryptoIcon}
            defaultSource={{
              uri:
                "https://via.placeholder.com/32x32.png?text=" +
                crypto.symbol.toUpperCase(),
            }}
          />
          <View style={styles.cryptoInfo}>
            <Text style={styles.cryptoName}>{crypto.name}</Text>
            <Text style={styles.cryptoSymbol}>
              {crypto.symbol.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.price}>
            {formatCurrency(crypto.current_price)}
          </Text>
          <View style={styles.changeContainer}>
            <Ionicons
              name={isPositive ? "trending-up" : "trending-down"}
              size={12}
              color={isPositive ? Colors.success : Colors.error}
            />
            <Text
              style={[
                styles.change,
                { color: isPositive ? Colors.success : Colors.error },
              ]}
            >
              {formatPercent(Math.abs(crypto.price_change_percentage_24h))}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: "500",
  },
});
