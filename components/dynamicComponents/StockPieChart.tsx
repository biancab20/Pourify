import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

interface StockPieChartProps {
  size: number;
  currentStock: number; // Current stock in the selected bar
  totalStock: number; // Total stock across all bars
  barName?: string;
}

export default function StockPieChart({
  size,
  currentStock,
  totalStock,
  barName,
}: StockPieChartProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  // Calculate percentage of total stock in this bar
  const percentage =
    totalStock > 0 ? Math.round((currentStock / totalStock) * 100) : 0;

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStrokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <View
      style={[styles.circleWrapper, { width: size, height: size }]}
      accessible={false}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Progress gradient - using the same gradient colors */}
          <LinearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#FF77E0" />
            <Stop offset="100%" stopColor="#F54D41" />
          </LinearGradient>
        </Defs>

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.isDark ? "#240000" : "#E5E5E5"}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={progressStrokeDasharray}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={styles.centerContent}>
        <Text
          style={[styles.labelText, { marginBottom: -7, color: colors.text }]}
        >
          In {barName || "All Bars"}
        </Text>
        <Text style={[styles.largeNumber, { color: colors.text }]}>
          {currentStock.toFixed(1)}L
        </Text>

        <Text
          style={[styles.labelText, { marginBottom: -7, color: colors.text }]}
        >
          Total
        </Text>
        <Text
          style={[styles.largeNumber, { marginBottom: -7, color: colors.text }]}
        >
          {totalStock.toFixed(1)}L
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    position: "absolute",
  },
  labelText: {
    fontSize: 10,
  },
  largeNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
});
