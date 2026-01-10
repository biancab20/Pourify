// app/(scan-flow)/add-delivery-item.tsx
import React, { useState, useMemo } from "react";
import { View, Pressable, TextInput, FlatList, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";

type LocalDeliveryProduct = {
  productId: string;
  name: string;
  volume: number;
  type: string;
  totalVolume: number;
};

type LocalDeliverySupplier = {
  supplierId: string;
  name: string;
  contactEmail?: string;
};

// Define the Product type from your hook data
type ProductType = {
  productId: string;
  name: string;
  volume: number;
  type: string;
  totalVolume?: number; // This is optional
};



export default function AddDeliveryItem() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entity?: string }>();
  const { theme } = useAppTheme();
  const entity = params.entity ?? "suppliers"; // "suppliers" or "products"

  const { data: suppliersData } = useSuppliers();
  const existingSuppliers = useMemo(() => suppliersData?.value ?? [], [suppliersData?.value]);

  const { data: productsData } = useProducts();
  const existingProducts = useMemo(() => productsData?.value ?? [], [productsData?.value]);

  const [selectedSupplier, setSelectedSupplier] = useState<LocalDeliverySupplier | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<LocalDeliveryProduct[]>([]);

  // Transform ProductType to LocalDeliveryProduct
  const transformProduct = (product: ProductType): LocalDeliveryProduct => ({
    productId: product.productId,
    name: product.name,
    volume: product.volume,
    type: product.type,
    totalVolume: product.totalVolume ?? product.volume // Use totalVolume if exists, otherwise use volume
  });

  // Filter products for search
  const productSuggestions = useMemo(() => {
    if (entity !== "products") return [];
    if (!productSearch.trim()) return [];
    const query = productSearch.toLowerCase();
    return existingProducts
      .filter(p => p.name.toLowerCase().includes(query))
      .filter(p => !selectedProducts.some(sp => sp.productId === p.productId))
      .map(transformProduct);
  }, [productSearch, existingProducts, selectedProducts, entity]);

  // Add product
  const addProduct = (product: LocalDeliveryProduct) => {
    setSelectedProducts(prev => [...prev, { ...product, totalVolume: product.volume }]);
    setProductSearch("");
  };

  // Remove product
  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  // Update product volume
  const updateVolume = (productId: string, volume: number) => {
    setSelectedProducts(prev =>
      prev.map(p => (p.productId === productId ? { ...p, totalVolume: volume } : p))
    );
  };

  // Proceed with selected items
  const onAddSelected = () => {
    if (entity === "suppliers" && !selectedSupplier) {
      Alert.alert("Missing supplier", "Please select a supplier");
      return;
    }
    if (entity === "products" && selectedProducts.length === 0) {
      Alert.alert("No products", "Please add at least one product");
      return;
    }

    router.push({
      pathname: "/(scan-flow)/manual-delivery",
      params: {
        selectedSupplier: JSON.stringify([selectedSupplier]),
        selectedProducts: JSON.stringify(selectedProducts)
      }
    });
  };

  // Render suppliers
  if (entity === "suppliers") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          Add Supplier
        </Text>
        <FlatList
          data={existingSuppliers}
          keyExtractor={s => s.supplierId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedSupplier(item)}
              style={[styles.item, { backgroundColor: theme.colors.cardBackground }]}
            >
              <Text style={{ color: theme.colors.text }}>{item.name}</Text>
            </Pressable>
          )}
          ListFooterComponent={
            selectedSupplier ? (
              <View style={[styles.selectedItem, { backgroundColor: theme.colors.cardBackground }]}>
                <Text style={{ color: theme.colors.text }}>{selectedSupplier.name}</Text>
                <Pressable onPress={() => setSelectedSupplier(null)}>
                  <Text style={{ color: "red" }}>Remove</Text>
                </Pressable>
              </View>
            ) : undefined
          }
        />
        <GradientButton
          text="Add Supplier"
          onPress={onAddSelected}
          disabled={!selectedSupplier}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  // Render products
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="gradient" gradientName="paloma" style={styles.title}>
        Add Products
      </Text>

      <TextInput
        placeholder="Search product..."
        value={productSearch}
        onChangeText={setProductSearch}
        style={[styles.searchInput, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text }]}
      />

      <FlatList
        data={productSuggestions}
        keyExtractor={p => p.productId}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => addProduct(item)}
            style={[styles.item, { backgroundColor: theme.colors.cardBackground }]}
          >
            <Text style={{ color: theme.colors.text }}>{item.name} ({item.volume} L)</Text>
          </Pressable>
        )}
        ListFooterComponent={
          selectedProducts.length > 0 ? (
            <View>
              {selectedProducts.map(p => (
                <View
                  key={p.productId}
                  style={[styles.selectedItem, { backgroundColor: theme.colors.cardBackground }]}
                >
                  <Text style={{ color: theme.colors.text }}>{p.name}</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={p.totalVolume.toString()}
                    onChangeText={val => updateVolume(p.productId, parseFloat(val) || 0)}
                    style={[styles.volumeInput, { borderColor: theme.colors.text, color: theme.colors.text }]}
                  />
                  <Pressable onPress={() => removeProduct(p.productId)}>
                    <Text style={{ color: "red" }}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : undefined
        }
      />

      <GradientButton
        text="Add Products"
        onPress={onAddSelected}
        disabled={selectedProducts.length === 0}
        style={{ marginTop: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16,},
  item: { padding: 12, borderRadius: 8, marginBottom: 8 },
  selectedItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, marginTop: 12 },
  searchInput: { padding: 12, borderRadius: 8, marginBottom: 8 },
  volumeInput: { width: 60, height: 36, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, marginHorizontal: 8 },
});