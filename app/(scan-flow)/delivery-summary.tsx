import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";
import ListItem, { DeliveryItem } from "@/components/ui/ListItem";
import GradientButton from "@/components/shared/GradientButton";
import { useBars } from "@/hooks/useLocations";
import { useStocks, useCreateStock, useUpdateStock } from "@/hooks/useStock";
import { useMemo } from "react";

type SectionProps = {
  title: string;
  items: DeliveryItem[];
};

function Section({ title, items }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map(item => (
        <ListItem key={item.id} delivery={item} readOnly />
      ))}
    </View>
  );
}

export default function DeliverySummary() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const { getAll } = useDeliveryStatus();
  const { data: barsData } = useBars();
  const { data: stockData } = useStocks();

  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  const all = Object.values(getAll());

  const received = all.filter(i => i.status === "received");
  const damaged = all.filter(i => i.status === "damaged");
  const missing = all.filter(i => i.status === "missing");
  const substituted = all.filter(i => i.status === "substituted");

  const storableItems = useMemo(
    () => all.filter(i => i.status === "received" || i.status === "substituted"),
    [all]
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          Delivery Summary
        </Text>

        <Section title="Received" items={received} />
        <Section title="Damaged" items={damaged} />
        <Section title="Missing" items={missing} />
        <Section title="Substituted" items={substituted} />
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <GradientButton text="Save"/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  buttonWrapper: {
    padding: 16,
  },
});
