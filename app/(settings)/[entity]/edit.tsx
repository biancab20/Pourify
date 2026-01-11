import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { openEditField } from "@/utils/open-edit-field";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import EditableSectionCard from "@/components/dynamicComponents/EditableSectionCard";
import {
  useSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
} from "@/hooks/useSuppliers";
import {
  useProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { useBar, useDeleteBar, useUpdateBar } from "@/hooks/useLocations";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";

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

  const deleteSupplier = useDeleteSupplier();
  const deleteProduct = useDeleteProduct();
  const deleteBar = useDeleteBar();

  const updateSupplier = useUpdateSupplier();
  const updateProduct = useUpdateProduct();
  const updateBar = useUpdateBar();

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
            openEditField(router, {
              title: "Stock location: Name",
              description:
                "This name is shown in your venue stock locations list.",
              label: "Location name",
              fieldType: "text",
              placeholder: "e.g. Main Bar",
              initialValue: item.name ?? "",
              onSave: async (newValue) => {
                await updateBar.mutateAsync({
                  barId: id,
                  data: { name: newValue.trim() },
                });
                // optionally refetch detail query if you want instant refresh:
                // await activeQuery.refetch();
              },
            }),
          editA11yLabel: "Edit location name",
        },
      ];
    }

    if (entity === "suppliers") {
      const currentName = item.name ?? "";
      const currentEmail = (item as any).email ?? "";

      return [
        {
          id: "name",
          title: "Supplier name",
          value: currentName,
          onEditPress: () =>
            openEditField(router, {
              title: "Supplier: Name",
              description:
                "This name is shown in your suppliers list and used to identify deliveries.",
              label: "Supplier name",
              fieldType: "text",
              placeholder: "e.g. Big Drinks BV",
              initialValue: currentName,
              onSave: async (newName) => {
                // ✅ send BOTH fields so backend doesn't wipe the other one
                await updateSupplier.mutateAsync({
                  supplierId: id,
                  data: {
                    name: newName.trim(),
                    email: currentEmail, // keep
                  },
                });
              },
            }),
          editA11yLabel: "Edit supplier name",
        },
        {
          id: "email",
          title: "Email",
          value: currentEmail,
          onEditPress: () =>
            openEditField(router, {
              title: "Supplier: Email",
              description:
                "This email can be used to notify the supplier if items were missing or incorrect.",
              label: "Email",
              fieldType: "email",
              placeholder: "orders@supplier.com",
              initialValue: currentEmail,
              onSave: async (newEmail) => {
                await updateSupplier.mutateAsync({
                  supplierId: id,
                  data: {
                    name: currentName, // keep
                    email: newEmail.trim(),
                  },
                });
              },
            }),
          editA11yLabel: "Edit supplier email",
        },
      ];
    }

    // PRODUCTS
    const currentName = item.name ?? "";
    const currentVolume =
      (item as any).volume === null || (item as any).volume === undefined
        ? ""
        : String((item as any).volume);
    const currentType = (item as any).type ?? "";

    const PRODUCT_TYPE_OPTIONS = [
      { label: "Keg", value: "KEG" },
      { label: "Wine", value: "WINE" },
      { label: "Box", value: "BOX" },
      { label: "Unit", value: "UNIT" },
      { label: "Bottle", value: "BOTTLE" },
    ];

    return [
      {
        id: "name",
        title: "Product name",
        value: currentName,
        onEditPress: () =>
          openEditField(router, {
            title: "Product: Name",
            description:
              "This name is shown in your product list and delivery checks.",
            label: "Product name",
            fieldType: "text",
            placeholder: "e.g. Bacardi Rum",
            initialValue: currentName,
            onSave: async (newName) => {
              await updateProduct.mutateAsync({
                productId: id,
                data: {
                  name: newName.trim(),
                  volume: Number(currentVolume),
                  type: currentType,
                },
              });
            },
          }),
        editA11yLabel: "Edit product name",
      },
      {
        id: "volume",
        title: "Volume (L)",
        value: currentVolume,
        onEditPress: () =>
          openEditField(router, {
            title: "Product: Volume",
            description: "Enter the container volume in liters (e.g. 0.25).",
            label: "Volume (L)",
            fieldType: "number",
            placeholder: "e.g. 0.25",
            initialValue: currentVolume,
            onSave: async (newVolume) => {
              const n = Number(String(newVolume).trim());
              if (!Number.isFinite(n) || n <= 0)
                throw new Error("Invalid volume");

              await updateProduct.mutateAsync({
                productId: id,
                data: {
                  name: currentName,
                  volume: n,
                  type: currentType,
                },
              });
            },
          }),
        editA11yLabel: "Edit product volume",
      },
      {
        id: "type",
        title: "Type",
        value: currentType,
        onEditPress: () =>
          openEditField(router, {
            title: "Product: Type",
            description: "Choose the packaging type for this product.",
            label: "Type",
            fieldType: "select",
            initialValue: currentType,
            options: PRODUCT_TYPE_OPTIONS,
            onSave: async (newType) => {
              await updateProduct.mutateAsync({
                productId: id,
                data: {
                  name: currentName,
                  volume: Number(currentVolume),
                  type: String(newType),
                },
              });
            },
          }),
        editA11yLabel: "Edit product type",
      },
    ];
  }, [entity, item, id, router, updateBar, updateSupplier, updateProduct]);

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
        {Platform.OS === "android" && (
          <AndroidCustomNavigation onBack={router.back} />
        )}

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
