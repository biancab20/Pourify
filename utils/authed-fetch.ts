// utils/authed-fetch.ts
import { useAuthStore } from "@/stores/auth-store";

/**
 * Fetch wrapper that automatically adds Authorization: Bearer <token>
 * and refreshes the token when needed via getValidAccessToken().
 */
export async function authedFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const tokenData = await useAuthStore.getState().getValidAccessToken();

  if (!tokenData) {
    // This means user is logged out or refresh failed
    throw new Error("Not authenticated");
  }

  // Merge headers safely
  const headers = new Headers(init.headers);

  // ✅ Add bearer
  headers.set("Authorization", `${tokenData.tokenType} ${tokenData.token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
