import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const quickActions = [
  {
    id: "buy",
    icon: "add-circle-outline",
    label: "Buy",
    color: Colors.success,
  },
  {
    id: "sell",
    icon: "remove-circle-outline",
    label: "Sell",
    color: Colors.error,
  },
  {
    id: "swap",
    icon: "swap-horizontal-outline",
    label: "Swap",
    color: Colors.info,
  },
  {
    id: "send",
    icon: "paper-plane-outline",
    label: "Send",
    color: Colors.primary,
  },
];

export default function QuickActions() {
  const handleActionPress = (actionId: string) => {
    console.log("Action pressed:", actionId);
    // TODO: Navigate to respective screens
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.actionButton}
            onPress={() => handleActionPress(action.id)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: action.color + "20" },
              ]}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color={action.color}
              />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
});
