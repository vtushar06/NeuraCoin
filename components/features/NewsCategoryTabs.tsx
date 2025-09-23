import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type NewsCategory = "all" | "crypto" | "market" | "regulatory" | "analysis";

interface NewsCategoryTabsProps {
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
}

const categories = [
  { key: "all", label: "All News", icon: "newspaper" },
  { key: "crypto", label: "Crypto", icon: "logo-bitcoin" },
  { key: "market", label: "Markets", icon: "trending-up" },
  { key: "regulatory", label: "Regulatory", icon: "shield-checkmark" },
  { key: "analysis", label: "Analysis", icon: "analytics" },
];

export default function NewsCategoryTabs({
  selectedCategory,
  onCategoryChange,
}: NewsCategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {categories.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.tab,
              selectedCategory === category.key && styles.activeTab,
            ]}
            onPress={() => onCategoryChange(category.key as NewsCategory)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={
                selectedCategory === category.key
                  ? Colors.background
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.key && styles.activeTabText,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.background,
  },
});
