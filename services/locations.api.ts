import { API } from "@/services/api.config";
import type {
  Bar,
  GetBarsResponse,
  UpdateBarResponse,
  DeleteBarResponse,
} from "@/types/locations";
import type { ApiError } from "@/services/api.errors";

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

  const res = await fetch(`${API.locations.getBars}${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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
    return JSON.parse(text) as GetBarsResponse;
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
  barId: number,
  payload: Partial<Bar>
): Promise<UpdateBarResponse> {
  const res = await fetch(`${API.locations.updateBar}/${barId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
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
    return JSON.parse(text) as UpdateBarResponse;
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
export async function deleteBar(barId: number): Promise<DeleteBarResponse> {
  const res = await fetch(`${API.locations.deleteBar}/${barId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
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
