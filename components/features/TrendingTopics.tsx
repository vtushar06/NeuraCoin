import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const trendingTopics = [
  { id: "1", title: "Bitcoin ETF", count: 47 },
  { id: "2", title: "Ethereum 2.0", count: 32 },
  { id: "3", title: "DeFi Protocols", count: 28 },
  { id: "4", title: "NFT Market", count: 19 },
  { id: "5", title: "Regulatory News", count: 15 },
  { id: "6", title: "Central Bank Digital Currencies", count: 12 },
];

export default function TrendingTopics() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flame" size={20} color={Colors.warning} />
        <Text style={styles.title}>Trending Topics</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicsContainer}
      >
        {trendingTopics.map((topic, index) => (
          <Pressable
            key={topic.id}
            style={[
              styles.topicCard,
              index === 0 && styles.hotTopic, // First topic is "hottest"
            ]}
          >
            <Text
              style={[styles.topicTitle, index === 0 && styles.hotTopicText]}
            >
              {topic.title}
            </Text>
            <View style={styles.countContainer}>
              <Text
                style={[styles.countText, index === 0 && styles.hotTopicText]}
              >
                {topic.count} articles
              </Text>
              {index === 0 && (
                <Ionicons name="flame" size={12} color={Colors.warning} />
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  topicsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  topicCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hotTopic: {
    backgroundColor: Colors.warning + "20",
    borderColor: Colors.warning + "40",
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  hotTopicText: {
    color: Colors.warning,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
