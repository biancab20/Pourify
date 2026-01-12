import GradientButton from "@/components/shared/GradientButton";
import { Text } from "@/components/shared/Text";
import EditableSectionCard from "@/components/dynamicComponents/EditableSectionCard";
import InputBox from "@/components/dynamicComponents/SearchBar";
import ListItem, {
  DeliveryItem,
} from "@/components/dynamicComponents/ListItem";
import { useCreateDelivery } from "@/hooks/useDeliveries";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";
import { useBars } from "@/hooks/useLocations";
import { useAppTheme } from "@/stores/app-theme-context";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to convert string to Title Case
const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

type SectionProps = {
  title: string;
  items: DeliveryItem[];
  searchQuery: string;
};

function Section({ title, items, searchQuery }: SectionProps) {
  const filteredItems = useMemo(() => {
    if (items.length === 0) return [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const productName = toTitleCase(item.name);
      return (
        productName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  if (filteredItems.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filteredItems.map((item) => (
        <ListItem
          key={item.id}
          delivery={{
            ...item,
            name: toTitleCase(item.name),
          }}
          readOnly
        />
      ))}
    </View>
  );
}

export default function DeliverySummary() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { getAll } = useDeliveryStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);

  const { data: barsData } = useBars();
  const bars = useMemo(() => barsData?.value || [], [barsData]);

  const createDeliveryMutation = useCreateDelivery();

  // Get latest delivery (OCR or manual)
  const latestDelivery = queryClient.getQueryData<any>(["deliveries", "latest"]);

  // Auto-select first bar if available
  useEffect(() => {
    if (bars.length > 0 && !selectedBarId) {
      setSelectedBarId(bars[0].barId);
    }
  }, [bars, selectedBarId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date found";
    try {
      if (dateString.includes("/")) return dateString;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const infoRows = useMemo(
    () => [
      {
        id: "supplier",
        title: "Supplier",
        value: latestDelivery?.supplier?.name || "Unknown",
        valueNumberOfLines: 1,
        onEditPress: () => {},
        showEdit: false,
        editA11yLabel: "View supplier info",
      },
      {
        id: "date",
        title: "Date",
        value: formatDate(latestDelivery?.deliveryDate),
        valueNumberOfLines: 1,
        onEditPress: () => {},
        showEdit: true,
        editA11yLabel: "Edit date",
      },
      {
        id: "bar",
        title: "Bar",
        value:
          bars.find((b) => b.barId === selectedBarId)?.name ||
          "Select a bar",
        valueNumberOfLines: 1,
        onEditPress: () => {},
        showEdit: true,
        editA11yLabel: "Select bar",
      },
    ],
    [latestDelivery, bars, selectedBarId]
  );

  // Merge manual delivery items with status items
  const all = useMemo(() => {
    const statusItems = Object.values(getAll()).map((item) => ({
      ...item,
      name: toTitleCase(item.name),
    }));

    if (latestDelivery?.products?.length) {
      const manualItems = latestDelivery.products.map((p: any) => ({
        id: p.id || `manual-${p.product?.productId || Date.now()}`,
        name: p.product?.name || p.name,
        status: "received",
        ...p,
      }));
      return [...manualItems, ...statusItems];
    }

    return statusItems;
  }, [getAll, latestDelivery]);

  const received = all.filter((i) => i.status === "received");
  const damaged = all.filter((i) => i.status === "damaged");
  const missing = all.filter((i) => i.status === "missing");
  const substituted = all.filter((i) => i.status === "substituted");

  const filteredItemsCount = useMemo(() => {
    if (!searchQuery.trim()) return all.length;
    const query = searchQuery.toLowerCase();
    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    ).length;
  }, [all, searchQuery]);

  const handleSave = async () => {
    if (!latestDelivery) return;
    try {
      await createDeliveryMutation.mutateAsync(latestDelivery);
      queryClient.removeQueries({ queryKey: ["deliveries", "latest"] });
      router.push("/(scan-flow)/successful-delivery");
    } catch (error: any) {
      Alert.alert(
        "❌ Error",
        `Failed to save delivery:\n\n${error.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  const handleSearch = (value: string | number) => setSearchQuery(value.toString());
  const showNoResults = searchQuery.trim() && filteredItemsCount === 0;

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

        <View style={styles.infoContainer}>
          <EditableSectionCard
            rows={infoRows}
            style={styles.editableCardStyle}
          />
        </View>

        <InputBox
          placeholder="Search items..."
          initialValue=""
          onSearch={handleSearch}
        />

        {showNoResults ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No items found for &quot;{searchQuery}&quot;
            </Text>
          </View>
        ) : (
          <>
            <Section title="Received" items={received} searchQuery={searchQuery} />
            <Section title="Damaged" items={damaged} searchQuery={searchQuery} />
            <Section title="Missing" items={missing} searchQuery={searchQuery} />
            <Section title="Substituted" items={substituted} searchQuery={searchQuery} />

            {all.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No delivery items to display
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <GradientButton
          text={createDeliveryMutation.isPending ? "Saving..." : "Save"}
          onPress={handleSave}
          disabled={all.length === 0 || createDeliveryMutation.isPending || !latestDelivery}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: "700", marginVertical: 16 },
  infoContainer: { marginBottom: 16 },
  editableCardStyle: { borderRadius: 12 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  buttonWrapper: { padding: 16 },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "500", textAlign: "center" },
});
