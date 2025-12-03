import {
  View,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { LinearGradient } from 'expo-linear-gradient';

export default function ScanNewDelivery() {
  const router = useRouter();
  const [photos, setPhotos] = useState<{uri: string}[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: true,
          skipProcessing: false,
        });
        
        // Add to photos array
        setPhotos(prev => [...prev, photo]);
        
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to capture photo");
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const proceedToOverview = () => {
    if (photos.length === 0) {
      Alert.alert("No Photos", "Please take at least one photo before proceeding");
      return;
    }
    
    router.push({
      pathname: "/(scan-flow)/picture-overview",
      params: { photos: JSON.stringify(photos) },
    });
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      {/* Tap outside to close */}
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan delivery note</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            enableTorch={false}
          />
          
          {/* Camera controls - positioned absolutely over the camera */}
          <View style={styles.cameraOverlay}>
            {/* Camera controls */}
            <View style={styles.cameraControls}>
              <Pressable onPress={toggleCameraType} style={styles.cameraButton}>
                <Text style={styles.cameraButtonText}>↻</Text>
              </Pressable>
            </View>
            
            {/* Capture button */}
            <View style={styles.captureContainer}>
              <Pressable style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Preview strip */}
        {photos.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>
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
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action button */}
        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.actionButton,
              photos.length === 0 && styles.disabledGradient,
            ]}
            onPress={proceedToOverview}
            disabled={photos.length === 0}
          >
            <LinearGradient
              colors={["#FF77E0", "#F54D41"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[
                styles.gradientButton,
                photos.length === 0 && styles.disabledGradient,
              ]}
            >
              <Text style={[
                styles.nextButtonText,
                photos.length === 0 && styles.disabledButtonText
              ]}>
                Review ({photos.length})
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const SHEET_HEIGHT = "100%";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "#001b3a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
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
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  cameraControls: {
    paddingTop: 20,
    paddingRight: 20,
    alignItems: "flex-end",
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButtonText: {
    color: "white",
    fontSize: 20,
  },
  captureContainer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  previewContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  previewTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  previewItem: {
    marginRight: 12,
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    alignItems: "center", // Center the button horizontally
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%", 
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Make the gradient fill the Pressable container
  },
  disabledGradient: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButtonText: {
    color: "rgba(255,255,255,0.7)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001b3a",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001b3a",
    padding: 20,
  },
  permissionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#D4FF3B",
  },
  permissionButtonText: {
    color: "#001b3a",
    fontWeight: "600",
    fontSize: 16,
  },
});