import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/lib/utils/format";
import { storage } from "@/lib/storage/storage";
import type { CryptoData } from "@/lib/store/crypto";

interface PriceAlert {
  id: string;
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  targetPrice: number;
  currentPrice: number;
  type: "above" | "below";
  isActive: boolean;
  createdAt: string;
}

interface PriceAlertsProps {
  cryptos: CryptoData[];
  onClose: () => void;
}

const ALERTS_STORAGE_KEY = "price_alerts";

export default function PriceAlerts({ cryptos, onClose }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");

  // Load alerts from storage
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const storedAlerts =
        await storage.getObject<PriceAlert[]>(ALERTS_STORAGE_KEY);
      if (storedAlerts) {
        setAlerts(storedAlerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const saveAlerts = async (updatedAlerts: PriceAlert[]) => {
    try {
      await storage.setObject(ALERTS_STORAGE_KEY, updatedAlerts);
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Error saving alerts:", error);
    }
  };

  const addAlert = () => {
    if (!selectedCrypto || !targetPrice) {
      Alert.alert(
        "Error",
        "Please select a cryptocurrency and enter a target price."
      );
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price.");
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      cryptoId: selectedCrypto.id,
      cryptoName: selectedCrypto.name,
      cryptoSymbol: selectedCrypto.symbol,
      targetPrice: price,
      currentPrice: selectedCrypto.current_price,
      type: alertType,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updatedAlerts = [...alerts, newAlert];
    saveAlerts(updatedAlerts);

    // Reset form
    setSelectedCrypto(null);
    setTargetPrice("");
    setShowAddAlert(false);

    Alert.alert("Success", "Price alert created successfully!");
  };

  const toggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(updatedAlerts);
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this price alert?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedAlerts = alerts.filter(
              (alert) => alert.id !== alertId
            );
            saveAlerts(updatedAlerts);
          },
        },
      ]
    );
  };

  const checkAlerts = () => {
    const triggeredAlerts = alerts.filter((alert) => {
      if (!alert.isActive) return false;

      const crypto = cryptos.find((c) => c.id === alert.cryptoId);
      if (!crypto) return false;

      return (
        (alert.type === "above" && crypto.current_price >= alert.targetPrice) ||
        (alert.type === "below" && crypto.current_price <= alert.targetPrice)
      );
    });

    if (triggeredAlerts.length > 0) {
      const message = triggeredAlerts
        .map(
          (alert) =>
            `${alert.cryptoSymbol.toUpperCase()}: ${formatCurrency(alert.targetPrice)}`
        )
        .join("\n");

      Alert.alert("🔔 Price Alerts Triggered!", message);
    }
  };

  // Check alerts when component mounts
  useEffect(() => {
    if (alerts.length > 0) {
      checkAlerts();
    }
  }, [cryptos]);

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Price Alerts</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        {/* Add Alert Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddAlert(true)}
        >
          <Ionicons name="add" size={20} color={Colors.background} />
          <Text style={styles.addButtonText}>Add Price Alert</Text>
        </Pressable>

        {/* Alerts List */}
        <ScrollView style={styles.alertsList}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>No price alerts yet</Text>
              <Text style={styles.emptySubtext}>
                Create alerts to get notified when prices reach your targets
              </Text>
            </View>
          ) : (
            alerts.map((alert) => {
              const crypto = cryptos.find((c) => c.id === alert.cryptoId);
              const currentPrice = crypto?.current_price || alert.currentPrice;

              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertCrypto}>
                      {alert.cryptoSymbol.toUpperCase()} / {alert.cryptoName}
                    </Text>
                    <Switch
                      value={alert.isActive}
                      onValueChange={() => toggleAlert(alert.id)}
                      trackColor={{
                        false: Colors.border,
                        true: Colors.primary,
                      }}
                      thumbColor={Colors.background}
                    />
                  </View>

                  <View style={styles.alertDetails}>
                    <View style={styles.priceRow}>
                      <Text style={styles.alertLabel}>Target:</Text>
                      <Text
                        style={[
                          styles.targetPrice,
                          {
                            color:
                              alert.type === "above"
                                ? Colors.success
                                : Colors.error,
                          },
                        ]}
                      >
                        {alert.type === "above" ? "≥" : "≤"}{" "}
                        {formatCurrency(alert.targetPrice)}
                      </Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.alertLabel}>Current:</Text>
                      <Text style={styles.currentPrice}>
                        {formatCurrency(currentPrice)}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => deleteAlert(alert.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={Colors.error}
                    />
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Add Alert Modal */}
        {showAddAlert && (
          <Modal visible={showAddAlert} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Price Alert</Text>
                  <Pressable onPress={() => setShowAddAlert(false)}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </Pressable>
                </View>

                {/* Crypto Selection */}
                <Text style={styles.inputLabel}>Select Cryptocurrency:</Text>
                <ScrollView style={styles.cryptoSelector} horizontal>
                  {cryptos.slice(0, 10).map((crypto) => (
                    <Pressable
                      key={crypto.id}
                      style={[
                        styles.cryptoOption,
                        selectedCrypto?.id === crypto.id &&
                          styles.cryptoOptionSelected,
                      ]}
                      onPress={() => setSelectedCrypto(crypto)}
                    >
                      <Text
                        style={[
                          styles.cryptoOptionText,
                          selectedCrypto?.id === crypto.id &&
                            styles.cryptoOptionTextSelected,
                        ]}
                      >
                        {crypto.symbol.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Alert Type */}
                <Text style={styles.inputLabel}>Alert Type:</Text>
                <View style={styles.typeSelector}>
                  {[
                    { key: "above", label: "Price Above", icon: "trending-up" },
                    {
                      key: "below",
                      label: "Price Below",
                      icon: "trending-down",
                    },
                  ].map((type) => (
                    <Pressable
                      key={type.key}
                      style={[
                        styles.typeOption,
                        alertType === type.key && styles.typeOptionSelected,
                      ]}
                      onPress={() =>
                        setAlertType(type.key as "above" | "below")
                      }
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={16}
                        color={
                          alertType === type.key
                            ? Colors.background
                            : Colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          alertType === type.key &&
                            styles.typeOptionTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Target Price */}
                <Text style={styles.inputLabel}>Target Price (USD):</Text>
                <TextInput
                  style={styles.priceInput}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder="Enter target price"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />

                {selectedCrypto && (
                  <Text style={styles.currentPriceLabel}>
                    Current price:{" "}
                    {formatCurrency(selectedCrypto.current_price)}
                  </Text>
                )}

                {/* Create Button */}
                <Pressable style={styles.createButton} onPress={addAlert}>
                  <Text style={styles.createButtonText}>Create Alert</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
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
  title: {
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    margin: 24,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 20,
  },
  alertCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  alertDetails: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  targetPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  deleteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  cryptoSelector: {
    maxHeight: 50,
  },
  cryptoOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cryptoOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cryptoOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  cryptoOptionTextSelected: {
    color: Colors.background,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  typeOptionTextSelected: {
    color: Colors.background,
  },
  priceInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentPriceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
