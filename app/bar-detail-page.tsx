import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import GraphChartStatic from "@/components/staticComponents/GraphChartStatic";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import DatePickerStatic from "@/components/staticComponents/DatePickerStatic";

export default function BarDetailPage() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
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

      {/* Add some spacing and additional content */}
      <View style={styles.spacer} />
      
      <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Stock</Text>
      
               <Pressable
                  onPress={() => router.push({
    pathname: "/(stock)/all-products-page",
    params: { barId: barId, barName: barName }
  })}
                  style={styles.stockButton}
                >
                <LinearGradient
                  colors={["#FF77E0", "#F54D41"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    paddingVertical: 14,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: 18,
                }}
              >
                View stock
              </Text>
            </LinearGradient>
          </Pressable>
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
    minHeight: 800, // Force minimum height to enable scrolling
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