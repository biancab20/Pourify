// src/utils/settingsFields.ts
import type { SelectOption } from "@/components/screenComponents/SingleFieldEditScreen";
import { getStoredString, setStoredString } from "@/utils/storage";

export type SettingsFieldType = "text" | "email" | "number" | "select";

export type SettingsFieldConfig = {
  key: string; // fieldKey in route
  title: string;
  label: string;
  fieldType: SettingsFieldType;
  placeholder?: string;

  storageKey: string; // SecureStore key
  options?: SelectOption[];

  /**
   * If true:
   * - empty string => clear (null)
   * If false:
   * - empty string => validation error
   */
  allowEmpty?: boolean;
};

export const SETTINGS_FIELDS: Record<string, SettingsFieldConfig> = {
  receiverEmail: {
    key: "receiverEmail",
    title: "Venue: Receiver email",
    label: "Receiver email",
    fieldType: "email",
    placeholder: "name@example.com",
    storageKey: "receiverEmail",
    allowEmpty: true,
  },
};

export function getSettingsField(fieldKey: string): SettingsFieldConfig | null {
  return SETTINGS_FIELDS[fieldKey] ?? null;
}

export async function loadSettingsFieldValue(
  field: SettingsFieldConfig
): Promise<string> {
  const v = await getStoredString(field.storageKey);
  return v ?? "";
}

export async function saveSettingsFieldValue(
  field: SettingsFieldConfig,
  value: string
): Promise<void> {
  const trimmed = value.trim();

  if (field.allowEmpty && !trimmed) {
    await setStoredString(field.storageKey, null);
    return;
  }

  if (field.fieldType === "number") {
    if (!trimmed) {
      await setStoredString(field.storageKey, null);
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) throw new Error("Please enter a valid number.");
    await setStoredString(field.storageKey, String(n));
    return;
  }

  await setStoredString(field.storageKey, trimmed);
}
