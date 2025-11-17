import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/stores/app-theme-context";
// import { Text } from "@/components/shared/Text";
import { Text } from "@/components/shared/Text";


export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Home</Text>
      <Text variant="gradient" gradientName="paloma" style={{ fontWeight: 700 }}>
        Banana Daiquiri!
      </Text>
      {/* <Text>Hello normal text!</Text>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Large normal text</Text> */}
      {/* <Text
        variant="gradient"
        gradientName="bananaDaiquiri"
        style={{ fontSize: 32 }}
      >
        Banana Daiquiri!
      </Text>
      <Text variant="gradient" gradientName="paloma" style={{ fontSize: 32, fontWeight: 700 }}>
        Banana Daiquiri!
      </Text> */}

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
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16, color: "white" },
});
