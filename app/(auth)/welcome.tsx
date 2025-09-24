import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image, // Add this import
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1200&fit=crop",
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(26, 26, 46, 0.8)", "rgba(0, 0, 0, 0.9)"]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            {/* Add Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo-icon-1.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>NeuraCoin</Text>
            <Text style={styles.subtitle}>
              Your Gateway to the Future of Finance
            </Text>
          </View>

          <View style={styles.features}>
            <FeatureItem icon="💰" text="Trade cryptocurrencies securely" />
            <FeatureItem icon="📈" text="Real-time market analytics" />
            <FeatureItem icon="🔒" text="Bank-level security" />
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
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
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  // Add logo styles
  logoContainer: {
    width: 156,
    height: 156,
    backgroundColor: "transparent", // Force transparent background
    borderRadius: 32, // Circular container
    overflow: "hidden", // Clip any background artifacts
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogo: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    marginHorizontal: 20,
  },
  features: {
    gap: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  buttons: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
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
});
