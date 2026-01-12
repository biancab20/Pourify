import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import FormInput from "@/components/dynamicComponents/FormInput";
import GradientButton from "@/components/shared/GradientButton";
import { Text as CustomText } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import ConfigSectionCard from "@/components/dynamicComponents/ConfigSectionCard";
import { ConfigRow } from "@/components/dynamicComponents/ConfigRow";
import { useAppTheme } from "@/stores/app-theme-context";

import { useProducts } from "@/hooks/useProducts";
import { useSuppliers, useCreateSupplier } from "@/hooks/useSuppliers";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */
type Product = {
  productId: string;
  name: string;
  volume: number;
  type: string;
};

type Supplier = {
  supplierId: string;
  name: string;
  email?: string;
};

type ManualProduct = {
  id: string;
  product: Product;
  bottles: number;
  totalVolume: number;
};

/* ---------------------------------- */
/* Screen                             */
/* ---------------------------------- */
export default function ManualDeliveryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  /* ---------------------------------- */
  /* Suppliers                          */
  /* ---------------------------------- */
  const { data: suppliersData } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const [supplierQuery, setSupplierQuery] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const supplierSuggestions = useMemo(() => {
    const list: Supplier[] = suppliersData?.value ?? [];
    if (!supplierQuery) return [];
    return list.filter((s) =>
      s.name.toLowerCase().includes(supplierQuery.toLowerCase())
    );
  }, [supplierQuery, suppliersData]);

  /* ---------------------------------- */
  /* Products                            */
  /* ---------------------------------- */
  const { data: productsData } = useProducts();

  const [productQuery, setProductQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );
  const [bottles, setBottles] = useState<string>("");

  const productSuggestions = useMemo(() => {
    const list: Product[] = productsData?.value ?? [];
    if (!productQuery) return [];
    return list.filter((p) =>
      p.name.toLowerCase().includes(productQuery.toLowerCase())
    );
  }, [productQuery, productsData]);

  const [items, setItems] = useState<ManualProduct[]>([]);

  /* ---------------------------------- */
  /* Validation                         */
  /* ---------------------------------- */
  const validateSupplier = () => {
    if (!selectedSupplier && !supplierQuery.trim()) {
      return "Please select or type a supplier name.";
    }
    return null;
  };

  const validateProduct = () => {
    if (!selectedProduct) return "Please select a product from the list.";
    const qty = Number(bottles);
    if (!Number.isInteger(qty) || qty <= 0)
      return "Please enter a valid number of bottles.";
    return null;
  };

  /* ---------------------------------- */
  /* Add product                        */
  /* ---------------------------------- */
  const onAddProduct = () => {
    const error = validateProduct();
    if (error) return Alert.alert("Missing info", error);

    const qty = Number(bottles);
    const totalVolume = selectedProduct!.volume * qty;

    setItems((prev) => [
      {
        id: `local-${Date.now()}`,
        product: selectedProduct!,
        bottles: qty,
        totalVolume,
      },
      ...prev,
    ]);

    setProductQuery("");
    setBottles("");
    setSelectedProduct(null);
  };

  /* ---------------------------------- */
  /* Save                               */
  /* ---------------------------------- */
  const onSave = async () => {
    const supplierError = validateSupplier();
    if (supplierError) return Alert.alert("Missing info", supplierError);
    if (items.length === 0)
      return Alert.alert("Missing info", "Please add at least one product.");

    let supplierToSave = selectedSupplier;

    if (!supplierToSave) {
      try {
        const result = await createSupplier.mutateAsync({
          name: supplierQuery,
          email: "n/a@example.com", // TEMP: Provide required email
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

    const payload = items.map((i) => ({
      productId: i.product.productId,
      bottles: i.bottles,
      totalVolume: i.totalVolume,
    }));

    console.log("Supplier:", supplierToSave);
    console.log("Products:", payload);

    router.back();
  };

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <CustomText variant="gradient" gradientName="paloma" style={styles.title}>
          Manual Delivery
        </CustomText>

        <CustomText style={[styles.subtitle, { color: theme.colors.text }]}>
          Select a supplier and add products with bottle counts.
        </CustomText>

        {/* ---------------- Supplier ---------------- */}
        <View style={styles.formCard}>
          <CustomText style={[styles.label, { color: theme.colors.text }]}>
            Supplier
          </CustomText>

          {selectedSupplier ? (
            <Pressable
              style={[styles.selectPill, { backgroundColor: theme.colors.background }]}
              onPress={() => setSelectedSupplier(null)}
            >
              <CustomText>{selectedSupplier.name}</CustomText>
              <Icon name="exit" size={18} color={theme.colors.icon} />
            </Pressable>
          ) : (
            <>
              <FormInput
                placeholder="Type supplier name…"
                value={supplierQuery}
                onChange={(v: string | number) =>
                  setSupplierQuery(String(v))
                }
              />

              {supplierSuggestions.length > 0 && (
                <View style={[styles.suggestions, { backgroundColor: theme.colors.background }]}>
                  {supplierSuggestions.slice(0, 5).map((s) => (
                    <Pressable
                      key={s.supplierId}
                      style={styles.suggestionRow}
                      onPress={() => {
                        setSupplierQuery(s.name);
                        setSelectedSupplier(s);
                      }}
                    >
                      <CustomText>{s.name}</CustomText>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* ---------------- Product ---------------- */}
        <View style={styles.formCard}>
          <CustomText style={[styles.label, { color: theme.colors.text }]}>
            Product
          </CustomText>
          <FormInput
            placeholder="Type product name…"
            value={productQuery}
            onChange={(v: string | number) => {
              setProductQuery(String(v));
              setSelectedProduct(null);
            }}
          />

          {productSuggestions.length > 0 && !selectedProduct && (
            <View style={[styles.suggestions, { backgroundColor: theme.colors.background }]}>
              {productSuggestions.slice(0, 5).map((p) => (
                <Pressable
                  key={p.productId}
                  style={styles.suggestionRow}
                  onPress={() => {
                    setProductQuery(p.name);
                    setSelectedProduct(p);
                  }}
                >
                  <CustomText>{p.name}</CustomText>
                  <CustomText style={{ opacity: 0.6 }}>{p.volume} L</CustomText>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.field}>
            <CustomText style={[styles.label, { color: theme.colors.text }]}>
              Bottles
            </CustomText>
            <FormInput
              value={bottles}
              onChange={(v: string | number) => setBottles(String(v))}
              placeholder="e.g. 6"
              type="number"
              min={1}
            />
          </View>

          {selectedProduct && bottles && (
            <CustomText style={{ opacity: 0.7 }}>
              Total volume: {Number(bottles) * selectedProduct.volume} L
            </CustomText>
          )}

          <GradientButton
            text="Add Product"
            onPress={onAddProduct}
            gradientName="bananaDaiquiri"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* ---------------- Product List ---------------- */}
        <ConfigSectionCard<ManualProduct>
          title={`Added products (${items.length})`}
          items={items}
          emptyText="No products added yet"
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.product.name}
              leftIconName="cube-outline"
              rightLabel={`${item.bottles} × ${item.product.volume} L = ${item.totalVolume} L`}
            />
          )}
          addLabel="Add product"
          onAdd={onAddProduct}
        />

        <GradientButton
          text="Save"
          onPress={onSave}
          gradientName="paloma"
          style={{ marginTop: 18 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* Styles                             */
/* ---------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  title: { fontSize: 40, fontWeight: "700", marginTop: 8 },
  subtitle: { marginTop: 12, fontSize: 16, marginBottom: 16 },

  formCard: { gap: 14, paddingBottom: 20 },
  field: { gap: 8 },
  label: { fontSize: 13 },

  selectPill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  suggestions: {
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },
  suggestionRow: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
