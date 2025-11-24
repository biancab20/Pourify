import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import GraphChartStatic from "@/components/staticComponents/GraphChartStatic";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import Calendar from "@/components/ui/Calendar";

export default function BarDetailPage() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;


  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Singular bar</Text>
      
        <Calendar />
        <GraphChartStatic />


      {/* Back Button */}
      <Pressable
        style={[styles.button, styles.secondary, { borderColor: palette.darkBlue }]}
        onPress={() => router.back()}
      >

        <Text style={[styles.secondaryText, { color: palette.darkBlue }]}>Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 40,
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
    backgroundColor: "transparent",
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
});