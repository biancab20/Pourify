import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Icon } from "@/components/icons/Icon";

export default function VenueSettings() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      {/* header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Icon name="exit" size={32} color={theme.colors.icon} />
        </Pressable>
      </View>

      {/*scroll view*/}

      <ScrollView
      // style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Venue name"
        >
          Hachi bar Settings
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    height: 56,
    gap: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },
    title: {
    fontSize: 42,
    fontWeight: "600",
    marginBottom: 16,
  },
});
