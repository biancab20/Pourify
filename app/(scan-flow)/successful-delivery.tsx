// app/(scan-flow)/successful-delivery.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import Button from "@/components/shared/GradientButton";
import { useRouter } from "expo-router";

export default function SuccessfulDeliveryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { palette } = theme;
  const successImage = require("@/assets/images/image-success-stock.png");
  const goHome = () => {
    // ✅ closes the current modal stack if possible
    router.dismissAll();

    // ✅ ensures you land on homepage (not stacked on top of something)
    router.replace("/(main-screens)/homepage");
  };
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.darkGreen }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        {/* Top text */}
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            You successfully{"\n"}registered a new delivery
          </Text>
        </View>

        {/* Center illustration */}
        <View style={styles.illustrationWrap}>
          <Image
            source={successImage}
            style={styles.illustration}
            resizeMode="contain"
            accessible
            accessibilityLabel="Delivery successfully added"
          />
        </View>

        {/* Bottom button */}
        <View style={styles.footer}>
          <Button
            text="Back to home"
            onPress={goHome}
            variant="primary"
            gradientName="paloma"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: 0.2,
    marginTop: 40,
  },
  illustrationWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 260,
    height: 260,
  },
  footer: {
    width: "100%",
    paddingBottom: 6,
  },
  button: {
    width: "100%",
    alignSelf: "center",
  },
});
