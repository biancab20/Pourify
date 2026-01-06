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
import type { Supplier } from "@/types";
import type { Bar as ApiBar } from "@/types/locations";
import { useMemo, useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBars } from "@/hooks/useLocations";

/** ✅ Local-only bars (old naming mistake) */
type StaticBar = {
  barId: string;
  name: string;
};

export default function VenueSettings() {
  const router = useRouter();
  const { theme } = useAppTheme();

  // ✅ Keep the old local list (empty)
  const [staticBars, setStaticBars] = useState<StaticBar[]>([
    // { barId: "1", name: "Main Bar (static)" },
  ]);

  // ✅ API bars (real stock locations)
  const {
    data: apiBarsData,
    isLoading: isApiBarsLoading,
    error: apiBarsError,
    refetch: refetchApiBars,
    isRefetching: isApiBarsRefetching,
  } = useBars();

  const apiBars = useMemo(() => apiBarsData?.items ?? [], [apiBarsData?.items]);

  // ✅ Suppliers API
  const {
    data: suppliersData,
    isLoading: isSuppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers,
    isRefetching: isSuppliersRefetching,
  } = useSuppliers();

  const suppliers = useMemo(() => suppliersData?.items ?? [], [suppliersData]);

  const addStaticBar = () => {
    // dummy add for now
    // you can wire this later to local form / modal / etc.
    setStaticBars((prev) => [
      ...prev,
      { barId: `static-${Date.now()}`, name: "New static bar" },
    ]);
  };

  const onAddSupplier = () => {
    router.push({
      pathname: "/(settings)/[entity]/add",
      params: {
        entity: "suppliers",
        venueName: "Hachi bar",
      },
    });
  };

  const onAddLocation = () => {
    router.push({
      pathname: "/(settings)/[entity]/add",
      params: {
        entity: "locations",
        venueName: "Hachi bar",
      },
    });
  };

  const openStaticBar = (barId: string) => {
    Alert.alert("Open static bar", `Static bar ID: ${barId}`);
  };

  const openApiBar = (barId: string) => {
    Alert.alert("Open location", `Location ID: ${barId}`);
  };

  const renderErrorState = (
    message: string,
    onRetry: () => void,
    isRetrying: boolean
  ) => (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "top"]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Icon name="exit" size={32} color={theme.colors.icon} />
        </Pressable>
      </View>

      <View style={styles.centerContainer}>
        <Text>{message}</Text>
        <Pressable
          onPress={onRetry}
          style={{ marginTop: 14, padding: 12, minWidth: 120, alignItems: "center" }}
        >
          {isRetrying ? (
            <ActivityIndicator color={theme.colors.icon} />
          ) : (
            <Text>Retry</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );

  // Only block the whole screen if suppliers fail to load (since you already had that behavior)
  if (isSuppliersLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom", "top"]}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
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
    const msg =
      typeof suppliersError === "object" && suppliersError && "message" in suppliersError
        ? String((suppliersError as any).message)
        : "Unknown error";

    return renderErrorState(
      `Error loading suppliers: ${msg}`,
      () => refetchSuppliers(),
      isSuppliersRefetching
    );
  }

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

      <ScrollView>
        <Text
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Venue name"
        >
          Hachi bar Settings
        </Text>

        {/* ✅ 1) Old local/static bars list (kept empty) */}
        <ConfigSectionCard<StaticBar>
          title="Bars"
          items={staticBars}
          emptyText="No bars have been added yet"
          addLabel="Add Bar"
          onAdd={addStaticBar}
          keyExtractor={(b) => b.barId}
          renderItem={({ item }) => (
            <ConfigRow
              title={item.name}
              leftIconName="cube-outline"
              onPress={() => openStaticBar(item.barId)}
            />
          )}
        />

        {/* ✅ 2) API bars list (stock locations) */}
        {apiBarsError ? (
          <View style={{ paddingHorizontal: 4, paddingTop: 10, paddingBottom: 6 }}>
            <Text>
              Could not load stock locations.
              {" "}
              <Text
                onPress={() => refetchApiBars()}
                style={{ textDecorationLine: "underline" }}
              >
                Tap to retry
              </Text>
            </Text>
          </View>
        ) : (
          <ConfigSectionCard<ApiBar>
            title="Stock locations within your venue"
            items={apiBars}
            emptyText={
              isApiBarsLoading ? "Loading stock locations..." : "No stock locations found"
            }
            addLabel="Add Location"
            onAdd={onAddLocation}
            keyExtractor={(b) => b.barId}
            renderItem={({ item }) => (
              <ConfigRow
                title={item.name}
                leftIconName="cube-outline"
                onPress={() => openApiBar(item.barId)}
              />
            )}
          />
        )}

        {/* ✅ Suppliers */}
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
