import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/shared/Text';
import { useAppTheme } from '@/stores/app-theme-context';

interface ProgressBarProps {
  label: string;
  value: number;
  percentage: number;
  width?: number;
  height?: number;
  gradientColors: [string, string];
  showBackground?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  percentage,
  height = 16,
  gradientColors,
  showBackground = true,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const radius = height / 2;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

        <View style={styles.progressBarContainer}>
          <Svg width="100%" height={height}>
            <Defs>
              <LinearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={gradientColors[0]} />
                <Stop offset="100%" stopColor={gradientColors[1]} />
              </LinearGradient>
            </Defs>

            {showBackground && (
              <Rect
                x="0"
                y="0"
                width="100%"
                height={height}
                rx={radius}
                ry={radius}
                fill="#E0E0E0"
              />
            )}

            <Rect
              x="0"
              y="0"
              width={`${percentage}%`}
              height={height}
              rx={radius}
              ry={radius}
              fill={showBackground ? `url(#gradient-${label})` : gradientColors[0]}
            />
          </Svg>
        </View>

        <Text style={[styles.value, { color: colors.text }]}>{value} L</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    width: 70,
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    flex: 1,
  },
  value: {
    width: 60,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default ProgressBar;