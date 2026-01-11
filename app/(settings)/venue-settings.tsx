import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import ConfigSectionCard from "@/components/dynamicComponents/ConfigSectionCard";
import { ConfigRow } from "@/components/dynamicComponents/ConfigRow";
import type { Supplier } from "@/types";
import type { Bar as ApiBar } from "@/types/locations";
import type { Product as ApiProduct } from "@/types/products";
import { useMemo, useState, useCallback } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBars } from "@/hooks/useLocations";
import { useProducts } from "@/hooks/useProducts";
import EditableSectionCard from "@/components/dynamicComponents/EditableSectionCard";

import { getStoredString } from "@/utils/storage";

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

export default function VenueSettings() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [receiverEmail, setReceiverEmailState] = useState<string | null>(null);

  // ✅ Reload receiverEmail whenever this screen is focused
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const v = await getStoredString("receiverEmail");
          if (active) setReceiverEmailState(v);
        } catch {
          if (active) setReceiverEmailState(null);
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  // ✅ local list (empty)
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

  const onEditReceiverEmail = () => {
    router.push({
      pathname: "/(settings)/[entity]/edit-field",
      params: {
        entity: "settings",
        fieldKey: "receiverEmail",
      },
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
          accessibilityRole="header"
          accessibilityLabel="Venue name"
        >
          Hachi bar Settings
        </Text>

        <ConfigSectionCard<StaticBar>
          title="Bars"
          items={staticBars}
          emptyText="No bars have been added yet"
          addLabel="Add Bar"
          onAdd={addStaticBar}
          keyExtractor={(b) => b.barId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="cube-outline"
              onPress={() => openStaticBar(item.barId)}
            />
          )}
        />

        <ConfigSectionCard<ApiBar>
          title="Stock locations within your venue"
          items={apiBars}
          emptyText="No stock locations found"
          addLabel="Add Location"
          onAdd={onAddLocation}
          isLoading={isApiBarsLoading}
          loadingText="Loading stock locations..."
          errorMessage={
            apiBarsError
              ? `Could not load stock locations: ${getErrorMessage(
                  apiBarsError
                )}`
              : null
          }
          onRetry={() => refetchApiBars()}
          isRetrying={isApiBarsRefetching}
          keyExtractor={(b) => b.barId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="cube-outline"
              onPress={() => openApiBar(item.barId)}
            />
          )}
        />

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

        <EditableSectionCard
          title="Venue settings"
          rows={[
            {
              id: "venueName",
              title: "Venue name",
              value: "Hachi bar",
              onEditPress: () => console.log("Edit venue name"),
              editA11yLabel: "Edit venue name",
            },
            {
              id: "openingHours",
              title: "Opening hours",
              value: "17:00  →  02:00",
              onEditPress: () => console.log("Edit opening hours"),
              editA11yLabel: "Edit venue opening hours",
            },
            {
              id: "shotSize",
              title: "Default shot size",
              value: "30 mL",
              onEditPress: () => console.log("Edit shot size"),
              editA11yLabel: "Edit venue shot size",
            },
            {
              id: "receiverEmail",
              title: "Receiver email",
              value: receiverEmail ?? "Not set",
              onEditPress: onEditReceiverEmail,
              editA11yLabel: "Edit receiver email",
            },
            {
              id: "location",
              title: "Location",
              value: "Haarlem\nNorth Holland, Netherlands",
              valueNumberOfLines: 3,
              showEdit: false,
            },
          ]}
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
