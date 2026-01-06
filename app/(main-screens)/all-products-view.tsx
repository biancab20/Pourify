import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import StockDropdownNavigation from "@/components/ui/StockDropdownNavigation";

import { useAppTheme } from "@/stores/app-theme-context";
import { useBars } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import { useStocks } from "@/hooks/useStock";

import { Product } from "@/types/products";

type ProductWithStock = Product & { totalVolume: number; bottleCount: number };

export default function AllProducts() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { colors } = theme;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [selectedBar, setSelectedBar] = useState<{ id: string | null; name: string }>({
    id: null,
    name: "General Stock",
  });

  // Data hooks
  const { data: barsData } = useBars();
  const { data: productsData } = useProducts();
  const { data: stocksData, isLoading: stocksLoading, refetch: refetchStocks } = useStocks(
    selectedBar.id ? { barId: selectedBar.id } : undefined
  );

  // Memoized arrays
  const bars = useMemo(() => barsData?.items || [], [barsData]);
  const allProducts = useMemo(() => productsData?.items || [], [productsData]);

  // Initialize selected bar from params if present
  useEffect(() => {
    const barIdParam = params.barId ? (Array.isArray(params.barId) ? params.barId[0] : params.barId) : null;
    const barNameParam = params.barName ? (Array.isArray(params.barName) ? params.barName[0] : params.barName) : null;

    if (barIdParam && barNameParam) {
      setSelectedBar({ id: barIdParam, name: barNameParam });
    }
  }, [params.barId, params.barName]);

  // Update products when bar, stock, or product data changes
  useEffect(() => {
    if (!allProducts.length) return;

    const productMap = new Map<string, ProductWithStock>();

    // Initialize all products
    allProducts.forEach(product => {
      productMap.set(product.productId.toString(), { // Convert productId to string
        ...product,
        productId: product.productId.toString(), // Ensure productId is string
        totalVolume: 0, 
        bottleCount: 0 
      });
    });

    // Add stock data if available
    if (stocksData?.items) {
      stocksData.items.forEach(stock => {
        const product = productMap.get(stock.productId.toString()); // Convert to string
        if (product) {
          const bottleCount = Math.floor(stock.volume / product.volume);
          product.totalVolume += stock.volume;
          product.bottleCount += bottleCount;
        }
      });
    }

    // Filter products based on selected bar
    let filteredProducts: ProductWithStock[];
    if (selectedBar.id) {
      filteredProducts = Array.from(productMap.values()).filter(p => p.totalVolume > 0);
    } else {
      filteredProducts = Array.from(productMap.values());
    }

    setProducts(filteredProducts);
  }, [selectedBar, allProducts, stocksData]);

  // Search filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query) ||
        product.volume.toString().includes(query) ||
        product.totalVolume.toString().includes(query)
    );
  }, [products, searchQuery]);

  // Handlers
  const handleSearch = (text: string | number) => setSearchQuery(text.toString());

  const handleBarSelect = (bar: { id: string | null; name: string }) => {
    setSelectedBar(bar);
    setProducts([]); // clear products immediately
    refetchStocks(); // refetch stock for the selected bar
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={Platform.OS === "android" ? ["bottom"] : []}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="gradient" gradientName="paloma" style={[styles.title, { color: colors.text }]}>
            Stock
          </Text>

          <StockDropdownNavigation bars={bars} selectedBar={selectedBar} onBarSelect={handleBarSelect} />
        </View>

        {/* Search */}
        <SearchBar onSearch={handleSearch} placeholder="Search products..." initialValue="" />

        {/* Loading */}
        {stocksLoading && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: colors.text }}>Loading stock data...</Text>
          </View>
        )}

        {/* Search results count */}
        {searchQuery && !stocksLoading && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}

        {/* Products list */}
        <View style={styles.productsList}>
          {!stocksLoading &&
            filteredProducts.map(product => (
              <Pressable
                key={product.productId}
                style={[styles.productButton, { backgroundColor: theme.colors.cardBackground }]}
                onPress={() =>
                  router.push({
                    pathname: "/product-stock",
                    params: {
                      productId: product.productId,
                      productName: product.name,
                      productVolume: product.volume.toString(),
                      productType: product.type,
                      totalVolume: product.totalVolume.toString(),
                      bottleCount: product.bottleCount.toString(),
                      ...(selectedBar.id && { barId: selectedBar.id, barName: selectedBar.name }),
                    },
                  })
                }
              >
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.colors.cardText }]}>{product.name}</Text>
                  <Text style={[styles.productDetails, { color: theme.colors.cardText }]}>
                    {product.totalVolume}L Total • {product.bottleCount} Bottles
                  </Text>
                </View>

                <View style={styles.alcoholTypeContainer}>
                  <Text style={[styles.alcoholTypeText, { color: theme.palette.pink }]}>
                    {product.type} {">"}
                  </Text>
                </View>
              </Pressable>
            ))}

          {/* Empty state */}
          {!stocksLoading && filteredProducts.length === 0 && !searchQuery && (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                {selectedBar.id ? `No stock available for ${selectedBar.name}` : "No stock available in your bars"}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.text }]}>Add products to see them appear here</Text>
            </View>
          )}

          {/* No search results */}
          {!stocksLoading && searchQuery && filteredProducts.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.text }]}>No products found for {searchQuery}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "700" },
  productsList: { marginTop: 20, gap: 12 },
  productButton: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  productInfo: { flex: 1 },
  productName: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  productDetails: { fontWeight: "500", fontSize: 14, marginBottom: 2 },
  alcoholTypeContainer: { marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  alcoholTypeText: { fontWeight: "600", fontSize: 12 },
  resultsContainer: { marginTop: 16, marginBottom: 8 },
  resultsText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  noResultsContainer: { padding: 20, alignItems: "center" },
  noResultsText: { fontSize: 16, fontWeight: "500", textAlign: "center" },
  emptyStateContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, marginTop: 60 },
  emptyStateText: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, textAlign: "center", opacity: 0.7 },
  loadingContainer: { padding: 20, alignItems: "center" },
});