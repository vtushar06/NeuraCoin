import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useWalletStore } from "@/lib/store/wallet";

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  badge?: string;
  comingSoon?: boolean;
}

export default function QuickActionsModal({
  visible,
  onClose,
}: QuickActionsModalProps) {
  const { wallet, addReward } = useWalletStore();

  const handleDailyReward = async () => {
    await addReward("daily_login", 100);
    Alert.alert(
      "🎉 Daily Reward Claimed!",
      "You earned 100 NeuraCoins! Come back tomorrow for more.",
      [{ text: "Awesome!", onPress: onClose }]
    );
  };

  const handleReferFriend = () => {
    Alert.alert(
      "👥 Refer Friends",
      "Invite friends to NeuraCoin and earn 500 NeuraCoins for each friend who joins!",
      [
        {
          text: "Share Link",
          onPress: () => console.log("Share referral link"),
        },
        { text: "Later", style: "cancel" },
      ]
    );
  };

  const allActions: ActionItem[] = [
    // Trading Actions
    {
      id: "market",
      icon: "trending-up",
      title: "Market Analysis",
      description: "View live charts and market trends",
      color: Colors.success,
      onPress: () => {
        onClose();
        router.push("/(tabs)/market");
      },
    },
    {
      id: "portfolio",
      icon: "pie-chart",
      title: "Portfolio",
      description: "Track your virtual investments",
      color: Colors.warning,
      onPress: () => {
        onClose();
        router.push("/(tabs)/portfolio");
      },
    },
    {
      id: "transactions",
      icon: "receipt",
      title: "Transactions",
      description: "View your trading history",
      color: Colors.primary,
      onPress: () => {
        onClose();
        router.push("/(tabs)/transactions");
      },
    },

    // Wallet Actions
    {
      id: "wallet",
      icon: "wallet",
      title: "My Wallet",
      description: `${wallet?.balance.toFixed(0) || "0"} NeuraCoins available`,
      color: Colors.primary,
      onPress: () => {
        onClose();
        router.push("/(tabs)/transactions");
      },
      badge: "NC",
    },
    {
      id: "daily_reward",
      icon: "gift",
      title: "Daily Reward",
      description: "Claim your daily 100 NeuraCoins",
      color: Colors.warning,
      onPress: handleDailyReward,
      badge: "🎁",
    },
    {
      id: "refer_friends",
      icon: "people",
      title: "Refer Friends",
      description: "Earn 500 NC for each referral",
      color: Colors.success,
      onPress: handleReferFriend,
      badge: "+500",
    },

    // Educational Actions
    {
      id: "news",
      icon: "newspaper",
      title: "Crypto News",
      description: "Stay updated with market news",
      color: Colors.info,
      onPress: () => {
        onClose();
        router.push("/(tabs)/news");
      },
    },
    {
      id: "learn",
      icon: "school",
      title: "Learn Trading",
      description: "Educational resources and guides",
      color: Colors.secondary,
      onPress: () => {
        Alert.alert(
          "📚 Learning Center",
          "Access trading tutorials, market analysis guides, and risk management tips.",
          [{ text: "Coming Soon!", onPress: onClose }]
        );
      },
      comingSoon: true,
    },

    // Advanced Features
    {
      id: "price_alerts",
      icon: "notifications",
      title: "Price Alerts",
      description: "Set alerts for price movements",
      color: Colors.error,
      onPress: () => {
        Alert.alert(
          "🔔 Price Alerts",
          "Get notified when your favorite cryptos reach target prices.",
          [{ text: "Coming Soon!", onPress: onClose }]
        );
      },
      comingSoon: true,
    },
    {
      id: "watchlist",
      icon: "bookmark",
      title: "Watchlist",
      description: "Track your favorite cryptos",
      color: Colors.primary,
      onPress: () => {
        Alert.alert(
          "⭐ Watchlist",
          "Create a personalized watchlist to track your favorite cryptocurrencies.",
          [{ text: "Coming Soon!", onPress: onClose }]
        );
      },
      comingSoon: true,
    },
    {
      id: "leaderboard",
      icon: "trophy",
      title: "Leaderboard",
      description: "Compete with other traders",
      color: Colors.warning,
      onPress: () => {
        Alert.alert(
          "🏆 Trading Leaderboard",
          "See how your virtual trading performance compares to other users.",
          [{ text: "Coming Soon!", onPress: onClose }]
        );
      },
      comingSoon: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Actions</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        {/* Actions List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.actionsContainer}>
            {allActions.map((action, index) => (
              <Pressable
                key={action.id}
                style={[
                  styles.actionItem,
                  action.comingSoon && styles.actionItemDisabled,
                ]}
                onPress={action.onPress}
                disabled={action.comingSoon}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={24}
                    color={
                      action.comingSoon ? Colors.textSecondary : action.color
                    }
                  />
                  {action.badge && !action.comingSoon && (
                    <View
                      style={[
                        styles.actionBadge,
                        { backgroundColor: action.color },
                      ]}
                    >
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                  {action.comingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      action.comingSoon && { color: Colors.textSecondary },
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {action.description}
                  </Text>
                </View>

                <View style={styles.actionArrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      action.comingSoon ? Colors.textSecondary : Colors.text
                    }
                  />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 All trading is virtual and risk-free. Perfect for learning!
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  actionsContainer: {
    padding: 24,
    gap: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionItemDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  actionBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: Colors.background,
  },
  comingSoonBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 8,
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
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionArrow: {
    marginLeft: 16,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});
