import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

interface PieChartStaticProps {
  size: number; // dynamic size to fit container
}

export default function PieChartStatic({ size }: PieChartStaticProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.circleWrapper, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.backgroundCircle,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderColor: theme.isDark ? "#240000" : "#E5E5E5" // Adjust border color for light mode
          },
        ]}
      />

      {/* Progress Circle */}
      <View
        style={[
          styles.progressCircle,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderTopColor: theme.palette.red // Use theme red color
          },
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={[styles.labelText, { marginBottom: -7, color: colors.text }]}>
          Poured % of Goal
        </Text>
        <Text style={[styles.largeNumber, { color: colors.text }]}>10%</Text>

        <Text style={[styles.labelText, { marginBottom: -7, color: colors.text }]}>
          Actual vs POS
        </Text>
        <Text style={[styles.largeNumber, { marginBottom: -7, color: colors.text }]}>-40%</Text>

        <Text style={[styles.largeNumber, { color: colors.text }]}>-40mL</Text>
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
  },

  progressCircle: {
    position: "absolute",
    borderWidth: 12,
    borderColor: "transparent",
    transform: [{ rotate: "20deg" }],
  },

  centerContent: {
    alignItems: "center",
  },

  labelText: {
    fontSize: 10,
  },

  largeNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
});