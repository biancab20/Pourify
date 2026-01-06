import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  Stack,
  useNavigation,
} from "expo-router";
import FormInput from "@/components/ui/FormInput";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientButton from "@/components/shared/GradientButton";
import { Text as CustomText } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import { useAppTheme } from "@/stores/app-theme-context";

import ConfigSectionCard from "@/components/ui/ConfigSectionCard";
import { ConfigRow } from "@/components/ui/ConfigRow";

// ✅ keep this import (used on Save)
import { useCreateSupplier } from "@/hooks/useSuppliers";

type EntityKey = "products" | "suppliers";
type FieldType = "text" | "select";

type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
};

type EntityScreenConfig<TItem> = {
  headerTitle: (venueName: string) => string;
  description: (venueName: string) => string;

  createButtonLabel: string;
  listTitle: (venueName: string, count: number) => string;
  emptyListText: string;

  fields: FieldConfig[];

  buildPayload: (values: Record<string, string>) => any;
  validate: (values: Record<string, string>) => string | null;

  row: {
    leftIconName: any;
    title: (item: TItem) => string;
    rightLabel?: (item: TItem) => string | undefined;
    onPress?: (item: TItem) => void;
    keyExtractor: (item: TItem) => string;
  };
};

// Local list item types (for this screen)
type LocalSupplier = { supplierId: string; name: string; email: string };
type LocalProduct = { productId: string; name: string; category: string };

function useEntityConfig(
  entity: EntityKey,
  venueName: string,
  theme: any
): EntityScreenConfig<any> {
  if (entity === "suppliers") {
    return {
      headerTitle: () => "Add your suppliers",
      description: (v) =>
        `Which suppliers do you have for ${v}? Please add them below (you can add more suppliers later).`,
      createButtonLabel: "Create Supplier",
      listTitle: (_v, count) => `Added suppliers (${count})`,
      emptyListText: "Please add at least one supplier",

      fields: [
        {
          key: "name",
          label: "Supplier name",
          placeholder: "e.g. Big Drinks BV",
          type: "text",
          required: true,
        },
        {
          key: "email",
          label: "Email",
          placeholder: "e.g. orders@bigdrinks.nl",
          type: "text",
          required: true,
        },
      ],

      buildPayload: (values) => ({
        name: values.name.trim(),
        email: values.email.trim(),
      }),

      validate: (values) => {
        if (!values.name?.trim()) return "Please enter a supplier name.";
        if (!values.email?.trim()) return "Please enter an email.";
        if (!values.email.includes("@")) return "Please enter a valid email.";
        return null;
      },

      row: {
        leftIconName: "people-outline",
        title: (s: LocalSupplier) => s.name,
        rightLabel: (s: LocalSupplier) => (s.email ? s.email : undefined),
        keyExtractor: (s: LocalSupplier) => s.supplierId,
        onPress: (s: LocalSupplier) =>
          Alert.alert("Supplier", `${s.name}\n${s.email}`),
      },
    };
  }

  // Products (still local-only until you wire API)
  return {
    headerTitle: () => "Add your products",
    description: (v) =>
      `Which bottles do you serve in ${v}? Please add them below (you can always add more!).`,
    createButtonLabel: "Create Product",
    listTitle: (_v, count) => `Added products (${count})`,
    emptyListText: "Please add at least one product",

    fields: [
      {
        key: "name",
        label: "Product name",
        placeholder: "e.g. Bacardi Rum",
        type: "text",
        required: true,
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { label: "Whiskey", value: "Whiskey" },
          { label: "Vodka", value: "Vodka" },
          { label: "Rum", value: "Rum" },
          { label: "Gin", value: "Gin" },
          { label: "Tequila", value: "Tequila" },
          { label: "Brandy", value: "Brandy" },
        ],
      },
    ],

    buildPayload: (values) => ({
      name: values.name.trim(),
      category: values.category,
    }),

    validate: (values) => {
      if (!values.name?.trim()) return "Please enter a product name.";
      if (!values.category) return "Please select a category.";
      return null;
    },

    row: {
      leftIconName: "wine-outline",
      title: (p: LocalProduct) => p.name,
      rightLabel: (p: LocalProduct) => p.category,
      keyExtractor: (p: LocalProduct) => p.productId,
      onPress: (p: LocalProduct) => Alert.alert("Product", p.name),
    },
  };
}

