import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";

interface WideCardStaticProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function WideCardStatic({ children, style }: WideCardStaticProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.wideCardBackground,
        {
          backgroundColor: theme.colors.cardBackground,
          // `color` does not apply to View — removed (correct)
          //if the component dosn't render properly, before it was used: color: theme.colors.text
        },
        style,
      ]}
      accessible={false}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wideCardBackground: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
});
