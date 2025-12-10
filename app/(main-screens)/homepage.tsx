import { Text } from "@/components/shared/Text";
import InformationCard from "@/components/staticComponents/InformationCardStatic";
import PieChartStatic from "@/components/staticComponents/PieChartStatic";
import WideCardStatic from "@/components/staticComponents/WideCardStatic";
import InfoCard from "@/components/ui/InfoBox";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { dummyData, Bar } from "@/types/DummyData";
import GradientButton from "@/components/ui/GradientButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const { width } = useWindowDimensions();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const cardWidth = width - 32;
  const circleSize = 150;

  const bars = dummyData.bars.items;

  return (
    <SafeAreaView style={{ flex: 1}} edges={["top", "bottom"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.topBar}>
          <Text style={[styles.dateText, { color: colors.text }]}>{today}</Text>
          <View style={styles.iconButtons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/(scan-flow)/scan-new-delivery")}
            >
              <Text style={{ color: colors.text, fontSize: 18 }}>📦</Text>
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Text style={{ color: colors.text, fontSize: 18 }}>🔔</Text>
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Text style={{ color: colors.text, fontSize: 18 }}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          Hachi bar
        </Text>

        <WideCardStatic>
          <View style={[styles.wideCard, { width: cardWidth }]}>
            <PieChartStatic size={circleSize} />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <RNText style={[styles.statLabel, { color: colors.text }]}>
                  Goal
                </RNText>
                <RNText style={[styles.statValue, { color: palette.blue }]}>
                  1,00 L
                </RNText>
              </View>
              <View style={styles.statItem}>
                <RNText style={[styles.statLabel, { color: colors.text }]}>
                  Total Poured
                </RNText>
                <RNText style={[styles.statValue, { color: palette.red }]}>
                  1,00 L
                </RNText>
              </View>
            </View>
          </View>

          <Text style={[styles.infoBox, { color: colors.text }]}>
            Transactions from your POS will appear once they are paid
          </Text>
        </WideCardStatic>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Most Popular Drink
          </Text>

          <WideCardStatic>
            <Text style={[styles.popularDrinkTitle, { color: colors.text }]}>
              Bacardi
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.text }]} />

            <View style={styles.row}>
              <InfoCard
                title="0.06 L"
                subtitle="Total Poured"
                style={{ width: "45%", marginRight: 10 }}
              />
              <InfoCard title={3} subtitle="#Pours" style={{ width: "45%" }} />
            </View>
          </WideCardStatic>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Poured today in your bars
          </Text>

          <View style={styles.cardsRow}>
            {bars.map((bar: Bar) => (
              <Pressable
                key={bar.barId}
                onPress={() =>
                  router.push({
                    pathname: "/bar-detail-page",
                    params: { barId: bar.barId, barName: bar.name },
                  })
                }
              >
                <InformationCard barName={bar.name} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Stock
          </Text>
          <GradientButton
            destination="/(stock)/all-products-page"
            buttonText="View stock"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  sectionContainer: {
    marginTop: 24,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },

  iconButtons: {
    flexDirection: "row",
    gap: 12,
  },

  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 42,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
  },

  wideCard: {
    flexDirection: "row",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  statsContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 20,
  },

  statItem: {
    marginBottom: 12,
  },

  statLabel: {
    fontSize: 18,
    fontWeight: "700",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },

  popularDrinkTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 0,
    marginBottom: 0,
  },

  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 0,
    gap: 10,
  },

  infoBox: {
    marginBottom: 8,
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },

  row: {
    flexDirection: "row",
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
