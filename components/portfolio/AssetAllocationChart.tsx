import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/lib/utils/format";
import type { PortfolioHolding } from "@/lib/types/portfolio";

const { width } = Dimensions.get("window");

interface AssetAllocationChartProps {
  holdings: PortfolioHolding[];
}

const CHART_COLORS = [
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#84CC16", // Lime
];

export default function AssetAllocationChart({
  holdings,
}: AssetAllocationChartProps) {
  const totalValue = holdings.reduce(
    (sum, holding) => sum + holding.currentValue,
    0
  );

  const chartData = holdings.map((holding, index) => ({
    name: holding.cryptoSymbol,
    population: holding.currentValue,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: Colors.textSecondary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => Colors.textSecondary,
  };

  if (holdings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Asset Allocation</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No holdings to display</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asset Allocation</Text>

      <PieChart
        data={chartData}
        width={width - 48}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />

      {/* Legend */}
      <View style={styles.legend}>
        {holdings.map((holding, index) => {
          const percentage = (holding.currentValue / totalValue) * 100;
          return (
            <View key={holding.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  },
                ]}
              />
              <View style={styles.legendInfo}>
                <Text style={styles.legendName}>{holding.cryptoSymbol}</Text>
                <Text style={styles.legendValue}>
                  {formatCurrency(holding.currentValue)} (
                  {percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  legend: {
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  legendValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
