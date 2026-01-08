import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/stores/app-theme-context";
import { Text } from "@/components/shared/Text";
import { Icon } from "@/components/icons/Icon";
import GradientButton from "@/components/shared/GradientButton";
import FormInput from "@/components/ui/FormInput";

type FieldType = "text" | "select";

export type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
};

type Props = {
  /** Top header */
  title: string; // gradient title
  description?: string;

  /** Form definition */
  fields: FieldConfig[];

  /** Prefill (already mapped from your entity) */
  initialValues: Record<string, string>;

  /** Validation + save */
  validate: (values: Record<string, string>) => string | null;
  onSave: (values: Record<string, string>) => Promise<void> | void;

  /** States */
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;

  isSaving?: boolean;

  /** Optional */
  saveLabel?: string;
  onClose?: () => void; // if you want an exit button
  enableDiscardWarning?: boolean; // default true
};

export default function EntityEditFormScreen({
  title,
  description,

  fields,
  initialValues,

  validate,
  onSave,

  isLoading = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,

  isSaving = false,

  saveLabel = "Save",
  onClose,
  enableDiscardWarning = true,
}: Props) {
  const { theme } = useAppTheme();

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [didInit, setDidInit] = useState(false);

  // Re-init if initialValues change (e.g. after fetch)
  useEffect(() => {
    setValues(initialValues);
    setDidInit(true);
  }, [initialValues]);

  const setField = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const hasChanges = useMemo(() => {
    if (!didInit) return false;
    const keys = Object.keys(initialValues);
    for (const k of keys) {
      if ((values[k] ?? "") !== (initialValues[k] ?? "")) return true;
    }
    // also include any extra keys (just in case)
    for (const k of Object.keys(values)) {
      if ((values[k] ?? "") !== (initialValues[k] ?? "")) return true;
    }
    return false;
  }, [didInit, initialValues, values]);

  const confirmDiscard = (onDiscard: () => void) => {
    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. If you leave now, your changes will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: onDiscard },
      ]
    );
  };

  const handleClose = () => {
    if (!onClose) return;

    if (enableDiscardWarning && hasChanges) {
      confirmDiscard(onClose);
      return;
    }
    onClose();
  };

  const handleSave = async () => {
    const msg = validate(values);
    if (msg) return Alert.alert("Missing info", msg);

    try {
      await onSave(values);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {!!onClose && (
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Icon name="exit" size={32} color={theme.colors.icon} />
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          {title}
        </Text>

        {!!description && (
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {description}
          </Text>
        )}

        {/* Error */}
        {!!errorMessage ? (
          <View style={styles.centerContainer}>
            <Text style={{ textAlign: "center" }}>{errorMessage}</Text>

            {onRetry ? (
              <Pressable
                onPress={onRetry}
                style={{
                  marginTop: 14,
                  padding: 12,
                  minWidth: 120,
                  alignItems: "center",
                }}
                accessibilityRole="button"
                accessibilityLabel="Retry"
              >
                {isRetrying ? (
                  <Text>Retrying...</Text>
                ) : (
                  <Text style={{ textDecorationLine: "underline" }}>Retry</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : isLoading ? (
          <View style={styles.centerContainer}>
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.formCard}>
              {fields.map((f) => {
                // TEXT
                if (f.type === "text") {
                  const type =
                    f.key === "email"
                      ? "email"
                      : f.key === "volume"
                      ? "number"
                      : "text";

                  return (
                    <View key={f.key} style={styles.field}>
                      <Text style={[styles.label, { color: theme.colors.text }]}>
                        {f.label}
                      </Text>

                      <FormInput
                        value={values[f.key] ?? ""}
                        onChange={(v) => setField(f.key, String(v))}
                        placeholder={f.placeholder}
                        type={type as any}
                        min={f.key === "volume" ? 0 : undefined}
                        decimal={f.key === "volume" ? true : undefined}
                        accessibilityLabel={f.label}
                      />
                    </View>
                  );
                }

                // SELECT (cycle through options)
                const opts = f.options ?? [];
                const currentValue = values[f.key] ?? "";
                const currentIndex = Math.max(
                  0,
                  opts.findIndex((o) => o.value === currentValue)
                );
                const currentLabel = opts[currentIndex]?.label ?? "Select";

                return (
                  <View key={f.key} style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {f.label}
                    </Text>

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
                      accessibilityRole="button"
                      accessibilityLabel={`Change ${f.label}`}
                    >
                      <Text style={{ color: theme.colors.text }}>
                        {currentLabel}
                      </Text>
                      <Icon name="settings" size={18} color={theme.colors.icon} />
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <GradientButton
              text={saveLabel}
              onPress={handleSave}
              gradientName="paloma"
              disabled={isSaving}
              style={{ marginTop: 10 }}
            />
          </>
        )}
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
  title: { fontSize: 40, fontWeight: "700", marginTop: 8 },
  subtitle: { marginTop: 12, fontSize: 16, lineHeight: 22, marginBottom: 16 },

  formCard: { gap: 14, paddingBottom: 12 },
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
});
