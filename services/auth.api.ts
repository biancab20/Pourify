// services/auth-service.ts
import { API } from "@/services/api.config";
import type { AuthTokenResponse } from "@/types/auth";

function formUrlEncode(data: Record<string, string>) {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function postForm(url: string, form: Record<string, string>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formUrlEncode(form),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Auth failed (${res.status}): ${text || "No details"}`);

  return JSON.parse(text) as AuthTokenResponse;
}

export const AuthService = {
  loginWithPassword: (params: { username: string; password: string }) =>
    postForm(API.auth.token, {
      grant_type: "password",
      client_id: API.auth.clientId,
      username: params.username,
      password: params.password,
    }),

  refresh: (params: { refreshToken: string }) =>
    postForm(API.auth.token, {
      grant_type: "refresh_token",
      client_id: API.auth.clientId,
      refresh_token: params.refreshToken,
    }),
};
