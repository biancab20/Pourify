import { Text } from "@/components/shared/Text";
import InformationCard from "@/components/staticComponents/InformationCardStatic";
import InfoCard from "@/components/ui/InfoBox";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function ProductDetails() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}
    contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Stock</Text>
      
              <View style={styles.wideCardBackground}>
                <Text style={styles.popularDrinkTitle}>Main Bar</Text>
      
                <View style={styles.divider} />
      
                <View style={styles.row}>
                  <InfoCard title="0.06 L" subtitle="#Litres" style={{ width: '45%', marginRight: 10 }} />
                  <InfoCard title={3} subtitle="#Bottles" style={{ width: '45%' }} />
                </View>
              </View>
            </View>

        <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Poured today in your bars</Text>
        
                <View style={styles.cardsRow}>
                  <InformationCard />
                  <InformationCard />
                </View>
              </View>

      

      <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Modify Stock</Text>
      
               <Pressable
                  onPress={() => router.push("/(stock)/edit-stock")}
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
                Adjust Stock
              </Text>
            </LinearGradient>
          </Pressable>
          </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16,paddingTop: 40 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 24, color: "white" },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#white",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "600" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
  },
  secondaryText: { color: "white", fontWeight: "600" },
  sectionContainer: {
    marginTop: 24,
  },

  wideCard: {
    flexDirection: "row",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  infoBox: {
    marginBottom: 8,
    color: "#ECECDF",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "white",
    marginVertical: 13,
  },

  row: {
    flexDirection: 'row',
    marginTop: 0, // spacing controlled by sectionTitle
  },
  
  wideCardBackground: {
    backgroundColor: "#000814",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  popularDrinkTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 0, // no extra margin; spacing controlled by sectionTitle
    marginBottom: 0,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15, // consistent spacing below title
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0, // spacing handled by sectionTitle
  },

  stockButton: {
    width: "100%",
    marginBottom: 60,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
  },
});
