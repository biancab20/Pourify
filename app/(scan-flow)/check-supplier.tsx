import { View, StyleSheet, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import type { DeliveryOcrResponse } from "@/types/deliveries";
import EditableSectionCard from "@/components/dynamicComponents/EditableSectionCard";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";
import { openEditField } from "@/utils/open-edit-field";

export default function CheckSupplier() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const queryClient = useQueryClient();

  const ocrData = useMemo<DeliveryOcrResponse | null>(() => {
    if (typeof params.ocrData !== "string") return null;
    try {
      return JSON.parse(params.ocrData);
    } catch {
      return null;
    }
  }, [params.ocrData]);

  // Format date from OCR data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date found";

    try {
      // If it's already in a readable format, return as-is
      if (dateString.includes("/")) return dateString;

      // Try to parse and format date
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

  // Define rows for the EditableSectionCard based on OCR data
  const infoRows = useMemo(
    () => [
      {
        id: "supplier",
        title: "Supplier",
        value: ocrData?.supplier?.name || "Supplier not detected",
        valueNumberOfLines: 1,
        onEditPress: () => {
          Alert.alert("Edit Supplier", "Edit supplier functionality");
        },
        showEdit: true,
        editA11yLabel: "Edit supplier",
      },
      {
        id: "date",
        title: "Date",
        value: formatDate(ocrData?.deliveryDate),
        valueNumberOfLines: 1,
        onEditPress: () => {
          Alert.alert("Edit Date", "Edit date functionality");
        },
        showEdit: true,
        editA11yLabel: "Edit date",
      },
      // Add more fields as needed
    ],
    [ocrData]
  );

  const confirmPhotos = () => {
    if (!ocrData) {
      Alert.alert("No OCR data found");
      return;
    }

    queryClient.setQueryData(["deliveries", "latest"], ocrData);
    router.replace("/delivery-check");
  };

  // If no OCR data, show error
  if (!ocrData) {
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
  function confirmAsync(title: string, message: string) {
    return new Promise<boolean>((resolve) => {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Add", onPress: () => resolve(true) },
      ]);
    });
  }
  openEditField(router, {
    title: "Delivery: Supplier",
    description:
      "Confirm who delivered this order. This is used for reporting issues.",
    label: "Supplier name",
    fieldType: "text",
    initialValue: ocrData.supplier.name,
    placeholder: "e.g. Big Drinks BV",
    onSave: async (newName) => {
      const name = newName.trim();
      if (!name) throw new Error("Please enter a supplier name.");

      const existing = suppliers.find(
        (s) => s.name.trim().toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        // Just select it / set it
        setDelivery((d) => ({
          ...d,
          supplierId: existing.supplierId,
          supplierName: existing.name,
        }));
        return true; // ✅ close editor
      }

      // Not found → ask to add
      const shouldAdd = await confirmAsync(
        "Add supplier?",
        `“${name}” is not in your supplier list. Do you want to add it now?`
      );

      if (!shouldAdd) {
        // keep the typed value in your delivery (optional) but don't add supplier
        setDelivery((d) => ({ ...d, supplierId: "", supplierName: name }));
        return true; // or false if you want them to keep editing
      }

      // Create supplier (use your existing hook/mutation from this screen)
      const created = await createSupplier.mutateAsync({
        name,
        email: "", // can be empty for now, or do later
      });

      // Make sure created returns supplierId; adapt to your API response
      setDelivery((d) => ({
        ...d,
        supplierId: created.supplierId,
        supplierName: name,
      }));

      // Optional: chain to email editor immediately
      openEditField(router, {
        title: "Supplier: Email",
        description: "Add an email now or you can do it later in settings.",
        label: "Email",
        fieldType: "email",
        initialValue: "",
        placeholder: "orders@supplier.com",
        onSave: async (email) => {
          const trimmed = email.trim();
          if (trimmed && !trimmed.includes("@"))
            throw new Error("Please enter a valid email.");

          // if your API requires full update, send name too
          await updateSupplier.mutateAsync({
            supplierId: created.supplierId,
            data: { name, email: trimmed },
          });

          return true;
        },
      });

      return true; // ✅ close the supplier-name editor
    },
  });
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={Platform.OS === "android" ? ["bottom", "top"] : ["bottom"]}
    >
      {Platform.OS === "android" && (
        <AndroidCustomNavigation onBack={router.back} paddingHorizontal={10} />
      )}
      <View style={styles.container}>
        {/* Header */}
        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
          accessibilityRole="header"
        >
          Verify Information
        </Text>

        {/* Subtext */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Please check if the information is correct.
        </Text>

        {/* Info Cards - Using EditableSectionCard */}
        <View style={styles.infoContainer}>
          <EditableSectionCard
            rows={infoRows}
            style={styles.editableCardStyle}
          />
        </View>

        {/* Spacer to push content up */}
        <View style={styles.spacer} />
      </View>

      {/* Actions - Fixed at bottom */}
      <View style={[styles.actions, { backgroundColor: colors.background }]}>
        <GradientButton text="Next" onPress={confirmPhotos} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  infoContainer: {
    marginTop: 15,
    gap: 16,
  },
  editableCardStyle: {
    borderRadius: 12,
  },
  spacer: {
    height: 30,
  },
  actions: {
    padding: 16,
  },
});
