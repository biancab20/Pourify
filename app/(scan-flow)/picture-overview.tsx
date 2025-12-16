import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import { Photo } from "@/app/(scan-flow)/scan-new-delivery";

function safeParsePhotos(value: unknown): Photo[] {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((p) => p && typeof p.uri === "string")
      .map((p) => ({
        id: typeof p.id === "string" ? p.id : `${Date.now()}-${Math.random()}`,
        uri: p.uri,
      }));
  } catch {
    return [];
  }
}

export default function PictureOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();

  const parsedFromParams = useMemo(
    () => safeParsePhotos(params.photos),
    [params.photos]
  );
  const [photos, setPhotos] = useState<Photo[]>(parsedFromParams);

useEffect(() => {
    setPhotos(parsedFromParams);
  }, [parsedFromParams]);

  const addMorePhotos = () => {
    router.push({
      pathname: "/(scan-flow)/scan-new-delivery",
      params: { existingPhotos: JSON.stringify(photos) },
    });
  };

  const confirmPhotos = () => {
    Alert.alert("Success", `${photos.length} photos saved for processing`, [
      {
        text: "OK",
        onPress: () => router.replace("/delivery-list"),
      },
    ]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      {/* header */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.isDark
                ? theme.palette.yellow
                : theme.palette.darkBlue,
            },
          ]}
        >
          Delivery Note Photos
        </Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Icon name="exit" size={32} color={theme.colors.icon} />
        </Pressable>
      </View>

      {/* Photo Grid */}
      <ScrollView style={styles.photoContainer}>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removePhoto(photo.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
              <View style={styles.photoNumberBadge}>
                <Text style={styles.photoNumberText}>Page {index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {/* Confirm Photos - Gradient Button */}
        <GradientButton
          onPress={confirmPhotos}
          text={`Confirm ${photos.length} Photo${
            photos.length !== 1 ? "s" : ""
          }`}
          disabled={photos.length === 0}
        />

        {/* Take More Photos - Secondary Button */}
        <GradientButton
          onPress={addMorePhotos}
          text="Take More Photos"
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    paddingHorizontal: 6,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    height: 56,
    minWidth: 48,
    right: 0,
  },
  photoContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    marginHorizontal: 6,
  },
  photoItem: {
    width: "48%",
    height: 200,
    borderRadius: 12,
    //overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#001b3a",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  photoNumberBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  buttonContainer: {
    paddingVertical: 16,
    gap: 12,
  },
});
