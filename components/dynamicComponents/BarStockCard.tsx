import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import InfoCard from "./InfoBox";
import StockPieChart from "./StockPieChart";

interface BarStockCardProps {
  barName: string;
  totalVolume: number;
  bottleCount: number;
  productVolume: number;
  totalStockAcrossAllBars: number;
}

export default function BarStockCard({
  barName,
  totalVolume,
  bottleCount,
  productVolume,
  totalStockAcrossAllBars,
}: BarStockCardProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 16 * 2 - 10) / 2;
  const circleSize = cardWidth - 26;

  return (
    <View
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: theme.isDark ? "#000000" : "#FFFFFF",
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {barName}
      </Text>

      <StockPieChart
        size={circleSize}
        currentStock={totalVolume}
        totalStock={totalStockAcrossAllBars}
        barName={barName}
      />

      <InfoCard title={`${totalVolume.toFixed(1)}L`} subtitle="#Litres" />
      <InfoCard title={bottleCount.toString()} subtitle="#Bottles" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});
