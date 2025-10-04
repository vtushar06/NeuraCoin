import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useCryptoStore } from "@/lib/store/crypto";
import { useWalletStore } from "@/lib/store/wallet";
import TradingModal from "@/components/trading/TradingModal";
import QuickActionsModal from "./QuickActionsModal";
import type { CryptoData } from "@/lib/store/crypto";

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  badge?: string;
  disabled?: boolean;
}

function QuickActionCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
  badge,
  disabled = false,
}: QuickActionProps) {
  return (
    <Pressable
      style={[styles.actionCard, disabled && styles.actionCardDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons
          name={icon}
          size={24}
          color={disabled ? Colors.textSecondary : color}
        />
        {badge && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.actionContent}>
        <Text
          style={[
            styles.actionTitle,
            disabled && { color: Colors.textSecondary },
          ]}
        >
          {title}
        </Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actionArrow}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={disabled ? Colors.textSecondary : Colors.text}
        />
      </View>
    </Pressable>
  );
}

export default function QuickActions() {
  const { topCryptos } = useCryptoStore();
  const { wallet } = useWalletStore();

  const [tradingModalVisible, setTradingModalVisible] = useState(false);
  const [quickActionsModalVisible, setQuickActionsModalVisible] =
    useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  // Get popular cryptos for quick trading
  const popularCryptos = topCryptos.slice(0, 3);

  const handleQuickBuy = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setTradeType("buy");
    setTradingModalVisible(true);
  };

  const handleQuickSell = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setTradeType("sell");
    setTradingModalVisible(true);
  };

  const quickActions: QuickActionProps[] = [
    {
      icon: "trending-up",
      title: "Market Analysis",
      subtitle: "View market trends",
      color: Colors.success,
      onPress: () => router.push("/(tabs)/market"),
    },
    {
      icon: "wallet",
      title: "My Wallet",
      subtitle: `${wallet?.balance.toFixed(0) || "0"} NeuraCoins`,
      color: Colors.primary,
      onPress: () => router.push("/(tabs)/transactions"),
      badge: wallet && wallet.balance > 0 ? "NC" : undefined,
    },
    {
      icon: "pie-chart",
      title: "Portfolio",
      subtitle: "Track your holdings",
      color: Colors.warning,
      onPress: () => router.push("/(tabs)/portfolio"),
    },
    {
      icon: "newspaper",
      title: "Crypto News",
      subtitle: "Stay updated",
      color: Colors.info,
      onPress: () => router.push("/(tabs)/news"),
    },
    {
      icon: "gift",
      title: "Daily Rewards",
      subtitle: "Claim free NeuraCoins",
      color: Colors.warning,
      onPress: () => {
        setQuickActionsModalVisible(true);
      },
      badge: "🎁",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable onPress={() => setQuickActionsModalVisible(true)}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </View>

      {/* Quick Trading Section */}
      {popularCryptos.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Trading</Text>
            <Text style={styles.sectionSubtitle}>Popular cryptos</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tradingContainer}
          >
            {popularCryptos.map((crypto, index) => (
              <View key={crypto.id} style={styles.tradingCard}>
                <View style={styles.tradingHeader}>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoSymbol}>
                      {crypto.symbol.toUpperCase()}
                    </Text>
                    <Text style={styles.cryptoPrice}>
                      ${crypto.current_price.toLocaleString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.priceChangeContainer,
                      {
                        backgroundColor:
                          crypto.price_change_percentage_24h >= 0
                            ? Colors.success + "20"
                            : Colors.error + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        crypto.price_change_percentage_24h >= 0
                          ? "trending-up"
                          : "trending-down"
                      }
                      size={12}
                      color={
                        crypto.price_change_percentage_24h >= 0
                          ? Colors.success
                          : Colors.error
                      }
                    />
                    <Text
                      style={[
                        styles.priceChange,
                        {
                          color:
                            crypto.price_change_percentage_24h >= 0
                              ? Colors.success
                              : Colors.error,
                        },
                      ]}
                    >
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.tradingActions}>
                  <Pressable
                    style={[styles.tradingButton, styles.buyButton]}
                    onPress={() => handleQuickBuy(crypto)}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={16}
                      color={Colors.background}
                    />
                    <Text style={styles.tradingButtonText}>Buy</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.tradingButton, styles.sellButton]}
                    onPress={() => handleQuickSell(crypto)}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={16}
                      color={Colors.background}
                    />
                    <Text style={styles.tradingButtonText}>Sell</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {/* View All Trading Card */}
            <Pressable
              style={styles.viewAllTradingCard}
              onPress={() => router.push("/(tabs)/market")}
            >
              <View style={styles.viewAllTradingContent}>
                <Ionicons
                  name="add-circle-outline"
                  size={32}
                  color={Colors.primary}
                />
                <Text style={styles.viewAllTradingText}>View All</Text>
                <Text style={styles.viewAllTradingSubtext}>
                  {topCryptos.length}+ cryptos
                </Text>
              </View>
            </Pressable>
          </ScrollView>
        </>
      )}

      {/* Educational Banner */}
      <View style={styles.educationalBanner}>
        <View style={styles.educationalIcon}>
          <Ionicons name="bulb" size={20} color={Colors.warning} />
        </View>
        <View style={styles.educationalContent}>
          <Text style={styles.educationalTitle}>💡 Trading Tip</Text>
          <Text style={styles.educationalText}>
            Start with small amounts to practice. This is virtual trading -
            perfect for learning!
          </Text>
        </View>
      </View>

      {/* Trading Modal */}
      <TradingModal
        visible={tradingModalVisible}
        crypto={selectedCrypto}
        initialType={tradeType}
        onClose={() => {
          setTradingModalVisible(false);
          setSelectedCrypto(null);
        }}
      />

      {/* Quick Actions Modal */}
      <QuickActionsModal
        visible={quickActionsModalVisible}
        onClose={() => setQuickActionsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  actionsGrid: {
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.background,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionArrow: {
    marginLeft: 12,
  },
  tradingContainer: {
    paddingRight: 24,
    gap: 16,
  },
  tradingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    width: 160,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tradingHeader: {
    marginBottom: 16,
  },
  cryptoInfo: {
    marginBottom: 8,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  cryptoPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  priceChange: {
    fontSize: 11,
    fontWeight: "600",
  },
  tradingActions: {
    flexDirection: "row",
    gap: 8,
  },
  tradingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  buyButton: {
    backgroundColor: Colors.success,
  },
  sellButton: {
    backgroundColor: Colors.error,
  },
  tradingButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.background,
  },
  viewAllTradingCard: {
    width: 160,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  viewAllTradingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  viewAllTradingText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 8,
  },
  viewAllTradingSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  educationalBanner: {
    flexDirection: "row",
    backgroundColor: Colors.warning + "10",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.warning + "20",
  },
  educationalIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
  },
  educationalContent: {
    flex: 1,
  },
  educationalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  educationalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});