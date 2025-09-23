import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface PriceChartProps {
  coinId: string;
  coinName?: string;
  coinSymbol?: string;
  coinImage?: string;
  timeFrame: '1D' | '1W' | '1M' | '1Y';
  height?: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

// Mock price data generator with coin-specific base prices
const generateMockData = (timeFrame: string, coinId: string): ChartData => {
  const getRandomPrice = (base: number, volatility: number) => {
    return base + (Math.random() - 0.5) * 2 * volatility;
  };

  // More realistic base prices for different coins
  const getPriceInfo = (id: string) => {
    const priceMap: Record<string, number> = {
      'bitcoin': 43000,
      'ethereum': 2500,
      'binancecoin': 315,
      'cardano': 0.45,
      'solana': 95,
      'ripple': 0.52,
      'dogecoin': 0.08,
      'polkadot': 5.2,
      'avalanche-2': 25,
      'chainlink': 14,
    };
    return priceMap[id] || 100;
  };

  const basePrice = getPriceInfo(coinId);
  const volatility = basePrice * 0.05; // 5% volatility

  let points: number;
  let labels: string[];
  let data: number[];

  switch (timeFrame) {
    case '1D':
      points = 24;
      labels = Array.from({ length: points }, (_, i) => `${i}h`);
      data = Array.from({ length: points }, () => getRandomPrice(basePrice, volatility));
      break;
    case '1W':
      points = 7;
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = Array.from({ length: points }, () => getRandomPrice(basePrice, volatility));
      break;
    case '1M':
      points = 30;
      labels = Array.from({ length: points }, (_, i) => `${i + 1}`);
      data = Array.from({ length: points }, () => getRandomPrice(basePrice, volatility));
      break;
    case '1Y':
      points = 12;
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = Array.from({ length: points }, () => getRandomPrice(basePrice, volatility));
      break;
    default:
      points = 24;
      labels = Array.from({ length: points }, (_, i) => `${i}h`);
      data = Array.from({ length: points }, () => getRandomPrice(basePrice, volatility));
  }

  // Create trend (slight upward trend with some volatility)
  data = data.map((price, index) => {
    const trendFactor = (index / points) * volatility * 0.1;
    const randomFactor = (Math.random() - 0.5) * volatility * 0.3;
    return price + trendFactor + randomFactor;
  });

  return {
    labels: timeFrame === '1M' || timeFrame === '1D' ? labels.filter((_, i) => i % Math.ceil(points / 6) === 0) : labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => Colors.primary,
        strokeWidth: 2,
      },
    ],
  };
};

export default function PriceChart({ 
  coinId, 
  coinName, 
  coinSymbol, 
  coinImage, 
  timeFrame, 
  height = 200 
}: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      const data = generateMockData(timeFrame, coinId);
      setChartData(data);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [coinId, timeFrame]);

  if (isLoading) {
    return (
      <View style={[styles.container, { height: height + 100 }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={[styles.container, { height: height + 100 }]}>
        <Text style={styles.errorText}>Failed to load chart data</Text>
      </View>
    );
  }

  const currentPrice = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
  const previousPrice = chartData.datasets[0].data[0];
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <View style={styles.container}>
      {/* Coin Header */}
      <View style={styles.coinHeader}>
        {coinImage && (
          <Image source={{ uri: coinImage }} style={styles.coinImage} />
        )}
        <View style={styles.coinInfo}>
          <Text style={styles.coinName}>
            {coinName || 'Unknown'} 
            {coinSymbol && (
              <Text style={styles.coinSymbol}> ({coinSymbol.toUpperCase()})</Text>
            )}
          </Text>
          <Text style={styles.timeFrameLabel}>
            {timeFrame} Chart
          </Text>
        </View>
      </View>

      {/* Price Info */}
      <View style={styles.priceInfo}>
        <Text style={styles.currentPrice}>
          ${currentPrice.toLocaleString(undefined, { 
            minimumFractionDigits: currentPrice < 1 ? 4 : 2,
            maximumFractionDigits: currentPrice < 1 ? 6 : 2,
          })}
        </Text>
        <View style={styles.priceChange}>
          <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
            {isPositive ? '+' : ''}${Math.abs(priceChange).toFixed(currentPrice < 1 ? 4 : 2)} ({isPositive ? '+' : ''}
            {priceChangePercent.toFixed(2)}%)
          </Text>
          <Text style={styles.timeFrameText}>
            in {timeFrame.toLowerCase()}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 48}
          height={height}
          chartConfig={{
            backgroundColor: Colors.card,
            backgroundGradientFrom: Colors.card,
            backgroundGradientTo: Colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => isPositive ? Colors.success : Colors.primary,
            labelColor: (opacity = 1) => Colors.textSecondary,
            style: {
              borderRadius: 12,
            },
            propsForDots: {
              r: '0',
            },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: Colors.border,
              strokeOpacity: 0.3,
            },
          }}
          bezier
          style={styles.chart}
          withDots={false}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          segments={4}
        />
      </View>

      {/* Chart Footer Info */}
      <View style={styles.chartFooter}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={styles.statValue}>
            ${Math.max(...chartData.datasets[0].data).toLocaleString(undefined, {
              minimumFractionDigits: currentPrice < 1 ? 4 : 2,
              maximumFractionDigits: currentPrice < 1 ? 4 : 2,
            })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={styles.statValue}>
            ${Math.min(...chartData.datasets[0].data).toLocaleString(undefined, {
              minimumFractionDigits: currentPrice < 1 ? 4 : 2,
              maximumFractionDigits: currentPrice < 1 ? 4 : 2,
            })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>
            ${(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toLocaleString(undefined, {
              minimumFractionDigits: currentPrice < 1 ? 4 : 2,
              maximumFractionDigits: currentPrice < 1 ? 4 : 2,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coinImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeFrameLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceInfo: {
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  priceChange: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeFrameText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
