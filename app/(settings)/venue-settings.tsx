import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Icon } from "@/components/icons/Icon";
import ConfigSectionCard from "@/components/ui/ConfigSectionCard";
import { ConfigRow } from "@/components/ui/ConfigRow";
import { Bar } from "@/types";
import { useState } from "react";

export default function VenueSettings() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [bars, setBars] = useState<Bar[]>([
    // { barId: 1, name: "Main Bar" },
    // { barId: 2, name: "Cocktail Bar" },
  ]);

  const addBar = () => {
    const newBar: Bar = {
      barId: bars.length + 1,
      name: `New Bar ${bars.length + 1}`,
    };

    setBars((prev) => [...prev, newBar]);
  };

  /** Dummy navigation / open function */
  const openBar = (barId: number) => {
  Alert.alert("Open Bar", `Bar ID: ${barId}`);
};
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      {/* header */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
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

        <ConfigSectionCard<Bar>
        title="Bars"
        items={bars}
        emptyText="No bars have been added yet"
        addLabel="Add Bar"
        onAdd={addBar}
        keyExtractor={(b) => b.barId.toString()}
        renderItem={({ item }) => (
          <ConfigRow
            title={item.name}
            leftIconName="cube-outline"
            onPress={() => openBar(item.barId)}
          />
        )}
      />

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
