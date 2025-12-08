import { Text } from "@/components/shared/Text";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

export default function GraphChartStatic() {
  const { theme } = useAppTheme();
  const bars = [110, 180, 230, 260, 240, 80];
  const labels = ["20:00", "21:00", "22:00", "23:00", "00:00", "04:00"];
  const chartHeight = 260;
  const chartWidth = 330;
  const barWidth = 22;
  const spacing = 40;
  const maxY = 300;
  const pinkColor = theme.palette.pink;
  const grayLineColor = "#CCCCCC";
  const grayLineOpacity = 0.4;
  const yLabels = [0, 100, 200];
  const yPositions = yLabels.map(
    (label, index) => chartHeight - 40 - (index * (chartHeight - 60)) / (yLabels.length - 1)
  );

  return (
    <View>

      <View style={[styles.chartContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <Svg height={chartHeight} width={chartWidth}>
          <Line
            x1="30"
            y1={chartHeight - 40}
            x2={chartWidth - 25}
            y2={chartHeight - 40}
            stroke={grayLineColor}
            strokeOpacity={grayLineOpacity}
            strokeWidth={2}
          />

          {yPositions.slice(1).map((y, index) => (
            <Line
              key={index}
              x1="30"
              y1={y}
              x2={chartWidth - 25}
              y2={y}
              stroke={grayLineColor}
              strokeOpacity={grayLineOpacity}
              strokeWidth={1}
            />
          ))}

          {yLabels.map((label, index) => (
            <SvgText
              key={index}
              x="30"
              y={yPositions[index] + 4}
              fill={pinkColor}
              fontSize="11"
              textAnchor="end"
            >
              {label}
            </SvgText>
          ))}

          <SvgText
            x="30"
            y={yPositions[yPositions.length - 1] - 12}
            fill={pinkColor}
            fontSize="12"
            textAnchor="end"
            fontWeight="600"
          >
            mL
          </SvgText>

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
                fill={pinkColor}
              />
            );
          })}

          {labels.map((label, i) => (
            <SvgText
              key={i}
              x={30 + 15 + i * spacing + barWidth / 2}
              y={chartHeight - 16}
              fill={pinkColor}
              fontSize="11"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}
        </Svg>
      </View>

      <WideCardStatic style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Total Poured</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>0.01</Text>
          </View>
          <View style={styles.column}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Total POS</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>1.27</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={[styles.label, { color: theme.colors.text }]}>POS vs Total</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>-</Text>
          </View>
          <View style={styles.column}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Number of Pours</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>-</Text>
          </View>
        </View>
      </WideCardStatic>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  card: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  column: {
    flex: 1,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
});
