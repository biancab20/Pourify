import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import PieChartStatic from "./PieChartStatic"; 
import { Text } from "@/components/shared/Text";
import InfoCard from "./InfoBox"; // import reusable card

export default function InformationCard() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 16 * 3) / 2; // container padding + gap
  const circleSize = cardWidth - 26; // match container padding

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      {/* Title */}
      <Text style={styles.title}>Main Bar</Text>

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
    backgroundColor: "#000814",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});
