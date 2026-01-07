import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "@/types/auth";

const KEY = {
  session: "auth.session",
} as const;

export async function saveSession(session: AuthSession) {
  await SecureStore.setItemAsync(KEY.session, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(KEY.session);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY.session);
}