export default function AddEntityScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useAppTheme();

  const params = useLocalSearchParams<{
    entity?: string;
    venueName?: string;
  }>();
  const entity = (params.entity ?? "products") as EntityKey;
  const venueName = params.venueName ?? "this venue";

  const config = useEntityConfig(entity, venueName, theme);

  // ✅ local staged list
  const [itemsLocal, setItemsLocal] = useState<any[]>([]);

  // ✅ keep create supplier hook (used on Save)
  const createSupplier = useCreateSupplier();

  // form state generated from fields
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of config.fields) init[f.key] = "";
    for (const f of config.fields) {
      if (f.type === "select") init[f.key] = f.options?.[0]?.value ?? "";
    }
    return init;
  });

  const setField = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const count = itemsLocal.length;
  const hasUnsavedChanges = itemsLocal.length > 0;

  const resetForm = () => {
    const next: Record<string, string> = { ...values };
    for (const f of config.fields) {
      next[f.key] = f.type === "select" ? f.options?.[0]?.value ?? "" : "";
    }
    setValues(next);
  };

  const confirmDiscard = (onDiscard: () => void) => {
    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. If you go back now, your changes will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: onDiscard },
      ]
    );
  };

  // ✅ intercept native back (header back / swipe / android back)
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();
      confirmDiscard(() => {
        setItemsLocal([]);
        navigation.dispatch(e.data.action);
      });
    });

    return sub;
  }, [navigation, hasUnsavedChanges]);

  const onCreate = async () => {
    const msg = config.validate(values);
    if (msg) return Alert.alert("Missing info", msg);

    const payload = config.buildPayload(values);

    // ✅ stage locally only (no API call here)
    if (entity === "suppliers") {
      const localSupplier: LocalSupplier = {
        supplierId: `local-${Date.now()}`,
        name: payload.name,
        email: payload.email,
      };
      setItemsLocal((prev) => [localSupplier, ...prev]);
    } else {
      const localProduct: LocalProduct = {
        productId: `local-${Date.now()}`,
        name: payload.name,
        category: payload.category,
      };
      setItemsLocal((prev) => [localProduct, ...prev]);
    }

    resetForm();
  };

  const onSave = async () => {
    if (itemsLocal.length === 0) {
      Alert.alert("Missing info", config.emptyListText);
      return;
    }

    if (entity !== "suppliers") {
      Alert.alert(
        "Not implemented yet",
        "Bulk save for this entity will be added later."
      );
      return;
    }

    try {
      // ✅ save one-by-one for now
      for (const s of itemsLocal as LocalSupplier[]) {
        await createSupplier.mutateAsync({ name: s.name, email: s.email });
      }

      setItemsLocal([]);
      router.back();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    }
  };

  const isSaving = createSupplier.isPending;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <CustomText
          variant="gradient"
          gradientName="paloma"
          style={styles.title}
        >
          {config.headerTitle(venueName)}
        </CustomText>

        <CustomText style={[styles.subtitle, { color: theme.colors.text }]}>
          {config.description(venueName)}
        </CustomText>

        {/* Dynamic form card */}
        <View style={styles.formCard}>
          {config.fields.map((f) => {
            if (f.type === "text") {
              return (
                <View key={f.key} style={styles.field}>
                  <CustomText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    {f.label}
                  </CustomText>
                  <FormInput
                    value={values[f.key]}
                    onChange={(v) => setField(f.key, String(v))}
                    placeholder={f.placeholder}
                    type={f.key === "email" ? "email" : "text"}
                    accessibilityLabel={f.label}
                  />
                </View>
              );
            }

            const opts = f.options ?? [];
            const currentIndex = Math.max(
              0,
              opts.findIndex((o) => o.value === values[f.key])
            );
            const currentLabel = opts[currentIndex]?.label ?? "Select";

            return (
              <View key={f.key} style={styles.field}>
                <CustomText
                  style={[styles.label, { color: theme.colors.text }]}
                >
                  {f.label}
                </CustomText>

                <Pressable
                  onPress={() => {
                    if (opts.length === 0) return;
                    const next = (currentIndex + 1) % opts.length;
                    setField(f.key, opts[next].value);
                  }}
                  style={[
                    styles.selectPill,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <CustomText style={{ color: theme.colors.text }}>
                    {currentLabel}
                  </CustomText>
                  <Icon name="settings" size={18} color={theme.colors.icon} />
                </Pressable>
              </View>
            );
          })}

          <GradientButton
            text={config.createButtonLabel}
            onPress={onCreate}
            gradientName="bananaDaiquiri"
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Local list */}
        <ConfigSectionCard<any>
          title={config.listTitle(venueName, count)}
          items={itemsLocal}
          emptyText={config.emptyListText}
          addLabel="Add more"
          onAdd={() =>
            Alert.alert("Tip", "Fill the form above and press Create.")
          }
          keyExtractor={(it) => config.row.keyExtractor(it)}
          renderItem={({ item }) => (
            <ConfigRow
              title={config.row.title(item)}
              leftIconName={config.row.leftIconName}
              rightLabel={config.row.rightLabel?.(item)}
              onPress={() => config.row.onPress?.(item)}
            />
          )}
        />

        <GradientButton
          text="Save"
          onPress={onSave}
          gradientName="paloma"
          disabled={isSaving}
          style={{ marginTop: 18 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 40, fontWeight: "700", marginTop: 8 },
  subtitle: { marginTop: 12, fontSize: 16, lineHeight: 22, marginBottom: 16 },

  formCard: { gap: 14, paddingBottom: 20 },
  field: { gap: 8 },
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
