import React, { useMemo, useState } from "react";
import {  StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import DeliveryList, { DeliveryItem } from "@/components/ui/DeliveryList";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeliveryCheck() {
  const queryClient = useQueryClient();
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  /**
   * Read OCR response from cache
   */
  const ocrResponse = queryClient.getQueryData<any>(["deliveries", "latest"]) ?? null;

  /**
   * Extract first delivery note
   */
  const delivery = useMemo(() => {
    if (!ocrResponse) return null;
    return Array.isArray(ocrResponse) ? ocrResponse[0] : ocrResponse;
  }, [ocrResponse]);

  /**
   * Map OCR products → DeliveryItem
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

    return mapped;
  }, [delivery]);

  /**
   * Swipe-to-remove handler
   */
  const handleSwipeComplete = (id: string) => {
    setRemovedIds(prev => [...prev, id]);
    console.log(`Product ${id} completed and removed`);
    
    // Optional: You could also update cache here
    // queryClient.setQueryData(["deliveries", "latest"], updatedData);
  };

  /**
   * Search handler
   */
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  /**
   * Item press handler
   */
  const handleItemPress = (item: DeliveryItem) => {
    console.log("Item pressed:", item);
    // Navigate to product detail or edit screen
  };

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <DeliveryList
          deliveries={[]}
          emptyState={{
            title: "No delivery scanned yet",
            message: "Scan a delivery note to get started"
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DeliveryList
        deliveries={deliveries}
        removedIds={removedIds}
        onSearch={handleSearch}
        onSwipeComplete={handleSwipeComplete}
        onItemPress={handleItemPress}
        emptyState={{
          title: deliveries.length === 0
            ? "All deliveries completed! 🎉"
            : "No deliveries match your search",
          message: "Scan a new delivery to add more items"
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});