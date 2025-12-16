import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

interface PieChartStaticProps {
  size: number;
}

export default function PieChartStatic({ size }: PieChartStaticProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const pouredPercentage = 10;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStrokeDasharray = `${(pouredPercentage / 100) * circumference} ${circumference}`;

  return (
    <View style={[styles.circleWrapper, { width: size, height: size }]} accessible={false}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Progress gradient */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
        <Text style={[styles.labelText, { marginBottom: -7, color: colors.text }]}>
          Poured % of Goal
        </Text>
        <Text style={[styles.largeNumber, { color: colors.text }]}>{pouredPercentage}%</Text>

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