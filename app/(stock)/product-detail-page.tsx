import { Text } from "@/components/shared/Text";
import InformationCard from "@/components/staticComponents/InformationCardStatic";
import InfoCard from "@/components/ui/InfoBox";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function ProductDetails() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Stock</Text>

        <WideCardStatic>
          <Text style={[styles.popularDrinkTitle, { color: colors.text }]}>To Be Dynamic</Text>

          <View style={[styles.divider, { backgroundColor: colors.text }]} />

          <View style={styles.row}>
            <InfoCard title="0.06 L" subtitle="#Litres" style={{ width: '45%', marginRight: 10 }} />
            <InfoCard title={3} subtitle="#Bottles" style={{ width: '45%' }} />
          </View>
        </WideCardStatic>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Poured today in your bars</Text>

        <View style={styles.cardsRow}>
          <InformationCard />
          <InformationCard />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Modify Stock</Text>

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
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingTop: 40 
  },
  sectionContainer: {
    marginTop: 24,
  },
  popularDrinkTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },
  row: {
    flexDirection: 'row',
    marginTop: 0,
  },
  stockButton: {
    width: "100%",
    marginBottom: 60,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
  },
});