import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SupplierCheck() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      {/* header */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={32}
            color={theme.isDark ? theme.palette.yellow : theme.palette.darkBlue}
          />

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
            Back
          </Text>
        </Pressable>
      </View>

      {/* verify supplier and date*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    paddingHorizontal: 6,
    height: 56,
    gap: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 48,
  },
});
