import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";

export default function PictureOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<{ uri: string }[]>(
    params.photos ? JSON.parse(params.photos as string) : []
  );

  useEffect(() => {
    if (params.photos) {
      setPhotos(JSON.parse(params.photos as string));
    }
  }, [params.photos]);

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

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Note Photos</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Photo Grid */}
      <ScrollView style={styles.photoContainer}>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001b3a",
  },
  header: {
    height: 56,
    backgroundColor: "#001b3a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    color: "#D4FF3B",
    fontSize: 18,
    fontWeight: "600",
  },
  closeText: {
    color: "white",
    fontSize: 24,
    fontWeight: "300",
  },
  photoContainer: {
    flex: 1,
    padding: 16,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoItem: {
    width: "48%",
    height: 200,
    marginBottom: 16,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
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
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
});
