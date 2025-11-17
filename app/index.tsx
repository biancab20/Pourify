import { Text } from "@/components/shared/Text";
import InformationCard from "@/components/ui/InformationCard";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions, Text as RNText } from "react-native";
import PieChartStatic from "@/components/ui/PieChartStatic";
import InfoCard from "@/components/ui/InfoBox";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { width } = useWindowDimensions();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const cardWidth = width - 32; // full width minus horizontal padding
  const circleSize = 150; // pie chart size

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Top Navigation Bar */}
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

      {/* Page Title */}
      <Text variant="gradient" gradientName="paloma" style={styles.title}>
        Hachi bar
      </Text>

      {/* Wide Card with Pie Chart and Stats */}
      <View style={styles.wideCardBackground}>
        <View style={[styles.wideCard, { width: cardWidth }]}>
          <PieChartStatic size={circleSize} />

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <RNText style={styles.statLabel}>Goal</RNText>
              <RNText style={[styles.statValue, { color: "#00D7CA" }]}>1,00 L</RNText>
            </View>
            <View style={styles.statItem}>
              <RNText style={styles.statLabel}>Total Poured</RNText>
              <RNText style={[styles.statValue, { color: "#FE3734" }]}>1,00 L</RNText>
            </View>
          </View>
        </View>

        <Text style={styles.infoBox}>
          Transactions from your POS will appear once they are paid
        </Text>
      </View>

      {/* Most Popular Drink Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Most Popular Drink</Text>

        <View style={styles.wideCardBackground}>
          <Text style={styles.popularDrinkTitle}>Bacardi</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <InfoCard title="0.06 L" subtitle="Total Poured" style={{ width: '45%', marginRight: 10 }} />
            <InfoCard title={3} subtitle="#Pours" style={{ width: '45%' }} />
          </View>
        </View>
      </View>

      {/* Poured Today Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Poured today in your bars</Text>

        <View style={styles.cardsRow}>
          <InformationCard />
          <InformationCard />
        </View>
      </View>
    </ScrollView>
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

  wideCardBackground: {
    backgroundColor: "#000814",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    color: "#ECECDF",
    fontSize: 18,
    fontWeight: "700",
  },

  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15, // consistent spacing below title
  },

  popularDrinkTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 0, // no extra margin; spacing controlled by sectionTitle
    marginBottom: 0,
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0, // spacing handled by sectionTitle
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
});
