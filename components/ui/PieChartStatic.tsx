// Create a dummy pie chart that will be used throughout the app that only mocks data

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";

interface PieChartStaticProps {
  size: number;// dynamic size to fit container
}

export default function PieChartStatic({ size }: PieChartStaticProps) {
  return (
    <View style={[styles.circleWrapper, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.backgroundCircle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />

      {/* Progress Circle */}
      <View
        style={[
          styles.progressCircle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={[styles.labelText, { marginBottom: -7 }]}>
          Poured % of Goal
        </Text>
        <Text style={styles.largeNumber}>10%</Text>

        <Text style={[styles.labelText, { marginBottom: -7 }]}>
          Actual vs POS
        </Text>
        <Text style={[styles.largeNumber, { marginBottom: -7 }]}>-40%</Text>

        <Text style={styles.largeNumber}>-40mL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  backgroundCircle: {
    position: "absolute",
    borderWidth: 12,
    borderColor: "#240000",
  },

  progressCircle: {
    position: "absolute",
    borderWidth: 12,
    borderColor: "transparent",
    borderTopColor: "#ff4d4d",
    transform: [{ rotate: "20deg" }],
  },

  centerContent: {
    alignItems: "center",
  },

  labelText: {
    color: "#cccccc",
    fontSize: 10,
  },

  largeNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
