import { API } from "@/services/api.config";
import type { ApiError } from "@/services/api.errors";
import { authedFetch } from "@/utils/authed-fetch";
import type { Bar, BarDto, DeleteBarResponse, GetBarsResponse, UpdateBarResponse } from "@/types/locations";
import type { ODataBoolean, ODataEntity } from "@/types/odata";
import { parseODataList, toApiError, firstOrThrow } from "@/utils/odata";
import { mapBarDto } from "@/utils/api-mappers";

export async function getBars(params?: Record<string, string | number>): Promise<GetBarsResponse> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";

  const res = await authedFetch(`${API.locations.list}${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  try {
    const data = parseODataList<BarDto>(text);
    return {
      "@odata.context": data["@odata.context"],
      value: data.value.map(mapBarDto),
    };
  } catch {
    throw { message: "Failed to parse JSON response", status: res.status, body: text } satisfies ApiError;
  }
}

export async function getBarById(barId: string): Promise<Bar> {
  const res = await authedFetch(API.locations.byId(barId), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const list = parseODataList<BarDto>(text);
  return mapBarDto(firstOrThrow(list, "Bar"));
}

export async function createBar(payload: { name: string }): Promise<Bar> {
  const res = await authedFetch(API.locations.create, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ BarName: payload.name }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<BarDto>;
  return mapBarDto(data);
}

export async function updateBar(barId: string, payload: Partial<Bar>): Promise<UpdateBarResponse> {
  const res = await authedFetch(API.locations.update(barId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ BarName: payload.name }),
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataEntity<BarDto>;
  return mapBarDto(data);
}

export async function deleteBar(barId: string): Promise<DeleteBarResponse> {
  const res = await authedFetch(API.locations.delete(barId), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  if (!res.ok) throw toApiError(res, text);

  const data = JSON.parse(text) as ODataBoolean;
  return { value: Boolean(data.value) };
}
