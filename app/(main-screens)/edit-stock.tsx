// app/(main-screens)/edit-stock.tsx

import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import { useAppTheme } from "@/stores/app-theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCreateStock, useStocks, useUpdateStock } from "@/hooks/useStock";

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
  const productName = params.productName as string;
  const productType = params.productType as string;
  const initialBottleCount = Number(params.currentStock ?? 0);
  const stockId = params.stockId as string; // Get stockId directly from params

  /* -----------------------------
     Local state
  ------------------------------ */
  const [unitCount, setUnitCount] = useState<number>(initialBottleCount);

  /* -----------------------------
     Data & mutations
  ------------------------------ */
  const { data: stocksData, isLoading } = useStocks();
  const updateStockMutation = useUpdateStock();
  const createStockMutation = useCreateStock();

  /* -----------------------------
     Find the correct stock item
  ------------------------------ */
  const stockItem = useMemo(() => {
    if (stockId) {
      return stocksData?.value.find(stock => stock.stockId === stockId);
    }
    
    return stocksData?.value.find(
      stock =>
        stock.productId === productId &&
        stock.storagePlaceId === barId
    );
  }, [stocksData, productId, barId, stockId]);

  /* -----------------------------
     Calculate leftovers
  ------------------------------ */
  const unitVolume = productVolume;
  const currentTotalVolume = stockItem?.volume ?? 0;
  const currentFullUnits = Math.floor(currentTotalVolume / unitVolume);
  const leftoverVolume = currentTotalVolume - currentFullUnits * unitVolume;

  /* -----------------------------
     Handle submit
  ------------------------------ */
  const handleAdjustStock = () => {
    if (stockItem || stockId) {
      const newVolume = leftoverVolume + unitCount * unitVolume;
      const targetStockId = stockItem?.stockId || stockId!;
      
      updateStockMutation.mutate({
        stockId: targetStockId,
        data: {
          volume: newVolume,
          productId: stockItem?.productId || productId,
          storagePlaceId: stockItem?.storagePlaceId || barId,
        },
      });
    } else {
      const newVolume = unitCount * unitVolume;
      
      createStockMutation.mutate({
        productId,
        storagePlaceId: barId,
        volume: newVolume,
      });
    }
  };

  /* -----------------------------
     Navigate back on success
  ------------------------------ */
  useEffect(() => {
    if (updateStockMutation.isSuccess || createStockMutation.isSuccess) {
      router.back();
    }
  }, [updateStockMutation.isSuccess, createStockMutation.isSuccess, router]);

  /* -----------------------------
     Button state
  ------------------------------ */
  const isPending = updateStockMutation.isPending || createStockMutation.isPending;
  const canSubmit = !isPending && !isLoading && productId && barId && unitCount >= 0;

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Adjust stock header */}
      <Text style={[styles.header, { color: colors.text }]}>
        Adjust stock
      </Text>

      {/* Info text */}
      <Text style={[styles.infoText, { color: colors.text }]}>
        You are trying to adjust the quantity of {productName} {productType}. 
        Please input the amount of full {productType}s that you see.
      </Text>

      {/* Unit input */}
      <SearchBar
        type="number"
        initialValue={unitCount.toString()}
        min={0}
        decimal={false}
        placeholder="Enter number of units"
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

      {/* Adjust button */}
      <Pressable
        onPress={handleAdjustStock}
        disabled={!canSubmit}
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
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Saving..." : "Adjust"}
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
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
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