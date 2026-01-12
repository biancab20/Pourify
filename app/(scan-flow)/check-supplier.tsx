import { View, StyleSheet, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import type { DeliveryOcrResponse } from "@/types/deliveries";
import EditableSectionCard from "@/components/dynamicComponents/EditableSectionCard";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";
import { openEditField } from "@/utils/open-edit-field";
import { useSuppliers, useCreateSupplier } from "@/hooks/useSuppliers";

function confirmYesNo(
  title: string,
  message: string,
  yesText = "Yes",
  noText = "No"
) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { text: noText, style: "cancel", onPress: () => resolve(false) },
      { text: yesText, onPress: () => resolve(true) },
    ]);
  });
}

function normalizeName(s: string) {
  return s.trim().toLowerCase();
}
function findSupplierIdByName(suppliers: any[], name: string): string | null {
  const n = normalizeName(name);
  const match = suppliers.find((s) => normalizeName(s.name) === n);
  return match?.supplierId ?? null;
}

export default function CheckSupplier() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const queryClient = useQueryClient();

  const parsedOcrData = useMemo<DeliveryOcrResponse | null>(() => {
    if (typeof params.ocrData !== "string") return null;
    try {
      return JSON.parse(params.ocrData);
    } catch {
      return null;
    }
  }, [params.ocrData]);

  // ✅ Create a local draft you can edit
  const [draft, setDraft] = useState<DeliveryOcrResponse | null>(parsedOcrData);

  useEffect(() => {
    setDraft(parsedOcrData);
  }, [parsedOcrData]);

  // ✅ Suppliers list for validation
  const suppliersQuery = useSuppliers();
  const suppliers = useMemo(
    () => suppliersQuery.data?.value ?? [],
    [suppliersQuery.data]
  );

  // ✅ Mutations (only needed for the “add supplier” flow)
  const createSupplier = useCreateSupplier();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date found";
    try {
      if (dateString.includes("/")) return dateString;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const onEditSupplier = useCallback(() => {
    if (!draft) return;

    openEditField(router, {
      title: "Delivery: Supplier",
      description:
        "Confirm who delivered this order. This is used for reporting delivery issues.",
      label: "Supplier name",
      fieldType: "text",
      placeholder: "e.g. Big Drinks BV",
      initialValue: draft.supplier?.name ?? "",
      onSave: async (newNameRaw) => {
        const name = newNameRaw.trim();
        if (!name) throw new Error("Please enter a supplier name.");

        if (!suppliersQuery.data && !suppliersQuery.isLoading) {
          await suppliersQuery.refetch();
        }

        const exists = suppliers.some(
          (s: any) => normalizeName(s.name) === normalizeName(name)
        );

        setDraft((prev) =>
          prev
            ? {
                ...prev,
                supplier: {
                  ...prev.supplier,
                  name,
                },
              }
            : prev
        );

        if (exists) return;

        const shouldAdd = await confirmYesNo(
          "Supplier not found",
          `“${name}” is not in your supplier list. Would you like to add it now?`,
          "Add",
          "No"
        );

        if (!shouldAdd) return;

        const email = String(draft?.supplier?.contactEmail ?? "").trim();

        await createSupplier.mutateAsync({
          name,
          email,
        });
      },
    });
  }, [draft, router, suppliers, suppliersQuery, createSupplier]);

  const onEditDate = useCallback(() => {
    if (!draft) return;

    openEditField(router, {
      title: "Delivery: Date",
      description: "Confirm the delivery date shown on the delivery note.",
      label: "Date",
      fieldType: "text",
      placeholder: "YYYY-MM-DD or DD/MM/YYYY",
      initialValue: formatDate(draft.deliveryDate),
      onSave: async (newDate) => {
        const v = newDate.trim();
        if (!v) throw new Error("Please enter a date.");

        setDraft((prev) => (prev ? { ...prev, deliveryDate: v } : prev));
      },
    });
  }, [draft, router]);

  const infoRows = useMemo(
    () => [
      {
        id: "supplier",
        title: "Supplier",
        value: draft?.supplier?.name || "Supplier not detected",
        valueNumberOfLines: 1,
        onEditPress: onEditSupplier,
        showEdit: true,
        editA11yLabel: "Edit supplier",
      },
      {
        id: "date",
        title: "Date",
        value: formatDate(draft?.deliveryDate),
        valueNumberOfLines: 1,
        onEditPress: onEditDate,
        showEdit: true,
        editA11yLabel: "Edit date",
      },
    ],
    [draft, onEditSupplier, onEditDate]
  );

  const ensureSupplierExists = async (): Promise<void> => {
    if (!draft?.supplier?.name) return;

    const name = draft.supplier.name.trim();
    if (!name) return;

    // Ensure suppliers list loaded
    if (!suppliersQuery.data && !suppliersQuery.isLoading) {
      await suppliersQuery.refetch();
    }
    console.log(
      "🧾 Suppliers from API:",
      suppliersQuery.data?.value ?? suppliers
    );
    console.log("🧾 OCR supplier name:", name);
    // Try resolve ID from current list
    let supplierId = findSupplierIdByName(
      suppliersQuery.data?.value ?? suppliers,
      name
    );
console.log("🔍 Resolved supplierId BEFORE create:", supplierId);
    // If not found, ask user to add new supplier
    if (!supplierId) {
      const shouldAdd = await confirmYesNo(
        "Supplier not found",
        `“${name}” is not in your supplier list. Would you like to add it now?`,
        "Add",
        "No"
      );

      if (!shouldAdd) return;

      const email = String(draft?.supplier?.contactEmail ?? "").trim();

      await createSupplier.mutateAsync({ name, email });
console.log("➕ Supplier created, refetching suppliers...");
      // refresh list and resolve again
      const refreshed = await suppliersQuery.refetch();
      supplierId = findSupplierIdByName(refreshed.data?.value ?? [], name);
      console.log("🧾 Suppliers AFTER create:", refreshed.data?.value ?? []);
console.log(
  "🔍 Resolved supplierId AFTER create:",
  findSupplierIdByName(refreshed.data?.value ?? [], name)
);
    }

    // If still no supplierId, stop
    if (!supplierId) {
      throw new Error(
        "Could not resolve supplier id after adding. Please try again."
      );
    }

    // Remember the resolved supplierId:
    // - update local draft + cache so next screens can use it
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            supplier: {
              ...prev.supplier,
              supplierId,
            },
          }
        : prev
    );
