import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import { makeId } from "@/utils/ids";
import { useQueryClient } from "@tanstack/react-query";
import type {Photo, DeliveryOcrResponse, DeliveryProduct } from "@/types/deliveries";
import EditableSectionCard from "@/components/ui/EditableSectionCard";

function safeParsePhotos(value: unknown): Photo[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((p) => ({
          id: p.id ?? makeId(),
          uri: p.uri,
        }))
      : [];
  } catch {
    return [];
  }
}

export default function CheckSupplier() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();

  const photos = useMemo(
    () => safeParsePhotos(params.photos),
    [params.photos]
  );

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
      if (dateString.includes('/')) return dateString;
      
      // Try to parse and format date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format volume for products
  const formatVolume = (volume?: number) => {
    if (!volume) return "N/A";
    return `${volume} m³`;
  };

  // Calculate total volume from products
  const calculateTotalVolume = () => {
    if (!ocrData?.products || !ocrData.products.length) return 0;
    return ocrData.products.reduce((total, product) => total + (product.volume || 0), 0);
  };

  // Define rows for the EditableSectionCard based on OCR data
  const infoRows = useMemo(() => [
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
    }
    // Add more fields as needed
  ], [ocrData]);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>No OCR data available</Text>
        <GradientButton text="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background , paddingHorizontal: 16 }}>
      {/* Header */}
       <Text
                variant="gradient"
                gradientName="paloma"
                style={styles.headerTitle}
                accessibilityRole="header"
                accessibilityLabel="Venue name"
              >
                Verify Information
              </Text>

      {/* Subtext */}
      <Text style={{ color: theme.colors.text }}>
        Please check if the information is correct.
      </Text>

      {/* Info Cards - Using EditableSectionCard */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <EditableSectionCard
            rows={infoRows}
            style={styles.editableCardStyle}
          />
          
          
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <GradientButton text="Next" onPress={confirmPhotos} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  scrollContainer: {
    flex: 1,
  },
  infoContainer: {
    marginTop: 24,
    paddingBottom: 24,
  },
  editableCardStyle: {
    borderRadius: 12,
  },
  actions: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333",
  },
});