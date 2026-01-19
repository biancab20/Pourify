import { CameraView } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, View } from "react-native";

import CameraSection from "@/components/scanDelivery/CameraSection";
import FilePreview from "@/components/scanDelivery/FilePreview";
import PhotoPreview from "@/components/scanDelivery/PhotoPreview";
import GradientButton from "@/components/shared/GradientButton";
import { Text } from "@/components/shared/Text";
import DropdownNavigation from "@/components/navigation/DropdownNavigation";
import { useCameraPermissionFlow } from "@/hooks/useCameraPermissionFlow";
import { useProcessDeliveryNote } from "@/hooks/useDeliveries";
import { useAppTheme } from "@/stores/app-theme-context";
import type { Photo } from "@/types/deliveries";
import { makeId, toPhotosFromAssets, toPickedFile } from "@/utils/scan-helpers";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const cameraRef = useRef<CameraView>(null);

  const { permission, hasCameraPermission } = useCameraPermissionFlow();
  const processDeliveryNote = useProcessDeliveryNote();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const isBusy = processDeliveryNote.isPending || isProcessing;

  const canProceed =
    (uploadMode === "images" && photos.length > 0) ||
    (uploadMode === "file" && files.length === 1);

  // Handlers
  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (result.canceled) return;

      if (uploadMode === "file") setFiles([]);
      setUploadMode("images");

      setPhotos((prev) => [...prev, ...toPhotosFromAssets(result.assets)]);
    } catch (e) {
      console.error("pickFromGallery error:", e);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      if (uploadMode === "images") setPhotos([]);
      setUploadMode("file");

      setFiles([toPickedFile(asset)]);
    } catch (e) {
      console.error("pickFiles error:", e);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
        skipProcessing: false,
      });
      if (uploadMode === "file") setFiles([]);
      setUploadMode("images");
      setPhotos((prev) => [...prev, { id: makeId(), uri: photo.uri }]);
    } catch (e) {
      console.error("takePicture error:", e);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

  const clearFile = () => {
    setFiles([]);
    setUploadMode(null);
  };

  const proceedToOverview = async () => {
    if (!(uploadMode === "images" && photos.length > 0)) {
      Alert.alert("Nothing selected", "Please add photos before proceeding.");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await processDeliveryNote.mutateAsync({
        kind: "photos",
        photos,
      });
      router.push({
        pathname: "/(scan-flow)/check-supplier",
        params: {
          photos: JSON.stringify(photos),
          ocrData: JSON.stringify(data),
        },
      });
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadFile = async () => {
    if (!(uploadMode === "file" && files.length === 1)) return;

    setIsProcessing(true);
    try {
      const file = files[0];
      const data = await processDeliveryNote.mutateAsync({
        kind: "file",
        file: { uri: file.uri, name: file.name, mimeType: file.mimeType },
      });

      router.push({
        pathname: "/(scan-flow)/check-supplier",
        params: {
          photos: JSON.stringify(photos),
          files: JSON.stringify(files),
          ocrData: JSON.stringify(data),
          sourceType: "file",
        },
      });
    } catch (e: any) {
      console.error("File OCR Error:", e);
      Alert.alert(
        "Upload failed",
        e?.body ? `${e.message}\n\n${e.body}` : (e?.message ?? String(e)),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore state from params
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
      }
    } catch {
      console.warn("Invalid existingPhotos param");
    }
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
      }
    } catch {
      console.warn("Invalid existingFiles param");
    }
  }, [params.existingFiles]);

  if (!permission)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.text }}>
          Checking camera permissions...
        </Text>
      </View>
    );

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
    >
      {/* Loading Overlay */}
      {isProcessing && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              minWidth: 200,
            }}
          >
            <ActivityIndicator size="large" color={theme.palette.yellow} />
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "600",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Processing OCR...
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Please wait while we read the document
            </Text>
          </View>
        </View>
      )}

      {/* ✅ New extracted navigation */}
      <DropdownNavigation
        title="Scan delivery note"
        onClose={() => router.back()}
        items={[
          {
            key: "manual",
            label: "Manual delivery",
            onPress: () => router.push("/(scan-flow)/manual-delivery"),
          },
        ]}
        paddingHorizontal={16}
        headerBottomGap={0}
      />

      {hasCameraPermission ? (
        <>
          <CameraSection
            cameraRef={cameraRef}
            onTakePicture={takePicture}
            onPickImage={pickFromGallery}
            onPickFile={pickFiles}
            isBusy={isBusy}
          />

          {uploadMode === "images" && photos.length > 0 && (
            <PhotoPreview
              photos={photos}
              onRemove={removePhoto}
              isBusy={isBusy}
            />
          )}

          {uploadMode === "file" && files.length === 1 && (
            <FilePreview file={files[0]} onRemove={clearFile} isBusy={isBusy} />
          )}

          <View style={{ paddingVertical: 16 }}>
            <GradientButton
              onPress={uploadMode === "file" ? uploadFile : proceedToOverview}
              text={
                uploadMode === "file" ? "Upload" : `Review (${photos.length})`
              }
              disabled={!canProceed || isBusy}
            />
          </View>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            margin: 16,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            backgroundColor: theme.palette.beige,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {isDenied
              ? "Camera permission is denied. Turn it on in Settings or choose another method."
              : isUndetermined
                ? "Requesting camera permission..."
                : "Waiting for camera permission..."}
          </Text>

          {isDenied && (
            <View style={{ width: "100%", marginTop: 16, gap: 12 }}>
              <GradientButton
                onPress={() => Linking.openSettings()}
                text="Open Settings"
              />
              <GradientButton
                onPress={() => router.push("/(scan-flow)/manual-delivery")}
                text="Add delivery manually"
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
