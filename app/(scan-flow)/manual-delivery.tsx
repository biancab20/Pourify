import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import ConfigSectionCard from "@/components/ui/ConfigSectionCard";
import { ConfigRow } from "@/components/ui/ConfigRow";
import type { Supplier } from "@/types";
import type { Bar as ApiBar } from "@/types/locations";
import type { Product as ApiProduct } from "@/types/products";
import { useMemo, useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBars } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import EditableSectionCard from "@/components/ui/EditableSectionCard";

/** ✅ Local-only bars (old naming mistake) */
type StaticBar = {
  barId: string;
  name: string;
};

function getErrorMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as any).message);
  }
  return "Unknown error";
}

export default function ManualDelivery() {
  const router = useRouter();
  const { theme } = useAppTheme();

  // ✅  local list (empty)
  const [staticBars, setStaticBars] = useState<StaticBar[]>([]);

  // ✅ API bars (real stock locations)
  const {
    data: apiBarsData,
    isLoading: isApiBarsLoading,
    error: apiBarsError,
    refetch: refetchApiBars,
    isRefetching: isApiBarsRefetching,
  } = useBars();

  const apiBars = useMemo(() => apiBarsData?.value ?? [], [apiBarsData?.value]);

  // ✅ Products API
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
    isRefetching: isProductsRefetching,
  } = useProducts();

  const products = useMemo(
    () => productsData?.value ?? [],
    [productsData?.value]
  );

  // ✅ Suppliers API
  const {
    data: suppliersData,
    isLoading: isSuppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers,
    isRefetching: isSuppliersRefetching,
  } = useSuppliers();

  const suppliers = useMemo(
    () => suppliersData?.value ?? [],
    [suppliersData?.value]
  );

  const addStaticBar = () => {
    setStaticBars((prev) => [
      ...prev,
      { barId: `static-${Date.now()}`, name: "New static bar" },
    ]);
  };

  const onAddSupplier = () => {
    router.push({
      pathname: "/(settings)/[entity]/add",
      params: { entity: "suppliers", venueName: "Hachi bar" },
    });
  };

  const onAddLocation = () => {
    router.push({
      pathname: "/(settings)/[entity]/add",
      params: { entity: "locations", venueName: "Hachi bar" },
    });
  };

  const onAddProduct = () => {
    router.push({
      pathname: "/(settings)/[entity]/add",
      params: { entity: "products", venueName: "Hachi bar" },
    });
  };

  const openStaticBar = (barId: string) => {
    Alert.alert("Open static bar", `Static bar ID: ${barId}`);
  };

  const openSupplier = (supplierId: string) => {
    router.push({
      pathname: "/(settings)/[entity]/edit",
      params: { entity: "suppliers", id: supplierId, venueName: "Hachi bar" },
    });
  };

  const openProduct = (productId: string) => {
    router.push({
      pathname: "/(settings)/[entity]/edit",
      params: { entity: "products", id: productId, venueName: "Hachi bar" },
    });
  };

  const openApiBar = (barId: string) => {
    router.push({
      pathname: "/(settings)/[entity]/edit",
      params: { entity: "locations", id: barId, venueName: "Hachi bar" },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Icon name="exit" size={32} color={theme.colors.icon} />
        </Pressable>
      </View>

      <ScrollView>
        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
        >
          Manual Delivery
        </Text>

        {/* 4) Suppliers */}
        <ConfigSectionCard<Supplier>
          title="Suppliers"
          items={suppliers}
          emptyText="No suppliers have been added yet"
          addLabel="Add Supplier"
          onAdd={onAddSupplier}
          isLoading={isSuppliersLoading}
          loadingText="Loading suppliers..."
          errorMessage={
            suppliersError
              ? `Error loading suppliers: ${getErrorMessage(suppliersError)}`
              : null
          }
          onRetry={() => refetchSuppliers()}
          isRetrying={isSuppliersRefetching}
          keyExtractor={(s) => s.supplierId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="people-outline"
              onPress={() => openSupplier(item.supplierId)}
            />
          )}
        />


        {/* 3) Products (API) */}
        <ConfigSectionCard<ApiProduct>
          title="Products"
          items={products}
          emptyText="No products found"
          addLabel="Add Product"
          onAdd={onAddProduct}
          isLoading={isProductsLoading}
          loadingText="Loading products..."
          errorMessage={
            productsError
              ? `Could not load products: ${getErrorMessage(productsError)}`
              : null
          }
          onRetry={() => refetchProducts()}
          isRetrying={isProductsRefetching}
          keyExtractor={(p) => p.productId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="wine-outline"
              rightLabel={`${item.volume} mL • ${item.type}`}
              onPress={() => openProduct(item.productId)}
            />
          )}
        />

        

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    height: 56,
    gap: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: "600",
    marginBottom: 16,
  },
});
