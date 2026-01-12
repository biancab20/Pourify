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

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type Product = {
  productId: string;
  name: string;
  volume: number;
  type: string;
};

type ManualProduct = {
  id: string;
  product: Product;
  bottles: number;
  totalVolume: number;
};

/* ---------------------------------- */
/* MOCK — replace with real hook      */
/* ---------------------------------- */

// Replace this with: useProducts(), store selector, or query
const useProducts = (): Product[] => [
  { productId: "1", name: "Bacardi Rum", volume: 0.7, type: "BOTTLE" },
  { productId: "2", name: "Heineken", volume: 0.33, type: "BOTTLE" },
  { productId: "3", name: "Jack Daniels", volume: 1, type: "BOTTLE" },
];

/* ---------------------------------- */
/* Screen                             */
/* ---------------------------------- */

export default function AddManualDeliveryProductScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const products = useProducts();

  const [query, setQuery] = useState("");
  const [bottles, setBottles] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [items, setItems] = useState<ManualProduct[]>([]);

  /* ---------------------------------- */
  /* Autocomplete filter                */
  /* ---------------------------------- */

  const suggestions = useMemo(() => {
    if (!query) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  /* ---------------------------------- */
  /* Validation                         */
  /* ---------------------------------- */

  const validate = () => {
    if (!selectedProduct)
      return "Please select a product from the list.";

    const qty = Number(bottles);
    if (!Number.isInteger(qty) || qty <= 0)
      return "Please enter a valid number of bottles.";

    return null;
  };

  /* ---------------------------------- */
  /* Add product                        */
  /* ---------------------------------- */

  const onAdd = () => {
    const error = validate();
    if (error) {
      Alert.alert("Missing info", error);
      return;
    }

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

    setQuery("");
    setBottles("");
    setSelectedProduct(null);
  };

  /* ---------------------------------- */
  /* Save                               */
  /* ---------------------------------- */

  const onSave = () => {
    if (items.length === 0) {
      Alert.alert("Missing info", "Please add at least one product.");
      return;
    }

    /**
     * Payload example:
     * items.map(i => ({
     *   productId: i.product.productId,
     *   bottles: i.bottles,
     *   totalVolume: i.totalVolume
     * }))
     */

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
          Add products manually
        </CustomText>

        <CustomText style={[styles.subtitle, { color: theme.colors.text }]}>
          Type the product name and enter the amount of bottles.
        </CustomText>

        {/* ---------------- Form ---------------- */}

        <View style={styles.formCard}>
          {/* Product name */}
          <View style={styles.field}>
            <CustomText style={[styles.label, { color: theme.colors.text }]}>
              Product
            </CustomText>

            <FormInput
              value={query}
              onChange={(v) => {
                setQuery(String(v));
                setSelectedProduct(null);
              }}
              placeholder="Start typing product name…"
            />

            {suggestions.length > 0 && !selectedProduct && (
              <View
                style={[
                  styles.suggestions,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                {suggestions.slice(0, 5).map((p) => (
                  <Pressable
                    key={p.productId}
                    style={styles.suggestionRow}
                    onPress={() => {
                      setQuery(p.name);
                      setSelectedProduct(p);
                    }}
                  >
                    <CustomText>{p.name}</CustomText>
                    <CustomText style={{ opacity: 0.6 }}>
                      {p.volume} L
                    </CustomText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Bottles */}
          <View style={styles.field}>
            <CustomText style={[styles.label, { color: theme.colors.text }]}>
              Bottles
            </CustomText>

            <FormInput
              value={bottles}
              onChange={(v) => setBottles(String(v))}
              placeholder="e.g. 6"
              type="number"
              min={1}
            />
          </View>

          {/* Calculated volume */}
          {selectedProduct && bottles && (
            <CustomText style={{ opacity: 0.7 }}>
              Total volume:{" "}
              {Number(bottles) * selectedProduct.volume} L
            </CustomText>
          )}

          <GradientButton
            text="Add product"
            onPress={onAdd}
            gradientName="bananaDaiquiri"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* ---------------- List ---------------- */}

        <ConfigSectionCard<ManualProduct>
          title={`Added products (${items.length})`}
          items={items}
          emptyText="No products added yet"
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.product.name}
              leftIconName="cube-outline"
              rightLabel={`${item.bottles} × ${item.product.volume} L = ${item.totalVolume} L`} />
          )} addLabel={""} onAdd={function (): void {
            throw new Error("Function not implemented.");
          } }        />

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
