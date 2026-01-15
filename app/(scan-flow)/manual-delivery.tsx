import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import SearchBar from "@/components/dynamicComponents/SearchBar";
import GradientButton from "@/components/shared/GradientButton";
import { Text as CustomText } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import InfoBox from "@/components/dynamicComponents/InfoBox";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";
import { useAppTheme } from "@/stores/app-theme-context";

import { useProducts } from "@/hooks/useProducts";
import { useSuppliers, useCreateSupplier } from "@/hooks/useSuppliers";

import type { DeliveryOcrResponse } from "@/types/deliveries";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */
type Product = { productId: string; name: string; volume: number; type: string };
type Supplier = { supplierId: string; name: string; email?: string };

type ManualProduct = {
  id: string;
  product: Product;
  units: number;
  totalVolume: number;
};

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */
const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function makeGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ---------------------------------- */
/* Screen                             */
/* ---------------------------------- */
export default function ManualDeliveryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useAppTheme();

  /* Suppliers */
  const { data: suppliersData } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const [supplierQuery, setSupplierQuery] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const supplierSuggestions = useMemo(() => {
    const list: Supplier[] = suppliersData?.value ?? [];
    if (!supplierQuery.trim() || selectedSupplier) return [];
    const q = supplierQuery.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [supplierQuery, suppliersData, selectedSupplier]);

  /* Products */
  const { data: productsData } = useProducts();

  const [productQuery, setProductQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [units, setUnits] = useState<string>("");

  const productSuggestions = useMemo(() => {
    const list: Product[] = productsData?.value ?? [];
    if (!productQuery.trim() || selectedProduct) return [];
    const q = productQuery.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [productQuery, productsData, selectedProduct]);

  const [items, setItems] = useState<ManualProduct[]>([]);

  /* ---------------------------------- */
  /* Add product                        */
  /* ---------------------------------- */
  const onAddProduct = () => {
    if (!selectedProduct)
      return Alert.alert("Missing info", "Please select a product from the list.");

    const qty = Number(units);
    if (!Number.isInteger(qty) || qty <= 0)
      return Alert.alert("Missing info", "Please enter a valid number of units.");

    const packVol = Number(selectedProduct.volume ?? 0);
    const totalVolume = packVol * qty;

    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.product.productId === selectedProduct.productId
      );

      if (existingItemIndex !== -1) {
        const newItems = [...prev];
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
          ...existingItem,
          units: existingItem.units + qty,
          totalVolume: existingItem.totalVolume + totalVolume,
        };
        return newItems;
      }

      return [
        {
          id: `local-${Date.now()}`,
          product: selectedProduct,
          units: qty,
          totalVolume,
        },
        ...prev,
      ];
    });

    setProductQuery("");
    setUnits("");
    setSelectedProduct(null);
  };

  /* ---------------------------------- */
  /* Remove product                     */
  /* ---------------------------------- */
  const onRemoveProduct = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------------------------------- */
  /* Save -> cache to delivery summary  */
  /* ---------------------------------- */
  const onSave = async () => {
    if (!selectedSupplier && !supplierQuery.trim()) {
      return Alert.alert("Missing info", "Please select or type a supplier name.");
    }

    if (items.length === 0) {
      return Alert.alert("Missing info", "Please add at least one product.");
    }

    let supplierToSave = selectedSupplier;

    // Create supplier if typed manually
    if (!supplierToSave) {
      try {
        const result = await createSupplier.mutateAsync({
          name: supplierQuery.trim(),
          email: "n/a@example.com", // required by API (temp)
        });

        supplierToSave = {
          supplierId: result.supplierId,
          name: result.name,
          email: result.email,
        };
      } catch (e: any) {
        return Alert.alert("Error", e?.message || "Failed to create supplier.");
      }
    }

    const deliveryNoteId = makeGuid();
    const deliveryDate = new Date().toISOString();

    // This is what delivery-summary.tsx expects in ["deliveries","latest"]
    const products = items.map((i) => ({
      productId: i.product.productId,
      name: toTitleCase(i.product.name),
      volume: Number(i.product.volume ?? 0), // liters per unit
      type: i.product.type ?? "",
      totalVolume: Number(i.totalVolume ?? 0), // liters total (units * volume)
    }));

    const manualDelivery: DeliveryOcrResponse = {
      deliveryNoteId,
      deliveryDate,
      supplier: {
        supplierId: supplierToSave!.supplierId,
        name: toTitleCase(supplierToSave!.name),
        contactEmail: supplierToSave!.email ?? "n/a@example.com",
      },
      products,
      deliveryNotePictureIds: [],
      deliveryPilePictureId: null,
    };

    /**
     * ✅ MUST match your ListItem fields:
     * - delivery.cans = product volume (L per unit) -> shows in title as X.XXX L
     * - delivery.cases = total volume (L total)
     * - units shown = cases / cans
     */
    const statusMap: Record<
      string,
      {
        id: string;
        name: string;
        status: "received";
        cases: number; // total volume
        cans: number; // product volume
        expectedUnits?: number;
        receivedUnits?: number;
      }
    > = {};

    items.forEach((i, index) => {
      const lineId = `${i.product.productId}-${index}`;
      const productVolume = Number(i.product.volume ?? 0);
      const total = Number(i.totalVolume ?? 0);
      const unitsNumber = Number(i.units ?? 0);

      statusMap[lineId] = {
        id: lineId,
        name: toTitleCase(i.product.name),
        status: "received",
        cases: total,
        cans: productVolume,
        expectedUnits: unitsNumber,
        receivedUnits: unitsNumber,
      };
    });

    queryClient.setQueryData(["deliveries", "latest"], manualDelivery);
    queryClient.setQueryData(["deliveries", "removedIds"], []);
    queryClient.setQueryData(["deliveries", "status"], statusMap);

    router.push("/(scan-flow)/delivery-summary");
  };

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={Platform.OS === "android" ? ["bottom", "top"] : ["bottom"]}
    >
      {Platform.OS === "android" && (
        <AndroidCustomNavigation onBack={router.back} paddingHorizontal={10} />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CustomText
            variant="gradient"
            gradientName="paloma"
            style={styles.title}
          >
            Manual Delivery
          </CustomText>
        </View>

        {/* ---------------- Supplier Section ---------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Supplier
            </CustomText>
            <CustomText
              style={[styles.sectionDescription, { color: theme.colors.text }]}
            >
              Choose which supplier made this delivery from your suppliers list
            </CustomText>
          </View>

          {selectedSupplier ? (
            <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.supplierRow}>
                <CustomText
                  style={[styles.supplierName, { color: theme.colors.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedSupplier.name}
                </CustomText>
                <Pressable
                  onPress={() => {
                    setSelectedSupplier(null);
                    setSupplierQuery("");
                  }}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Remove supplier"
                >
                  <Icon name="delete" size={20} />
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <SearchBar
                placeholder="Search for supplier…"
                value={supplierQuery}
                onChangeText={setSupplierQuery}
                accessibilityLabel="Search for supplier"
              />

              {supplierSuggestions.length > 0 && (
                <View
                  style={[
                    styles.suggestions,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderWidth: 1,
                      borderColor: theme.colors.background,
                    },
                  ]}
                >
                  {supplierSuggestions.map((s) => (
                    <Pressable
                      key={s.supplierId}
                      style={styles.suggestionRow}
                      onPress={() => {
                        setSelectedSupplier(s);
                        setSupplierQuery(s.name);
                      }}
                    >
                      <CustomText style={{ color: theme.colors.text }}>
                        {s.name}
                      </CustomText>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* ---------------- Products Section ---------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Products
            </CustomText>
            <CustomText
              style={[styles.sectionDescription, { color: theme.colors.text }]}
            >
              Add products and their delivered quantities
            </CustomText>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <CustomText style={[styles.inputLabel, { color: theme.colors.text }]}>
                Product Name
              </CustomText>
              <SearchBar
                placeholder="Search product…"
                value={productQuery}
                onChangeText={(value) => {
                  setProductQuery(value);
                  setSelectedProduct(null);
                }}
                accessibilityLabel="Search for product"
              />

              {productSuggestions.length > 0 && !selectedProduct && (
                <View
                  style={[
                    styles.suggestions,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderWidth: 1,
                      borderColor: theme.colors.background,
                    },
                  ]}
                >
                  {productSuggestions.map((p) => (
                    <Pressable
                      key={p.productId}
                      style={styles.suggestionRow}
                      onPress={() => {
                        setProductQuery(p.name);
                        setSelectedProduct(p);
                      }}
                    >
                      <View style={styles.productSuggestion}>
                        <CustomText style={{ color: theme.colors.text }}>
                          {p.name}
                        </CustomText>
                        <CustomText style={{ color: theme.colors.text, opacity: 0.6 }}>
                          {Number(p.volume ?? 0).toFixed(3)}L
                        </CustomText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={[styles.inputLabel, { color: theme.colors.text }]}>
                Units Delivered
              </CustomText>
              <SearchBar
                placeholder="Enter quantity…"
                value={units}
                onChangeText={setUnits}
                accessibilityLabel="Enter number of units"
              />
            </View>

            <GradientButton
              text="Add to List"
              onPress={onAddProduct}
              gradientName="bananaDaiquiri"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>

        {/* ---------------- Products List ---------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Delivery Summary
            </CustomText>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <CustomText style={[styles.emptyText, { color: theme.colors.text }]}>
                  No products added yet
                </CustomText>
                <CustomText style={[styles.emptySubtext, { color: theme.colors.text }]}>
                  Add products above to create your delivery
                </CustomText>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.colors.background },
                    ]}
                  />
                )}
                renderItem={({ item }) => (
                  <View style={styles.productRow}>
                    <View style={styles.productInfo}>
                      <CustomText
                        style={[styles.productName, { color: theme.colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.product.name}
                      </CustomText>
                    </View>

                    <View style={styles.productRightSection}>
                      <InfoBox
                        title={String(item.units)}
                        subtitle="units"
                        style={styles.infoBox}
                      />
                      <Pressable
                        onPress={() => onRemoveProduct(item.id)}
                        style={styles.removeButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.product.name}`}
                      >
                        <Icon name="delete" size={20} />
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>

        {/* ---------------- Actions ---------------- */}
        <View style={styles.actions}>
          <GradientButton text="Save Delivery" onPress={onSave} gradientName="paloma" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* Styles                             */
/* ---------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: Platform.OS === "ios" ? 16 : 8,
  },

  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 8 },

  section: { marginBottom: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  sectionDescription: { fontSize: 14, lineHeight: 20, opacity: 0.7 },

  formCard: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: "500" },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  supplierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  supplierName: { fontSize: 16, flex: 1, marginRight: 12, fontWeight: "500" },

  suggestions: { borderRadius: 12, marginTop: 8, overflow: "hidden" },
  suggestionRow: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  productSuggestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  emptyState: { paddingVertical: 32, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "500" },
  emptySubtext: { fontSize: 14, opacity: 0.6 },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: "500", marginBottom: 2 },

  productRightSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoBox: { margin: 0, paddingVertical: 6, paddingHorizontal: 10, minWidth: 60, maxWidth: 80 },
  removeButton: { padding: 4 },

  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  actions: { paddingTop: 8, paddingBottom: 16 },
});
