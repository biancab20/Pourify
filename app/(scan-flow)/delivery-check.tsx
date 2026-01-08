import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import DeliveryList, { DeliveryItem } from "@/components/ui/DeliveryList";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { Text } from "@/components/shared/Text";  
import { useRouter } from "expo-router"; // Added import

export default function DeliveryCheck() {
  const queryClient = useQueryClient();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const router = useRouter(); // Added router

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
   * Check if all items have been completed
   */
  const allItemsCompleted = useMemo(() => {
    if (deliveries.length === 0) return false;
    return deliveries.every(item => removedIds.includes(item.id));
  }, [deliveries, removedIds]);

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

  /**
   * Handle summary button press
   */
  const handleSummaryPress = () => {
    console.log("Navigating to delivery summary");
    // Navigation is handled by the Button component
  };

  if (!delivery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <DeliveryList
          deliveries={deliveries}
          removedIds={removedIds}
          onSearch={handleSearch}
          onSwipeComplete={handleSwipeComplete}
          onItemPress={handleItemPress}
          emptyState={{
            title: deliveries.length === 0
              ? "All items in the delivery list are checked. Please go to summary."
              : "No deliveries match your search",
            message: "Scan a new delivery to add more items"
          }}
        />
        
        {/* Summary Button */}
        <View style={{ padding: 16, backgroundColor: colors.background }}>
          <Button
            text="View Delivery Summary"
            onPress={() => router.push("/delivery-summary")} // Changed to use router.push
            disabled={!allItemsCompleted}
            variant="primary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});