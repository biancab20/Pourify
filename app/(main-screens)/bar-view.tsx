import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import GraphChartStatic from "@/components/staticComponents/GraphChartStatic";
import DatePickerStatic from "@/components/staticComponents/DatePickerStatic";
import GradientButton from "@/components/shared/GradientButton";

export default function BarView() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const params = useLocalSearchParams();
  const { barId, barName } = params;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom"] : []}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text
          variant="gradient"
          gradientName="paloma"
          style={[styles.title, { color: colors.text }]}
        >
          {barName || "Singular bar"}
        </Text>

        <DatePickerStatic />
        <GraphChartStatic />

        <View style={styles.spacer} />

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Stock
          </Text>
          <GradientButton
            destination="/(stock)/all-products-page"
            params={{ barId, barName }}
            text="View stock"
          />
        </View>
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
