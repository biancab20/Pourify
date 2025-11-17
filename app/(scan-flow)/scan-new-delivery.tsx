import {
  View,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";

export default function ScanNewDelivery() {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      {/* tap outside to close */}
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* bottom sheet */}
      <View style={styles.sheet}>
        {/* Top bar like your “Scan delivery note” bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan delivery note</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Content (camera view, etc.) */}
        <View style={styles.content}>
          <Text>Camera / QR scanner UI goes here</Text>

          {/* Only from STEP 1 you can go to STEP 2 */}
          <Pressable
            style={styles.button}
            //onPress={() => router.push("/(scan-flow)/step2")}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const SHEET_HEIGHT = "85%"; // adjust to match your Figma

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // darken the home screen
    justifyContent: "flex-end",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "#001b3a", // example, match your design
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
  },
  headerTitle: {
    color: "#D4FF3B", // your lime text color
    fontSize: 18,
    fontWeight: "600",
  },
  closeText: {
    color: "white",
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginTop: 24,
    alignSelf: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#D4FF3B",
  },
  buttonText: {
    fontWeight: "600",
    color: "#001b3a",
  },
});
