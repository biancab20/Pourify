import InputBox from "@/components/ui/InputBox";
import ListItem from "@/components/ui/ListItem";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { useQueryClient } from "@tanstack/react-query";

type DeliveryItem = {
  id: string;
  name: string;
  cases: number;
  cans: number;
};

export default function DeliveryList() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  /**
   * ✅ Read OCR response from cache
   */
  const ocrResponse =
    queryClient.getQueryData<any>(["deliveries", "latest"]) ?? null;

  /**
   * ✅ Extract first delivery note
   */
  const delivery = useMemo(() => {
    if (!ocrResponse) return null;
    return Array.isArray(ocrResponse) ? ocrResponse[0] : ocrResponse;
  }, [ocrResponse]);

  /**
   * ✅ Map OCR products → DeliveryItem (UI-compatible)
   */
const deliveries = useMemo<DeliveryItem[]>(() => {
  if (!delivery || !Array.isArray(delivery.products)) return [];

  const mapped: DeliveryItem[] = delivery.products
    .filter((p: any) => !p.isDeleted)
    .map((p: any, index: number): DeliveryItem => ({
      id: p.productId ?? `product-${index}`,
      name: p.name ?? "Unknown product",
      cases: Number(p.totalVolume ?? 0),
      cans: Number(p.volume ?? 0),
    }));

  return mapped.filter((item: DeliveryItem) => !removedIds.includes(item.id));
}, [delivery, removedIds]);

  /**
   * ✅ Swipe-to-remove handler (same behavior as before)
   */
  const handleSwipeComplete = (id: string) => {
    setRemovedIds(prev => [...prev, id]);
    console.log(`Product ${id} completed and removed`);
  };

  /**
   * ✅ Search handler (InputBox compatibility)
   */
  const handleSearch = (value: string | number) => {
    setSearchQuery(value.toString());
  };

  /**
   * ✅ Filtered list
   */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return deliveries;
    const query = searchQuery.toLowerCase();
    return deliveries.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [deliveries, searchQuery]);

  if (!delivery) {
    return (
      <View style={styles.emptyState}>
        <Text>No delivery scanned yet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="gradient" gradientName="paloma" style={styles.title}>
        Check delivery list
      </Text>

      {/* ✅ Same InputBox as before */}
      <InputBox
        placeholder="Search deliveries..."
        initialValue=""
        onSearch={handleSearch}
      />

      {searchQuery && (
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {filteredData.length} result
          {filteredData.length !== 1 ? "s" : ""}
        </Text>
      )}

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            {deliveries.length === 0
              ? "All deliveries completed! 🎉"
              : "No deliveries match your search"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              delivery={item}
              onSwipeComplete={handleSwipeComplete}
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
  },
  resultsText: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 40,
  },
});
