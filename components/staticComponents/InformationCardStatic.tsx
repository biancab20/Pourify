import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import InfoCard from "../ui/InfoBox";
import PieChartStatic from "./PieChartStatic";

export default function InformationCardStatic() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 16 * 3) / 2;
  const circleSize = cardWidth - 26;

  return (
    <View style={[
      styles.container, 
      { 
        width: cardWidth,
        backgroundColor: theme.isDark ? "#000000" : "#FFFFFF"
      }
    ]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Main Bar</Text>

      {/* Static Pie Chart */}
      <PieChartStatic size={circleSize} />

      {/* Dynamic Info Cards */}
      <InfoCard title="Bacardi" subtitle="Most popular product" />
      <InfoCard title={3} subtitle="#Pours" />
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