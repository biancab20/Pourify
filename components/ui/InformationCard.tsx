import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import PieChartStatic from "./PieChartStatic"; 
import { Text } from "@/components/shared/Text";

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

      {/* Product Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bacardi</Text>
        <Text style={styles.cardSubtitle}>Most popular product</Text>
      </View>

      {/* Pours Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3</Text>
        <Text style={styles.cardSubtitle}>#Pours</Text>
      </View>
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

  card: {
    width: "100%",
    backgroundColor: "#00204d",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },

  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#dddddd",
    fontSize: 10,
  },
});
