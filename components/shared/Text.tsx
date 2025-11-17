// components/Text.tsx
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { useAppTheme } from "@/stores/app-theme-context";
import GradientText from "./GradientText";

type Variant = "normal" | "gradient";

interface Props extends TextProps {
  variant?: Variant;
  gradientName?: "paloma" | "bananaDaiquiri"; // extend as you add more
}

export function Text({
  children,
  style,
  variant = "normal",
  gradientName = "paloma",
  ...rest
}: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  // GRADIENT VARIANT
  if (variant === "gradient") {
    return (
      <GradientText style={style} gradientName={gradientName}>
        {children}
      </GradientText>
    );
  }

  // NORMAL VARIANT
  return (
    <RNText
      {...rest}
      style={[
        { fontFamily: "Roobert", color: colors.text },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
