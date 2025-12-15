import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  AppState,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";

export default function ScanNewDelivery() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();

  const [photos, setPhotos] = useState<{ uri: string }[]>([]);
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // =========================
  // Permission-related
  // =========================

  const requestNativePermission = () => {
    // This triggers the OS native prompt (iOS/Android)
    requestPermission()
      .then((res) => setHasCameraPermission(res.granted))
      .catch((e) => console.log("requestPermission threw:", e));
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleChooseAnotherMethod = () => {
    Alert.alert(
      "Not implemented",
      "Hook this up to your alternative upload flow."
    );
  };

  // Keep local boolean in sync with hook state
  useEffect(() => {
    if (permission?.granted !== undefined) {
      setHasCameraPermission(permission.granted);
    }
  }, [permission?.granted]);

  // Auto-trigger OS permission prompt when undetermined
  useEffect(() => {
    if (!permission) return;

    if (permission.status === "undetermined") {
      requestNativePermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission?.status]);

  // Re-check when returning from Settings (foreground)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        requestPermission()
          .then((res) => setHasCameraPermission(res.granted))
          .catch((e) => console.log("requestPermission on resume threw:", e));
      }
    });

    return () => sub.remove();
  }, [requestPermission]);

  // =========================
  // Picture-related
  // =========================

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
        skipProcessing: false,
      });

      setPhotos((prev) => [...prev, photo]);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const proceedToOverview = () => {
    if (photos.length === 0) {
      Alert.alert(
        "No Photos",
        "Please take at least one photo before proceeding"
      );
      return;
    }

    router.push({
      pathname: "/(scan-flow)/picture-overview",
      params: { photos: JSON.stringify(photos) },
    });
  };

  // Load existing photos if coming back from overview
  useEffect(() => {
    if (params.existingPhotos) {
      const existing = JSON.parse(params.existingPhotos as string);
      setPhotos(existing);
    }
  }, [params.existingPhotos]);

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
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.background }]}
      >
        {/* header view */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
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
            Scan delivery note
          </Text>
          {/* this pressable is 48x48 so matches accessability standards */}
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
                facing={"back"}
                enableTorch={false}
              />

              {/* Capture button INSIDE the camera rectangle */}
              <View style={styles.captureContainer}>
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
                >
                  <View
                    style={[
                      styles.captureButtonInner,
                      { backgroundColor: theme.colors.cardBackground },
                    ]}
                  />
                </Pressable>
              </View>
            </View>

            {photos.length > 0 && (
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
                <Text
                  style={[styles.previewTitle, { color: theme.colors.text }]}
                >
                  Taken Photos ({photos.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.previewImage}
                      />
                      <Pressable
                        style={[
                          styles.removeButton,
                          {
                            backgroundColor: theme.palette.red,
                            borderColor: theme.colors.background,
                          },
                        ]}
                        onPress={() => removePhoto(index)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.actionContainer}>
              <GradientButton
                onPress={proceedToOverview}
                text={`Review (${photos.length})`}
                disabled={photos.length === 0}
              />
            </View>
          </>
        ) : (
          <View
            style={[
              styles.cameraPlaceholder,
              {
                backgroundColor: theme.isDark
                  ? theme.palette.darkBlue
                  : theme.palette.beige,
              },
            ]}
          >
            <Text
              style={[styles.placeholderText, { color: theme.colors.text }]}
            >
              {isDenied
                ? "Camera permission is denied. Turn it on in Settings or choose another method to upload delivery notes."
                : isUndetermined
                ? "Requesting camera permission..."
                : "Waiting for camera permission..."}
            </Text>

            {isDenied && (
              <View style={{ width: "100%", marginTop: 16, gap: 12 }}>
                <GradientButton
                  onPress={handleOpenSettings}
                  text="Open Settings"
                />
                <GradientButton
                  onPress={handleChooseAnotherMethod}
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
    left: 0,
    right: 0,
    bottom: 16,
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
});
