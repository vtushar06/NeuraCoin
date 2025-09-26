import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/lib/utils/format";
import { useWalletStore } from "@/lib/store/wallet";
import SuccessAnimation from "@/components/ui/SuccessAnimation";
import type { CryptoData } from "@/lib/store/crypto";

interface TradingModalProps {
  visible: boolean;
  crypto: CryptoData | null;
  initialType?: "buy" | "sell";
  onClose: () => void;
}

export default function TradingModal({
  visible,
  crypto,
  initialType = "buy",
  onClose,
}: TradingModalProps) {
  const { wallet, buyCrypto, sellCrypto, isProcessing } = useWalletStore();

  const [tradeType, setTradeType] = useState<"buy" | "sell">(initialType);
  const [amount, setAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState({ title: "", message: "" });

  useEffect(() => {
    setTradeType(initialType);
  }, [initialType]);

  useEffect(() => {
    validateAmount();
  }, [amount, tradeType, crypto, wallet]);

  const validateAmount = () => {
    if (!amount || !crypto || !wallet) {
      setIsValidAmount(false);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setIsValidAmount(false);
      return;
    }

    if (tradeType === "buy") {
      const totalCost = numAmount * crypto.current_price;
      const fee = totalCost * 0.001;
      const totalWithFee = totalCost + fee;
      setIsValidAmount(wallet.balance >= totalWithFee);
    } else {
      // For sell, we'd need to check portfolio holdings
      // For now, we'll assume it's valid if amount is reasonable
      setIsValidAmount(numAmount <= 10); // Max 10 units to sell
    }
  };

  const getTotalCost = () => {
    if (!amount || !crypto) return 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return numAmount * crypto.current_price;
  };

  const getFee = () => {
    return getTotalCost() * 0.001; // 0.1% fee
  };

  const getTotalWithFee = () => {
    return getTotalCost() + getFee();
  };

  const handleTrade = async () => {
    if (!crypto || !amount || !isValidAmount) return;

    const numAmount = parseFloat(amount);
    const success =
      tradeType === "buy"
        ? await buyCrypto(crypto.id, numAmount, crypto.current_price)
        : await sellCrypto(crypto.id, numAmount, crypto.current_price);

    if (success) {
      // Show success animation
      setSuccessData({
        title: `${tradeType === "buy" ? "Purchase" : "Sale"} Successful! 🎉`,
        message: `You have ${tradeType === "buy" ? "bought" : "sold"} ${numAmount.toFixed(6)} ${crypto.symbol.toUpperCase()}. Check your portfolio!`,
      });
      setShowSuccessAnimation(true);
    } else {
      Alert.alert(
        "Trade Failed",
        "There was an error processing your trade. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false);
    handleClose();

    // Navigate to portfolio after successful buy
    if (tradeType === "buy") {
      setTimeout(() => {
        router.push("/(tabs)/portfolio");
      }, 100);
    }
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  if (!visible || !crypto) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image
                  source={{ uri: crypto.image }}
                  style={styles.cryptoImage}
                />
                <View>
                  <Text style={styles.cryptoName}>{crypto.name}</Text>
                  <Text style={styles.cryptoPrice}>
                    {formatCurrency(crypto.current_price)}
                  </Text>
                  <View style={styles.priceChangeContainer}>
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
                        styles.priceChangeText,
                        {
                          color:
                            crypto.price_change_percentage_24h >= 0
                              ? Colors.success
                              : Colors.error,
                        },
                      ]}
                    >
                      {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                      {crypto.price_change_percentage_24h.toFixed(2)}% 24h
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            {/* Trade Type Selector */}
            <View style={styles.tradeTypeContainer}>
              <Pressable
                style={[
                  styles.tradeTypeButton,
                  tradeType === "buy" && styles.tradeTypeButtonActive,
                  {
                    borderColor:
                      tradeType === "buy" ? Colors.success : Colors.border,
                    backgroundColor:
                      tradeType === "buy"
                        ? Colors.success + "20"
                        : "transparent",
                  },
                ]}
                onPress={() => setTradeType("buy")}
              >
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={
                    tradeType === "buy" ? Colors.success : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.tradeTypeText,
                    {
                      color:
                        tradeType === "buy"
                          ? Colors.success
                          : Colors.textSecondary,
                    },
                  ]}
                >
                  Buy {crypto.symbol.toUpperCase()}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tradeTypeButton,
                  tradeType === "sell" && styles.tradeTypeButtonActive,
                  {
                    borderColor:
                      tradeType === "sell" ? Colors.error : Colors.border,
                    backgroundColor:
                      tradeType === "sell"
                        ? Colors.error + "20"
                        : "transparent",
                  },
                ]}
                onPress={() => setTradeType("sell")}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={
                    tradeType === "sell" ? Colors.error : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.tradeTypeText,
                    {
                      color:
                        tradeType === "sell"
                          ? Colors.error
                          : Colors.textSecondary,
                    },
                  ]}
                >
                  Sell {crypto.symbol.toUpperCase()}
                </Text>
              </Pressable>
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Amount to {tradeType} ({crypto.symbol.toUpperCase()})
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  !isValidAmount && amount && styles.inputWrapperError,
                ]}
              >
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00000000"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.cryptoSymbol}>
                  {crypto.symbol.toUpperCase()}
                </Text>
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                <Text style={styles.quickAmountLabel}>Quick amounts:</Text>
                <View style={styles.quickAmountButtons}>
                  {["0.001", "0.01", "0.1", "1"].map((quickAmount) => (
                    <Pressable
                      key={quickAmount}
                      style={[
                        styles.quickAmountButton,
                        amount === quickAmount &&
                          styles.quickAmountButtonActive,
                      ]}
                      onPress={() => setAmount(quickAmount)}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          amount === quickAmount &&
                            styles.quickAmountTextActive,
                        ]}
                      >
                        {quickAmount}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Market Price Info */}
              <View style={styles.marketInfo}>
                <Text style={styles.marketInfoLabel}>Market Price:</Text>
                <Text style={styles.marketInfoValue}>
                  1 {crypto.symbol.toUpperCase()} ={" "}
                  {crypto.current_price.toFixed(2)} NC
                </Text>
              </View>
            </View>

            {/* Trade Summary */}
            {amount && crypto && parseFloat(amount) > 0 && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Trade Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {parseFloat(amount).toFixed(8)}{" "}
                    {crypto.symbol.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Price per unit:</Text>
                  <Text style={styles.summaryValue}>
                    {crypto.current_price.toFixed(2)} NC
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {tradeType === "buy" ? "Subtotal:" : "You receive:"}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {getTotalCost().toFixed(2)} NC
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Trading fee (0.1%):</Text>
                  <Text style={styles.summaryValue}>
                    {getFee().toFixed(2)} NC
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelTotal}>
                    Total {tradeType === "buy" ? "cost:" : "received:"}
                  </Text>
                  <Text
                    style={[
                      styles.summaryValueTotal,
                      {
                        color:
                          tradeType === "buy" ? Colors.error : Colors.success,
                      },
                    ]}
                  >
                    {tradeType === "buy" ? "-" : "+"}
                    {getTotalWithFee().toFixed(2)} NC
                  </Text>
                </View>

                {/* Balance Info */}
                {wallet && (
                  <View style={styles.balanceInfo}>
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>
                        Available balance:
                      </Text>
                      <Text style={styles.balanceValue}>
                        {wallet.balance.toFixed(2)} NC
                      </Text>
                    </View>

                    {tradeType === "buy" && (
                      <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>After trade:</Text>
                        <Text
                          style={[
                            styles.balanceValue,
                            {
                              color: isValidAmount
                                ? Colors.success
                                : Colors.error,
                            },
                          ]}
                        >
                          {(wallet.balance - getTotalWithFee()).toFixed(2)} NC
                        </Text>
                      </View>
                    )}

                    {!isValidAmount && amount && (
                      <Text style={styles.errorText}>
                        {tradeType === "buy"
                          ? "Insufficient NeuraCoins balance"
                          : "Invalid amount"}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Trade Button */}
            <Pressable
              style={[
                styles.tradeButton,
                {
                  backgroundColor:
                    isValidAmount && !isProcessing && amount
                      ? tradeType === "buy"
                        ? Colors.success
                        : Colors.error
                      : Colors.textSecondary,
                },
              ]}
              onPress={handleTrade}
              disabled={!isValidAmount || isProcessing || !amount}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color={Colors.background} />
                  <Text style={styles.tradeButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name={tradeType === "buy" ? "arrow-down" : "arrow-up"}
                    size={20}
                    color={Colors.background}
                  />
                  <Text style={styles.tradeButtonText}>
                    {tradeType === "buy" ? "Buy Now" : "Sell Now"}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Educational Notes */}
            <View style={styles.educationalNotes}>
              <View style={styles.educationalNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.educationalText}>
                  This is virtual trading with NeuraCoins. No real money is
                  involved.
                </Text>
              </View>

              <View style={styles.educationalNote}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={Colors.success}
                />
                <Text style={styles.educationalText}>
                  All trades are executed instantly at current market prices.
                </Text>
              </View>

              {tradeType === "buy" && (
                <View style={styles.educationalNote}>
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={Colors.warning}
                  />
                  <Text style={styles.educationalText}>
                    Your purchase will appear in your portfolio immediately.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccessAnimation}
        title={successData.title}
        message={successData.message}
        onComplete={handleSuccessComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cryptoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cryptoName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  cryptoPrice: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  tradeTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  tradeTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  tradeTypeButtonActive: {
    // Active styles are applied dynamically
  },
  tradeTypeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    paddingVertical: 16,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  quickAmounts: {
    marginTop: 16,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  quickAmountTextActive: {
    color: Colors.background,
  },
  marketInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primary + "10",
    borderRadius: 8,
  },
  marketInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  marketInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  summaryContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 8,
    textAlign: "center",
  },
  tradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  tradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.background,
  },
  educationalNotes: {
    gap: 12,
  },
  educationalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  educationalText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
