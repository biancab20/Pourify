import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import SingleFieldEditScreen from "@/components/screenComponents/SingleFieldEditScreen";
import type { SelectOption } from "@/components/screenComponents/SingleFieldEditScreen";
import { useEditFieldCallbackStore } from "@/stores/edit-field-callback-store";
import { Alert } from "react-native";

type FieldType = "text" | "email" | "number" | "select";

function safeParseOptions(raw?: string): SelectOption[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x: any) => ({ label: String(x.label), value: String(x.value) }));
  } catch {
    return undefined;
  }
}

export default function GlobalEditFieldRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    editId?: string;
    title?: string;
    description?: string;
    label?: string;
    fieldType?: FieldType;
    placeholder?: string;
    initialValue?: string;
    optionsJson?: string;
  }>();

  const editId = params.editId ?? "";
  const title = params.title ?? "Edit";
  const description = params.description ?? "";
  const label = params.label ?? "Value";
  const fieldType = (params.fieldType ?? "text") as FieldType;
  const placeholder = params.placeholder ?? "";
  const initialValue = params.initialValue ?? "";

  const options = useMemo(
    () =>
      fieldType === "select" ? safeParseOptions(params.optionsJson) : undefined,
    [fieldType, params.optionsJson]
  );

  const getCallback = useEditFieldCallbackStore((s) => s.getCallback);
  const clearCallback = useEditFieldCallbackStore((s) => s.clearCallback);

  const onSave = async (v: string) => {
    const cb = getCallback(editId);

    try {
      const result = cb ? await cb(v) : undefined;

      // default: close
      const close =
        typeof result === "boolean" ? result : result?.close ?? true;

      // optional: update displayed value if caller returns nextValue
      if (
        result &&
        typeof result === "object" &&
        typeof result.nextValue === "string"
      ) {
        // you can optionally support this by pushing a param update,
        // OR simpler: ignore and let the caller reopen if needed
      }

      if (close) {
        clearCallback(editId);
        router.back();
      }
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
      // keep screen open
    }
  };

  const onClose = () => {
    clearCallback(editId);
    router.back();
  };

  return (
    <SingleFieldEditScreen
      mode="static"
      title={title}
      description={description}
      label={label}
      fieldType={fieldType}
      options={options}
      placeholder={placeholder}
      initialValue={initialValue}
      onSave={onSave}
      onClose={onClose}
      saveLabel="Save"
    />
  );
}
