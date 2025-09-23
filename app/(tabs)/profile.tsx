import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/auth";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      Toast.show({
        type: "success",
        text1: "Signed Out",
        text2: "See you next time!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to sign out",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.options}>
          <OptionItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Coming Soon",
                text2: "Profile editing will be available soon",
              })
            }
          />
          <OptionItem
            icon="settings-outline"
            title="Settings"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Coming Soon",
                text2: "Settings will be available soon",
              })
            }
          />
          <OptionItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Coming Soon",
                text2: "Help section will be available soon",
              })
            }
          />
          <OptionItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={handleSignOut}
            isDestructive
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function OptionItem({
  icon,
  title,
  onPress,
  isDestructive = false,
}: {
  icon: any;
  title: string;
  onPress: () => void;
  isDestructive?: boolean;
}) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={isDestructive ? Colors.error : Colors.text}
      />
      <Text
        style={[styles.optionText, isDestructive && { color: Colors.error }]}
      >
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  options: {
    gap: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
});
