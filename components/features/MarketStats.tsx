import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { formatMarketCap } from '@/lib/utils/format';

interface MarketStatsProps {
  data: {
    total_market_cap?: { usd: number };
    total_volume?: { usd: number };
    market_cap_percentage?: { btc: number; eth: number };
    active_cryptocurrencies?: number;
    markets?: number;
  };
}

export default function MarketStats({ data }: MarketStatsProps) {
  const stats = [
    {
      label: 'Market Cap',
      value: data.total_market_cap?.usd ? formatMarketCap(data.total_market_cap.usd) : 'N/A',
      icon: '📊',
    },
    {
      label: '24h Volume',
      value: data.total_volume?.usd ? formatMarketCap(data.total_volume.usd) : 'N/A',
      icon: '📈',
    },
    {
      label: 'BTC Dominance',
      value: data.market_cap_percentage?.btc ? `${data.market_cap_percentage.btc.toFixed(1)}%` : 'N/A',
      icon: '₿',
    },
    {
      label: 'Active Coins',
      value: data.active_cryptocurrencies?.toLocaleString() || 'N/A',
      icon: '🪙',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Statistics</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
});
