import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/InputBox";
import StockDropdownNavigation from "@/components/ui/StockDropdownNavigation";
import { useAppTheme } from "@/stores/app-theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBars } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import { useStocks } from "@/hooks/useStock";
import { Bar } from "@/types/locations";
import { Product } from "@/types/products";

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

  const { data: barsData } = useBars();
  const { data: productsData } = useProducts();
  const { data: stocksData, isLoading: stocksLoading, refetch: refetchStocks } = useStocks(
    selectedBar.id ? { barId: selectedBar.id } : undefined
  );

  const bars = useMemo(() => barsData?.items || [], [barsData]);
  const allProducts = useMemo(() => productsData?.items || [], [productsData]);

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
    // Clear products when bar changes
    setProducts([]);
    
    if (stocksLoading || !stocksData || allProducts.length === 0) {
      return;
    }

    const stockItems = stocksData.items || [];
    const productMap = new Map<number, ProductWithStock>();

    // Process all stock items
    stockItems.forEach((stock) => {
      const product = allProducts.find(p => p.productId === stock.productId);
      if (product) {
        const bottleCount = Math.floor(stock.volume / product.volume);
        
        if (productMap.has(product.productId)) {
          const existing = productMap.get(product.productId)!;
          existing.totalVolume += stock.volume;
          existing.bottleCount += bottleCount;
        } else {
          productMap.set(product.productId, {
            ...product,
            totalVolume: stock.volume,
            bottleCount
          });
        }
      }
    });

    // For specific bar, only show products with stock
    if (selectedBar.id) {
      const productsWithStock = Array.from(productMap.values())
        .filter(p => p.totalVolume > 0);
      setProducts(productsWithStock);
    } else {
      // For general view, show all products
      const allProductsArray = allProducts.map(product => {
        const stockProduct = productMap.get(product.productId);
        return stockProduct || {
          ...product,
          totalVolume: 0,
          bottleCount: 0
        };
      });
      setProducts(allProductsArray);
    }
  }, [selectedBar.id, stocksData, stocksLoading, allProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product: ProductWithStock) =>
        product.name.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query) ||
        product.volume.toString().includes(query) ||
        product.totalVolume.toString().includes(query)
    );
  }, [products, searchQuery]);

  const handleSearch = (searchText: string | number) => {
    setSearchQuery(searchText.toString());
  };

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    console.log("Switching to bar:", bar.id, bar.name);
    setSelectedBar(bar);
    // Clear products immediately when bar changes
    setProducts([]);
    // Force refetch
    refetchStocks();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom"] : []}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text
            variant="gradient"
            gradientName="paloma"
            style={[styles.title, { color: colors.text }]}
          >
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
          placeholder="Search products..."
          initialValue=""
        />

        {stocksLoading && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: colors.text }}>Loading stock data...</Text>
          </View>
        )}

        {searchQuery && !stocksLoading && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}

        <View style={styles.productsList}>
          {!stocksLoading && filteredProducts.map((product: ProductWithStock) => (
            <Pressable
              key={product.productId}
              style={[
                styles.productButton,
                { backgroundColor: theme.colors.cardBackground },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/product-stock",
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

          {!stocksLoading && filteredProducts.length === 0 && !searchQuery && (
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

          {!stocksLoading && searchQuery && filteredProducts.length === 0 && (
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});