import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";

export default function LoginScreen() {
  const { signIn, isLoading, error, clearError } = useAuthStore(); // Use signIn instead of login

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSignIn = async () => {
  if (!validateForm()) return;

  clearError();
  console.log("🔑 Attempting to sign in with:", email);

  try {
    const success = await signIn(email.trim().toLowerCase(), password);

    if (success) {
      const { user } = useAuthStore.getState();

      if (user?.isNewUser) {
        console.log("✅ New user signed in, going to welcome-success");
        router.replace("/welcome-success");
      } else {
        console.log("✅ Existing user signed in, going to home");
        router.replace("/(tabs)");
      }
    }
  } catch (error) {
    console.error("❌ Sign in failed:", error);
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your crypto trading journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  validationErrors.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  validationErrors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorText}>
                  {validationErrors.password}
                </Text>
              )}
            </View>

            {/* Global Error */}
            {error && (
              <View style={styles.globalError}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <Pressable
              style={[
                styles.signInButton,
                (isLoading || !email || !password) &&
                  styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.background} />
                  <Text style={styles.signInButtonText}>Signing In...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color={Colors.background} />
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Link href="/register" style={styles.footerLink}>
                Create Account
              </Link>
            </Text>
          </View>

          {/* Demo Info */}
          <View style={styles.demoInfo}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={Colors.info}
            />
            <Text style={styles.demoInfoText}>
              Demo Mode: Use any password with your registered email
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + "10",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  globalError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error + "20",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  globalErrorText: {
    fontSize: 14,
    color: Colors.error,
    flex: 1,
  },
  signInButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  signInButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  demoInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.info + "10",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  demoInfoText: {
    fontSize: 12,
    color: Colors.info,
    flex: 1,
  },
});
