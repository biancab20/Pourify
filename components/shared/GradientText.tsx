import React from "react";
import {
  Text as RNText,
  StyleSheet,
  TextStyle,
  StyleProp,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/stores/app-theme-context";

export type GradientName = "paloma" | "bananaDaiquiri";

export interface GradientTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  gradientName: GradientName;
}

export default function GradientText({
  children,
  style,
  gradientName,
}: GradientTextProps) {
  const { theme } = useAppTheme();
  const gradient = theme.palette[gradientName];

  return (
    <MaskedView
      maskElement={
        <RNText style={[style, styles.maskText, { fontFamily: "Roobert" }]}>
          {children}
        </RNText>
      }
    >
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
      >
        <RNText style={[style, styles.hidden]}>{children}</RNText>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskText: {
    backgroundColor: "transparent",
  },
  hidden: {
    opacity: 0,
  },
});
