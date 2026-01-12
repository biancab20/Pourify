// DeliveryCheck.tsx (UPDATED – full file)
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import DeliveryList, {
  DeliveryItem,
} from "@/components/screenComponents/DeliveryList";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRouter } from "expo-router";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";

export default function DeliveryCheck() {
  const queryClient = useQueryClient();
  const { setStatus } = useDeliveryStatus();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const { theme } = useAppTheme();
  const { colors } = theme;
  const router = useRouter();

  const ocrResponse =
    queryClient.getQueryData<any>(["deliveries", "latest"]) ?? null;

  const delivery = useMemo(() => {
    if (!ocrResponse) return null;
    return Array.isArray(ocrResponse) ? ocrResponse[0] : ocrResponse;
  }, [ocrResponse]);

  const deliveries = useMemo<DeliveryItem[]>(() => {
    if (!delivery?.products) return [];

    return delivery.products
      .filter((p: any) => !p.isDeleted)
      .map((p: any, index: number) => ({
        id: `${p.productId ?? "unknown"}-${index}`, //added unique key to prevent from getting an error (sometimes the productId is repeated)
        name: p.name ?? "Unknown product",
        cases: Number(p.totalVolume ?? 0),
        cans: Number(p.volume ?? 0),
      }));
  }, [delivery]);

  const allItemsCompleted = useMemo(() => {
    return (
      deliveries.length > 0 &&
      deliveries.every((d) => removedIds.includes(d.id))
    );
  }, [deliveries, removedIds]);

  const handleSwipeComplete = (id: string) => {
    const item = deliveries.find((d) => d.id === id);
    if (!item) return;

    setStatus(item, "received");
    setRemovedIds((prev) => [...prev, id]);
  };

  if (!delivery) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <DeliveryList deliveries={[]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <DeliveryList
        deliveries={deliveries}
        removedIds={removedIds}
        onSwipeComplete={handleSwipeComplete}
      />

      <View style={{ padding: 16 }}>
        <Button
          text="View Delivery Summary"
          disabled={!allItemsCompleted}
          onPress={() => router.push("/delivery-summary")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
