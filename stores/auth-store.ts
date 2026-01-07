// stores/auth-store.ts
import { create } from "zustand";
import type { AuthSession } from "@/types/auth";
import { AuthService } from "@/services/auth.api";
import { clearSession, loadSession, saveSession } from "@/utils/auth-storage";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthStore = {
  status: AuthStatus;
  session: AuthSession | null;

  bootstrap: () => Promise<void>;
  signIn: (params: { username: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;

  // returns a valid token (refreshes if needed)
  getValidAccessToken: () => Promise<{ token: string; tokenType: string } | null>;
};

const SKEW_MS = 20_000; // refresh a bit before expiry

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "loading",
  session: null,

  bootstrap: async () => {
    const session = await loadSession();
    set({ session, status: session ? "signedIn" : "signedOut" });
  },

  signIn: async ({ username, password }) => {
    const res = await AuthService.loginWithPassword({ username, password });

    const expiresAt = Date.now() + res.expires_in * 1000 - SKEW_MS;

    const session: AuthSession = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      tokenType: res.token_type ?? "Bearer",
      expiresAt,
    };

    await saveSession(session);
    set({ session, status: "signedIn" });
  },

  signOut: async () => {
    await clearSession();
    set({ session: null, status: "signedOut" });
  },

  getValidAccessToken: async () => {
    const { session } = get();
    if (!session) return null;

    if (Date.now() < session.expiresAt) {
      return { token: session.accessToken, tokenType: session.tokenType };
    }

    // expired → refresh
    try {
      const refreshed = await AuthService.refresh({ refreshToken: session.refreshToken });

      const expiresAt = Date.now() + refreshed.expires_in * 1000 - SKEW_MS;

      const updated: AuthSession = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? session.refreshToken,
        tokenType: refreshed.token_type ?? session.tokenType,
        expiresAt,
      };

      await saveSession(updated);
      set({ session: updated, status: "signedIn" });

      return { token: updated.accessToken, tokenType: updated.tokenType };
    } catch {
      // refresh failed → force logout
      await clearSession();
      set({ session: null, status: "signedOut" });
      return null;
    }
  },
}));
