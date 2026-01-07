import { API } from "@/services/api.config";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import type {
  Bar,
  DeleteBarResponse,
  GetBarsResponse,
  UpdateBarResponse,
} from "@/types/locations";

/**
 * GET /locations (bars)
 */
export async function getBars(
  params?: Record<string, string | number>
): Promise<GetBarsResponse> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await authedFetch(`${API.locations.getBars}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);

    // Transform the API response to match your expected type
    // Your API returns { "@odata.context": "...", "value": [...] }
    // But GetBarsResponse expects { items: [...], totalCount: ..., etc }

    const items = data.value || [];

    // Create the response matching GetBarsResponse type
    return {
      items: items.map((item: any) => ({
        barId: item.BarId, // Note: API returns "BarId" not "barId"
        name: item.BarName, // Note: API returns "BarName" not "name"
      })),
      totalCount: items.length,
      page: 1,
      pageSize: items.length,
      totalPages: 1,
    } as GetBarsResponse;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * POST /bar
 * (Create new location)
 */
export async function createBar(payload: { name: string }): Promise<Bar> {
  const res = await authedFetch(`${API.locations.updateBar}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ BarName: payload.name }),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);
    return {
      barId: data.BarId,
      name: data.BarName,
    } as Bar;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * PUT /locations/:id
 */
export async function updateBar(
  barId: string, // Changed from number to string
  payload: Partial<Bar>
): Promise<UpdateBarResponse> {
  const res = await authedFetch(`${API.locations.updateBar}/${barId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ BarName: payload.name }),
  });

  const text = await res.text();

  if (!res.ok) {
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  try {
    const data = JSON.parse(text);
    // Transform response from PascalCase to camelCase
    return {
      barId: data.BarId,
      name: data.BarName,
    } as UpdateBarResponse;
  } catch {
    throw {
      message: "Failed to parse JSON response",
      status: res.status,
      body: text,
    } satisfies ApiError;
  }
}

/**
 * DELETE /locations/:id
 * 204 No Content
 */
export async function deleteBar(barId: string): Promise<DeleteBarResponse> {
  const res = await authedFetch(`${API.locations.deleteBar}/${barId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    const err: ApiError = {
      message: `Request failed with status ${res.status}`,
      status: res.status,
      body: text,
    };
    throw err;
  }

  // 204 No Content
  return;
}
