import { View, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import SearchBar from "@/components/ui/SearchBar";
import { useAppTheme } from "@/stores/app-theme-context";
import { enhancedDummyData, Product, getTotalStockForAllBars, getStockForBar, dummyData, Bar } from "@/types/DummyData";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBar, setSelectedBar] = useState<{ id: number | null; name: string }>({ id: null, name: "General Stock" });

  // Get all bars from dummy data
  const bars = dummyData.bars.items;

  // Check if we're viewing stock for a specific bar or all bars from navigation params
  const barIdFromParams = params.barId ? (Array.isArray(params.barId) ? params.barId[0] : params.barId) : null;
  const barNameFromParams = params.barName ? (Array.isArray(params.barName) ? params.barName[0] : params.barName) : null;

  useEffect(() => {
    // Set initial selection based on navigation params
    if (barIdFromParams && barNameFromParams) {
      setSelectedBar({ id: parseInt(barIdFromParams), name: barNameFromParams });
    }
  }, [barIdFromParams, barNameFromParams]);

  useEffect(() => {
    if (selectedBar.id) {
      // Get stock for specific bar
      const barStock = getStockForBar(selectedBar.id);
      setProducts(barStock);
    } else {
      // Get total stock for all bars
      const totalStock = getTotalStockForAllBars();
      setProducts(totalStock);
    }
  }, [selectedBar]);

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

  const handleBarSelect = (bar: { id: number | null; name: string }) => {
    setSelectedBar(bar);
    setShowDropdown(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Dropdown Header */}
        <View style={styles.dropdownContainer}>
          <Pressable
            style={[styles.dropdownButton, { backgroundColor: palette.darkBlue }]}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownButtonText}>{selectedBar.name}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </Pressable>

        </View>

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowDropdown(false)}
          >
            <View style={[styles.dropdownMenu, { backgroundColor: colors.background }]}>
              {/* General Stock Option */}
              <Pressable
                style={styles.dropdownItem}
                onPress={() => handleBarSelect({ id: null, name: "General Stock" })}
              >
                <Text style={[styles.dropdownItemText, { color: colors.text }]}>General Stock</Text>
              </Pressable>
              
              {/* Bar Options */}
              {bars.map((bar: Bar) => (
                <Pressable
                  key={bar.barId}
                  style={styles.dropdownItem}
                  onPress={() => handleBarSelect({ id: bar.barId, name: bar.name })}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{bar.name}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
        
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
                  ...(selectedBar.id && { barId: selectedBar.id.toString(), barName: selectedBar.name })
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
          
          {/* Empty state when no products */}
          {filteredProducts.length === 0 && !searchQuery && (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                {selectedBar.id 
                  ? `No stock available for ${selectedBar.name}`
                  : "No stock available in your bars"
                }
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.text }]}>
                Add products to see them appear here
              </Text>
            </View>
          )}
          
          {/* Show message when no results found from search */}
          {searchQuery && filteredProducts.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.text }]}>
                No products found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  dropdownButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  dropdownArrow: {
    color: "white",
    fontSize: 12,
    marginLeft: 8,
  },
  warningContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  warningText: {
    fontSize: 12,
    fontWeight: "500",
    color: 'orange',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    borderRadius: 12,
    padding: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  productsList: {
    marginTop: 20,
    gap: 12,
    paddingBottom: 40,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});