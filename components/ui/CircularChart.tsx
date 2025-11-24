import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/shared/Text';
import ProgressBar from './ProgressBar';
import { useAppTheme } from '@/stores/app-theme-context';
import { Mode } from './DatePicker'; // Import the Mode type

interface ChartData {
  ordered: number;
  poured: number;
  sold: number;
}

interface CircularChartProps {
  data: ChartData;
  strokeWidth?: number;
  mode: Mode; // Add mode prop
}

const CircularChart: React.FC<CircularChartProps> = ({
  data,
  strokeWidth = 30,
  mode // Destructure mode prop
}) => {
  const { theme } = useAppTheme(); 
  const { ordered, poured, sold } = data;
  const { width: screenWidth } = useWindowDimensions();

  // Use the same horizontal margin as the legend (16px on each side)
  const horizontalMargin = 16;
  const chartContainerWidth = screenWidth - (horizontalMargin * 2);

  // Calculate chart size based on the container width (same as legend)
  const chartSize = Math.min(chartContainerWidth - 50, 300); // Subtract some padding for the chart container

  // Calculate percentages
  const soldPercentage = (sold / ordered) * 100;
  const pouredPercentage = (poured / ordered) * 100;

  // Radius + circumference
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const soldStrokeDasharray = `${(soldPercentage / 100) * circumference} ${circumference}`;
  const pouredStrokeDasharray = `${(pouredPercentage / 100) * circumference} ${circumference}`;

  const progressBarWidth = Math.min(200, screenWidth - 120);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chartContainer,
          { 
            backgroundColor: theme.colors.cardBackground,
            width: chartContainerWidth, // Same width as legend container
          }
        ]}
      >
        <Svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`}>
          <Defs>
            {/* Sold gradient */}
            <LinearGradient id="soldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FF77E0" />
              <Stop offset="100%" stopColor="#F54D41" />
            </LinearGradient>

            {/* Poured gradient */}
            <LinearGradient id="pouredGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#D9E734" />
              <Stop offset="100%" stopColor="#00C264" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Poured segment */}
          <G rotation="-90" origin={`${chartSize / 2}, ${chartSize / 2}`}>
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius}
              stroke="url(#pouredGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={pouredStrokeDasharray}
              strokeLinecap="round"
            />
          </G>

          {/* Sold segment */}
          <G rotation="-90" origin={`${chartSize / 2}, ${chartSize / 2}`}>
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius + strokeWidth / 4}
              stroke="url(#soldGradient)"
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={soldStrokeDasharray}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center text */}
        <View style={[styles.centerText, { top: chartSize / 2 - 30 }]}>
          <Text
            style={[
              styles.detailText
            ]}
          >
            Sold this {mode.toLowerCase()} {/* Dynamic text based on mode */}
          </Text>
          <Text
            style={[
              styles.percentageText,
              { color: theme.colors.text }
            ]}
          >
            {Math.round(soldPercentage)}%
          </Text>

          <Text
            style={[
              styles.detailText
            ]}
          >
            {sold.toFixed(2).replace('.', ',')} of {ordered}L
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.legend,
          {
            width: chartContainerWidth,
            backgroundColor: theme.colors.cardBackground
          }
        ]}
      >
        <ProgressBar
          label="Ordered"
          value={ordered}
          percentage={100}
          width={progressBarWidth}
          gradientColors={['#E0E0E0', '#E0E0E0']}
          showBackground={false}
        />

        <ProgressBar
          label="Poured"
          value={poured}
          percentage={pouredPercentage}
          width={progressBarWidth}
          gradientColors={['#D9E734', '#00C264']}
        />

        <ProgressBar
          label="Sold"
          value={sold}
          percentage={soldPercentage}
          width={progressBarWidth}
          gradientColors={['#FF77E0', '#F54D41']}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    padding: 25,
    borderRadius: 16,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 64,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 64,
  },
  detailText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#00C264',
  },
  legend: {
    padding: 16,
    borderRadius: 16,
  },
});

export default CircularChart;