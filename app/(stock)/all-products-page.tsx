import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/SearchBar";
import { useAppTheme } from "@/stores/app-theme-context";
import { enhancedDummyData, Product, getTotalStockForAllBars, getStockForBar } from "@/types/DummyData";
import { useState, useMemo, useEffect } from "react";

// Define the type for products with stock info
type ProductWithStock = Product & { totalVolume: number; bottleCount: number };

export default function AllProducts() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductWithStock[]>([]);

  // Check if we're viewing stock for a specific bar or all bars
  const barId = params.barId ? (Array.isArray(params.barId) ? params.barId[0] : params.barId) : null;
  const barName = params.barName ? (Array.isArray(params.barName) ? params.barName[0] : params.barName) : null;

  useEffect(() => {
    if (barId) {
      // Get stock for specific bar
      const barStock = getStockForBar(parseInt(barId));
      setProducts(barStock);
    } else {
      // Get total stock for all bars
      const totalStock = getTotalStockForAllBars();
      setProducts(totalStock);
    }
  }, [barId]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return products.filter((product: ProductWithStock) => 
      product.name.toLowerCase().includes(query) ||
      product.type.toLowerCase().includes(query) ||
      product.volume.toString().includes(query)
    );
  }, [products, searchQuery]);

  const handleSearch = (searchText: string) => {
    setSearchQuery(searchText);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Show header based on whether viewing specific bar or general stock */}
      <View style={styles.barHeader}>
        <Text style={[styles.barTitle, { color: colors.text }]}>
          {barName ? `Stock in ${barName}` : "General Stock"}
        </Text>
      </View>
      
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search products..."
        initialValue=""
      />
      
      {/* Show search results count */}
      {searchQuery && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, { color: colors.text }]}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}
      
      <View style={styles.productsList}>
        {filteredProducts.map((product: ProductWithStock) => (
          <Pressable
            key={product.productId}
            style={[styles.productButton, { backgroundColor: palette.darkBlue }]}
            onPress={() => router.push({
              pathname: "/(stock)/product-detail-page",
              params: { 
                productId: product.productId.toString(),
                productName: product.name,
                productVolume: product.volume.toString(),
                productType: product.type,
                totalVolume: product.totalVolume.toString(),
                bottleCount: product.bottleCount.toString(),
                // Pass bar info if viewing specific bar
                ...(barId && { barId, barName })
              }
            })}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDetails}>
                {product.totalVolume}L Total • {product.bottleCount} Bottles
              </Text>
              <Text style={styles.productSubDetails}>
                {product.volume}L per unit • {product.type}
              </Text>
            </View>
          </Pressable>
        ))}
        
        {/* Show message when no results found */}
        {searchQuery && filteredProducts.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: colors.text }]}>
              No products found for "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  barHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  barTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 24, 
    marginTop: 20,
    textAlign: "center",
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
  },
  productInfo: {
    flex: 1,
  },
  productName: { 
    color: "white", 
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  productDetails: { 
    color: "white", 
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 2,
  },
  productSubDetails: { 
    color: "white", 
    fontWeight: "400",
    fontSize: 12,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 12,
    alignSelf: "center",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "600" 
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  secondaryText: { 
    fontWeight: "600" 
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
});