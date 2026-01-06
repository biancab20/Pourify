import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/shared/Text";
import { useAppTheme } from "@/stores/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import ConfigSectionCard from "@/components/ui/ConfigSectionCard";
import { ConfigRow } from "@/components/ui/ConfigRow";
import { Bar, Supplier } from "@/types";
import { useMemo, useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";

export default function VenueSettings() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [bars, setBars] = useState<Bar[]>([
    // { barId: 1, name: "Main Bar" },
    // { barId: 2, name: "Cocktail Bar" },
  ]);

  const {
    data: suppliersData,
    isLoading: isSuppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers,
    isRefetching: isSuppliersRefetching,
  } = useSuppliers();

  const suppliers = useMemo(() => {
    return suppliersData?.items ?? [];
  }, [suppliersData?.items]);

  const addBar = () => {
    

    setBars((prev) => [...prev]);
  };
  const onAddSupplier = () => {
  router.push({
    pathname: "/(settings)/[entity]/add",
    params: {
      entity: "suppliers",
      venueName: "Hachi bar", // or your dynamic venue name
    },
  });
};

  /** Dummy navigation / open function */
  const openBar = (barId: string) => {
    Alert.alert("Open Bar", `Bar ID: ${barId}`);
  };

  if (isSuppliersLoading) {
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

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.icon} />
          <Text style={{ marginTop: 10 }}>Loading suppliers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (suppliersError) {
    const message =
      typeof suppliersError === "object" &&
      suppliersError &&
      "message" in suppliersError
        ? String((suppliersError as any).message)
        : "Unknown error";

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

        <View style={styles.centerContainer}>
          <Text>Error loading suppliers: {message}</Text>

          <Pressable
            onPress={() => refetchSuppliers()}
            style={{ marginTop: 14, padding: 12 }}
          >
            {isSuppliersRefetching ? (
              <ActivityIndicator color={theme.colors.icon} />
            ) : (
              <Text>Retry</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
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

        <ConfigSectionCard<Supplier>
          title="Suppliers"
          items={suppliers}
          emptyText="No suppliers have been added yet"
          addLabel="Add Supplier"
          onAdd={onAddSupplier}
          keyExtractor={(s) => s.supplierId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="people-outline"
              // rightLabel={item.email}
              onPress={() => Alert.alert("Open Supplier", item.supplierId)}
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
    centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});
