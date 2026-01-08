import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import GradientButton from "@/components/shared/GradientButton";

export default function DeliverySummary() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const params = useLocalSearchParams();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom"] : []}
    >
        <Text
          variant="gradient"
          gradientName="paloma"
          style={[styles.title, { color: colors.text }]}
        >
          Delivery Summary
        </Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        


        <View style={styles.spacer} />

      
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  sectionContainer: {
    marginTop: 15,
  },
  scrollContent: {
    paddingBottom: 60,
    minHeight: 800,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  spacer: {
    height: 30,
  },
});
