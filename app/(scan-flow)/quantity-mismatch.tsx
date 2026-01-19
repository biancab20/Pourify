import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { openEditField } from "@/utils/open-edit-field";
import { Text } from "@/components/shared/Text";
import GradientButton from "@/components/shared/GradientButton";
import { useAppTheme } from "@/stores/app-theme-context";
import { useDeliveryStatus } from "@/hooks/useDeliveryStatus";
import type { DeliveryStatus } from "@/types/deliveries";
import { useDeliveryRemoved } from "@/hooks/useDeliveryRemoved";

type Params = {
  id?: string;
  name?: string;
  expectedUnits?: string;
  cases?: string; // totalVolume
  cans?: string; // per-unit volume
  unitLabel?: string;
};

const parseNumber = (v: unknown, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

export default function QuantityMismatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const { theme } = useAppTheme();
  const { colors, palette } = theme;

  const casesParam = parseNumber(params.cases, 0);
  const cansParam = parseNumber(params.cans, 0);

  const { statusMap, setStatus, setReceivedUnits } = useDeliveryStatus();
  const { addRemoved } = useDeliveryRemoved();

  const id = params.id ?? "";
  const name = params.name ?? "Unknown product";

  const expectedUnitsParam =
    cansParam > 0
      ? casesParam / cansParam
      : parseNumber(params.expectedUnits, 0);

  const unitLabel = params.unitLabel ?? "Bottles";

  const stored = useMemo(() => {
    return id ? statusMap?.[id] : undefined;
  }, [id, statusMap]);

  const [receivedUnits, setReceivedUnitsLocal] = useState<number>(
    stored?.receivedUnits ?? expectedUnitsParam,
  );

  // Ensure entry exists WITH real cases/cans
  useEffect(() => {
    if (!id) return;

    if (!stored) {
      setStatus(
        { id, name, cases: casesParam, cans: cansParam } as any,
        "quantity_mismatch" as DeliveryStatus,
      );
    }
  }, [id, name, stored, setStatus, casesParam, cansParam]);

  useEffect(() => {
    if (typeof stored?.receivedUnits === "number") {
      setReceivedUnitsLocal(stored.receivedUnits);
    }
  }, [stored?.receivedUnits]);

  const expectedUnits = stored?.expectedUnits ?? expectedUnitsParam;

  const onEditReceived = () => {
    openEditField(router, {
      title: name,
      description:
        "If the information is not correct, please modify with the quantity you received.",
      label: "Received",
      fieldType: "number",
      placeholder: `e.g. ${Math.round(expectedUnits)}`,
      initialValue: String(Math.round(receivedUnits)),
      onSave: async (v) => {
        const n = Number(String(v).trim());
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Please enter a valid quantity.");
        }
        setReceivedUnitsLocal(n);
      },
    });
  };

  const hasChanged = receivedUnits !== expectedUnits;

  const onUpdateQuantity = () => {
    if (!id) return;

    // 1) store received units
    setReceivedUnits(id, receivedUnits);

    // 2) keep the REAL cans/cases
    setStatus(
      { id, name, cases: casesParam, cans: cansParam } as any,
      "quantity_mismatch",
    );

    // 3) remove from list
    addRemoved(id);

    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backRow}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={palette.yellow} />
          <Text
            style={{ color: palette.yellow, fontSize: 16, fontWeight: "600" }}
          >
            Back
          </Text>
        </Pressable>

        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          {name}
        </Text>

        <Text style={[styles.subtitle, { color: colors.text }]}>
          If the information is not correct, please{"\n"}modify with the
          quantity you received.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardHeader, { color: colors.text }]}>
            Expected
          </Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {unitLabel}: {Math.round(expectedUnits)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardHeader, { color: colors.text }]}>
            Received
          </Text>

          <View style={styles.receivedRow}>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {unitLabel}: {Math.round(receivedUnits)}
            </Text>

            <Pressable
              onPress={onEditReceived}
              style={[styles.editFab, { backgroundColor: palette.yellow }]}
              accessibilityRole="button"
              accessibilityLabel="Edit received quantity"
            >
              <Ionicons name="pencil" size={16} color={palette.black} />
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <GradientButton
          text="Update quantity"
          onPress={onUpdateQuantity}
          disabled={!hasChanged || !id}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  title: { fontSize: 32, fontWeight: "800", marginTop: 10 },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 22, opacity: 0.9 },
  card: { borderRadius: 22, padding: 18, marginTop: 18 },
  cardHeader: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  cardValue: { fontSize: 16, fontWeight: "500" },
  receivedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editFab: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  button: { width: "100%" },
});