console.log("💾 Saving supplierId into cache:", {
  supplierId,
  name,
});
    queryClient.setQueryData(["deliveries", "latest"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        supplier: {
          ...(old.supplier ?? {}),
          supplierId,
          name,
        },
      };
    });
    console.log(
  "🧠 Cached delivery AFTER supplier resolve:",
  queryClient.getQueryData(["deliveries", "latest"])
);
  };

  const goToNextStep = async () => {
    if (!draft) {
      Alert.alert("No OCR data found");
      return;
    }

    try {
      await ensureSupplierExists();

      router.replace("/delivery-check");
    } catch (e: any) {
      Alert.alert("Could not continue", e?.message ?? "Unknown error");
    }
  };

  if (!draft) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 20 }}>
          No OCR data available
        </Text>
        <GradientButton text="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom", "top"] : ["bottom"]}
    >
      {Platform.OS === "android" && (
        <AndroidCustomNavigation onBack={router.back} paddingHorizontal={10} />
      )}

      <View style={styles.container}>
        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
          accessibilityRole="header"
        >
          Verify Information
        </Text>

        <Text style={[styles.subtitle, { color: colors.text }]}>
          Please check if the information is correct.
        </Text>

        <View style={styles.infoContainer}>
          <EditableSectionCard
            rows={infoRows}
            style={styles.editableCardStyle}
          />
        </View>

        <View style={styles.spacer} />
      </View>

      <View style={[styles.actions, { backgroundColor: colors.background }]}>
        <GradientButton text="Next" onPress={goToNextStep} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  infoContainer: { marginTop: 15, gap: 16 },
  editableCardStyle: { borderRadius: 12 },
  spacer: { height: 30 },
  actions: { padding: 16 },
});
