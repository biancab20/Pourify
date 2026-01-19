import { View, Pressable, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/stores/app-theme-context";

type Props = {
  cameraRef: React.RefObject<CameraView | null>; // <-- allow null
  onTakePicture: () => void;
  onPickImage: () => void;
  onPickFile: () => void;
  isBusy: boolean;
};

export default function CameraSection({
  cameraRef,
  onTakePicture,
  onPickImage,
  onPickFile,
  isBusy,
}: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        enableTorch={false}
      />

      <View style={styles.captureContainer}>
        <Pressable
          onPress={onPickImage}
          style={[
            styles.toolButton,
            { backgroundColor: theme.colors.background },
          ]}
          disabled={isBusy}
        >
          <MaterialIcons name="photo" size={30} color={theme.colors.icon} />
        </Pressable>

        <Pressable
          style={[
            styles.captureButton,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.cardBackground,
            },
          ]}
          onPress={onTakePicture}
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
          onPress={onPickFile}
          style={[
            styles.toolButton,
            { backgroundColor: theme.colors.background },
          ]}
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
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  camera: { flex: 1 },
  captureContainer: {
    position: "absolute",
    flexDirection: "row",
    left: 15,
    right: 15,
    bottom: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },
  captureButtonInner: { width: 64, height: 64, borderRadius: 32 },
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
});
