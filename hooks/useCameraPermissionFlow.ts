import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useCameraPermissions } from "expo-camera";

export function useCameraPermissionFlow() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    if (permission?.granted !== undefined) {
      setHasCameraPermission(permission.granted);
    }
  }, [permission]);

  useEffect(() => {
    if (!permission) return;

    if (permission.status === "undetermined") {
      requestPermission()
        .then((res) => setHasCameraPermission(res.granted))
        .catch(() => {});
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        requestPermission()
          .then((res) => setHasCameraPermission(res.granted))
          .catch(() => {});
      }
    });

    return () => sub.remove();
  }, [requestPermission]);

  return { permission, requestPermission, hasCameraPermission };
}
