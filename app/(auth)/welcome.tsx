import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1200&fit=crop",
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(26, 26, 46, 0.85)", "rgba(0, 0, 0, 0.9)"]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.header}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Image
                  source={require("@/assets/images/logo-icon-1.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.title}>NeuraCoin</Text>
            <Text style={styles.subtitle}>
              Master Crypto Trading with Virtual Money
            </Text>
            <Text style={styles.description}>
              Learn, practice, and master cryptocurrency trading in a risk-free
              environment with real market data.
            </Text>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Why Choose NeuraCoin?</Text>

            <FeatureItem
              icon="shield-checkmark"
              text="100% Risk-Free Learning"
              color={Colors.success}
            />
            <FeatureItem
              icon="trending-up"
              text="Real Market Data & Charts"
              color={Colors.primary}
            />
            <FeatureItem
              icon="wallet"
              text="Virtual NeuraCoins & Portfolio"
              color={Colors.warning}
            />
            <FeatureItem
              icon="school"
              text="Educational Trading Resources"
              color={Colors.info}
            />
            <FeatureItem
              icon="gift"
              text="Daily Rewards & Bonuses"
              color={Colors.secondary}
            />
          </View>

          {/* Welcome Bonus Banner */}
          <View style={styles.bonusBanner}>
            <View style={styles.bonusContent}>
              <Text style={styles.bonusTitle}>🎁 Sign Up Bonus</Text>
              <Text style={styles.bonusText}>
                Get 1,000 NeuraCoins + Free Bitcoin worth 10,000 NC
              </Text>
            </View>
            <View style={styles.bonusAmount}>
              <Text style={styles.bonusValue}>11,000</Text>
              <Text style={styles.bonusUnit}>NC Value</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push("/register")}
            >
              <Ionicons name="person-add" size={20} color={Colors.background} />
              <Text style={styles.primaryButtonText}>Create Free Account</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/login")}
            >
              <Ionicons name="log-in" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </Pressable>

            <Pressable style={styles.demoButton}>
              <Text style={styles.demoButtonText}>
                👀 View Demo Trading Interface
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Join 10,000+ users learning crypto trading safely
            </Text>
          </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

function FeatureItem({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.feature}>
      <View
        style={[styles.featureIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 15,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logo: {
    width: 128,
    height: 128,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  features: {
    marginTop: 24,
    marginBottom: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  bonusBanner: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "20",
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
    alignItems: "center",
  },
  bonusContent: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bonusAmount: {
    alignItems: "center",
    paddingLeft: 16,
  },
  bonusValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  bonusUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  buttons: {
    gap: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  demoButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  demoButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
