import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useAuthStore } from "@/lib/store/auth";
import { Colors } from "@/constants/Colors";

export default function DebugPanel() {
  const { clearAllData } = useAuthStore();

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all users and authentication data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert("Success", "All data cleared!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Panel</Text>
      <Pressable style={styles.button} onPress={handleClearData}>
        <Text style={styles.buttonText}>Clear All Data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    opacity: 0.8,
  },
  title: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: "600",
  },
});
