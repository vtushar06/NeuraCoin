import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Gradients } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";

const { width } = Dimensions.get("window");

export default function WelcomeSuccessScreen() {
  const { user, markUserAsExisting } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Start welcome animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    // Mark user as existing so they don't see this screen again
    await markUserAsExisting();

    router.replace("/(tabs)");
  };


  return (
    <LinearGradient colors={Gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Animated Welcome Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Success Animation */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={80}
                  color={Colors.success}
                />
              </View>

              {/* Confetti Animation */}
              <View style={styles.confetti}>
                {["🎉", "🚀", "💰", "⭐", "🎊", "✨"].map((emoji, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.confettiEmoji,
                      {
                        left: Math.random() * width,
                        animationDelay: `${Math.random() * 2}s`,
                      },
                    ]}
                  >
                    {emoji}
                  </Text>
                ))}
              </View>
            </View>

            {/* Welcome Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.welcomeTitle}>
                🎉 Welcome to NeuraCoin, {user?.firstName}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Your account has been created successfully and you're ready to
                start your crypto journey!
              </Text>
            </View>

            {/* Bonus Cards */}
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusTitle}>Your Welcome Rewards</Text>

              {/* NeuraCoins Bonus */}
              <View style={styles.bonusCard}>
                <View style={styles.bonusIcon}>
                  <Ionicons name="wallet" size={32} color={Colors.warning} />
                </View>
                <View style={styles.bonusContent}>
                  <Text style={styles.bonusAmount}>1,000 NeuraCoins</Text>
                  <Text style={styles.bonusDescription}>
                    Virtual currency to start trading immediately
                  </Text>
                </View>
              </View>

              {/* Bitcoin Bonus */}
              <View style={styles.bonusCard}>
                <View style={styles.bonusIcon}>
                  <Image
                    source={{
                      uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    }}
                    style={styles.cryptoIcon}
                  />
                </View>
                <View style={styles.bonusContent}>
                  <Text style={styles.bonusAmount}>Free Bitcoin</Text>
                  <Text style={styles.bonusDescription}>
                    Worth 10,000 NeuraCoins in your portfolio
                  </Text>
                </View>
              </View>

              {/* Daily Rewards */}
              <View style={styles.bonusCard}>
                <View style={styles.bonusIcon}>
                  <Ionicons name="gift" size={32} color={Colors.success} />
                </View>
                <View style={styles.bonusContent}>
                  <Text style={styles.bonusAmount}>Daily Rewards</Text>
                  <Text style={styles.bonusDescription}>
                    Earn 100 NeuraCoins every day you log in
                  </Text>
                </View>
              </View>
            </View>

            {/* Features Preview */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What You Can Do</Text>

              <View style={styles.featuresGrid}>
                <FeatureCard
                  icon="trending-up"
                  title="Virtual Trading"
                  description="Buy & sell crypto risk-free"
                  color={Colors.success}
                />
                <FeatureCard
                  icon="pie-chart"
                  title="Portfolio"
                  description="Track your investments"
                  color={Colors.primary}
                />
                <FeatureCard
                  icon="newspaper"
                  title="Market News"
                  description="Stay updated with trends"
                  color={Colors.info}
                />
                <FeatureCard
                  icon="school"
                  title="Learn Trading"
                  description="Educational resources"
                  color={Colors.warning}
                />
              </View>
            </View>

            {/* Get Started Button */}
            <Pressable
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedText}>Start Trading Now</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.background}
              />
            </Pressable>

            {/* Educational Note */}
            <View style={styles.educationalNote}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.info}
              />
              <Text style={styles.educationalText}>
                💡 This is a virtual trading platform. No real money is involved
                - perfect for learning!
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  successIcon: {
    marginBottom: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  confetti: {
    position: "absolute",
    top: -50,
    left: -50,
    right: -50,
    height: 100,
  },
  confettiEmoji: {
    position: "absolute",
    fontSize: 20,
    opacity: 0.8,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bonusContainer: {
    width: "100%",
    marginBottom: 40,
  },
  bonusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  bonusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bonusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bonusContent: {
    flex: 1,
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  bonusDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  featureCard: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 16,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
    gap: 8,
  },
  getStartedText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
  educationalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  educationalText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },
});
