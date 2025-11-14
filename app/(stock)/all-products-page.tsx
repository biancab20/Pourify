import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/text";
export default function AllProducts() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Second flow – Step 1</Text>

      {/* Go to next step in this flow */}
      <Pressable
        style={styles.button}
       // onPress={() => router.push("/(stock)/step2")}
      >
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>

      {/* Back to home (you also have the swipe gesture) */}
      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 24 },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#001b3a",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "600" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#001b3a",
  },
  secondaryText: { color: "#001b3a", fontWeight: "600" },
});
