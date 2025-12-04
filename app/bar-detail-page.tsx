import { View, StyleSheet,  ScrollView } from "react-native";
import {  useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import GraphChartStatic from "@/components/staticComponents/GraphChartStatic";
import DatePickerStatic from "@/components/staticComponents/DatePickerStatic";
import GradientButton from "@/components/ui/GradientButton";

export default function BarDetailPage() {

  const { theme } = useAppTheme();
  const { colors} = theme;
  const params = useLocalSearchParams();
  const { barId, barName } = params;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: colors.text }]}>{barName || "Singular bar"}</Text>
      
      <DatePickerStatic />
      <GraphChartStatic />

      <View style={styles.spacer} />
      
      <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Stock</Text>
                <GradientButton
                  destination="/(stock)/all-products-page"
                  params={{ barId, barName }}
                  buttonText="View stock"
                />
            </View>  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
   sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  sectionContainer: {
    marginTop: 24,
  },

  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 60,
    minHeight: 800, 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 24,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "center",
  },
  adjustButton: {
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 18 
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 12,
    alignSelf: "center",
  },
  secondary: {
    backgroundColor: "green",
    borderWidth: 1,
  },
  secondaryText: { 
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  column: {
    flex: 1,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
  spacer: {
    height: 30,
  },
  stockButton: {
    width: "100%",
    marginBottom: 60,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
  },
});