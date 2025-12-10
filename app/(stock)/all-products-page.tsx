import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/SearchBar";
import StockDropdownNavigation from "@/components/ui/StockDropdownNavigation";
import { useAppTheme } from "@/stores/app-theme-context";
import {
  Product,
  getTotalStockForAllBars,
  getStockForBar,
  dummyData,
} from "@/types/DummyData";
import { useState, useMemo, useEffect } from "react";

type ProductWithStock = Product & { totalVolume: number; bottleCount: number };

export default function AllProducts() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [selectedBar, setSelectedBar] = useState<{
    id: number | null;
    name: string;
  }>({ id: null, name: "General Stock" });

  const bars = dummyData.bars.items;

  const barIdFromParams = params.barId
    ? Array.isArray(params.barId)
      ? params.barId[0]
      : params.barId
    : null;
  const barNameFromParams = params.barName
    ? Array.isArray(params.barName)
      ? params.barName[0]
      : params.barName
    : null;

  useEffect(() => {
    if (barIdFromParams && barNameFromParams) {
      setSelectedBar({
        id: parseInt(barIdFromParams),
        name: barNameFromParams,
      });
    }
  }, [barIdFromParams, barNameFromParams]);

  useEffect(() => {
    if (selectedBar.id) {
      const barStock = getStockForBar(selectedBar.id);
      setProducts(barStock);
    } else {
      const totalStock = getTotalStockForAllBars();
      setProducts(totalStock);
    }
  }, [selectedBar]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product: ProductWithStock) =>
        product.name.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query) ||
        product.volume.toString().includes(query)
    );
  }, [products, searchQuery]);

  const handleSearch = (searchText: string) => {
    setSearchQuery(searchText);
  };

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    setSelectedBar(bar);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView style={styles.scrollView}>
        <StockDropdownNavigation
          bars={bars}
          selectedBar={selectedBar}
          onBarSelect={handleBarSelect}
        />

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search products..."
          initialValue=""
        />

        {searchQuery && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}

        <View style={styles.productsList}>
          {filteredProducts.map((product: ProductWithStock) => (
            <Pressable
              key={product.productId}
              style={[
                styles.productButton,
                { backgroundColor: theme.colors.cardBackground },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(stock)/product-detail-page",
                  params: {
                    productId: product.productId.toString(),
                    productName: product.name,
                    productVolume: product.volume.toString(),
                    productType: product.type,
                    totalVolume: product.totalVolume.toString(),
                    bottleCount: product.bottleCount.toString(),
                    ...(selectedBar.id && {
                      barId: selectedBar.id.toString(),
                      barName: selectedBar.name,
                    }),
                  },
                })
              }
            >
              <View style={styles.productInfo}>
                <Text
                  style={[styles.productName, { color: theme.colors.cardText }]}
                >
                  {product.name}
                </Text>
                <Text
                  style={[
                    styles.productDetails,
                    { color: theme.colors.cardText },
                  ]}
                >
                  {product.totalVolume}L Total • {product.bottleCount} Bottles
                </Text>
              </View>

              <View style={styles.alcoholTypeContainer}>
                <Text
                  style={[
                    styles.alcoholTypeText,
                    { color: theme.palette.pink },
                  ]}
                >
                  {product.type} {">"}
                </Text>
              </View>
            </Pressable>
          ))}

          {filteredProducts.length === 0 && !searchQuery && (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                {selectedBar.id
                  ? `No stock available for ${selectedBar.name}`
                  : "No stock available in your bars"}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.text }]}>
                Add products to see them appear here
              </Text>
            </View>
          )}

          {searchQuery && filteredProducts.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.text }]}>
                No products found for {searchQuery}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  productsList: {
    marginTop: 20,
    gap: 12,
  },
  productButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  productDetails: {
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 2,
  },
  alcoholTypeContainer: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alcoholTypeText: {
    fontWeight: "600",
    fontSize: 12,
  },
  resultsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
});
