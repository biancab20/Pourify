import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

type AndroidBackHeaderProps = {
  onBack: () => void;
  label?: string; 
  paddingHorizontal?: number;
};

export default function AndroidCustomNavigation({
  onBack,
  label = "Back",
  paddingHorizontal = 0,
}: AndroidBackHeaderProps) {
  const { theme } = useAppTheme();

  const accentColor = theme.isDark ? theme.palette.yellow : theme.palette.pink;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 6,
          paddingHorizontal,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={24} color={accentColor} />
        <Text style={[styles.backText, { color: accentColor }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
  },
  backText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 4,
  },
});
