// components/ui/Button.tsx
import React from "react";
import {
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

export type ButtonVariant = "primary" | "secondary";
export type GradientName = "paloma" | "bananaDaiquiri";

interface ButtonProps {
  destination?: string;
  params?: Record<string, any>;
  text?: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  gradientName?: GradientName;
  /**
   * Only used for the secondary variant (inner background).
   * Defaults to a themed card background.
   */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  destination,
  params = {},
  text = "Button",
  onPress,
  disabled = false,
  variant = "primary",
  gradientName = "paloma",
  backgroundColor,
  style,
}: ButtonProps) {
  const router = useRouter();
  const { theme } = useAppTheme();

  const gradient = theme.palette[gradientName];

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    if (onPress) {
      onPress(event);
      return;
    }

    if (destination) {
      router.push({
        pathname: destination as any,
        params,
      });
    }
  };

  const innerBackground =
    backgroundColor ?? theme.colors.cardBackground;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "secondary" && styles.secondaryBase,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={gradient.colors}
          start={gradient.start}
          end={gradient.end}
          style={styles.primaryGradient}
        >
          <Text style={styles.primaryText}>{text}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={gradient.colors}
          start={gradient.start}
          end={gradient.end}
          style={styles.secondaryGradientBorder}
        >
          <View
            style={[
              styles.secondaryInner,
              { backgroundColor: innerBackground },
            ]}
          >
            {/* Your shared Text supports gradient variant */}
            <Text
              variant="gradient"
              gradientName={gradientName}
              style={styles.secondaryText}
            >
              {text}
            </Text>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 12,
  },
  secondaryBase: {
    height: 52,
  },
  primaryGradient: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  secondaryGradientBorder: {
    flex: 1,
    padding: 2,
    borderRadius: 24,
  },
  secondaryInner: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
