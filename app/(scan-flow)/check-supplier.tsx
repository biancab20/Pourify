import { View, StyleSheet, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import type { DeliveryOcrResponse } from "@/types/deliveries";
import EditableSectionCard from "@/components/ui/EditableSectionCard";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";

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
