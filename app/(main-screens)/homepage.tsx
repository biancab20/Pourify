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
  Platform,
} from "react-native";
import GradientButton from "@/components/shared/GradientButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import { useBars } from "@/hooks/useLocations";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const { width } = useWindowDimensions();

  const { data: barsData, isLoading, error } = useBars();
  
  const bars = barsData?.value || [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const cardWidth = width - 32;
  const circleSize = 150;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["top", "bottom"] : ["top"]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text
            style={[styles.dateText, { color: colors.text }]}
            accessible={false}
          >
            {today}
          </Text>

          {/* Top bar icons */}
          <View style={styles.iconButtons}>
            <Pressable
              onPress={() => router.push("/(scan-flow)/scan-new-delivery")}
              accessibilityRole="button"
              accessibilityLabel="Scan new delivery"
            >
              <Icon name="scan" size={35} color={colors.icon} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(settings)/venue-settings")}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Icon name="settings" size={35} color={colors.icon} />
            </Pressable>
            <Pressable
             // onPress={() => router.push("/(scan-flow)/successful-delivery")}
              accessibilityRole="button"
              accessibilityLabel="More actions"
              accessible={false}
            >
              <Icon name="moreActions" size={35} color={colors.icon} />
            </Pressable>
          </View>
        </View>

        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Venue name"
        >
          Hachi bar
        </Text>

        <WideCardStatic>
          <View
            style={[styles.wideCard, { width: cardWidth }]}
            accessible={false}
          >
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

          <Text
            style={[styles.infoBox, { color: colors.text }]}
            accessible={false}
          >
            Transactions from your POS will appear once they are paid
          </Text>
        </WideCardStatic>

        <View style={styles.sectionContainer} accessible={false}>
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
          <Text
            style={[styles.sectionTitle, { color: colors.text }]}
            accessibilityRole="text"
            accessibilityLabel="Bars within the venue"
          >
            Poured today in your bars
          </Text>

          {isLoading ? (
            <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
              Loading bars...
            </Text>
          ) : error ? (
            <Text style={{ color: palette.red, textAlign: "center", marginTop: 20 }}>
              Error loading bars
            </Text>
          ) : bars.length === 0 ? (
            <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
              No bars found
            </Text>
          ) : (
            <View style={styles.cardsRow}>
              {bars.map((bar) => (
                <Pressable
                  key={bar.barId}
                  onPress={() =>
                    router.push({
                      pathname: "/bar-view",
                      params: { barId: bar.barId, barName: bar.name },
                    })
                  }
                  accessibilityRole="button"
                >
                  <InformationCard barName={bar.name} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: colors.text }]}
            accessibilityRole="text"
          >
            Stock
          </Text>
          <GradientButton destination="/all-products-view" text="View stock" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
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
    gap: 10,
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
});