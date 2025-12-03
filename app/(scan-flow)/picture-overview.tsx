import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/shared/Text";

export default function PictureOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<{uri: string}[]>(
    params.photos ? JSON.parse(params.photos as string) : []
  );

  const addMorePhotos = () => {
    router.back(); // Go back to camera screen
  };

  const confirmPhotos = () => {
    // Here you would typically upload photos to your server
    console.log("Photos to process:", photos);
    Alert.alert(
      "Success",
      `${photos.length} photos saved for processing`,
      [
        {
          text: "OK",
          onPress: () => router.replace("/(stock)/all-products-page"), // Or your next screen
        }
      ]
    );
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Delivery Note Photos</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Review your {photos.length} photo{photos.length !== 1 ? "s" : ""}. 
          Tap on a photo to remove it.
        </Text>
        <Text style={styles.subInstructionText}>
          Make sure all pages are clear and readable
        </Text>
      </View>

      {/* Photo Grid */}
      <ScrollView style={styles.photoContainer}>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <Pressable
              key={index}
              onPress={() => removePhoto(index)}
              style={styles.photoItem}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.photo}
              />
              <View style={styles.photoOverlay}>
                <Text style={styles.removeText}>Remove</Text>
              </View>
              <View style={styles.photoNumberBadge}>
                <Text style={styles.photoNumberText}>Page {index + 1}</Text>
              </View>
            </Pressable>
          ))}
          
          {/* Add more button */}
          <Pressable
            style={[styles.photoItem, styles.addMoreButton]}
            onPress={addMorePhotos}
          >
            <View style={styles.addMoreContent}>
              <Text style={styles.addMoreIcon}>+</Text>
              <Text style={styles.addMoreText}>Add More</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={addMorePhotos}
        >
          <Text style={styles.secondaryButtonText}>Take More Photos</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={confirmPhotos}
          disabled={photos.length === 0}
        >
          <Text style={[
            styles.primaryButtonText,
            photos.length === 0 && styles.disabledButtonText
          ]}>
            Confirm {photos.length} Photo{photos.length !== 1 ? "s" : ""}
          </Text>
        </Pressable>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#D4FF3B",
    fontSize: 28,
    fontWeight: "300",
  },
  headerTitle: {
    color: "#D4FF3B",
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
  },
  subInstructionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
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
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  removeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  addMoreButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreContent: {
    alignItems: "center",
  },
  addMoreIcon: {
    color: "#D4FF3B",
    fontSize: 36,
    fontWeight: "300",
    marginBottom: 8,
  },
  addMoreText: {
    color: "#D4FF3B",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#D4FF3B",
  },
  primaryButtonText: {
    color: "#001b3a",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  secondaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButtonText: {
    color: "rgba(0,27,58,0.5)",
  },
});