import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/text";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* Flow 1 (bottom sheet) */}
      <Button
        title="Start Scan flow"
        onPress={() => router.push("/(scan-flow)/scan-new-delivery")}
      />

      {/* Flow 2 (full screen) */}
      <Button
        title="Start Second flow"
        onPress={() => router.push("/(stock)/all-products-page")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
});
