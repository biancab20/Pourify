export const API_URL =
  "https://products-pourify-production.apps.inholland-minor.openshift.eu/api";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API GET failed: ${response.status}`);
  }

  return (await response.json()) as T;
}