// src/utils/storage.ts
import * as SecureStore from "expo-secure-store";

export async function getStoredString(key: string): Promise<string | null> {
  const v = await SecureStore.getItemAsync(key);
  return v ?? null;
}

export async function setStoredString(
  key: string,
  value: string | null
): Promise<void> {
  if (value == null || !value.trim()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, value.trim());
}
