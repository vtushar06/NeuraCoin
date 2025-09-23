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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCryptoStore } from "@/lib/store/crypto";
import { Colors } from "@/constants/Colors";
import CryptoCard from "@/components/features/CryptoCard";
import PriceChart from "@/components/features/PriceChart";
import MarketStats from "@/components/features/MarketStats";
import TopMovers from "@/components/features/TopMovers";
import PriceAlerts from "@/components/features/PriceAlerts";

const { width } = Dimensions.get("window");

type SortOption = "market_cap" | "price" | "volume" | "change_24h";
type FilterOption = "all" | "gainers" | "losers" | "favorites";
type TimeFrame = "1D" | "1W" | "1M" | "1Y";

export default function MarketScreen() {
  const {
    topCryptos,
    fetchTopCryptos,
    isLoading,
    error,
    lastUpdated,
    searchCryptos,
    globalData,
    fetchGlobalData,
  } = useCryptoStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCryptos, setFilteredCryptos] = useState(topCryptos);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("market_cap");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("bitcoin");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1D");
  const [showAlerts, setShowAlerts] = useState(false);

  // Get selected crypto data
  const selectedCryptoData =
    topCryptos.find((crypto) => crypto.id === selectedCrypto) || topCryptos[0];

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...topCryptos];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case "gainers":
        filtered = filtered.filter(
          (crypto) => crypto.price_change_percentage_24h > 0
        );
        break;
      case "losers":
        filtered = filtered.filter(
          (crypto) => crypto.price_change_percentage_24h < 0
        );
        break;
      case "favorites":
        // TODO: Implement favorites functionality
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "market_cap":
          return b.market_cap - a.market_cap;
        case "price":
          return b.current_price - a.current_price;
        case "volume":
          return b.total_volume - a.total_volume;
        case "change_24h":
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        default:
          return 0;
      }
    });

    setFilteredCryptos(filtered);
  }, [topCryptos, searchQuery, filterBy, sortBy]);

  // Set default selected crypto when data loads
  useEffect(() => {
    if (topCryptos.length > 0 && !selectedCryptoData) {
      setSelectedCrypto(topCryptos[0].id);
    }
  }, [topCryptos, selectedCryptoData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTopCryptos(100), fetchGlobalData()]);
    setRefreshing(false);
  }, [fetchTopCryptos, fetchGlobalData]);

  useEffect(() => {
    fetchTopCryptos(100);
    fetchGlobalData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.alertButton}
              onPress={() => setShowAlerts(true)}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.text}
              />
            </Pressable>
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
          </View>
        )}

        {/* Market Stats */}
        {globalData && <MarketStats data={globalData} />}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cryptocurrencies..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Price Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Price Chart</Text>
            <View style={styles.timeFrameSelector}>
              {(["1D", "1W", "1M", "1Y"] as TimeFrame[]).map((tf) => (
                <Pressable
                  key={tf}
                  style={[
                    styles.timeFrameButton,
                    timeFrame === tf && styles.timeFrameButtonActive,
                  ]}
                  onPress={() => setTimeFrame(tf)}
                >
                  <Text
                    style={[
                      styles.timeFrameText,
                      timeFrame === tf && styles.timeFrameTextActive,
                    ]}
                  >
                    {tf}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {selectedCryptoData ? (
            <PriceChart
              coinId={selectedCryptoData.id}
              coinName={selectedCryptoData.name}
              coinSymbol={selectedCryptoData.symbol}
              coinImage={selectedCryptoData.image}
              timeFrame={timeFrame}
              height={200}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                Select a cryptocurrency to view chart
              </Text>
            </View>
          )}
        </View>

        {/* Top Movers */}
        {topCryptos.length > 0 && (
          <TopMovers cryptos={topCryptos.slice(0, 20)} />
        )}

        {/* Filter and Sort Controls */}
        <View style={styles.controlsContainer}>
          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {[
              { key: "all", label: "All", count: topCryptos.length },
              {
                key: "gainers",
                label: "Gainers",
                count: topCryptos.filter(
                  (c) => c.price_change_percentage_24h > 0
                ).length,
              },
              {
                key: "losers",
                label: "Losers",
                count: topCryptos.filter(
                  (c) => c.price_change_percentage_24h < 0
                ).length,
              },
              { key: "favorites", label: "Favorites", count: 0 },
            ].map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterBy === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilterBy(filter.key as FilterOption)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterBy === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <Text style={styles.filterCount}> ({filter.count})</Text>
                  )}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sort Dropdown */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortOptions}
            >
              {[
                { key: "market_cap", label: "Market Cap", icon: "stats-chart" },
                { key: "price", label: "Price", icon: "pricetag" },
                { key: "volume", label: "Volume", icon: "bar-chart" },
                { key: "change_24h", label: "24h Change", icon: "trending-up" },
              ].map((sort) => (
                <Pressable
                  key={sort.key}
                  style={[
                    styles.sortButton,
                    sortBy === sort.key && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(sort.key as SortOption)}
                >
                  <Ionicons
                    name={sort.icon as any}
                    size={14}
                    color={
                      sortBy === sort.key
                        ? Colors.background
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.sortText,
                      sortBy === sort.key && styles.sortTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Crypto List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              Cryptocurrencies ({filteredCryptos.length})
            </Text>
            {searchQuery && (
              <Text style={styles.searchResultText}>
                Results for "{searchQuery}"
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading market data...</Text>
            </View>
          ) : filteredCryptos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>No cryptocurrencies found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            <View style={styles.cryptoList}>
              {filteredCryptos.map((crypto, index) => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  onPress={() => setSelectedCrypto(crypto.id)}
                  delay={index * 50}
                  isSelected={selectedCrypto === crypto.id}
                />
              ))}
            </View>
          )}
        </View>

        {/* Price Alerts Modal */}
        {showAlerts && (
          <PriceAlerts
            cryptos={topCryptos.slice(0, 20)}
            onClose={() => setShowAlerts(false)}
          />
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
  alertButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  errorBanner: {
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
    textAlign: "center",
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
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  timeFrameSelector: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeFrameButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeFrameButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeFrameText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  timeFrameTextActive: {
    color: Colors.background,
  },
  controlsContainer: {
    marginBottom: 24,
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: Colors.background,
  },
  filterCount: {
    fontSize: 12,
    opacity: 0.8,
  },
  sortContainer: {
    paddingHorizontal: 24,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  sortOptions: {
    gap: 12,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  sortTextActive: {
    color: Colors.background,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  searchResultText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 20,
  },
  cryptoList: {
    gap: 12,
  },
});
