import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";

import EditableSectionCard from "@/components/ui/EditableSectionCard";

import { useSupplier, useDeleteSupplier } from "@/hooks/useSuppliers";
import { useProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useBar, useDeleteBar } from "@/hooks/useLocations";

type EntityKey = "products" | "suppliers" | "locations";

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "object" && err && "message" in err)
    return String((err as any).message);
  return "Unknown error";
}

export default function EditEntityScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const params = useLocalSearchParams<{
    entity?: string;
    id?: string;
    venueName?: string;
  }>();

  const entity = (params.entity ?? "products") as EntityKey;
  const id = params.id ?? "";

  // ✅ Detail queries (only run when needed)
  const supplierQuery = useSupplier(entity === "suppliers" ? id : "");
  const productQuery = useProduct(entity === "products" ? id : "");
  const barQuery = useBar(entity === "locations" ? id : "");

  const activeQuery =
    entity === "suppliers"
      ? supplierQuery
      : entity === "products"
      ? productQuery
      : barQuery;

  const item = activeQuery.data ?? null;
  const isLoading = activeQuery.isLoading;
  const isRefetching = activeQuery.isRefetching;
  const error = activeQuery.error;
  const refetch = activeQuery.refetch;

  // ✅ Delete mutations
  const deleteSupplier = useDeleteSupplier();
  const deleteProduct = useDeleteProduct();
  const deleteBar = useDeleteBar();

  const isDeleting =
    deleteSupplier.isPending || deleteProduct.isPending || deleteBar.isPending;

  const prettyEntity =
    entity === "suppliers"
      ? "supplier"
      : entity === "products"
      ? "product"
      : "stock location";

  const onConfirmDelete = async () => {
    if (!id) return;

    try {
      if (entity === "suppliers") {
        await deleteSupplier.mutateAsync(id);
      } else if (entity === "products") {
        await deleteProduct.mutateAsync(id);
      } else {
        await deleteBar.mutateAsync(id);
      }

      Alert.alert("Deleted", `The ${prettyEntity} was deleted successfully.`);
      router.back();
    } catch (e: any) {
      Alert.alert("Delete failed", e?.message ?? "Unknown error");
    }
  };

  const onDeletePress = () => {
    if (!id) return;

    Alert.alert(
      `Delete this ${prettyEntity}?`,
      "This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isDeleting ? "Deleting..." : "Delete",
          style: "destructive",
          onPress: onConfirmDelete,
        },
      ],
      { cancelable: true }
    );
  };

  // ---- UI labels + values ----
  const pageTitle = useMemo(() => {
    if (!item) return "Settings";
    return (
      item.name ??
      (entity === "suppliers"
        ? "Supplier"
        : entity === "products"
        ? "Product"
        : "Location")
    );
  }, [entity, item]);

  const sectionTitle = useMemo(() => {
    if (entity === "suppliers") return "Supplier settings";
    if (entity === "products") return "Product settings";
    return "Stock location settings";
  }, [entity]);

  const rows = useMemo(() => {
    if (!item) return [];

    if (entity === "locations") {
      return [
        {
          id: "name",
          title: "Location name",
          value: item.name ?? "",
          onEditPress: () =>
            router.push({
              pathname: "/(settings)/[entity]/edit-field",
              params: {
                entity,
                id,
                fieldKey: "name",
                value: item.name ?? "",
              },
            }),
          editA11yLabel: "Edit location name",
        },
      ];
    }

    if (entity === "suppliers") {
      return [
        {
          id: "name",
          title: "Supplier name",
          value: item.name ?? "",
          onEditPress: () =>
            router.push({
              pathname: "/(settings)/[entity]/edit-field",
              params: {
                entity,
                id,
                fieldKey: "name",
                value: item.name ?? "",
              },
            }),
          editA11yLabel: "Edit supplier name",
        },
        {
          id: "email",
          title: "Email",
          value: (item as any).email ?? "",
          onEditPress: () =>
            router.push({
              pathname: "/(settings)/[entity]/edit-field",
              params: {
                entity,
                id,
                fieldKey: "email",
                value: (item as any).email ?? "",
              },
            }),
          editA11yLabel: "Edit supplier email",
        },
      ];
    }

    const typeValue = (item as any).type ?? "";
    const volumeValue =
      (item as any).volume === null || (item as any).volume === undefined
        ? ""
        : String((item as any).volume);

    return [
      {
        id: "name",
        title: "Product name",
        value: item.name ?? "",
        onEditPress: () =>
          router.push({
            pathname: "/(settings)/[entity]/edit-field",
            params: {
              entity,
              id,
              fieldKey: "name",
              value: item.name ?? "",
            },
          }),
        editA11yLabel: "Edit product name",
      },
      {
        id: "volume",
        title: "Volume (L)",
        value: volumeValue,
        onEditPress: () =>
          router.push({
            pathname: "/(settings)/[entity]/edit-field",
            params: {
              entity,
              id,
              fieldKey: "volume",
              value:
                (item as any).volume === null ||
                (item as any).volume === undefined
                  ? ""
                  : String((item as any).volume),
            },
          }),
        editA11yLabel: "Edit product volume",
      },
      {
        id: "type",
        title: "Type",
        value: typeValue,
        onEditPress: () =>
          router.push({
            pathname: "/(settings)/[entity]/edit-field",
            params: {
              entity,
              id,
              fieldKey: "type",
              value: (item as any).type ?? "",
            },
          }),
        editA11yLabel: "Edit product type",
      },
    ];
  }, [entity, item, id, router]);

  const renderCenteredState = (title: string, subtitle?: string) => (
    <View style={styles.centerContainer}>
      <Text style={{ textAlign: "center" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 8, textAlign: "center" }}>{subtitle}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          {pageTitle}
        </Text>

        {error ? (
          <View style={styles.centerContainer}>
            <Text style={{ textAlign: "center" }}>
              Could not load {entity}: {getErrorMessage(error)}
            </Text>

            <Pressable
              onPress={() => refetch()}
              style={{
                marginTop: 14,
                padding: 12,
                minWidth: 120,
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              {isRefetching ? (
                <ActivityIndicator color={theme.colors.icon} />
              ) : (
                <Text style={{ textDecorationLine: "underline" }}>Retry</Text>
              )}
            </Pressable>
          </View>
        ) : isLoading ? (
          renderCenteredState(`Loading ${entity}...`)
        ) : !id ? (
          renderCenteredState(
            "Missing id",
            "No entity id was provided in the route params."
          )
        ) : !item ? (
          renderCenteredState(
            "Not found",
            `We couldn't find this ${entity.slice(0, -1)}.`
          )
        ) : (
          <View style={{ gap: 14 }}>
            <EditableSectionCard title={sectionTitle} rows={rows} />

            <Pressable
              onPress={onDeletePress}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel={`Delete this ${prettyEntity}`}
              style={styles.deletePressable}
            >
              {isDeleting ? (
                <ActivityIndicator color={theme.colors.icon} />
              ) : (
                <Text
                  variant="gradient"
                  gradientName="paloma"
                  style={styles.deleteText}
                >
                  Delete this {prettyEntity}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 40, fontWeight: "700", marginBottom: 10 },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  deletePressable: {
    alignSelf: "center",
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
