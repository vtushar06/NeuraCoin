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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterScreen() {
  const { register, signIn, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation (required)
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation (optional - can be empty)
    // No validation needed for lastName - it's optional now

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Simplified password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.general =
        "Please accept the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleRegister = async () => {
   if (!validateForm()) {
     return;
   }

   try {
     const success = await register({
       firstName: formData.firstName.trim(),
       lastName: formData.lastName.trim() || "",
       email: formData.email.trim().toLowerCase(),
       password: formData.password,
     });

     if (success) {
       console.log("🎉 Registration successful, signing in...");

       const signInSuccess = await signIn(
         formData.email.trim().toLowerCase(),
         formData.password
       );

       if (signInSuccess) {
         console.log("✅ Auto sign-in successful, going to welcome-success");
         router.replace("/welcome-success");
       }
     }
   } catch (error) {
     console.error("Registration error:", error);
     setErrors({
       general:
         error instanceof Error
           ? error.message
           : "Registration failed. Please try again.",
     });
   }
 };



  // const handleRegister = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   try {
  //     const success = await register({
  //       firstName: formData.firstName.trim(),
  //       lastName: formData.lastName.trim() || "",
  //       email: formData.email.trim().toLowerCase(),
  //       password: formData.password,
  //     });

  //     if (success) {
  //       // Show success message and go back to welcome page (not welcome-success)
  //       Alert.alert(
  //         "🎉 Registration Successful!",
  //         `Welcome ${formData.firstName}! Your account has been created. Please sign in to start trading.`,
  //         [
  //           {
  //             text: "Sign In Now",
  //             onPress: () => {
  //               // Go back to welcome page where user can sign in
  //               router.replace("/(auth)/welcome");
  //             },
  //           },
  //         ]
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Registration error:", error);
  //     setErrors({
  //       general:
  //         error instanceof Error
  //           ? error.message
  //           : "Registration failed. Please try again.",
  //     });
  //   }
  // };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.backButton}>
              <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join NeuraCoin and start your virtual crypto trading journey
            </Text>
          </View>

          {/* Welcome Bonus Banner */}
          <View style={styles.bonusBanner}>
            <View style={styles.bonusIcon}>
              <Ionicons name="gift" size={24} color={Colors.warning} />
            </View>
            <View style={styles.bonusContent}>
              <Text style={styles.bonusTitle}>🎁 Welcome Bonus!</Text>
              <Text style={styles.bonusText}>
                Get 1,000 NeuraCoins + Free Bitcoin worth 10,000 NC
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.firstName && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => updateFormData("firstName", text)}
                  placeholder="Enter your first name"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Last Name <Text style={styles.optional}>(optional)</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.lastName && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => updateFormData("lastName", text)}
                  placeholder="Enter your last name (optional)"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateFormData("password", text)}
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    updateFormData("confirmPassword", text)
                  }
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Simplified Password Info */}
            <View style={styles.passwordInfo}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.info}
              />
              <Text style={styles.passwordInfoText}>
                Password must be at least 4 characters
              </Text>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Pressable
                style={styles.checkbox}
                onPress={() => {
                  setAcceptTerms(!acceptTerms);
                  if (!acceptTerms && errors.general) {
                    setErrors((prev) => ({ ...prev, general: undefined }));
                  }
                }}
              >
                <Ionicons
                  name={acceptTerms ? "checkbox" : "square-outline"}
                  size={20}
                  color={acceptTerms ? Colors.primary : Colors.textSecondary}
                />
              </Pressable>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* General Error */}
            {errors.general && (
              <Text style={styles.generalError}>{errors.general}</Text>
            )}

            {/* Register Button */}
            <Pressable
              style={[
                styles.registerButton,
                (isLoading || !acceptTerms) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.background} />
                  <Text style={styles.registerButtonText}>
                    Creating Account...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="person-add"
                    size={20}
                    color={Colors.background}
                  />
                  <Text style={styles.registerButtonText}>
                    Create Free Account
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Link href="/login" style={styles.footerLink}>
                Sign In
              </Link>
            </Text>
          </View>

          {/* Educational Note */}
          <View style={styles.educationalNote}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={Colors.info}
            />
            <Text style={styles.educationalText}>
              NeuraCoin is a virtual trading platform for learning
              cryptocurrency trading risk-free. No real money or personal
              financial information is required.
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
    marginBottom: 32,
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
  bonusBanner: {
    flexDirection: "row",
    backgroundColor: Colors.warning + "15",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.warning + "30",
  },
  bonusIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
  },
  bonusContent: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  optional: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginTop: 4,
    marginLeft: 4,
  },
  passwordInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.info + "10",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  passwordInfoText: {
    fontSize: 12,
    color: Colors.info,
    flex: 1,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  generalError: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.error + "20",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
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
  educationalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.info + "10",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.info + "20",
  },
  educationalText: {
    flex: 1,
    fontSize: 12,
    color: Colors.info,
    lineHeight: 16,
  },
});
