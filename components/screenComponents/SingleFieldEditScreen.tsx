import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/stores/app-theme-context";
import { Text } from "@/components/shared/Text";
import FormInput from "@/components/dynamicComponents/FormInput";
import GradientButton from "@/components/shared/GradientButton";
import AndroidCustomNavigation from "@/components/navigation/AndroidCustomNavigation";

type FieldType = "text" | "email" | "number" | "select";

export type SelectOption = { label: string; value: string };

type BaseProps = {
  title: string;
  description?: string;
  label: string; // field label
  fieldType: FieldType;

  placeholder?: string;
  options?: SelectOption[]; // for select

  /** UI */
  onClose?: () => void;
  saveLabel?: string;

  /** Validation */
  validate?: (value: string) => string | null;
};

type EntityModeProps = BaseProps & {
  mode: "entity";
  initialValue: string;
  isLoading: boolean;
  isRefetching?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;

  /** Persist */
  onSave: (value: string) => Promise<void>;
  isSaving?: boolean;
};

type StaticModeProps = BaseProps & {
  mode: "static";
  initialValue: string;
  onSave: (value: string) => Promise<void> | void;
};

type Props = EntityModeProps | StaticModeProps;

export default function SingleFieldEditScreen(props: Props) {
  const { theme } = useAppTheme();

  const [value, setValue] = useState<string>(props.initialValue ?? "");
  const [localSaving, setLocalSaving] = useState(false);

  // keep in sync with fetched value (entity mode)
  useEffect(() => {
    setValue(props.initialValue ?? "");
  }, [props.initialValue]);

  const isSaving = props.mode === "entity" ? !!props.isSaving : localSaving;

  const options = useMemo(() => {
    return props.fieldType === "select" ? (props.options ?? []) : [];
  }, [props.fieldType, props.options]);

  const runValidation = () => {
    if (props.validate) return props.validate(value);

    // sensible defaults if validate not provided
    const trimmed = value.trim();
    if (props.fieldType === "email") {
      if (!trimmed) return "Please enter an email.";
      if (!trimmed.includes("@")) return "Please enter a valid email.";
      return null;
    }
    if (props.fieldType === "number") {
      if (!trimmed) return "Please enter a value.";
      const n = Number(trimmed);
      if (!Number.isFinite(n)) return "Please enter a valid number.";
      return null;
    }
    if (props.fieldType === "select") {
      if (!value) return "Please select a value.";
      return null;
    }
    if (!trimmed) return "Please enter a value.";
    return null;
  };

  const handleSave = async () => {
    const msg = runValidation();
    if (msg) return Alert.alert("Missing info", msg);

    try {
      if (props.mode === "static") setLocalSaving(true);
      await props.onSave(value);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      if (props.mode === "static") setLocalSaving(false);
    }
  };

  const renderError = () => {
    if (props.mode !== "entity") return null;
    if (!props.errorMessage) return null;

    return (
      <View style={styles.centerContainer}>
        <Text style={{ textAlign: "center" }}>{props.errorMessage}</Text>

        {props.onRetry ? (
          <Pressable
            onPress={props.onRetry}
            style={{
              marginTop: 14,
              padding: 12,
              minWidth: 120,
              alignItems: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            {props.isRefetching ? (
              <ActivityIndicator color={theme.colors.icon} />
            ) : (
              <Text style={{ textDecorationLine: "underline" }}>Retry</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderLoading = () => {
    if (props.mode !== "entity") return null;
    if (!props.isLoading) return null;

    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  };

  const showForm =
    props.mode === "static" ||
    (props.mode === "entity" && !props.isLoading && !props.errorMessage);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {Platform.OS === "android" && props.onClose ? (
          <AndroidCustomNavigation onBack={props.onClose} />
        ) : null}

        <Text variant="gradient" gradientName="paloma" style={styles.title}>
          {props.title}
        </Text>
        {!!props.description?.trim() && (
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {props.description}
          </Text>
        )}

        {renderError()}
        {renderLoading()}

        {showForm ? (
          <>
            <View style={styles.formCard}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {props.label}
              </Text>

              {props.fieldType !== "select" ? (
                <FormInput
                  value={value}
                  onChange={(v) => setValue(String(v))}
                  placeholder={props.placeholder ?? props.label}
                  type={
                    props.fieldType === "email"
                      ? "email"
                      : props.fieldType === "number"
                        ? "number"
                        : "text"
                  }
                  min={props.fieldType === "number" ? 0 : undefined}
                  decimal={props.fieldType === "number" ? true : undefined}
                  accessibilityLabel={props.label}
                />
              ) : (
                <FormInput
                  value={value}
                  onChange={(v) => setValue(String(v))}
                  type="select"
                  placeholder={props.placeholder ?? "Select"}
                  options={options}
                  disabled={options.length === 0}
                  accessibilityLabel={`Change ${props.label}`}
                />
              )}
            </View>

            <GradientButton
              text={isSaving ? "Saving..." : (props.saveLabel ?? "Save")}
              onPress={handleSave}
              gradientName="paloma"
              disabled={isSaving}
              style={{ marginTop: 18 }}
            />

            {isSaving ? (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <ActivityIndicator color={theme.colors.icon} />
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { fontSize: 40, fontWeight: "700", marginBottom: 14 },
  formCard: { gap: 10, paddingBottom: 10 },
  label: { fontSize: 13 },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
});
