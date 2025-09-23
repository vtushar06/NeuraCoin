import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNewsStore,
  startNewsAutoRefresh,
  stopNewsAutoRefresh,
} from "@/lib/store/news";
import { Colors } from "@/constants/Colors";
import NewsCard from "@/components/features/NewsCard";
import NewsCategoryTabs from "@/components/features/NewsCategoryTabs";
import TrendingTopics from "@/components/features/TrendingTopics";

type NewsCategory = "all" | "crypto" | "market" | "regulatory" | "analysis";

export default function NewsScreen() {
  const {
    allNews,
    cryptoNews,
    marketNews,
    regulatoryNews,
    analysisNews,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    fetchAllNews,
    fetchCryptoNews,
    fetchMarketNews,
    fetchRegulatoryNews,
    fetchAnalysisNews,
    searchNews,
    refreshNews,
    clearError,
  } = useNewsStore();

  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get news for selected category
  const getNewsForCategory = () => {
    switch (selectedCategory) {
      case "crypto":
        return cryptoNews;
      case "market":
        return marketNews;
      case "regulatory":
        return regulatoryNews;
      case "analysis":
        return analysisNews;
      default:
        return allNews;
    }
  };

  const currentNews = searchQuery ? searchResults : getNewsForCategory();

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchNews(searchQuery);
          setSearchResults(results as any);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchNews]);

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: NewsCategory) => {
      setSelectedCategory(category);
      setSearchQuery(""); // Clear search when changing category

      // Fetch category-specific news if needed
      switch (category) {
        case "crypto":
          if (cryptoNews.length === 0) fetchCryptoNews();
          break;
        case "market":
          if (marketNews.length === 0) fetchMarketNews();
          break;
        case "regulatory":
          if (regulatoryNews.length === 0) fetchRegulatoryNews();
          break;
        case "analysis":
          if (analysisNews.length === 0) fetchAnalysisNews();
          break;
        default:
          if (allNews.length === 0) fetchAllNews();
      }
    },
    [
      allNews.length,
      cryptoNews.length,
      marketNews.length,
      regulatoryNews.length,
      analysisNews.length,
    ]
  );

  // Refresh handler
  const onRefresh = useCallback(async () => {
    await refreshNews();
  }, [refreshNews]);

  // Initialize data
  useEffect(() => {
    fetchAllNews();
    fetchCryptoNews();

    // Start auto-refresh
    startNewsAutoRefresh(15); // Refresh every 15 minutes

    return () => {
      stopNewsAutoRefresh();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>News & Insights</Text>
          <View style={styles.headerActions}>
            {lastUpdated && (
              <Text style={styles.lastUpdate}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Pressable onPress={clearError} style={styles.errorClose}>
              <Ionicons name="close" size={16} color={Colors.error} />
            </Pressable>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={isSearching ? Colors.primary : Colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crypto news..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {(searchQuery.length > 0 || isSearching) && (
              <Pressable onPress={() => setSearchQuery("")}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons
                    name="close"
                    size={20}
                    color={Colors.textSecondary}
                  />
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Trending Topics */}
        {!searchQuery && <TrendingTopics />}

        {/* Category Tabs */}
        <NewsCategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* News List */}
        <View style={styles.newsContainer}>
          {isLoading && currentNews.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading news...</Text>
            </View>
          ) : currentNews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="newspaper-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {searchQuery ? "No news found" : "No news available"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Pull to refresh or try a different category"}
              </Text>
            </View>
          ) : (
            <View style={styles.newsList}>
              {currentNews.map((article, index) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onPress={() => {
                    // TODO: Navigate to full article or open in browser
                    console.log("Open article:", article.title);
                  }}
                  delay={index * 100}
                />
              ))}
            </View>
          )}
        </View>

        {/* Loading More Indicator */}
        {isLoading && currentNews.length > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingMoreText}>Loading more news...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerActions: {
    alignItems: "flex-end",
  },
  lastUpdate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.error + "20",
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  errorClose: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  newsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 20,
  },
  newsList: {
    gap: 16,
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loadingMoreText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
