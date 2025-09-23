import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatTimeAgo } from "@/lib/utils/format";
import type { NewsArticle } from "@/lib/api/news";

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
  delay?: number;
}

export default function NewsCard({
  article,
  onPress,
  delay = 0,
}: NewsCardProps) {
  const handlePress = () => {
    // Open in browser or navigate to full article
    if (article.url) {
      Linking.openURL(article.url);
    } else {
      onPress();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crypto":
        return Colors.primary;
      case "market":
        return Colors.success;
      case "regulatory":
        return Colors.warning;
      case "analysis":
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return { name: "trending-up", color: Colors.success };
      case "negative":
        return { name: "trending-down", color: Colors.error };
      default:
        return { name: "remove", color: Colors.textSecondary };
    }
  };

  const sentimentIcon = getSentimentIcon(article.sentiment);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Article Image */}
      {article.urlToImage && (
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.image}
          defaultSource={{
            uri: "https://via.placeholder.com/300x150.png?text=News",
          }}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Category and Sentiment */}
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(article.category) + "20" },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(article.category) },
              ]}
            >
              {article.category.toUpperCase()}
            </Text>
          </View>

          {article.sentiment && (
            <View style={styles.sentimentContainer}>
              <Ionicons
                name={sentimentIcon.name as any}
                size={12}
                color={sentimentIcon.color}
              />
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {article.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.sourceInfo}>
            <Text style={styles.source}>{article.source.name}</Text>
            {article.author && (
              <Text style={styles.author}>• {article.author}</Text>
            )}
          </View>

          <View style={styles.timeContainer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.time}>
              {formatTimeAgo(article.publishedAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Read More Arrow */}
      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.textSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: Colors.border,
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sentimentContainer: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  source: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.primary,
  },
  author: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  arrow: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
});
