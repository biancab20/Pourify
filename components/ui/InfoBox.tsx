import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

type InfoBoxProps = {
  title: string | number;
  subtitle: string;
  style?: object;
};

export default function InfoBox({ title, subtitle, style }: InfoBoxProps) {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? palette.darkBlue : palette.beige,
        },
        style,
      ]}
      accessible={false}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 10,
  },
});
