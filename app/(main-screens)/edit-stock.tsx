// app/(main-screens)/edit-stock.tsx

import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useStocks, useUpdateStock } from "@/hooks/useStock";

export default function EditStock() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const router = useRouter();
  const params = useLocalSearchParams();

  /* -----------------------------
     Params from previous screen
  ------------------------------ */
  const productId = params.productId as string;
  const barId = params.barId as string;
  const productVolume = Number(params.productVolume); // litres per unit (keg/bottle)
  const initialBottleCount = Number(params.currentStock ?? 0);

  /* -----------------------------
     Local state
  ------------------------------ */
  const [unitCount, setUnitCount] = useState<number>(initialBottleCount);

  /* -----------------------------
     Data & mutations
  ------------------------------ */
  const { data: stocksData, isLoading } = useStocks();
  const updateStockMutation = useUpdateStock();

  /* -----------------------------
     Find the correct stock item
  ------------------------------ */
  const stockItem = useMemo(() => {
    return stocksData?.value.find(
      stock =>
        stock.productId === productId &&
        stock.storagePlaceId === barId
    );
  }, [stocksData, productId, barId]);

  /* -----------------------------
     Calculate leftovers
     (THIS IS THE FIX)
  ------------------------------ */
  const unitVolume = productVolume; // 50L for keg, 0.75L for bottle, etc

  const currentTotalVolume = stockItem?.volume ?? 0;

  const currentFullUnits = Math.floor(currentTotalVolume / unitVolume);
  const leftoverVolume =
    currentTotalVolume - currentFullUnits * unitVolume;

  /* -----------------------------
     Handle submit
  ------------------------------ */
  const handleAdjustStock = () => {
    if (!stockItem) return;

    const newVolume =
      leftoverVolume + unitCount * unitVolume;

    updateStockMutation.mutate({
      stockId: stockItem.stockId,
      data: {
        volume: newVolume,
      },
    });
  };

  /* -----------------------------
     Navigate back on success
  ------------------------------ */
  useEffect(() => {
    if (updateStockMutation.isSuccess) {
      router.back();
    }
  }, [updateStockMutation.isSuccess, router]);

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Info text */}
      <Text style={[styles.infoText, { color: colors.text }]}>
        Adjust the number of full units.
        Any remaining opened unit will be preserved automatically.
      </Text>

      {/* Unit input */}
      <SearchBar
        type="number"
        initialValue={unitCount.toString()}
        min={0}
        decimal={false}
        onSearch={(value) => {
          if (value === "") {
            setUnitCount(0);
          } else {
            setUnitCount(
              typeof value === "number" ? value : Number(value)
            );
          }
        }}
      />

      {/* Leftover indicator
      {leftoverVolume > 0 && (
        <Text style={{ color: colors.text, marginTop: 12 }}>
          Open unit remaining: {leftoverVolume.toFixed(1)} L
        </Text>
      )} */}

      {/* Adjust button */}
      <Pressable
        onPress={handleAdjustStock}
        disabled={
          updateStockMutation.isPending ||
          isLoading ||
          !stockItem
        }
        style={styles.adjustButton}
      >
        <LinearGradient
          colors={["#FF77E0", "#F54D41"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            paddingVertical: 14,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            opacity:
              updateStockMutation.isPending || !stockItem ? 0.6 : 1,
          }}
        >
          <Text style={styles.buttonText}>
            {updateStockMutation.isPending ? "Saving..." : "Adjust"}
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

/* -----------------------------
   Styles
------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  adjustButton: {
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});
