import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { CryptoData } from "@/lib/store/crypto";

interface TopMoversProps {
  cryptos: CryptoData[];
}

export default function TopMovers({ cryptos }: TopMoversProps) {
  const topGainers = cryptos
    .filter((crypto) => crypto.price_change_percentage_24h > 0)
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )
    .slice(0, 5);

  const topLosers = cryptos
    .filter((crypto) => crypto.price_change_percentage_24h < 0)
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    )
    .slice(0, 5);

  const MoverCard = ({
    crypto,
    isGainer,
  }: {
    crypto: CryptoData;
    isGainer: boolean;
  }) => (
    <Pressable style={styles.moverCard}>
      <Image source={{ uri: crypto.image }} style={styles.cryptoImage} />
      <View style={styles.moverInfo}>
        <Text style={styles.cryptoSymbol}>{crypto.symbol.toUpperCase()}</Text>
        <Text style={styles.cryptoPrice}>
          {formatCurrency(crypto.current_price)}
        </Text>
      </View>
      <View style={styles.changeContainer}>
        <Ionicons
          name={isGainer ? "trending-up" : "trending-down"}
          size={16}
          color={isGainer ? Colors.success : Colors.error}
        />
        <Text
          style={[
            styles.changeText,
            { color: isGainer ? Colors.success : Colors.error },
          ]}
        >
          {formatPercent(Math.abs(crypto.price_change_percentage_24h))}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Top Gainers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚀 Top Gainers</Text>
          <Ionicons name="trending-up" size={20} color={Colors.success} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moversContainer}
        >
          {topGainers.map((crypto) => (
            <MoverCard key={crypto.id} crypto={crypto} isGainer={true} />
          ))}
        </ScrollView>
      </View>

      {/* Top Losers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📉 Top Losers</Text>
          <Ionicons name="trending-down" size={20} color={Colors.error} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moversContainer}
        >
          {topLosers.map((crypto) => (
            <MoverCard key={crypto.id} crypto={crypto} isGainer={false} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  moversContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  moverCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cryptoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  moverInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  cryptoPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
