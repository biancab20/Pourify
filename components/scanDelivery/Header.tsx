import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import { useAppTheme } from "@/stores/app-theme-context";
import { useRouter } from "expo-router";

export default function Header({ title }: { title: string }) {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.headerTitle, { color: theme.isDark ? theme.palette.yellow : theme.palette.darkBlue }]}>
        {title}
      </Text>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Icon name="exit" size={32} color={theme.colors.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    height: 56,
    minWidth: 48,
    right: 0,
  },
});
