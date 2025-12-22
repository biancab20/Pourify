import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useState, useRef, useEffect } from "react";
import { CameraView } from "expo-camera";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import type { Photo } from "@/types/deliveries";
import { makeId } from "@/utils/ids";
import { toPhotosFromAssets, toPickedFile } from "@/utils/upload";
import { useCameraPermissionFlow } from "@/hooks/useCameraPermissionFlow";
import { useProcessDeliveryNote } from "@/hooks/useDeliveries";

export type PickedFile = {
  id: string;
  uri: string;
  name?: string;
  mimeType?: string;
};

type UploadMode = "images" | "file" | null;

export default function ScanNewDelivery() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>(null);

  const cameraRef = useRef<CameraView>(null);

  const { permission, hasCameraPermission } = useCameraPermissionFlow();

  const processDeliveryNote = useProcessDeliveryNote();

  // =========================
  // Pick images from gallery
  // =========================
  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to select images from your gallery."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      // Enforce exclusivity
      if (uploadMode === "file") setFiles([]);
      setUploadMode("images");

      const newPhotos = toPhotosFromAssets(result.assets);
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (e) {
      console.error("pickFromGallery error:", e);
      Alert.alert("Error", "Failed to pick image(s)");
    }
  };

  // =========================
  // Pick file
  // =========================
  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      // Enforce exclusivity
      if (uploadMode === "images") setPhotos([]);
      setUploadMode("file");

      const picked = toPickedFile(asset);
      setFiles([picked]);
    } catch (e) {
      console.error("pickFiles error:", e);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  // =========================
  // Take picture
  // =========================
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
        skipProcessing: false,
      });

      // Enforce exclusivity
      if (uploadMode === "file") setFiles([]);
      setUploadMode("images");

      setPhotos((prev) => [...prev, { id: makeId(), uri: photo.uri }]);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const clearFile = () => {
    setFiles([]);
    setUploadMode(null);
  };

  // =========================
  // Actions
  // =========================
  const proceedToOverview = () => {
    if (!(uploadMode === "images" && photos.length > 0)) {
      Alert.alert("Nothing selected", "Please add photos before proceeding.");
      return;
    }

    router.push({
      pathname: "/(scan-flow)/picture-overview",
      params: { photos: JSON.stringify(photos) },
    });
  };

  const uploadFile = async () => {
    if (!(uploadMode === "file" && files.length === 1)) return;

    try {
      const file = files[0];

      const data = await processDeliveryNote.mutateAsync({
        kind: "file",
        file: {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
        },
      });

      Alert.alert("OCR response", JSON.stringify(data, null, 2));
    } catch (e: any) {
      Alert.alert(
        "Upload failed",
        e?.body ? `${e.message}\n\n${e.body}` : e?.message ?? String(e)
      );
    }
  };

  const isBusy = processDeliveryNote.isPending;

  const canProceed =
    (uploadMode === "images" && photos.length > 0) ||
    (uploadMode === "file" && files.length === 1);

  // =========================
  // Restore state when coming back
  // =========================
  useEffect(() => {
    if (!params.existingPhotos) return;

    try {
      const parsed = JSON.parse(params.existingPhotos as string);
      const normalized: Photo[] = Array.isArray(parsed)
        ? parsed.map((p: any) => ({
            id: typeof p.id === "string" ? p.id : makeId(),
            uri: p.uri,
          }))
        : [];

      setPhotos(normalized);

      if (normalized.length > 0) {
        setUploadMode("images");
        setFiles([]);
      } else if (uploadMode === "images") {
        setUploadMode(null);
      }
    } catch {
      console.warn("Invalid existingPhotos param");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.existingPhotos]);

  useEffect(() => {
    if (!params.existingFiles) return;

    try {
      const parsed = JSON.parse(params.existingFiles as string);
      const normalized: PickedFile[] = Array.isArray(parsed)
        ? parsed.map((f: any) => ({
            id: typeof f.id === "string" ? f.id : makeId(),
            uri: f.uri,
            name: f.name,
            mimeType: f.mimeType,
          }))
        : [];

      setFiles(normalized);

      if (normalized.length > 0) {
        setUploadMode("file");
        setPhotos([]);
      } else if (uploadMode === "file") {
        setUploadMode(null);
      }
    } catch {
      console.warn("Invalid existingFiles param");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.existingFiles]);

  // =========================
  // UI states
  // =========================
  if (!permission) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>
          Checking camera permissions...
        </Text>
      </View>
    );
  }

  const isDenied = permission.status === "denied" && !hasCameraPermission;
  const isUndetermined =
    permission.status === "undetermined" && !hasCameraPermission;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 16,
      }}
      edges={["bottom", "top"]}
    >
      <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
        {/* header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.isDark ? theme.palette.yellow : theme.palette.darkBlue,
              },
            ]}
          >
            Scan delivery note
          </Text>

          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Icon name="exit" size={32} color={theme.colors.icon} />
          </Pressable>
        </View>

        {hasCameraPermission ? (
          <>
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                enableTorch={false}
              />

              {/* buttons inside camera */}
              <View style={styles.captureContainer}>
                <Pressable
                  onPress={pickFromGallery}
                  style={[
                    styles.toolButton,
                    { backgroundColor: theme.colors.background },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Upload from gallery"
                  disabled={isBusy}
                >
                  <MaterialIcons name="photo" size={30} color={theme.colors.icon} />
                </Pressable>

                <Pressable
                  style={[
                    styles.captureButton,
                    {
                      backgroundColor: theme.isDark
                        ? theme.palette.darkBlue
                        : theme.palette.beige,
                      borderColor: theme.isDark
                        ? theme.palette.black
                        : theme.palette.white,
                    },
                  ]}
                  onPress={takePicture}
                  disabled={isBusy}
                >
                  <View
                    style={[
                      styles.captureButtonInner,
                      { backgroundColor: theme.colors.cardBackground },
                    ]}
                  />
                </Pressable>

                <Pressable
                  onPress={pickFiles}
                  style={[
                    styles.toolButton,
                    { backgroundColor: theme.colors.background },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Upload file"
                  disabled={isBusy}
                >
                  <MaterialIcons
                    name="attach-file"
                    size={30}
                    color={theme.colors.icon}
                  />
                </Pressable>
              </View>
            </View>

            {uploadMode === "images" && photos.length > 0 && (
              <View
                style={[
                  styles.previewContainer,
                  {
                    borderTopColor: theme.isDark
                      ? theme.palette.darkBlue
                      : theme.palette.beige,
                  },
                ]}
              >
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                  Taken Photos ({photos.length})
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photos.map((photo) => (
                    <View key={photo.id} style={styles.previewItem}>
                      <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                      <Pressable
                        style={[
                          styles.removeButton,
                          {
                            backgroundColor: theme.palette.red,
                            borderColor: theme.colors.background,
                          },
                        ]}
                        onPress={() => removePhoto(photo.id)}
                        disabled={isBusy}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {uploadMode === "file" && files.length === 1 && (
              <View
                style={[
                  styles.previewContainer,
                  {
                    borderTopColor: theme.isDark
                      ? theme.palette.darkBlue
                      : theme.palette.beige,
                  },
                ]}
              >
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                  Selected file
                </Text>

                <View
                  style={[
                    styles.fileRow,
                    { backgroundColor: theme.colors.cardBackground },
                  ]}
                >
                  <MaterialIcons
                    name="attach-file"
                    size={20}
                    color={theme.colors.icon}
                  />

                  <Text
                    style={[styles.fileName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {files[0].name ?? "File"}
                  </Text>

                  <Pressable
                    style={[
                      styles.removeButton,
                      {
                        backgroundColor: theme.palette.red,
                        borderColor: theme.colors.background,
                      },
                    ]}
                    onPress={clearFile}
                    disabled={isBusy}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.actionContainer}>
              <GradientButton
                onPress={uploadMode === "file" ? uploadFile : proceedToOverview}
                text={uploadMode === "file" ? "Upload" : `Review (${photos.length})`}
                disabled={!canProceed || isBusy}
              />
            </View>
          </>
        ) : (
          <View
            style={[
              styles.cameraPlaceholder,
              {
                backgroundColor: theme.isDark ? theme.palette.darkBlue : theme.palette.beige,
              },
            ]}
          >
            <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
              {isDenied
                ? "Camera permission is denied. Turn it on in Settings or choose another method to upload delivery notes."
                : isUndetermined
                ? "Requesting camera permission..."
                : "Waiting for camera permission..."}
            </Text>

            {isDenied && (
              <View style={{ width: "100%", marginTop: 16, gap: 12 }}>
                <GradientButton onPress={() => Linking.openSettings()} text="Open Settings" />
                <GradientButton
                  onPress={() =>
                    Alert.alert(
                      "Not implemented",
                      "Hook this up to your alternative upload flow."
                    )
                  }
                  text="Choose another method"
                />
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const SHEET_HEIGHT = "100%";

const styles = StyleSheet.create({
  sheet: {
    height: SHEET_HEIGHT,
  },
  header: {
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
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: "center",
  },
  captureContainer: {
    position: "absolute",
    flexDirection: "row",
    left: 15,
    right: 15,
    bottom: 16,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  previewContainer: {
    paddingVertical: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  previewItem: {
    marginRight: 12,
    position: "relative",
    paddingTop: 6,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionContainer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
