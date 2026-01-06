import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text as CustomText } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import { useAppTheme } from "@/stores/app-theme-context";

import ConfigSectionCard from "@/components/ui/ConfigSectionCard";
import { ConfigRow } from "@/components/ui/ConfigRow";

// ✅ hooks (examples)
import { useSuppliers, useCreateSupplier } from "@/hooks/useSuppliers";
// If you also have products hooks later, plug them in similarly.
// import { useProducts, useCreateProduct } from "@/services/products.hooks";

type EntityKey = "products" | "suppliers";

type FieldType = "text" | "select";

type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;

  // for select fields
  options?: { label: string; value: string }[];
};

type EntityScreenConfig = {
  headerTitle: (venueName: string) => string;
  description: (venueName: string) => string;

  createButtonLabel: string;
  listTitle: (venueName: string, count: number) => string;
  emptyListText: string;

  fields: FieldConfig[];

  // entity behavior
  // fetch list
  useList: () => {
    items: any[];
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
  };

  // create
  useCreate: () => {
    create: (payload: any) => Promise<any>;
    isCreating: boolean;
  };

  // how to render rows in the list
  row: {
    leftIconName: any; // Ionicons name type inside your ConfigRow
    title: (item: any) => string;
    rightLabel?: (item: any) => string | undefined;
    onPress?: (item: any) => void;
    keyExtractor: (item: any) => string;
  };

  // build create payload from form values
  buildPayload: (values: Record<string, string>) => any;

  // minimal validation (you can expand later)
  validate: (values: Record<string, string>) => string | null;
};

/** ---- CONFIGS: add more entities here ---- */
function useEntityConfig(
  entity: EntityKey,
  venueName: string,
  theme: any
): EntityScreenConfig {
  if (entity === "suppliers") {
    return {
      headerTitle: (v) => "Add your suppliers",
      description: (v) =>
        `Which suppliers do you have for ${v}? Please add them below (you can add more suppliers later).`,

      createButtonLabel: "Create Supplier",

      // ✅ changed wording
      listTitle: (_v, count) => `Added suppliers (${count})`,

      // ✅ changed empty state
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

      useList: () => {
        const q = useSuppliers();
        return {
          items: q.data?.items ?? [],
          isLoading: q.isLoading,
          error: q.error,
          refetch: q.refetch,
        };
      },

      useCreate: () => {
        const m = useCreateSupplier();
        return {
          create: (payload) => m.mutateAsync(payload),
          isCreating: m.isPending,
        };
      },

      row: {
        leftIconName: "people-outline",
        title: (s) => s.name,
        rightLabel: (s) => (s.email ? s.email : undefined),
        keyExtractor: (s) => s.supplierId,
        onPress: (s) => Alert.alert("Supplier", `${s.name}\n${s.email}`),
      },

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
    };
  }

  // Example stub for products (wire later to real hooks)
  return {
    headerTitle: () => `Add your products`,
    description: (v) =>
      `Which bottles do you serve in ${v}? Please add them below (you can always add more!).`,
    createButtonLabel: "Create Product",
    listTitle: (v, count) => `Products in ${v} (${count})`,
    emptyListText: "This venue contains no products.",
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

    useList: () => ({
      items: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    }),

    useCreate: () => ({
      create: async () => {
        Alert.alert("TODO", "Wire products create hook");
      },
      isCreating: false,
    }),

    row: {
      leftIconName: "wine-outline",
      title: (p) => p.name,
      rightLabel: (p) => p.category,
      keyExtractor: (p) => p.productId,
      onPress: (p) => Alert.alert("Product", p.name),
    },

    buildPayload: (values) => ({
      name: values.name.trim(),
      category: values.category,
    }),

    validate: (values) => {
      if (!values.name?.trim()) return "Please enter a product name.";
      if (!values.category) return "Please select a category.";
      return null;
    },
  };
}

