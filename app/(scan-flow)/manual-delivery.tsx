import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfigSectionCard from "@/components/dynamic/ConfigSectionCard";
import { ConfigRow } from "@/components/dynamic/ConfigRow";
import { useState, useEffect } from "react";
import GradientButton from "@/components/shared/GradientButton";

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

export default function ManualDelivery() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedSupplier?: string;
    selectedProducts?: string;
  }>();
  const { theme } = useAppTheme();

  // Local state for delivery
  const [supplier, setSupplier] = useState<LocalDeliverySupplier | null>(null);
  const [products, setProducts] = useState<LocalDeliveryProduct[]>([]);

  // Handle params when they come in (e.g., from returning from modal)
  useEffect(() => {
    if (params.selectedSupplier) {
      try {
        const supplierData = JSON.parse(params.selectedSupplier as string);
        setSupplier(supplierData[0]); // Get first item from array
      } catch (error) {
        console.error("Failed to parse selected supplier:", error);
      }
    }

    if (params.selectedProducts) {
      try {
        const productsData = JSON.parse(params.selectedProducts as string);
        // Add new products, avoiding duplicates
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.productId));
          const newProducts = productsData.filter(
            (p: any) => !existingIds.has(p.productId)
          );
          return [...prev, ...newProducts];
        });
      } catch (error) {
        console.error("Failed to parse selected products:", error);
      }
    }
  }, [params.selectedSupplier, params.selectedProducts]);

  // Navigate to add supplier screen
  const navigateToAddSupplier = () => {
    router.push({
      pathname: "/(scan-flow)/add-delivery-item",
      params: {
        entity: "suppliers",
        context: "manual-delivery",
        existingSupplierIds: supplier
          ? JSON.stringify([supplier.supplierId])
          : JSON.stringify([]),
      },
    });
  };

  // Navigate to add product screen
  const navigateToAddProduct = () => {
    if (!supplier) {
      Alert.alert(
        "Add supplier first",
        "Please select a supplier before adding products."
      );
      return;
    }

    router.push({
      pathname: "/(scan-flow)/add-delivery-item",
      params: {
        entity: "products",
        context: "manual-delivery",
        existingProductIds: JSON.stringify(products.map((p) => p.productId)),
      },
    });
  };

  // Remove supplier
  const removeSupplier = () => {
    if (!supplier) return;

    Alert.alert(
      "Remove Supplier",
      `Are you sure you want to remove ${supplier?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSupplier(null);
            setProducts([]); // Remove products when supplier is removed
          },
        },
      ]
    );
  };

  // Remove product
  const removeProduct = (productId: string, productName: string) => {
    Alert.alert(
      "Remove Product",
      `Are you sure you want to remove ${productName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setProducts((prev) =>
              prev.filter((p) => p.productId !== productId)
            );
          },
        },
      ]
    );
  };

  // Update product quantity
  const updateProductQuantity = (productId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, totalVolume: Math.max(1, quantity) }
          : p
      )
    );
  };

  const onProceed = () => {
    if (!supplier) {
      Alert.alert("Missing supplier", "Please add a supplier first");
      return;
    }

    if (products.length === 0) {
      Alert.alert("Missing products", "Please add at least one product");
      return;
    }

    // Prepare manual delivery data in OCR response format
    const manualDeliveryData = {
      deliveryNoteId: `manual-${Date.now()}`,
      deliveryDate: new Date().toISOString(),
      supplier: {
        supplierId: supplier.supplierId,
        name: supplier.name,
        contactEmail: supplier.contactEmail,
      },
      products: products.map((p) => ({
        productId: p.productId,
        name: p.name,
        volume: p.volume,
        type: p.type,
        totalVolume: p.totalVolume || p.volume,
        isDeleted: false,
      })),
      deliveryNotePictureIds: [],
      deliveryPilePictureId: null,
      sourceType: "manual",
    };

    // Navigate to CheckSupplier screen with manual data
    router.push({
      pathname: "/(scan-flow)/check-supplier",
      params: {
        ocrData: JSON.stringify(manualDeliveryData),
        sourceType: "manual",
      },
    });
  };

  const canProceed = supplier && products.length > 0;

  // Calculate total volume

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>Close</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          Manual Delivery
        </Text>

        {/* Supplier section */}
        <ConfigSectionCard<LocalDeliverySupplier>
          title="Supplier"
          items={supplier ? [supplier] : []}
          emptyText="No supplier added"
          addLabel="Add Supplier"
          onAdd={navigateToAddSupplier}
          keyExtractor={(s) => s.supplierId}
          renderItem={({ item }) => (
            <View style={styles.supplierRow}>
              <ConfigRow
                title={item.name}
                leftIconName="people-outline"
                rightLabel={item.contactEmail}
                onPress={() =>
                  Alert.alert(
                    "Supplier Info",
                    `${item.name}\n${item.contactEmail || "No email"}`
                  )
                }
              />
              <Pressable onPress={removeSupplier} style={styles.removeButton}>
                <Text style={{ color: theme.colors.text }}>Remove</Text>
              </Pressable>
            </View>
          )}
        />

        {/* Products section */}
        <ConfigSectionCard<LocalDeliveryProduct>
          title={`Products (${products.length})`}
          items={products}
          emptyText="No products added"
          addLabel="Add Product"
          onAdd={navigateToAddProduct}
          keyExtractor={(p) => p.productId}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <View style={styles.productInfo}>
                <ConfigRow
                  title={item.name}
                  leftIconName="wine-outline"
                  rightLabel={`${item.type}`}
                  onPress={() =>
                    Alert.alert(
                      "Product Info",
                      `${item.name}\n${item.type}\n${item.volume}L per unit`
                    )
                  }
                />
                <View style={styles.productDetails}>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    Unit: {item.volume}L
                  </Text>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    Total: {item.totalVolume}L
                  </Text>
                </View>
              </View>

              <View style={styles.quantitySection}>
                <View style={styles.quantityRow}>
                  <View style={styles.quantityControls}>
                    <Pressable
                      onPress={() =>
                        updateProductQuantity(
                          item.productId,
                          item.totalVolume - 1
                        )
                      }
                      style={[
                        styles.quantityButton,
                        { backgroundColor: theme.colors.cardBackground },
                      ]}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme.colors.text },
                        ]}
                      >
                        -
                      </Text>
                    </Pressable>
                    <View style={styles.quantityDisplay}>
                      <Text
                        style={[
                          styles.quantityValue,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.totalVolume}
                      </Text>
                      <Text
                        style={[
                          styles.quantityUnit,
                          { color: theme.colors.text },
                        ]}
                      >
                        L
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        updateProductQuantity(
                          item.productId,
                          item.totalVolume + 1
                        )
                      }
                      style={[
                        styles.quantityButton,
                        { backgroundColor: theme.colors.cardBackground },
                      ]}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme.colors.text },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => removeProduct(item.productId, item.name)}
                    style={styles.removeButton}
                  >
                    <Text style={{ color: theme.colors.text }}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />

        {/* Proceed button */}
        <View style={styles.buttonContainer}>
          <GradientButton
            text={
              canProceed
                ? `Review Delivery (${products.length} items)`
                : "Add Items to Proceed"
            }
            onPress={onProceed}
            disabled={!canProceed}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "left",
  },
  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  productInfo: {
    flex: 1,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 40,
    paddingRight: 16,
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    opacity: 0.7,
  },
  quantitySection: {
    marginTop: 8,
    paddingLeft: 40,
    paddingRight: 16,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    minWidth: 60,
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  quantityUnit: {
    fontSize: 12,
    marginLeft: 2,
    opacity: 0.7,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginHorizontal: 8,
  },
});
