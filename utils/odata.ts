import type { ODataList } from "@/types/odata";
import type { ApiError } from "@/services/api.errors";

export function parseODataList<T>(text: string): ODataList<T> {
  const data = JSON.parse(text) as ODataList<T>;
  if (!data || !Array.isArray((data as any).value)) {
    throw new Error("Invalid OData list shape");
  }
  return data;
}

export function firstOrThrow<T>(list: ODataList<T>, entityName = "Entity"): T {
  const item = list.value?.[0];
  if (!item) throw new Error(`${entityName} not found`);
  return item;
}

export function toApiError(res: Response, bodyText: string): ApiError {
  return {
    message: `Request failed with status ${res.status}`,
    status: res.status,
    body: bodyText,
  };
}
