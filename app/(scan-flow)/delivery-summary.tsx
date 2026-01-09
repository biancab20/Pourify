// DeliverySummary.tsx (FULL FILE – uses the SAME ListItem UI)
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";
import ListItem, { DeliveryItem } from "@/components/ui/ListItem";

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
        <ListItem
        key={item.id}
        delivery={item}
        readOnly
        />
      ))}
    </View>
  );
}

export default function DeliverySummary() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { getAll } = useDeliveryStatus();

  const all = Object.values(getAll());

  const received = all.filter(i => i.status === "received");
  const damaged = all.filter(i => i.status === "damaged");
  const missing = all.filter(i => i.status === "missing");
  const substituted = all.filter(i => i.status === "substituted");

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 60,
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
});