export default function AddEntityScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  // route: /(settings)/[entity]/add?venueName=Bibi%20s%20bar
  const params = useLocalSearchParams<{
    entity?: string;
    venueName?: string;
  }>();
  const entity = (params.entity ?? "products") as EntityKey;
  const venueName = params.venueName ?? "this venue";

  const config = useEntityConfig(entity, venueName, theme);

  // form state generated from fields
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of config.fields) init[f.key] = "";
    // set a default for selects (optional)
    for (const f of config.fields)
      if (f.type === "select") init[f.key] = f.options?.[0]?.value ?? "";
    return init;
  });

  const setField = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const { items, isLoading, error, refetch } = config.useList();
  const { create, isCreating } = config.useCreate();

  const count = items.length;

  const onCreate = async () => {
    const msg = config.validate(values);
    if (msg) return Alert.alert("Missing info", msg);

    try {
      const payload = config.buildPayload(values);
      await create(payload);

      // reset the form after success
      const next: Record<string, string> = { ...values };
      for (const f of config.fields)
        next[f.key] = f.type === "select" ? f.options?.[0]?.value ?? "" : "";
      setValues(next);
    } catch (e: any) {
      Alert.alert("Create failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="scan" size={28} color={theme.colors.icon} />
        </Pressable>
      </View>

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
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          {config.fields.map((f) => {
            if (f.type === "text") {
              return (
                <View key={f.key} style={styles.field}>
                  <CustomText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    {f.label}
                  </CustomText>
                  <TextInput
                    value={values[f.key]}
                    onChangeText={(t) => setField(f.key, t)}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.colors.text}
                    style={[styles.input, { color: theme.colors.text }]}
                  />
                </View>
              );
            }

            // “select” kept simple: tap to cycle options (Expo-safe, no extra libs)
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

          <Pressable
            onPress={onCreate}
            disabled={isCreating}
            style={[
              styles.createButton,
              { backgroundColor: theme.palette.green },
              isCreating ? { opacity: 0.6 } : null,
            ]}
          >
            {isCreating ? (
              <ActivityIndicator />
            ) : (
              <CustomText
                style={[styles.createButtonText, { color: theme.colors.text }]}
              >
                {config.createButtonLabel}
              </CustomText>
            )}
          </Pressable>
        </View>

        {/* List section card */}
        {isLoading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator />
            <CustomText style={{ marginTop: 8, color: theme.colors.text }}>
              Loading…
            </CustomText>
          </View>
        ) : error ? (
          <View style={styles.centerBlock}>
            <CustomText style={{ color: theme.colors.text }}>
              Error loading list.
            </CustomText>
            <Pressable onPress={refetch} style={{ marginTop: 10 }}>
              <CustomText>Retry</CustomText>
            </Pressable>
          </View>
        ) : (
          <ConfigSectionCard<any>
            title={config.listTitle(venueName, count)}
            items={items}
            emptyText={config.emptyListText}
            addLabel="Add more"
            onAdd={() => {
              // scroll up or focus first field if you want
              Alert.alert("Tip", "Fill the form above and press Create.");
            }}
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
        )}

        <Pressable
          onPress={() => router.back()}
          style={[
            styles.doneButton,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <CustomText style={{ color: theme.colors.text, fontWeight: "700" }}>
            Done
          </CustomText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, justifyContent: "center", paddingHorizontal: 16 },
  backBtn: { minWidth: 48, minHeight: 48, justifyContent: "center" },

  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 40, fontWeight: "700", marginTop: 8 },
  subtitle: { marginTop: 12, fontSize: 16, lineHeight: 22, marginBottom: 16 },

  formCard: { borderRadius: 24, padding: 16, gap: 14 },
  field: { gap: 8 },
  label: { fontSize: 13 },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    // background comes from theme via inputBackground on the select; if you have input bg, apply here too
  },

  selectPill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  createButton: {
    marginTop: 6,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: { fontSize: 16, fontWeight: "700" },

  centerBlock: { paddingVertical: 18, alignItems: "center" },

  doneButton: {
    marginTop: 18,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
