import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/dynamicComponents/SearchBar";
import StockDropdownNavigation from "@/components/dynamicComponents/StockDropdownLocationPicker";

import { useBars } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import { useStocks } from "@/hooks/useStock";
import { useAppTheme } from "@/stores/app-theme-context";
import { StockItem } from "@/types/stock";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";

const formatProductName = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AllProducts() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { colors } = theme;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBar, setSelectedBar] = useState<{
    id: string | null;
    name: string;
  }>({
    id: null,
    name: "General Stock",
  });

  // Data
  const { data: barsData } = useBars();
  const { data: productsData } = useProducts();
  const { data: stocksData, isLoading: stocksLoading } = useStocks();

  const bars = useMemo(() => barsData?.value ?? [], [barsData?.value]);
  const products = useMemo(
    () => productsData?.value ?? [],
    [productsData?.value],
  );
  const stocks = useMemo(() => stocksData?.value ?? [], [stocksData?.value]);

  // Init bar from params
  useEffect(() => {
    const barId = Array.isArray(params.barId) ? params.barId[0] : params.barId;
    const barName = Array.isArray(params.barName)
      ? params.barName[0]
      : params.barName;

    if (barId && barName) {
      setSelectedBar({ id: barId, name: barName });
    }
  }, [params.barId, params.barName]);

  // Filter + sort stock
  const filteredStocks = useMemo(() => {
    if (!products.length) return [];

    return products
      .map((product) => {
        let productStocks = stocks.filter(
          (stock: StockItem) => stock.productId === product.productId,
        );

        if (selectedBar.id) {
          productStocks = productStocks.filter(
            (stock) => stock.storagePlaceId === selectedBar.id,
          );
        }

        const totalVolume = productStocks.reduce(
          (sum, stock) => sum + stock.volume,
          0,
        );

        const bottleCount =
          product.volume > 0 ? Math.floor(totalVolume / product.volume) : 0;

        return {
          stockId: `${product.productId}-${selectedBar.id ?? "general"}`,
          productId: product.productId,
          productName: product.name,
          productType: product.type,
          productVolume: product.volume,
          volume: totalVolume,
          bottleCount,
          isOutOfStock: totalVolume === 0,
        };
      })
      .filter((stock) =>
        searchQuery
          ? stock.productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            stock.productType.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
      .sort((a, b) => {
        if (a.isOutOfStock !== b.isOutOfStock) {
          return a.isOutOfStock ? 1 : -1;
        }
        return a.productName.localeCompare(b.productName);
      });
  }, [products, stocks, selectedBar, searchQuery]);

  const handleSearch = (text: string | number) =>
    setSearchQuery(text.toString());

  const handleBarSelect = (bar: { id: string | null; name: string }) => {
    setSelectedBar(bar);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom", "top"] : []}
    >
      {Platform.OS === "android" && (
        <AndroidCustomNavigation onBack={router.back} />
      )}
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="gradient" gradientName="paloma" style={styles.title}>
            Stock
          </Text>
          <StockDropdownNavigation
            bars={bars}
            selectedBar={selectedBar}
            onBarSelect={handleBarSelect}
          />
        </View>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search stock..."
          initialValue=""
        />

        {stocksLoading && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: colors.text }}>Loading stock data…</Text>
          </View>
        )}

        <View style={styles.productsList}>
          {!stocksLoading &&
            filteredStocks.map((stock) => (
              <Pressable
                key={stock.stockId}
                style={[
                  styles.productButton,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/product-stock",
                    params: {
                      productId: stock.productId,
                      productName: stock.productName,
                      productVolume: stock.productVolume.toString(),
                      productType: stock.productType,
                      totalVolume: stock.volume.toString(),
                      bottleCount: stock.bottleCount.toString(),
                      ...(selectedBar.id && {
                        barId: selectedBar.id,
                        barName: selectedBar.name,
                      }),
                    },
                  })
                }
              >
                <View style={styles.productInfo}>
                  <Text
                    style={[
                      styles.productName,
                      { color: theme.colors.cardText },
                    ]}
                  >
                    {formatProductName(stock.productName)}
                  </Text>

                  {stock.isOutOfStock ? (
                    <Text
                      style={[
                        styles.productDetails,
                        {
                          color: theme.colors.cardText,
                          opacity: 0.6,
                        },
                      ]}
                    >
                      Out of Stock
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.productDetails,
                        { color: theme.colors.cardText },
                      ]}
                    >
                      {stock.volume}L • {stock.bottleCount} Bottles
                    </Text>
                  )}
                </View>

                <Text
                  style={{
                    color: theme.palette.pink,
                    fontWeight: "600",
                  }}
                >
                  {stock.productType.toUpperCase()} &gt;
                </Text>
              </Pressable>
            ))}

          {!stocksLoading && filteredStocks.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={{ color: colors.text }}>
                {selectedBar.id
                  ? `No stock available for ${selectedBar.name}`
                  : "No stock available"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "700" },
  productsList: { marginTop: 20, gap: 12, paddingBottom: 50 },
  productButton: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "600" },
  productDetails: { fontSize: 14, marginTop: 4 },
  emptyStateContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});
