import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import { useAppTheme } from "@/stores/app-theme-context";

export default function GraphChartStatic() {
  const { theme } = useAppTheme();

  // Static values
  const bars = [110, 180, 230, 260, 240, 80];
  const labels = ["20:00", "21:00", "22:00", "23:00", "00:00", "04:00"];

  const chartHeight = 260;
  const chartWidth = 330;

  const barWidth = 22;
  const spacing = 40;
  const maxY = 300;

  const background = theme.isDark ? theme.colors.cardBackground : "#FFFFFF";
  const axisColor = theme.isDark ? "#FFFFFF88" : "#00000033"; // soft white or soft black
  const textColor = theme.colors.text;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Svg height={chartHeight} width={chartWidth}>
        {/* === Y AXIS LINE === */}
        <Line
          x1="30"
          y1="20"
          x2="30"
          y2={chartHeight - 40}
          stroke={axisColor}
          strokeWidth={1.5}
        />

        {/* === X AXIS LINE === */}
        <Line
          x1="30"
          y1={chartHeight - 40}
          x2={chartWidth - 25}
          y2={chartHeight - 40}
          stroke={axisColor}
          strokeWidth={1.5}
        />

        {/* === GRID LINE (0 mL line) === */}
        <Line
          x1="30"
          y1={chartHeight - 40}
          x2={chartWidth - 25}
          y2={chartHeight - 40}
          stroke={textColor + "55"} // subtle grid
          strokeDasharray="6"
          strokeWidth={2}
        />

        {/* === Y-AXIS LABELS === */}
        <SvgText
          x="30"
          y="12"
          fill={textColor}
          fontSize="12"
          textAnchor="start"
          fontWeight="600"
        >
          mL
        </SvgText>

        <SvgText
          x="30"
          y={chartHeight - 220}
          fill={textColor}
          fontSize="11"
          textAnchor="end"
        >
          200
        </SvgText>

        <SvgText
          x="30"
          y={chartHeight - 160}
          fill={textColor}
          fontSize="11"
          textAnchor="end"
        >
          100
        </SvgText>

        <SvgText
          x="30"
          y={chartHeight - 40 + 14}
          fill={textColor}
          fontSize="11"
          textAnchor="end"
        >
          0
        </SvgText>

        {/* === BARS === */}
        {bars.map((value, i) => {
          const scaled = (value / maxY) * (chartHeight - 60);

          return (
            <Rect
              key={i}
              x={30 + 15 + i * spacing}
              y={chartHeight - 40 - scaled}
              width={barWidth}
              height={scaled}
              rx={6}
              fill={theme.palette.pink}
            />
          );
        })}

        {/* === X-AXIS LABELS === */}
        {labels.map((label, i) => (
          <SvgText
            key={i}
            x={30 + 15 + i * spacing + barWidth / 2}
            y={chartHeight - 16}
            fill={textColor}
            fontSize="11"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
});
