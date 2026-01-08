import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/stores/app-theme-context";
import { Text } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";

import FormInput from "@/components/ui/FormInput";
import GradientButton from "@/components/shared/GradientButton";

type EntityKey = "products" | "suppliers" | "locations";
type FieldKey = "name" | "email" | "volume" | "type";

const PRODUCT_TYPE_OPTIONS = [
  { label: "Keg", value: "KEG" },
  { label: "Wine", value: "WINE" },
  { label: "Box", value: "BOX" },
  { label: "Unit", value: "UNIT" },
  { label: "Bottle", value: "BOTTLE" },
];

function getFieldLabel(entity: EntityKey, fieldKey: FieldKey) {
  if (entity === "locations" && fieldKey === "name") return "Location name";
  if (entity === "suppliers" && fieldKey === "name") return "Supplier name";
  if (entity === "suppliers" && fieldKey === "email") return "Email";
  if (entity === "products" && fieldKey === "name") return "Product name";
  if (entity === "products" && fieldKey === "volume") return "Volume (L)";
  if (entity === "products" && fieldKey === "type") return "Type";
  return "Edit field";
}

function getFieldTitle(entity: EntityKey, fieldKey: FieldKey) {
  // gradient title for the page
  const base =
    entity === "suppliers" ? "Supplier" : entity === "products" ? "Product" : "Stock location";
  const label = getFieldLabel(entity, fieldKey);
  return `${base}: ${label}`;
}

export default function EditEntityFieldScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const params = useLocalSearchParams<{
    entity?: string;
    id?: string;
    fieldKey?: string;
    value?: string;
  }>();

  const entity = (params.entity ?? "products") as EntityKey;
  const id = params.id ?? "";
  const fieldKey = (params.fieldKey ?? "name") as FieldKey;

  // initial value passed from previous screen (string)
  const initialValue = params.value ?? "";

  // Single field state
  const [value, setValue] = useState<string>(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const label = useMemo(() => getFieldLabel(entity, fieldKey), [entity, fieldKey]);
  const title = useMemo(() => getFieldTitle(entity, fieldKey), [entity, fieldKey]);

  const isSelect = entity === "products" && fieldKey === "type";
  const selectOptions = PRODUCT_TYPE_OPTIONS;

  const currentSelectLabel = useMemo(() => {
    if (!isSelect) return "";
    return selectOptions.find((o) => o.value === value)?.label ?? "Select";
  }, [isSelect, selectOptions, value]);

  const validate = () => {
    const trimmed = value.trim();

    if (fieldKey === "name") {
      if (!trimmed) return `Please enter a ${label.toLowerCase()}.`;
      return null;
    }

    if (fieldKey === "email") {
      if (!trimmed) return "Please enter an email.";
      if (!trimmed.includes("@")) return "Please enter a valid email.";
      return null;
    }

    if (fieldKey === "volume") {
      if (!trimmed) return "Please enter a volume.";
      const vol = Number(trimmed);
      if (!Number.isFinite(vol) || vol <= 0) return "Please enter a valid volume.";
      return null;
    }

    if (fieldKey === "type") {
      if (!value) return "Please select a type.";
      return null;
    }

    return null;
  };

  const onSave = async () => {
    if (!id) return Alert.alert("Missing id", "No entity id was provided.");
    const msg = validate();
    if (msg) return Alert.alert("Missing info", msg);

    try {
      setIsSaving(true);

      // ✅ TODO: plug your update mutations here
      // Examples (depending on your hooks):
      // if (entity === "locations" && fieldKey === "name") await updateBar.mutateAsync({ barId: id, name: value.trim() })
      // if (entity === "suppliers" && fieldKey === "name") await updateSupplier.mutateAsync({ supplierId: id, name: value.trim() })
      // if (entity === "suppliers" && fieldKey === "email") await updateSupplier.mutateAsync({ supplierId: id, email: value.trim() })
      // if (entity === "products" && fieldKey === "name") await updateProduct.mutateAsync({ productId: id, name: value.trim() })
      // if (entity === "products" && fieldKey === "volume") await updateProduct.mutateAsync({ productId: id, volume: Number(value) })
      // if (entity === "products" && fieldKey === "type") await updateProduct.mutateAsync({ productId: id, type: value })

      console.log("UPDATE FIELD", { entity, id, fieldKey, value });

      router.back();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Icon name="exit" size={32} color={theme.colors.icon} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          {title}
        </Text>

        <View style={styles.formCard}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

          {!isSelect ? (
            <FormInput
              value={value}
              onChange={(v) => setValue(String(v))}
              placeholder={label}
              type={
                fieldKey === "email"
                  ? "email"
                  : fieldKey === "volume"
                  ? "number"
                  : "text"
              }
              min={fieldKey === "volume" ? 0 : undefined}
              decimal={fieldKey === "volume" ? true : undefined}
              accessibilityLabel={label}
            />
          ) : (
            <Pressable
              onPress={() => {
                const idx = Math.max(
                  0,
                  selectOptions.findIndex((o) => o.value === value)
                );
                const next = (idx + 1) % selectOptions.length;
                setValue(selectOptions[next].value);
              }}
              style={[styles.selectPill, { backgroundColor: theme.colors.background }]}
              accessibilityRole="button"
              accessibilityLabel={`Change ${label}`}
            >
              <Text style={{ color: theme.colors.text }}>{currentSelectLabel}</Text>
              <Icon name="settings" size={18} color={theme.colors.icon} />
            </Pressable>
          )}
        </View>

        <GradientButton
          text={isSaving ? "Saving..." : "Save"}
          onPress={onSave}
          gradientName="paloma"
          disabled={isSaving}
          style={{ marginTop: 18 }}
        />

        {isSaving ? (
          <View style={{ marginTop: 12, alignItems: "center" }}>
            <ActivityIndicator color={theme.colors.icon} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  closeButton: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 40, fontWeight: "700", marginBottom: 14 },

  formCard: { gap: 10, paddingBottom: 10 },
  label: { fontSize: 13 },

  selectPill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
