import {
  View,
  StyleSheet,
  Image,
  Pressable,
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
import type { Photo } from "@/types/deliveries";
import { makeId } from "@/utils/ids";
import { useQueryClient } from "@tanstack/react-query";
import type { DeliveryOcrResponse } from "@/types/deliveries";

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

export default function PictureOverview() {
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

  const confirmPhotos = () => {
    if (!ocrData) {
      Alert.alert("No OCR data found");
      return;
    }

    queryClient.setQueryData(["deliveries", "latest"], ocrData);

    router.replace("/delivery-check");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Photos</Text>
        <Pressable onPress={() => router.back()}>
          <Icon name="exit" size={28} color={theme.colors.icon} />
        </Pressable>
      </View>

      {/* Photos */}
      <ScrollView>
        <View style={styles.grid}>
          {photos.map((p, i) => (
            <View key={p.id} style={styles.photoBox}>
              <Image source={{ uri: p.uri }} style={styles.photo} />
              <Text style={styles.page}>Page {i + 1}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <GradientButton
          text="Confirm & Continue"
          onPress={confirmPhotos}
        />
        <GradientButton
          text="Add More Photos"
          variant="secondary"
          onPress={() =>
            router.replace({
              pathname: "/(scan-flow)/scan-new-delivery",
              params: { existingPhotos: JSON.stringify(photos) },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
  },
  photoBox: {
    width: "48%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  page: {
    position: "absolute",
    bottom: 8,
    left: 8,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
});
