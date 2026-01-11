import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/stores/app-theme-context";

export interface ConfigRowProps {
  title: string;
  rightLabel?: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function ConfigRow({
  title,
  rightLabel,
  leftIconName,
  onPress,
}: ConfigRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        {leftIconName && (
          <Ionicons name={leftIconName} size={22} color={theme.colors.icon} />
        )}

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>
        {rightLabel && (
          <Text style={[styles.rightLabel, { color: theme.colors.text }]}>
            {rightLabel}
          </Text>
        )}

        <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rightLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
});
